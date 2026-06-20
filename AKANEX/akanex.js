import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@crysnovax/baileys';
import pino from 'pino';
import fs from 'fs';
import configmanager from '../utils/configmanager.js';
import { canalInfo } from '../akane/boutons.js';

// 🌟 NOUVEAU : Récupère le numéro passé par le serveur web (ou utilise ton numéro par défaut en secours)
const targetNumber = process.argv[2] || '221705928204';

const USER_CONFIG = {
    phoneNumber: targetNumber,
    displayName: 'AKANE',
    channelLink: 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R',
    channelName: '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ʕ◕ᴥ◕ʔ🌹',
    prefix: '.',
    reaction: '🌹'
};

const PAIR_SESSIONS_FILE = './sessions/pair_sessions.json';
// 🌟 NOUVEAU : On cible directement le dossier créé par le site web !
const data = `sessions/pair_${targetNumber}`;

// ─── Stats bots parrainés ─────────────────────────────────────────────────────

function getPairStats() {
    try {
        if (!fs.existsSync(PAIR_SESSIONS_FILE)) return { total: 0, alive: 0, dead: 0 };
        const list = JSON.parse(fs.readFileSync(PAIR_SESSIONS_FILE, 'utf-8'));
        const total = list.length;
        const alive = list.filter(e => e?.status !== 'dead').length;
        const dead = total - alive;
        return { total, alive, dead };
    } catch (e) { return { total: 0, alive: 0, dead: 0 }; }
}

async function connectToWhatsapp(handleMessage) {
    const { version } = await fetchLatestBaileysVersion();
    console.log(`📱 Version: ${version} | Démarrage bot pour +${targetNumber}`);

    const { state, saveCreds } = await useMultiFileAuthState(data);

    const sock = makeWASocket({
        version: version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        syncFullHistory: true,
        markOnlineOnConnect: true,
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            return { conversation: '' };
        },
        patchMessageBeforeSending: (msg) => {
            const requiresPatch = !!(msg.buttonsMessage || msg.listMessage || msg.templateMessage);
            if (requiresPatch) {
                msg = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {}
                            },
                            ...msg
                        }
                    }
                };
            }
            return msg;
        }
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

            console.log('❌ Déconnecté:', reason, 'Code:', statusCode);

            if (reason.includes('Bad MAC') || reason.includes('bad-mac') || reason.includes('Bad Session')) {
                console.log('🧹 Bad MAC détecté — nettoyage des sessions corrompues...');
                try {
                    const sessionDir = `./${data}`;
                    const files = fs.readdirSync(sessionDir);
                    for (const file of files) {
                        if (file !== 'creds.json' && (file.endsWith('.json') || file.endsWith('.bin'))) {
                            fs.unlinkSync(`${sessionDir}/${file}`);
                            console.log(`🗑️ Supprimé: ${file}`);
                        }
                    }
                    console.log('✅ Sessions nettoyées — reconnexion dans 3 secondes...');
                } catch (cleanErr) {
                    console.error('❌ Erreur nettoyage:', cleanErr.message);
                }
                setTimeout(() => connectToWhatsapp(handleMessage), 3000);
                return;
            }

            if (statusCode !== DisconnectReason.loggedOut) {
                console.log('🔄 Reconnexion dans 5 secondes...');
                setTimeout(() => connectToWhatsapp(handleMessage), 5000);
            } else {
                console.log('🚫 Déconnecté définitivement (logout)');
            }

        } else if (connection === 'connecting') {
            console.log('⏳ Connexion en cours...');

        } else if (connection === 'open') {
            console.log('✅ WhatsApp connecté !');

            try {
                const chatId = `${USER_CONFIG.phoneNumber}@s.whatsapp.net`;
                const stats = getPairStats();

                const savedConfig = configmanager.config.users?.[USER_CONFIG.phoneNumber];
                const currentPrefix   = savedConfig?.prefix   ?? USER_CONFIG.prefix;
                const currentReaction = savedConfig?.reaction ?? USER_CONFIG.reaction;

                await sock.sendMessage(chatId, {
                    image: { url: './database/DigixCo.jpg' },
                    jpegThumbnail: null,
                    caption:
`╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊👤 CONNECTE : ${USER_CONFIG.displayName}*
┊
*┊📱 NUMERO : +${USER_CONFIG.phoneNumber}*
┊
*┊⚙️ PREFIXE : ${currentPrefix}*
┊
*┊🌹 REACTION : ${currentReaction}*
┊
*┊📊 STATS BOTS PARRAINES :*
*┊🔢 TOTAL : ${stats.total}*
*┊🟢 EN VIE : ${stats.alive}*
*┊🔴 DECONNECTES : ${stats.dead}*
┊
*┊📢 REJOINS MA CHAINE 🔥*
*┊${USER_CONFIG.channelLink}*
┊
╰─────────────────❂`
                });

                console.log('📩 Message envoyé !');

            } catch (err) {
                console.error('❌ Erreur message:', err);
            }

            sock.ev.on('messages.upsert', async (msg) => handleMessage(sock, msg));
        }
    });

    sock.ev.on("group-participants.update", async (event) => {
        const { id, action, participants } = event;

        if (action !== "add") return;

        const welcomeConfig = JSON.parse(
            fs.existsSync('welcome.json')
                ? fs.readFileSync('welcome.json', 'utf-8')
                : '{"groups":[]}'
        );

        if (!welcomeConfig.groups.includes(id)) return;

        try {
            const metadata = await sock.groupMetadata(id);
            const groupName = metadata.subject;
            const groupDesc = metadata.desc || '';

            for (const participant of participants) {
                const pId = typeof participant === "object" ? participant.id : participant;
                const pNum = pId.split('@')[0];

                let text = `Bienvenue @${pNum}\n\n`;
                if (groupDesc) text += `📝 Description:\n${groupDesc}\n\n`;
                text += `Bienvenue dans *${groupName}* 🎉`;

                try {
                    const groupPic = await sock.profilePictureUrl(id, 'image');
                    await sock.sendMessage(id, { image: { url: groupPic }, caption: text, mentions: [pId] });
                } catch {
                    await sock.sendMessage(id, { image: { url: './database/menu.jpg' }, caption: text, mentions: [pId] });
                }
            }

        } catch (err) {
            console.log('❌ Welcome error:', err.message);
        }
    });

    return sock;
}

export default connectToWhatsapp;