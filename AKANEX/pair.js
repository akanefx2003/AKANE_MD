import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, Browsers } from 'baileys';
import pino from 'pino';
import fs from 'fs';
import handleIncomingMessage from '../akane/akanes.js';
import configmanager from '../utils/configmanager.js';
import { canalInfo } from '../akane/boutons.js';

const activePairSockets = new Map();
const PAIR_SESSIONS_FILE = './sessions/pair_sessions.json';

// ─── Persistance sessions ─────────────────────────────────────────────────────

function savePairSession(number) {
    try {
        if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions', { recursive: true });
        let list = fs.existsSync(PAIR_SESSIONS_FILE)
            ? JSON.parse(fs.readFileSync(PAIR_SESSIONS_FILE, 'utf-8')) : [];
        if (!list.includes(number)) {
            list.push(number);
            fs.writeFileSync(PAIR_SESSIONS_FILE, JSON.stringify(list, null, 2));
        }
    } catch (e) {}
}

function removePairSession(number) {
    try {
        if (!fs.existsSync(PAIR_SESSIONS_FILE)) return;
        let list = JSON.parse(fs.readFileSync(PAIR_SESSIONS_FILE, 'utf-8'));
        list = list.filter(n => n !== number);
        fs.writeFileSync(PAIR_SESSIONS_FILE, JSON.stringify(list, null, 2));
    } catch (e) {}
}

// ─── Config sans toucher au bot originel ─────────────────────────────────────

function writeConfigForNumber(number) {
    try {
        const raw = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
        raw.users = raw.users || {};
        if (!raw.users[number]) {
            raw.users[number] = {
                sudoList: [`${number}@s.whatsapp.net`],
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
            // ✅ Écriture directe — jamais configmanager.save()
            fs.writeFileSync('./config.json', JSON.stringify(raw, null, 2));
        }
        if (!configmanager.config.users[number]) {
            configmanager.config.users[number] = raw.users[number];
        }
    } catch (e) { console.error('❌ writeConfigForNumber:', e.message); }
}

function getPrefix(number) {
    try {
        const raw = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
        return raw.users?.[number]?.prefix || '.';
    } catch (e) { return '.'; }
}

// ─── Démarrer le socket bot parrain ──────────────────────────────────────────

async function startBotSocket(number, sessionDir, notifyClient, notifySender, isRestore) {
    // Fermer l'ancien socket si existant
    if (activePairSockets.has(number)) {
        try { activePairSockets.get(number).ws.close(); } catch {}
        activePairSockets.delete(number);
        await new Promise(r => setTimeout(r, 1000));
    }

    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        syncFullHistory: false,
        markOnlineOnConnect: true,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
    });

    // ✅ Toujours dans la map — même après connexion
    activePairSockets.set(number, sock);
    sock.ev.on('creds.update', saveCreds);

    let codeSent = isRestore;
    let msgHandlerAttached = false;
    // ✅ firstOpen = true seulement lors de la toute première connexion (pas restore, pas reconnexion)
    let firstOpen = !isRestore;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        // ── Envoyer le code de pairing ──
        if (!codeSent && connection === 'connecting') {
            codeSent = true;
            await new Promise(r => setTimeout(r, 5000));
            try {
                const code = await sock.requestPairingCode(number);
                const fmt = code.match(/.{1,4}/g)?.join('-') || code;
                if (notifyClient && notifySender) {
                    // ✅ Message texte avec instructions
                    await notifyClient.sendMessage(notifySender, {
                        text:
`╔══════════════════╗
║   🔑 *CODE DE CONNEXION*   ║
╚══════════════════╝

━━━━━━━━━━━━━━━━━━━━━

📱 *Numéro :* +${number}

🔑 *Code :*
*${fmt}*

━━━━━━━━━━━━━━━━━━━━━

📌 *Comment l'utiliser :*
1️⃣ Ouvre WhatsApp sur +${number}
2️⃣ Va dans *Paramètres*
3️⃣ *Appareils liés*
4️⃣ *Lier un appareil*
5️⃣ *Lier avec un numéro*
6️⃣ Entre le code : *${fmt}*

⚠️ *Ce code expire dans 60 secondes !*

> *© AKANE-MD 🌹*`
                    });

                    // ✅ Message contenant uniquement le code brut
                    // WhatsApp affiche automatiquement le bouton "Copier" sur les codes courts
                    await notifyClient.sendMessage(notifySender, {
                        text: fmt
                    });
                }
            } catch (err) {
                if (notifyClient && notifySender) {
                    await notifyClient.sendMessage(notifySender, {
                        text: `❌ *Erreur génération du code*\n🔍 *Raison :* ${err.message}`
                    }).catch(() => {});
                }
            }
        }

        // ── Connexion établie ──
        if (connection === 'open') {
            console.log(`✅ Bot parrain +${number} connecté`);

            // Override sendMessage avec canalInfo
            const orig = sock.sendMessage.bind(sock);
            sock.sendMessage = async (jid, content, opts = {}) => {
                if (content.react || content.delete) return orig(jid, content, opts);
                content.contextInfo = { ...(content.contextInfo || {}), ...canalInfo };
                return orig(jid, content, opts);
            };

            // Config sans toucher au bot originel
            writeConfigForNumber(number);

            // Sauvegarder pour redémarrage
            savePairSession(number);

            // ✅ Handler messages — une seule fois
            if (!msgHandlerAttached) {
                msgHandlerAttached = true;
                sock.ev.on('messages.upsert', async (msg) => {
                    handleIncomingMessage(sock, msg);
                });
            }

            // ✅ Messages envoyés UNIQUEMENT à la première vraie connexion
            if (firstOpen) {
                firstOpen = false;

                // ✅ Préfixe lu depuis la config réelle (pas hardcodé)
                const prefix = getPrefix(number);

                // Message d'accueil au bot pair
                try {
                    await sock.sendMessage(`${number}@s.whatsapp.net`, {
                        image: { url: './database/DigixCo.jpg' },
                        caption:
`╔═════════════╗
║      *AKANE MD*           ║
╚═════════════╝

━━━━━━━━━━━━━━━━━━━━━

👤 *CONNECTÉ COMME* : AKANE KUROGAWA
📱 *NUMÉRO*          : +${number}
🔰 *PRÉFIXE*         : ${prefix}
💫 *RÉACTION*        : 🌸

━━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ʕ◕ᴥ◕ʔ🌹
https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R

━━━━━━━━━━━━━━━━━━━━━

> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*
> *_© AKANE-MD 🌹_*`
                    });
                } catch (e) {}

                // Notifier celui qui a fait .pair
                if (notifyClient && notifySender) {
                    notifyClient.sendMessage(notifySender, {
                        text: `✅ *+${number} est maintenant actif comme bot !*\n\n> *© AKANE-MD 🌹*`
                    }).catch(() => {});
                }
            }
        }

        // ── Déconnexion ──
        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            console.log(`❌ Bot parrain +${number} déconnecté (code: ${code})`);
            msgHandlerAttached = false;

            if (code === DisconnectReason.loggedOut || code === 401) {
                console.log(`🚫 Bot parrain +${number} logout définitif`);
                removePairSession(number);
                activePairSockets.delete(number);
            } else {
                // ✅ Reconnexion auto — isRestore=true pour ne pas renvoyer les messages
                console.log(`🔄 Reconnexion bot parrain +${number} dans 5s...`);
                const currentSock = sock;
                setTimeout(async () => {
                    if (activePairSockets.get(number) === currentSock) {
                        activePairSockets.delete(number);
                        try {
                            await startBotSocket(number, sessionDir, notifyClient, notifySender, true);
                        } catch (e) {
                            console.error(`❌ Reconnexion +${number}:`, e.message);
                        }
                    }
                }, 5000);
            }
        }
    });

    return sock;
}

