// commands/pair.js

// @cat: tools

import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, Browsers } from 'baileys';
import pino from 'pino';
import fs from 'fs';
import handleIncomingMessage from '../akane/akanes.js';
import configmanager from '../utils/configmanager.js';
import { canalInfo } from '../akane/boutons.js';

const activePairSockets = new Map();
const PAIR_SESSIONS_FILE = './sessions/pair_sessions.json';

// ─── Persistance sessions ─────────────────────────────────────────────────────

function savePairSession(number, pairedBy) {
    try {
        if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions', { recursive: true });
        let list = fs.existsSync(PAIR_SESSIONS_FILE)
            ? JSON.parse(fs.readFileSync(PAIR_SESSIONS_FILE, 'utf-8')) : [];
        const idx = list.findIndex(e => (typeof e === 'object' ? e.number : e) === number);
        if (idx === -1) {
            list.push({ number, pairedBy: pairedBy || null, status: 'alive' });
        } else {
            list[idx] = { number, pairedBy: list[idx]?.pairedBy || pairedBy || null, status: 'alive' };
        }
        fs.writeFileSync(PAIR_SESSIONS_FILE, JSON.stringify(list, null, 2));
    } catch (e) {}
}

function markSessionDead(number) {
    try {
        if (!fs.existsSync(PAIR_SESSIONS_FILE)) return;
        let list = JSON.parse(fs.readFileSync(PAIR_SESSIONS_FILE, 'utf-8'));
        const idx = list.findIndex(e => (typeof e === 'object' ? e.number : e) === number);
        if (idx !== -1) {
            list[idx].status = 'dead';
            fs.writeFileSync(PAIR_SESSIONS_FILE, JSON.stringify(list, null, 2));
        }
    } catch (e) {}
}

function removePairSession(number) {
    try {
        if (!fs.existsSync(PAIR_SESSIONS_FILE)) return;
        let list = JSON.parse(fs.readFileSync(PAIR_SESSIONS_FILE, 'utf-8'));
        list = list.filter(e => (typeof e === 'object' ? e.number : e) !== number);
        fs.writeFileSync(PAIR_SESSIONS_FILE, JSON.stringify(list, null, 2));
    } catch (e) {}
}

