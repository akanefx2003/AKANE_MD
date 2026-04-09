import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import pino from 'pino';
import fs from 'fs';

// Configuration par défaut
const DEFAULT_CONFIG = {
    displayName: 'AKANE KUROGAWA',
    channelLink: 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R',
    channelName: '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ʕ◕ᴥ◕ʔ🌹',
    prefix: '.',
    reaction: '🌸'
};

// Fonction pour connecter un utilisateur spécifique
async function connectToWhatsapp(phoneNumber, handleMessage, callbacks = {}) {
    const sessionDir = `sessions/${phoneNumber}`;
    
    // Créer le dossier si nécessaire
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }
    
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    const sock = makeWASocket({
        version: version,
        auth: state,
        printQRInTerminal: false,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        logger: pino({ level: 'silent' }),
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
        generateHighQualityLinkPreview: true,
    });

    // Sauvegarde des credentials
    sock.ev.on('creds.update', saveCreds);

    // Gestion de la connexion
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr, code } = update;
        
        // Capturer le QR code
        if (qr && callbacks.onQR) {
            callbacks.onQR(qr);
        }
        
        // Capturer le code de connexion
        if (code && callbacks.onCode) {
            callbacks.onCode(code);
        }
        
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log(`❌ [${phoneNumber}] Disconnected. Status:`, statusCode);
            
            if (callbacks.onDisconnect) {
                callbacks.onDisconnect(statusCode);
            }
            
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log(`🔄 [${phoneNumber}] Reconnecting in 5s...`);
                setTimeout(() => connectToWhatsapp(phoneNumber, handleMessage, callbacks), 5000);
            }
        } else if (connection === 'connecting') {
            console.log(`⏳ [${phoneNumber}] Connecting...`);
        } else if (connection === 'open') {
            console.log(`✅ [${phoneNumber}] WhatsApp connected!`);
            
            if (callbacks.onConnected) {
                callbacks.onConnected();
            }
            
            // Envoyer message de bienvenue (optionnel)
            try {
                const chatId = `${phoneNumber}@s.whatsapp.net`;
                const imagePath = './database/DigixCo.jpg';
                
                const messageText = 
"┌─────────────────────┐\n" +
"│     *AKANE MD*      │\n" +
"└─────────────────────┘\n\n" +
"───────────────────────\n\n" +
`👤 *CONNECTÉ COMME* : ${DEFAULT_CONFIG.displayName}\n` +
`📱 *NUMÉRO*          : +${phoneNumber}\n` +
`🔰 *PRÉFIXE*         : ${DEFAULT_CONFIG.prefix}\n` +
`💫 *RÉACTION*        : ${DEFAULT_CONFIG.reaction}\n\n` +
"───────────────────────\n\n" +
`📢 *REJOINS MA CHAÎNE* 🔥\n\n` +
`${DEFAULT_CONFIG.channelName}\n` +
`${DEFAULT_CONFIG.channelLink}\n\n` +
"───────────────────────\n\n" +
`> *DEV : 🍁AKANE KUROGAWA ʕ◕ᴥ◕ʔ🌹*\n\n` +
`> *© AKANE-MD 🌹*`;

                if (fs.existsSync(imagePath)) {
                    await sock.sendMessage(chatId, {
                        image: { url: imagePath },
                        caption: messageText
                    });
                } else {
                    await sock.sendMessage(chatId, { text: messageText });
                }
                console.log(`📨 Welcome message sent to ${phoneNumber}`);
            } catch (err) {
                console.error(`❌ Error sending welcome message:`, err);
            }
            
            // Écouter les messages
            sock.ev.on('messages.upsert', async (msg) => {
                if (handleMessage) {
                    await handleMessage(sock, msg);
                }
            });
        }
    });

    // Si non connecté, générer le code de paire
    if (!state.creds.registered) {
        console.log(`🔑 Generating pairing code for ${phoneNumber}...`);
        try {
            const code = await sock.requestPairingCode(phoneNumber, 'AKANEMD9');
            console.log(`📱 Pairing code for ${phoneNumber}: ${code}`);
            
            if (callbacks.onCode) {
                callbacks.onCode(code);
            }
            
            return { sock, code };
        } catch (err) {
            console.error(`❌ Error generating pairing code:`, err);
            throw err;
        }
    }
    
    return { sock };
}

// Fonction pour restaurer les sessions existantes
async function restoreSessions(handleMessage, callbacks = {}) {
    const sessionsDir = 'sessions';
    if (!fs.existsSync(sessionsDir)) return [];
    
    const folders = fs.readdirSync(sessionsDir);
    const restored = [];
    
    for (const folder of folders) {
        const credFile = `${sessionsDir}/${folder}/creds.json`;
        if (fs.existsSync(credFile)) {
            console.log(`♻️ Restoring session for: ${folder}`);
            try {
                await connectToWhatsapp(folder, handleMessage, callbacks);
                restored.push(folder);
            } catch (err) {
                console.error(`❌ Failed to restore ${folder}:`, err);
            }
        }
    }
    
    return restored;
}

export default { connectToWhatsapp, restoreSessions };