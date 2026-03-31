import express from 'express';
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handleIncomingMessage from './events/messageHandler.js';
import configmanager from './utils/configmanager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Ensure required directories exist on startup ───────────────────
['sessions', 'database', 'temp'].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Store active sessions in memory
const activeSessions = {};

// ── Helper: sanitize phone number ──────────────────────────────────
function sanitizeNumber(num) {
    return num.replace(/[^0-9]/g, '').trim();
}

// ── Connect a user session ─────────────────────────────────────────
async function connectUser(phoneNumber) {
    const sessionDir = `sessions/${phoneNumber}`;
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        logger: pino({ level: 'silent' }),
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
        generateHighQualityLinkPreview: true,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log(`❌ [${phoneNumber}] Disconnected. Status:`, statusCode);
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log(`🔄 [${phoneNumber}] Reconnecting in 5s...`);
                setTimeout(() => connectUser(phoneNumber), 5000);
            } else {
                delete activeSessions[phoneNumber];
                console.log(`🚫 [${phoneNumber}] Logged out permanently.`);
            }
        } else if (connection === 'open') {
            console.log(`✅ [${phoneNumber}] Connected!`);
            activeSessions[phoneNumber] = { sock, status: 'connected' };

            // Setup config for this user
            if (!configmanager.config.users[phoneNumber]) {
                configmanager.config.users[phoneNumber] = {
                    sudoList: [`${phoneNumber}@s.whatsapp.net`],
                    tagAudioPath: 'tag.mp3',
                    antilink: true,
                    response: true,
                    autoreact: false,
                    prefix: '.',
                    reaction: '🌸',
                    welcome: true,
                    record: false,
                    type: false,
                    publicMode: false,
                };
                configmanager.save();
            }

            sock.ev.on('messages.upsert', async (msg) => handleIncomingMessage(sock, msg));
        }
    });

    // Request pairing code after 3 seconds
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                if (!state.creds.registered) {
                    const code = await sock.requestPairingCode(phoneNumber, 'AKANEMD9');
                    activeSessions[phoneNumber] = { sock, status: 'pending', code };
                    resolve(code);
                } else {
                    activeSessions[phoneNumber] = { sock, status: 'already_connected' };
                    resolve('ALREADY_CONNECTED');
                }
            } catch (err) {
                reject(err);
            }
        }, 3000);
    });
}

// ── Routes ─────────────────────────────────────────────────────────

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Request pairing code
app.post('/pair', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.json({ success: false, message: 'Phone number is required' });

    const number = sanitizeNumber(phone);
    if (number.length < 7) return res.json({ success: false, message: 'Invalid phone number' });

    // Already has an active session
    if (activeSessions[number]?.status === 'connected') {
        return res.json({ success: true, message: 'Already connected!', code: 'ALREADY_CONNECTED' });
    }

    try {
        console.log(`📲 Pairing request for: ${number}`);
        const code = await connectUser(number);
        res.json({ success: true, code, message: 'Enter this code in WhatsApp > Linked Devices > Link with phone number' });
    } catch (err) {
        console.error(`❌ Pairing error for ${number}:`, err);
        res.json({ success: false, message: 'Failed to generate pairing code. Try again.' });
    }
});

// Check session status
app.get('/status/:phone', (req, res) => {
    const number = sanitizeNumber(req.params.phone);
    const session = activeSessions[number];
    if (!session) return res.json({ status: 'not_found' });
    res.json({ status: session.status });
});

// ── Start server ───────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🌐 AKANE MD Web Server running on port ${PORT}`);
    console.log(`🔗 Visit: http://localhost:${PORT}`);
});

// Auto-reconnect existing sessions on startup
function restoreExistingSessions() {
    const sessionsDir = 'sessions';
    if (!fs.existsSync(sessionsDir)) return;
    const folders = fs.readdirSync(sessionsDir);
    folders.forEach(folder => {
        const credFile = path.join(sessionsDir, folder, 'creds.json');
        if (fs.existsSync(credFile)) {
            console.log(`♻️ Restoring session for: ${folder}`);
            connectUser(folder).catch(err => console.error(`❌ Failed to restore ${folder}:`, err));
        }
    });
}

restoreExistingSessions();
