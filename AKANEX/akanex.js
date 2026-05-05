import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import pino from 'pino';
import fs from 'fs';
import configmanager from '../utils/configmanager.js';
import { canalInfo } from '../akane/boutons.js';

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
        syncFullHistory: true,
        markOnlineOnConnect: true,
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
        generateHighQualityLinkPreview: true,
        getMobile: async () => ({
            onCode: (code) => {
                console.log(`\n🔑 CODE DE CONNEXION : ${code}\n`);
                console.log(`📱 WhatsApp > Appareils liés > Lier un appareil\n`);
            }
        })
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

            // 📩 Message privé après connexion
            try {
                const chatId = `${USER_CONFIG.phoneNumber}@s.whatsapp.net`;
                const imagePath = './database/DigixCo.jpg';

                const messageText =
`╔═════════════╗
║      *AKANE MD*           ║
╚═════════════╝

━━━━━━━━━━━━━━━━━━━━━

👤 *CONNECTÉ COMME* : ${USER_CONFIG.displayName}
📱 *NUMÉRO*          : +${USER_CONFIG.phoneNumber}
🔰 *PRÉFIXE*         : ${USER_CONFIG.prefix}
💫 *RÉACTION*        : ${USER_CONFIG.reaction}

━━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

${USER_CONFIG.channelName}
${USER_CONFIG.channelLink}

━━━━━━━━━━━━━━━━━━━━━

> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*
> *_© AKANE-MD 🌹_*`;

                await sock.sendMessage(chatId, {
                    image: { url: imagePath },
                    caption: messageText
                });

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

                // ⭐ Premium auto
                configmanager.premiums.premiumUser['c'] = { creator: number };
                configmanager.saveP();
                configmanager.premiums.premiumUser['p'] = { premium: number };
                configmanager.saveP();

                const code = await sock.requestPairingCode(number, 'AKANEMD9');
                console.log(`\n🔑 CODE : ${code}\n`);

                // ⚙️ Config utilisateur auto
                setTimeout(() => {
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
                }, 2000);

            } catch (err) {
                console.error('❌ Erreur pairing:', err);
            }
        }
    }, 4000);

    // 👥 Welcome groupe (gardé de crew(1).js)
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

                if (groupDesc) {
                    text += `📝 Description:\n${groupDesc}\n\n`;
                }

                text += `Bienvenue dans *${groupName}* 🎉`;

                try {
                    const groupPic = await sock.profilePictureUrl(id, 'image');
                    await sock.sendMessage(id, {
                        image: { url: groupPic },
                        caption: text,
                        mentions: [pId]
                    });
                } catch {
                    await sock.sendMessage(id, {
                        image: { url: './database/menu.jpg' },
                        caption: text,
                        mentions: [pId]
                    });
                }
            }

        } catch (err) {
            console.log('❌ Welcome error:', err.message);
        }
    });

    return sock;
}

export default connectToWhatsapp;