// ─── Commande .pair ──────────────────────────────────────────────────────────

async function handlePairCommand(client, message, args) {
    const sender = message.key.remoteJid;
    let targetNumber = args[0]?.replace(/[^0-9]/g, '');

    if (!targetNumber || targetNumber.length < 7) {
        await client.sendMessage(sender, {
            text: `❌ *Numéro invalide !*\n\n📌 *Usage :* \`.pair <numéro>\`\n📌 *Exemple :* \`.pair 221705928204\`\n\n> Mets le numéro complet avec l'indicatif pays (sans + ni espaces)`
        });
        return;
    }

    // Fermer l'ancien socket si existant
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
        // Session vierge pour un code frais
        if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
        }
        fs.mkdirSync(sessionDir, { recursive: true });
        removePairSession(targetNumber);

        // ✅ isRestore=false → firstOpen=true → messages envoyés à la connexion
        await startBotSocket(targetNumber, sessionDir, client, sender, false);

        // Timeout 5 min
        setTimeout(() => {
            const s = activePairSockets.get(targetNumber);
            if (s && !s._activated) {
                try { s.ws.close(); } catch {}
                activePairSockets.delete(targetNumber);
            }
        }, 300000);

    } catch (err) {
        console.error('❌ Erreur pair:', err);
        activePairSockets.delete(targetNumber);
        await client.sendMessage(sender, {
            text: `❌ *Erreur :* ${err.message}`
        });
    }
}

// ─── Restauration au démarrage ────────────────────────────────────────────────

export async function restorePairSessions() {
    if (!fs.existsSync(PAIR_SESSIONS_FILE)) return;
    let list = [];
    try { list = JSON.parse(fs.readFileSync(PAIR_SESSIONS_FILE, 'utf-8')); } catch (e) { return; }
    if (list.length === 0) return;

    console.log(`🔄 Restauration de ${list.length} bot(s) parrain(s)...`);
    for (const number of list) {
        const sessionDir = `./sessions/pair_${number}`;
        if (!fs.existsSync(sessionDir)) { removePairSession(number); continue; }
        try {
            // ✅ isRestore=true → firstOpen=false → pas de messages à la reconnexion
            await startBotSocket(number, sessionDir, null, null, true);
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.error(`❌ Restauration +${number}:`, e.message);
        }
    }
}

export default handlePairCommand;
