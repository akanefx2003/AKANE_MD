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
        keepAliveIntervalMs: 15000, // ✅ Augmenté à 15s pour plus de stabilité
        retryRequestDelayMs: 2000,
    });

    activePairSockets.set(number, sock);
    sock.ev.on('creds.update', saveCreds);

    let codeSent = isRestore;
    let msgHandlerAttached = false;
    let firstOpen = !isRestore;
    let reconnectAttempts = 0;

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
                    await notifyClient.sendMessage(notifySender, { text:
`﹝╎🔑 𝐂𝐎𝐃𝐄 𝐃𝐄 𝐂𝐎𝐍𝐍𝐄𝐗𝐈𝐎𝐍 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐍𝐮𝐦𝐞́𝐫𝐨 ⪨
⸙﹝ +${number} ﹞✴︎

⋆.˚⪩ 𝐂𝐨𝐝𝐞 ⪨
⸙﹝ *${fmt}* ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

📌 *Comment l'utiliser :*
1️⃣ Ouvre WhatsApp sur +${number}
2️⃣ *Paramètres* → *Appareils liés*
3️⃣ *Lier un appareil* → *Lier avec un numéro*
4️⃣ Entre le code ci-dessus

⚠️ _Code expire dans 60 secondes !_

> *© AKANE MD 🌹*` });

                    // Code brut pour copier facilement
                    await notifyClient.sendMessage(notifySender, { text: fmt });
                }
            } catch (err) {
                if (notifyClient && notifySender) {
                    await notifyClient.sendMessage(notifySender, {
                        text: `❌ *Erreur génération du code*\n\n⸙﹝ ${err.message} ﹞✴︎\n\n> *© AKANE MD 🌹*`
                    }).catch(() => {});
                }
            }
        }

        // ── Connexion établie ──
        if (connection === 'open') {
            reconnectAttempts = 0; // ✅ Reset compteur à chaque connexion réussie
            console.log(`✅ Bot parrain +${number} connecté`);

            const orig = sock.sendMessage.bind(sock);
            sock.sendMessage = async (jid, content, opts = {}) => {
                if (content.react || content.delete) return orig(jid, content, opts);
                content.contextInfo = { ...(content.contextInfo || {}), ...canalInfo };
                return orig(jid, content, opts);
            };

            writeConfigForNumber(number);
            savePairSession(number);

            if (!msgHandlerAttached) {
                msgHandlerAttached = true;
                sock.ev.on('messages.upsert', async (msg) => {
                    handleIncomingMessage(sock, msg);
                });
            }

            // ✅ Message de bienvenue UNIQUEMENT à la première vraie connexion
            if (firstOpen) {
                firstOpen = false;
                const prefix = getPrefix(number);

                try {
                    await sock.sendMessage(`${number}@s.whatsapp.net`, {
                        image: { url: './database/DigixCo.jpg' },
                        caption:
`﹝╎🤖 𝐀𝐊𝐀𝐍𝐄 𝐌𝐃 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐞́ ⪨
⸙﹝ +${number} ﹞✴︎

⋆.˚⪩ 𝐏𝐫𝐞́𝐟𝐢𝐱𝐞 ⪨
⸙﹝ ${prefix} ﹞✴︎

⋆.˚⪩ 𝐑𝐞́𝐚𝐜𝐭𝐢𝐨𝐧 ⪨
⸙﹝ 🌸 ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

📢 *REJOINS MA CHAÎNE* 🔥
https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R

> *© AKANE MD 🌹*`
                    });
                } catch (e) {}

                if (notifyClient && notifySender) {
                    notifyClient.sendMessage(notifySender, {
                        text:
`✅ *Bot parrain connecté !*

⸙﹝ +${number} est maintenant actif ﹞✴︎

> *© AKANE MD 🌹*`
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
                // ✅ Reconnexion avec délai progressif (max 30s)
                reconnectAttempts++;
                const delay = Math.min(5000 * reconnectAttempts, 30000);
                console.log(`🔄 Reconnexion bot parrain +${number} dans ${delay/1000}s... (tentative ${reconnectAttempts})`);

                const currentSock = sock;
                setTimeout(async () => {
                    if (activePairSockets.get(number) === currentSock) {
                        activePairSockets.delete(number);
                        try {
                            // ✅ isRestore=true → pas de message de bienvenue
                            await startBotSocket(number, sessionDir, notifyClient, notifySender, true);
                        } catch (e) {
                            console.error(`❌ Reconnexion +${number}:`, e.message);
                        }
                    }
                }, delay);
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
        await client.sendMessage(sender, { text:
`﹝╎🔑 𝐏𝐀𝐈𝐑 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐢𝐨𝐧 ⪨
⸙﹝ pair [numéro complet] ﹞✴︎

⋆.˚⪩ 𝐄𝐱𝐞𝐦𝐩𝐥𝐞 ⪨
⸙﹝ pair 221705928204 ﹞✴︎

⚠️ _Numéro complet avec indicatif pays, sans + ni espaces_

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*` });
        return;
    }

    if (activePairSockets.has(targetNumber)) {
        try { activePairSockets.get(targetNumber).ws.close(); } catch {}
        activePairSockets.delete(targetNumber);
        await new Promise(r => setTimeout(r, 2000));
    }

    await client.sendMessage(sender, { text:
`⏳ *Génération du code...*

⸙﹝ +${targetNumber} ﹞✴︎

🔄 _Patiente quelques secondes..._

> *© AKANE MD 🌹*` });

    const sessionDir = `./sessions/pair_${targetNumber}`;

    try {
        if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
        }
        fs.mkdirSync(sessionDir, { recursive: true });
        removePairSession(targetNumber);

        await startBotSocket(targetNumber, sessionDir, client, sender, false);

    } catch (err) {
        console.error('❌ Erreur pair:', err);
        activePairSockets.delete(targetNumber);
        await client.sendMessage(sender, {
            text: `❌ *Erreur :* ${err.message}\n\n> *© AKANE MD 🌹*`
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
            // ✅ isRestore=true → pas de message, juste reconnecter
            await startBotSocket(number, sessionDir, null, null, true);
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.error(`❌ Restauration +${number}:`, e.message);
        }
    }
}

export default handlePairCommand;
