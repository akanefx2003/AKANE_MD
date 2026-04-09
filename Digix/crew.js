import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import pino from 'pino';
import fs from 'fs';

const USER_CONFIG = {
    phoneNumber: '221705928204',
    displayName: 'AKANE KUROGAWA',
    channelLink: 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R',
    channelName: '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ʕ◕ᴥ◕ʔ🌹',
    prefix: '.',
    reaction: '🌸'
};

const data = 'sessionData';

async function connectToWhatsapp(handleMessage) {
    const { version } = await fetchLatestBaileysVersion();
    console.log('📱 Version:', version);
    
    const { state, saveCreds } = await useMultiFileAuthState(data);
    
    const sock = makeWASocket({
        version: version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        getMobile: async () => {
            return {
                onCode: (code) => {
                    console.log(`\n🔑 CODE DE CONNEXION : ${code}\n`);
                    console.log(`📱 Entre ce code dans WhatsApp > Appareils liés > Lier un appareil\n`);
                }
            };
        }
    });

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log('❌ Déconnecté, code:', statusCode);
            if (statusCode !== DisconnectReason.loggedOut) {
                console.log('🔄 Reconnexion dans 5s...');
                setTimeout(() => connectToWhatsapp(handleMessage), 5000);
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp connecté !');
            sock.ev.on('messages.upsert', async (msg) => handleMessage(sock, msg));
        }
    });

    setTimeout(async () => {
        if (!state.creds.registered) {
            console.log('🔑 Demande du code de connexion...');
            try {
                const code = await sock.requestPairingCode(USER_CONFIG.phoneNumber, 'AKANEMD9');
                console.log(`\n🔑 VOTRE CODE : ${code}\n`);
            } catch (err) {
                console.error('❌ Erreur:', err);
            }
        }
    }, 3000);

    return sock;
}

export default connectToWhatsapp;