import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, Browsers } from 'baileys';
import pino from 'pino';
import fs from 'fs';
import handleIncomingMessage from '../akane/akanes.js';
import configmanager from '../utils/configmanager.js';
import { canalInfo } from '../akane/boutons.js';

const activePairSockets = new Map();

async function startPairSocket(targetNumber, sessionDir, client, sender, isRetry = false) {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const pairSock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        syncFullHistory: false,
        markOnlineOnConnect: false,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
    });

    activePairSockets.set(targetNumber, pairSock);
    pairSock.ev.on('creds.update', saveCreds);

    let codeSent = isRetry; // si c'est une reconnexion, ne pas renvoyer le code

    pairSock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        // Envoyer le code seulement au premier démarrage
        if (!codeSent && connection === 'connecting') {
            codeSent = true;

            await new Promise(r => setTimeout(r, 5000));

            try {
                const code = await pairSock.requestPairingCode(targetNumber);
                const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;

                await client.sendMessage(sender, {
                    text:
`╔══════════════════╗
║   🔑 *CODE DE CONNEXION*   ║
╚══════════════════╝

━━━━━━━━━━━━━━━━━━━━━

📱 *Numéro :* +${targetNumber}

🔑 *Code :*
*${formattedCode}*

━━━━━━━━━━━━━━━━━━━━━

📌 *Comment l'utiliser :*
1️⃣ Ouvre WhatsApp sur +${targetNumber}
2️⃣ Va dans *Paramètres*
3️⃣ *Appareils liés*
4️⃣ *Lier un appareil*
5️⃣ *Lier avec un numéro*
6️⃣ Entre le code : *${formattedCode}*

⚠️ *Ce code expire dans 60 secondes !*

> *© AKANE-MD 🌹*`
                });

            } catch (err) {
                await client.sendMessage(sender, {
                    text: `❌ *Erreur génération du code*\n🔍 *Raison :* ${err.message}`
                });
                cleanup(targetNumber, sessionDir, pairSock);
            }
        }

        if (connection === 'open') {
            activePairSockets.delete(targetNumber);

            // ✅ Override sendMessage avec canalInfo comme akanex.js
            const originalSendMessage = pairSock.sendMessage.bind(pairSock);
            pairSock.sendMessage = async (jid, content, options = {}) => {
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

            // ✅ Config auto pour ce numéro — lecture fraîche depuis le fichier
            // pour ne pas écraser le préfixe du bot originel en mémoire
            const rawConfig = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
            rawConfig.users = rawConfig.users || {};
            rawConfig.users[targetNumber] = {
                ...(rawConfig.users[targetNumber] || {}),
                sudoList: [`${targetNumber}@s.whatsapp.net`],
                tagAudioPath: 'tag.mp3',
                antilink: true,
                response: true,
                autoreact: false,
                prefix: '.', // ✅ Toujours '.' pour le bot parrain
                reaction: '🌸',
                welcome: true,
                record: false,
                type: false,
                publicMode: false,
            };
            // ✅ Écrire directement dans le fichier SANS passer par configmanager
            // pour ne pas toucher à la config en mémoire du bot originel
            fs.writeFileSync('./config.json', JSON.stringify(rawConfig, null, 2));
            // ✅ Sync aussi en mémoire uniquement pour ce nouveau numéro
            configmanager.config.users[targetNumber] = rawConfig.users[targetNumber];

            // ✅ Message d'accueil identique à akanex.js
            try {
                const messageText =
`╔═════════════╗
║      *AKANE MD*           ║
╚═════════════╝

━━━━━━━━━━━━━━━━━━━━━

👤 *CONNECTÉ COMME* : AKANE KUROGAWA
📱 *NUMÉRO*          : +${targetNumber}
🔰 *PRÉFIXE*         : .
💫 *RÉACTION*        : 🌸

━━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ʕ◕ᴥ◕ʔ🌹
https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R

━━━━━━━━━━━━━━━━━━━━━

> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*
> *_© AKANE-MD 🌹_*`;
                await pairSock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                    image: { url: './database/DigixCo.jpg' },
                    caption: messageText
                });
            } catch (e) {}

            // ✅ Activer la réception des messages → le socket devient un vrai bot
            pairSock.ev.on('messages.upsert', async (msg) => {
                handleIncomingMessage(pairSock, msg);
            });

            // Notifier celui qui a fait .pair
            await client.sendMessage(sender, {
                text: `✅ *+${targetNumber} est maintenant actif comme bot !*\n\n> *© AKANE-MD 🌹*`
            });
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;

            if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                // Refus définitif
                cleanup(targetNumber, sessionDir, pairSock);
            } else if (activePairSockets.has(targetNumber)) {
                // ✅ Reconnexion automatique — comme akanex.js
                // WhatsApp coupe brièvement pendant la validation du code
                console.log(`🔄 Reconnexion pair ${targetNumber} (code: ${statusCode})...`);
                setTimeout(() => {
                    if (activePairSockets.has(targetNumber)) {
                        startPairSocket(targetNumber, sessionDir, client, sender, true);
                    }
                }, 3000);
            }
        }
    });

    return pairSock;
}

async function handlePairCommand(client, message, args) {
    const sender = message.key.remoteJid;

    let targetNumber = args[0]?.replace(/[^0-9]/g, '');

    if (!targetNumber || targetNumber.length < 7) {
        await client.sendMessage(sender, {
            text: `❌ *Numéro invalide !*\n\n📌 *Usage :* \`.pair <numéro>\`\n📌 *Exemple :* \`.pair 221705928204\`\n\n> Mets le numéro complet avec l'indicatif pays (sans + ni espaces)`
        });
        return;
    }

    // Tuer ancienne session si elle existe
    if (activePairSockets.has(targetNumber)) {
        try { activePairSockets.get(targetNumber).ws.close(); } catch {}
        activePairSockets.delete(targetNumber);
        await new Promise(r => setTimeout(r, 2000));
    }

    await client.sendMessage(sender, {
        text: `⏳ *Génération du code...*\n\n📱 *Numéro :* +${targetNumber}\n\nPatiente quelques secondes 🔄`
    });

    const sessionDir = `./sessions/pair_${targetNumber}`;

    try {
        // Session vierge = code frais
        if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
        }
        fs.mkdirSync(sessionDir, { recursive: true });

        await startPairSocket(targetNumber, sessionDir, client, sender, false);

        // Timeout 5 minutes
        setTimeout(() => {
            if (activePairSockets.has(targetNumber)) {
                const sock = activePairSockets.get(targetNumber);
                cleanup(targetNumber, sessionDir, sock);
            }
        }, 300000);

    } catch (err) {
        console.error('❌ Erreur pair:', err);
        cleanup(targetNumber, sessionDir, null);
        await client.sendMessage(sender, {
            text: `❌ *Erreur :* ${err.message}`
        });
    }
}

function cleanup(number, sessionDir, sock) {
    if (sock) {
        try { sock.ws.close(); } catch {}
    }
    activePairSockets.delete(number);
    setTimeout(() => {
        try {
            if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
            }
        } catch {}
    }, 3000);
}

export default handlePairCommand;
