import express from 'express';
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handleIncomingMessage from './events/messageHandler.js';
import configmanager from './utils/configmanager.js';
import crew from './Digix/crew.js';

const { connectToWhatsapp, restoreSessions } = crew;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Ensure required directories exist on startup ───────────────────
['sessions', 'database', 'temp', 'public'].forEach(dir => {
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

    // Stocker l'état initial
    activeSessions[phoneNumber] = { status: 'pending', code: null };

    try {
        console.log(`📲 Pairing request for: ${phoneNumber}`);
        
        // Utiliser la nouvelle fonction connectToWhatsapp avec callbacks
        const result = await connectToWhatsapp(phoneNumber, handleIncomingMessage, {
            onCode: (code) => {
                console.log(`🔑 Code generated for ${phoneNumber}: ${code}`);
                if (activeSessions[phoneNumber]) {
                    activeSessions[phoneNumber].code = code;
                    activeSessions[phoneNumber].status = 'pending';
                }
            },
            onConnected: () => {
                console.log(`✅ ${phoneNumber} is now connected!`);
                if (activeSessions[phoneNumber]) {
                    activeSessions[phoneNumber].status = 'connected';
                    activeSessions[phoneNumber].code = null;
                }
                
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
            },
            onDisconnect: (statusCode) => {
                console.log(`❌ ${phoneNumber} disconnected. Status: ${statusCode}`);
                if (statusCode === DisconnectReason.loggedOut) {
                    if (activeSessions[phoneNumber]) {
                        activeSessions[phoneNumber].status = 'logged_out';
                    }
                }
            },
            onQR: (qr) => {
                console.log(`📱 QR Code generated for ${phoneNumber}`);
                if (activeSessions[phoneNumber]) {
                    activeSessions[phoneNumber].qr = qr;
                }
            }
        });
        
        if (result && result.code) {
            return result.code;
        }
        
        return 'ALREADY_CONNECTED';
    } catch (err) {
        console.error(`❌ Pairing error for ${phoneNumber}:`, err);
        delete activeSessions[phoneNumber];
        throw err;
    }
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
    res.json({ status: session.status, code: session.code });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date(),
        activeSessions: Object.keys(activeSessions).length
    });
});

// ── Start server ───────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🌐 AKANE MD Web Server running on port ${PORT}`);
    console.log(`🔗 Visit: http://localhost:${PORT}`);
});

// Auto-reconnect existing sessions on startup
async function restoreExistingSessions() {
    console.log('♻️ Restoring existing sessions...');
    const restored = await restoreSessions(handleIncomingMessage, {
        onConnected: (phoneNumber) => {
            console.log(`✅ Restored session for ${phoneNumber}`);
            if (activeSessions[phoneNumber]) {
                activeSessions[phoneNumber].status = 'connected';
            } else {
                activeSessions[phoneNumber] = { status: 'connected', code: null };
            }
            
            // Setup config for restored user
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
        },
        onDisconnect: (phoneNumber, statusCode) => {
            console.log(`❌ Restored session ${phoneNumber} disconnected`);
            if (activeSessions[phoneNumber]) {
                activeSessions[phoneNumber].status = 'disconnected';
            }
        }
    });
    
    console.log(`♻️ Restored ${restored.length} sessions`);
}

restoreExistingSessions();