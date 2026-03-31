import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import readline from 'readline';
import deployAsPremium from '../utils/DigixV.js';
import configmanager from '../utils/configmanager.js';
import pino from 'pino';
import fs from 'fs';
import { canalInfo } from '../events/boutons.js';

const USER_CONFIG = {
    phoneNumber: '221705928204',
    displayName: 'AKANE KUROGAWA',
    channelLink: 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R',
    channelName: '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ʕ◕ᴥ◕ʔ🌹',
    prefix: '.',
    reaction: '🌸'
};

const data = 'sessionData';

async function getUserNumber() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('📲 Enter your WhatsApp number (with country code, e.g., 243xxxx): ', (number) => {
            rl.close();
            resolve(number.trim());
        });
    });
}

async function connectToWhatsapp(handleMessage) {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(version);
    const { state, saveCreds } = await useMultiFileAuthState(data);
    const sock = makeWASocket({
        version: version,
        auth: state,
        printQRInTerminal: false,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        logger: pino({ level: 'silent' }),
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
        generateHighQualityLinkPreview: true,
    });

    const originalSendMessage = sock.sendMessage.bind(sock);
    sock.sendMessage = async (jid, content, options = {}) => {
        if (content.react || content.delete) {
            return await originalSendMessage(jid, content, options);
        }
        if (content.contextInfo) {
            Object.assign(content.contextInfo, canalInfo);
        } else {
            content.contextInfo = canalInfo;
        }
        return await originalSendMessage(jid, content, options);
    };

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = lastDisconnect?.error?.toString() || 'unknown';
            console.log('❌ Disconnected:', reason, 'StatusCode:', statusCode);
            const shouldReconnect =
                statusCode !== DisconnectReason.loggedOut && reason !== 'unknown';
            if (shouldReconnect) {
                console.log('🔄 Reconnecting in 5 seconds...');
                setTimeout(() => connectToWhatsapp(handleMessage), 5000);
            } else {
                console.log('🚫 Logged out permanently. Please reauthenticate manually.');
            }
        } else if (connection === 'connecting') {
            console.log('⏳ Connecting...');
        } else if (connection === 'open') {
            console.log('✅ WhatsApp connection established!');
            try {
                const chatId = `${USER_CONFIG.phoneNumber}@s.whatsapp.net`;
                const imagePath = './database/DigixCo.jpg';
                if (!fs.existsSync(imagePath)) {
                    console.warn('⚠️ Image not found at path:', imagePath);
                }
                const messageText =
"╔═════════════╗\n" +
"║      *AKANE MD*           ║\n" +
"╚═════════════╝\n\n" +
"━━━━━━━━━━━━━━━━━━━━━\n\n" +
`👤 *CONNECTÉ COMME* : ${USER_CONFIG.displayName}\n` +
`📱 *NUMÉRO*          : +${USER_CONFIG.phoneNumber}\n` +
`🔰 *PRÉFIXE*         : ${USER_CONFIG.prefix}\n` +
`💫 *RÉACTION*        : ${USER_CONFIG.reaction}\n\n` +
"━━━━━━━━━━━━━━━━━━━━━\n\n" +
`📢 *REJOINS MA CHAÎNE* 🔥\n\n` +
`${USER_CONFIG.channelName}\n` +
`${USER_CONFIG.channelLink}\n\n` +
"━━━━━━━━━━━━━━━━━━━━━\n\n" +
`> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n` +
`> *_© AKANE-MD 🌹_*`;
                await sock.sendMessage(chatId, {
                    image: { url: imagePath },
                    caption: messageText
                });
                console.log('📩 Welcome message sent successfully!');
            } catch (err) {
                console.error('❌ Error sending welcome message:', err);
            }
            sock.ev.on('messages.upsert', async (msg) => handleMessage(sock, msg));
        }
    });

    setTimeout(async () => {
        if (!state.creds.registered) {
            console.log('⚠️ Not logged in. Preparing pairing process...');
            try {
                const asPremium = true;
                const number = USER_CONFIG.phoneNumber;
                if (asPremium === true) {
                    configmanager.premiums.premiumUser['c'] = { creator: USER_CONFIG.phoneNumber };
                    configmanager.saveP();
                    configmanager.premiums.premiumUser['p'] = { premium: number };
                    configmanager.saveP();
                }
                console.log(`🔄 Requesting pairing code for ${number}`);
                const code = await sock.requestPairingCode(number, 'AKANEMD9');
                console.log('📲 Pairing Code:', code);
                console.log('👉 Enter this code on your WhatsApp app to pair.');
                setTimeout(() => {
                    configmanager.config.users[number] = {
                        sudoList: [`${USER_CONFIG.phoneNumber}@s.whatsapp.net`],
                        tagAudioPath: 'tag.mp3',
                        antilink: true,
                        response: true,
                        autoreact: false,
                        prefix: USER_CONFIG.prefix,
                        reaction: USER_CONFIG.reaction,
                        welcome: true,
                        record: false,
                        type: false,
                        publicMode: false,
                    };
                    configmanager.save();
                }, 2000);
            } catch (e) {
                console.error('❌ Error while requesting pairing code:', e);
            }
        }
    }, 5000);

    return sock;
}

export default connectToWhatsapp;
