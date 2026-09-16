import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import pino from 'pino';
import fs from 'fs';
import zlib from 'zlib';
import configmanager from '../utils/configmanager.js';
import { canalInfo } from '../akane/boutons.js';

const USER_CONFIG = {
    phoneNumber: '221769825107',
    displayName: 'AKANE',
    channelLink: 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R',
    channelName: '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ʕ◕ᴥ◕ʔ🌹',
    prefix: '.',
    reaction: '🌹'
};

const PAIR_SESSIONS_FILE = './sessions/pair_sessions.json';
const data = 'sessionData';

// ─── Session pré-générée par le site (SESSION_ID) ────────────────────────────
// Si SESSION_ID (format "AKANE~...") est défini et qu'aucune session locale
// n'existe déjà, on restaure creds.json directement dans sessionData/ avant
// useMultiFileAuthState() : state.creds.registered vaut alors déjà true, donc
// le bloc de pairing par numéro plus bas ne se déclenche jamais.
function decodeSessionId(sessionId) {
    const raw = Buffer.from(sessionId.slice('AKANE~'.length), 'base64');
    try {
        return JSON.parse(zlib.gunzipSync(raw).toString('utf-8'));
    } catch (e) {
        return JSON.parse(raw.toString('utf-8')); // ancien format non compressé
    }
}
function bootstrapSessionFromEnv() {
    const sessionId = process.env.SESSION_ID;
    if (!sessionId || !sessionId.startsWith('AKANE~')) return;
    const credsPath = `./${data}/creds.json`;
    if (fs.existsSync(credsPath)) return;
    try {
        const creds = decodeSessionId(sessionId);
        fs.mkdirSync(`./${data}`, { recursive: true });
        fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2));
        console.log('🔑 Session restaurée depuis SESSION_ID — pas de code de pairing nécessaire.');
    } catch (e) {
        console.error('❌ SESSION_ID invalide/corrompu, retour au pairing par numéro :', e.message);
    }
}
bootstrapSessionFromEnv();

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
    console.log('📱 Version:', version);

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
        // ✅ Fix Bad MAC Error — nettoyer les sessions Signal corrompues
        getMessage: async (key) => {
            return { conversation: '' };
        },
        patchMessageBeforeSending: (msg) => {
            // interactiveMessage (native flow / interactiveButtons) doit être
            // inclus ici, sinon WhatsApp ignore silencieusement le bouton —
            // c'était l'oubli qui faisait que le message d'accueil n'avait
            // jamais de bouton natif malgré interactiveButtons plus bas.
            const requiresPatch = !!(msg.buttonsMessage || msg.listMessage || msg.templateMessage || msg.interactiveMessage);
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

    // 🔥 Override sendMessage (canal + boutons)
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

            // ✅ Fix Bad MAC — nettoyer les sessions Signal corrompues et reconnecter
            if (reason.includes('Bad MAC') || reason.includes('bad-mac') || reason.includes('Bad Session')) {
                console.log('🧹 Bad MAC détecté — nettoyage des sessions corrompues...');
                try {
                    const sessionDir = `./${data}`;
                    const files = fs.readdirSync(sessionDir);
                    for (const file of files) {
                        // Supprimer uniquement les fichiers de sessions (pas creds.json)
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
                // sock.user.id reflète le numéro réel de la session utilisée
                // (utile si SESSION_ID appartient à un autre numéro que celui
                // codé en dur dans USER_CONFIG.phoneNumber).
                const connectedNumber = sock.user.id.split(':')[0].split('@')[0];
                const chatId = `${connectedNumber}@s.whatsapp.net`;
                const stats = getPairStats();

                // ─── Lecture du préfixe et de la réaction sauvegardés ───────────
                const savedConfig = configmanager.config.users?.[connectedNumber];
                const currentPrefix   = savedConfig?.prefix   ?? USER_CONFIG.prefix;
                const currentReaction = savedConfig?.reaction ?? USER_CONFIG.reaction;
                // ────────────────────────────────────────────────────────────────

                const welcomeCaption =
`╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊👤 CONNECTE : ${USER_CONFIG.displayName}*
┊
*┊📱 NUMERO : +${connectedNumber}*
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
╰─────────────────❂`;

                try {
                    await sock.sendMessage(chatId, {
                        image: { url: './database/DigixCo.jpg' },
                        jpegThumbnail: null,
                        caption: welcomeCaption,
                        footer: USER_CONFIG.channelName,
                        interactiveButtons: [
                            {
                                name: 'cta_url',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'Voir la chaîne',
                                    url: USER_CONFIG.channelLink,
                                    merchant_url: USER_CONFIG.channelLink
                                })
                            }
                        ]
                    });
                } catch (btnErr) {
                    console.log('⚠️ Bouton natif non supporté, envoi sans bouton :', btnErr.message);
                    await sock.sendMessage(chatId, {
                        image: { url: './database/DigixCo.jpg' },
                        jpegThumbnail: null,
                        caption: welcomeCaption
                    });
                }

                console.log('📩 Message envoyé !');

            } catch (err) {
                console.error('❌ Erreur message:', err);
            }

            sock.ev.on('messages.upsert', async (msg) => handleMessage(sock, msg));
        }
    });

    // 🔑 Pairing + config auto
    setTimeout(async () => {
        if (!state.creds.registered) {
            console.log('🔑 Demande du code...');

            try {
                const number = USER_CONFIG.phoneNumber;

                configmanager.premiums.premiumUser['c'] = { creator: number };
                configmanager.saveP();
                configmanager.premiums.premiumUser['p'] = { premium: number };
                configmanager.saveP();

                const code = await sock.requestPairingCode(number, 'AKANEMD9');
                console.log(`\n🔑 CODE : ${code}\n`);

                setTimeout(() => {
                    // N'écrase la config que si elle n'existe pas encore
                    if (!configmanager.config.users[number]) {
                        configmanager.config.users[number] = {
                            sudoList: [`${number}@s.whatsapp.net`],
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
                    }
                }, 2000);

            } catch (err) {
                console.error('❌ Erreur pairing:', err);
            }
        }
    }, 4000);

    // 👥 Welcome groupe
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