function getPairedBy(number) {
    try {
        if (!fs.existsSync(PAIR_SESSIONS_FILE)) return null;
        const list = JSON.parse(fs.readFileSync(PAIR_SESSIONS_FILE, 'utf-8'));
        const entry = list.find(e => (typeof e === 'object' ? e.number : e) === number);
        return entry?.pairedBy || null;
    } catch (e) { return null; }
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

// ─── Stats bots parrainés ─────────────────────────────────────────────────────

function getPairStats() {
    try {
        if (!fs.existsSync(PAIR_SESSIONS_FILE)) return { total: 0, alive: 0, dead: 0 };
        const list = JSON.parse(fs.readFileSync(PAIR_SESSIONS_FILE, 'utf-8'));
        const total = list.length;
        const alive = list.filter(e => {
            const num = typeof e === 'object' ? e.number : e;
            return activePairSockets.has(num) && e?.status !== 'dead';
        }).length;
        const dead = total - alive;
        return { total, alive, dead };
    } catch (e) { return { total: 0, alive: 0, dead: 0 }; }
}

// ─── Démarrer le socket bot parrain ──────────────────────────────────────────

async function startBotSocket(number, sessionDir, notifyClient, notifySender, isRestore, pairedBy) {

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
        keepAliveIntervalMs: 15000,
        retryRequestDelayMs: 2000,
    });

    activePairSockets.set(number, sock);
    sock.ev.on('creds.update', saveCreds);

    let codeSent = isRestore;
    let msgHandlerAttached = false;
    let confirmationSent = false;
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
                    await notifyClient.sendMessage(notifySender, {
                        image: { url: 'https://raw.githubusercontent.com/toge021/Media/main/8fd5.jpg' },
                        jpegThumbnail: null,
                        caption:
`╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊🎵 AKANE MD*
┊
*┊🔑 NUMERO : +${number}*
┊
*┊🔐 CODE : ${fmt}*
┊
*┊📌 COMMENT L'UTILISER :*
*┊1️⃣ OUVRE WHATSAPP SUR +${number}*
*┊2️⃣ PARAMETRES → APPAREILS LIES*
*┊3️⃣ LIER UN APPAREIL → LIER AVEC UN NUMERO*
*┊4️⃣ ENTRE LE CODE CI-DESSUS*
┊
*┊⚠️ CODE EXPIRE DANS 60 SECONDES !*
┊
╰─────────────────❂`
                    });
                    await notifyClient.sendMessage(notifySender, { text: fmt });
                }
            } catch (err) {
                if (notifyClient && notifySender) {
                    await notifyClient.sendMessage(notifySender, {
                        text: `*❌ ERREUR GENERATION DU CODE*\n\n*${err.message.toUpperCase()}*`
                    }).catch(() => {});
                }
            }
        }

        // ── Connexion établie ──
        if (connection === 'open') {
            reconnectAttempts = 0;
            console.log(`✅ Bot parrain +${number} connecté`);

            const orig = sock.sendMessage.bind(sock);
            sock.sendMessage = async (jid, content, opts = {}) => {
                if (content.react || content.delete) return orig(jid, content, opts);
                content.contextInfo = { ...(content.contextInfo || {}), ...canalInfo };
                return orig(jid, content, opts);
            };

            writeConfigForNumber(number);
            savePairSession(number, pairedBy);

            if (!msgHandlerAttached) {
                msgHandlerAttached = true;
                sock.ev.on('messages.upsert', async (msg) => {
                    handleIncomingMessage(sock, msg);
                });
            }

            // ── Confirmation envoyée À CHAQUE connexion open (première + reconnexions) ──
            if (!confirmationSent) {
                confirmationSent = true;
                const prefix = getPrefix(number);
                const stats = getPairStats();

                // 1) Message au bot lui-même
                try {
                    await sock.sendMessage(`${number}@s.whatsapp.net`, {
                        image: { url: './database/DigixCo.jpg' },
                        caption:
`╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊✅ TON BOT EST CONNECTE !*
┊
*┊📱 NUMERO : +${number}*
┊
*┊⚙️ PREFIXE : ${prefix}*
┊
*┊🌸 REACTION : 🌸*
┊
*┊📊 STATS BOTS :*
*┊🔢 TOTAL PARRAINES : ${stats.total}*
*┊🟢 EN VIE : ${stats.alive}*
*┊🔴 DECONNECTES : ${stats.dead}*
┊
*┊📢 REJOINS MA CHAINE 🔥*
┊https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R
┊
╰─────────────────❂`
                    });
                    console.log(`📩 Message de bienvenue envoyé à +${number}`);
                } catch (e) { console.error('❌ Msg bot:', e.message); }

                // 2) Confirmation à celui qui a tapé la commande pair
                if (notifyClient && notifySender) {
                    try {
                        await notifyClient.sendMessage(notifySender, {
                            image: { url: 'https://raw.githubusercontent.com/toge021/Media/main/8fd5.jpg' },
                            jpegThumbnail: null,
                            caption:
`╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊✅ BOT PARRAIN CONNECTE !*
┊
*┊📱 NUMERO : +${number}*
┊
*┊🟢 STATUT : ACTIF*
┊
*┊📊 STATS BOTS :*
*┊🔢 TOTAL PARRAINES : ${stats.total}*
*┊🟢 EN VIE : ${stats.alive}*
*┊🔴 DECONNECTES : ${stats.dead}*
┊
╰─────────────────❂`
                        });
                        console.log(`📩 Confirmation envoyée au sender`);
                    } catch (e) { console.error('❌ Msg sender:', e.message); }
                }

                // 3) Notification au parrain si différent du sender
                const pairedByJid = pairedBy ? `${pairedBy}@s.whatsapp.net` : null;
                if (pairedByJid && pairedByJid !== notifySender && notifyClient) {
                    try {
                        await notifyClient.sendMessage(pairedByJid, {
                            image: { url: 'https://raw.githubusercontent.com/toge021/Media/main/8fd5.jpg' },
                            jpegThumbnail: null,
                            caption:
`╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊🎉 UN BOT A ETE PARRAINE PAR TOI !*
┊
*┊📱 NUMERO CONNECTE : +${number}*
┊
*┊🟢 STATUT : ACTIF*
┊
*┊📊 STATS BOTS :*
*┊🔢 TOTAL PARRAINES : ${stats.total}*
*┊🟢 EN VIE : ${stats.alive}*
*┊🔴 DECONNECTES : ${stats.dead}*
┊
╰─────────────────❂`
                        });
                    } catch (e) {}
                }
            }
        }

        // ── Déconnexion ──
        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            const reason = lastDisconnect?.error?.message || '';
            console.log(`❌ Bot parrain +${number} déconnecté (code: ${code}, raison: ${reason})`);
            msgHandlerAttached = false;
            confirmationSent = false;

            // ── Logout définitif : suppression appareil lié OU code 401/440/loggedOut ──
            const isLoggedOut =
                code === DisconnectReason.loggedOut ||
                code === 401 ||
                code === 440 ||
                reason.toLowerCase().includes('logged out') ||
                reason.toLowerCase().includes('conflict');

            if (isLoggedOut) {
                console.log(`🚫 Bot parrain +${number} logout définitif (appareil supprimé)`);
                markSessionDead(number);
                activePairSockets.delete(number);

                // Nettoyage du dossier session
                const sessDir = `./sessions/pair_${number}`;
                try {
                    if (fs.existsSync(sessDir)) fs.rmSync(sessDir, { recursive: true, force: true });
                } catch (e) {}

                // Notifier les concernés
                const savedPairedBy = getPairedBy(number);
                const stats = getPairStats();
                const notifTargets = [];
                if (notifySender) notifTargets.push(notifySender);
                if (savedPairedBy) {
                    const jid = `${savedPairedBy}@s.whatsapp.net`;
                    if (!notifTargets.includes(jid)) notifTargets.push(jid);
                }

                for (const target of notifTargets) {
                    try {
                        if (notifyClient) {
                            await notifyClient.sendMessage(target, {
                                text:
`╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊🔴 BOT DECONNECTE !*
┊
*┊📱 NUMERO : +${number}*
┊
*┊⚠️ RAISON : APPAREIL SUPPRIME / LOGOUT*
┊
*┊📊 STATS BOTS :*
*┊🔢 TOTAL PARRAINES : ${stats.total}*
*┊🟢 EN VIE : ${stats.alive}*
*┊🔴 DECONNECTES : ${stats.dead}*
┊
*┊🔄 TAPE PAIR ${number} POUR RECONNECTER*
┊
╰─────────────────❂`
                            });
                        }
                    } catch (e) {}
                }

            } else {
                // ── Reconnexion automatique avec délai progressif ──
                reconnectAttempts++;
                const delay = Math.min(5000 * reconnectAttempts, 30000);
                console.log(`🔄 Reconnexion bot parrain +${number} dans ${delay / 1000}s... (tentative ${reconnectAttempts})`);

                const currentSock = sock;
                const sessDir = `./sessions/pair_${number}`;
                setTimeout(async () => {
                    if (activePairSockets.get(number) === currentSock) {
                        activePairSockets.delete(number);
                        try {
                            const savedPairedBy = getPairedBy(number);
                            await startBotSocket(number, sessDir, notifyClient, notifySender, true, savedPairedBy);
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
    const senderNumber = sender.replace('@s.whatsapp.net', '').replace('@g.us', '');
    let targetNumber = args[0]?.replace(/[^0-9]/g, '');

    // ── Aide (sans numéro) ──
    if (!targetNumber || targetNumber.length < 7) {
        const stats = getPairStats();
        await client.sendMessage(sender, {
            image: { url: 'https://raw.githubusercontent.com/toge021/Media/main/b9f6.jpg' },
            jpegThumbnail: null,
            caption:
`╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊🔑 UTILISATION : PAIR [NUMERO]*
┊
*┊📋 EXEMPLE : PAIR 221705928204*
┊
*┊⚠️ NUMERO COMPLET AVEC INDICATIF PAYS, SANS + NI ESPACES*
┊
*┊📊 STATISTIQUES BOTS :*
*┊🔢 TOTAL PARRAINES : ${stats.total}*
*┊🟢 EN VIE : ${stats.alive}*
*┊🔴 DECONNECTES : ${stats.dead}*
┊
╰─────────────────❂`
        });
        return;
    }

    if (activePairSockets.has(targetNumber)) {
        try { activePairSockets.get(targetNumber).ws.close(); } catch {}
        activePairSockets.delete(targetNumber);
        await new Promise(r => setTimeout(r, 2000));
    }

    await client.sendMessage(sender, {
        text:
`╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊⏳ GENERATION DU CODE...*
┊
*┊📱 NUMERO : +${targetNumber}*
┊
*┊🔄 PATIENTE QUELQUES SECONDES...*
┊
╰─────────────────❂`
    });

    const sessionDir = `./sessions/pair_${targetNumber}`;

    try {
        if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
        }
        fs.mkdirSync(sessionDir, { recursive: true });
        removePairSession(targetNumber);

        await startBotSocket(targetNumber, sessionDir, client, sender, false, senderNumber);

    } catch (err) {
        console.error('❌ Erreur pair:', err);
        activePairSockets.delete(targetNumber);
        await client.sendMessage(sender, {
            text:
`╭─✧🍉━━━━━━━━━━━━━❂
┊
*┊❌ ERREUR : ${err.message.toUpperCase()}*
┊
╰─────────────────❂`
        });
    }
}

// ─── Restauration au démarrage ────────────────────────────────────────────────

export async function restorePairSessions() {
    if (!fs.existsSync(PAIR_SESSIONS_FILE)) return;
    let list = [];
    try { list = JSON.parse(fs.readFileSync(PAIR_SESSIONS_FILE, 'utf-8')); } catch (e) { return; }
    if (list.length === 0) return;

    const aliveList = list.filter(e => e?.status !== 'dead');
    console.log(`🔄 Restauration de ${aliveList.length} bot(s) parrain(s)...`);

    for (const entry of aliveList) {
        const number = typeof entry === 'object' ? entry.number : entry;
        const pairedBy = typeof entry === 'object' ? entry.pairedBy : null;
        const sessionDir = `./sessions/pair_${number}`;
        if (!fs.existsSync(sessionDir)) { markSessionDead(number); continue; }
        try {
            await startBotSocket(number, sessionDir, null, null, true, pairedBy);
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.error(`❌ Restauration +${number}:`, e.message);
        }
    }
}

export default handlePairCommand;
