// commands/pair.js
// @cat: tools

import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, Browsers } from '@crysnovax/baileys';
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
                sudoList:    [`${number}@s.whatsapp.net`],
                tagAudioPath: 'tag.mp3',
                antilink:    true,
                response:    true,
                autoreact:   false,
                prefix:      '.',
                reaction:    '🌹',
                welcome:     true,
                record:      false,
                type:        false,
                publicMode:  false,
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

        await new Promise(r => setTimeout(r, 1500));

    }

    const { version } = await fetchLatestBaileysVersion();

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    // ─── FIX PRINCIPAL : config socket stable pour @crysnovax/baileys ────────
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),

        // ✅ FIX 1 : Browser qui ressemble à un vrai client WhatsApp Web
        browser: Browsers.ubuntu('Chrome'),

        // ✅ FIX 2 : keepAlive plus fréquent pour éviter les coupures
        keepAliveIntervalMs: 5000,

        // ✅ FIX 3 : Timeout de connexion raisonnable
        connectTimeoutMs: 60000,

        // ✅ FIX 4 : Délai de retry plus court
        retryRequestDelayMs: 1000,

        // ✅ FIX 5 : Désactiver syncFullHistory pour les bots parrainés
        //            (évite la surcharge qui cause des déconnexions)
        syncFullHistory: false,

        // ✅ FIX 6 : Marquer online pour maintenir la session active
        markOnlineOnConnect: true,

        // ✅ FIX 7 : Générer high quality previews
        generateHighQualityLinkPreview: true,

        // ✅ FIX 8 : Options de cache qui stabilisent la connexion
        options: {
            maxMsgRetryCount: 5,
        },
    });

    activePairSockets.set(number, sock);

    sock.ev.on('creds.update', saveCreds);

    let codeSent    = isRestore;
    let msgHandlerAttached = false;
    let confirmationSent   = false;
    let reconnectAttempts  = 0;
    let pingInterval       = null;

    sock.ev.on('connection.update', async (update) => {

        const { connection, lastDisconnect } = update;

        // ── Envoyer le code de pairing ──
        if (!codeSent && connection === 'connecting') {

            codeSent = true;

            // ✅ FIX 9 : Délai réduit à 3s (5s était trop long avec la nouvelle version)
            await new Promise(r => setTimeout(r, 3000));

            try {

                const code = await sock.requestPairingCode(number);
                const fmt  = code.match(/.{1,4}/g)?.join('-') || code;

                if (notifyClient && notifySender) {

                    await notifyClient.sendMessage(notifySender, {

                        image:         { url: 'https://raw.githubusercontent.com/toge021/Media/main/8fd5.jpg' },
                        jpegThumbnail: null,
                        caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
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
╰─────────────────❂`,
                        nativeFlow: [
                            {
                                text: '📋 COPIER LE CODE',
                                copy: fmt
                            }
                        ]

                    });

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

            // ✅ FIX 10 : Ping manuel toutes les 20s pour garder la session vivante
            if (pingInterval) clearInterval(pingInterval);

            pingInterval = setInterval(async () => {

                try {

                    if (activePairSockets.get(number) === sock) {
                        await sock.sendPresenceUpdate('available');
                    } else {
                        clearInterval(pingInterval);
                    }

                } catch {
                    clearInterval(pingInterval);
                }

            }, 20000);

            // Override sendMessage avec canal info
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

            if (!confirmationSent) {

                confirmationSent = true;

                const prefix = getPrefix(number);
                const stats  = getPairStats();

                // Message au bot lui-même
                try {

                    await sock.sendMessage(`${number}@s.whatsapp.net`, {

                        image:         { url: './database/DigixCo.jpg' },
                        jpegThumbnail: null,
                        caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊✅ CONNEXION RÉUSSIE !*
┊
*┊📱 NUMERO : +${number}*
┊
*┊⚙️ PREFIXE : ${prefix}*
┊
*┊📊 STATS BOTS PARRAINÉS :*
*┊🔢 TOTAL : ${stats.total}*
*┊🟢 EN VIE : ${stats.alive}*
*┊🔴 DÉCONNECTÉS : ${stats.dead}*
┊
*┊💡 UTILISE ${prefix}help POUR VOIR LES COMMANDES*
┊
╰─────────────────❂`

                    });

                } catch (e) {}

                // Notification à celui qui a fait le pair
                if (notifyClient && notifySender) {

                    try {

                        await notifyClient.sendMessage(notifySender, {

                            image:         { url: 'https://raw.githubusercontent.com/toge021/Media/main/8fd5.jpg' },
                            jpegThumbnail: null,
                            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊✅ BOT CONNECTÉ AVEC SUCCÈS !*
┊
*┊📱 NUMERO : +${number}*
┊
*┊⚙️ PREFIXE : ${prefix}*
┊
*┊📊 STATS BOTS :*
*┊🔢 TOTAL PARRAINÉS : ${stats.total}*
*┊🟢 EN VIE : ${stats.alive}*
*┊🔴 DÉCONNECTÉS : ${stats.dead}*
┊
╰─────────────────❂`

                        });

                    } catch (e) {}

                }

                // Notification au parraineur si différent
                const pairedByJid = pairedBy ? `${pairedBy}@s.whatsapp.net` : null;

                if (pairedByJid && pairedByJid !== notifySender && notifyClient) {

                    try {

                        await notifyClient.sendMessage(pairedByJid, {

                            image:         { url: 'https://raw.githubusercontent.com/toge021/Media/main/8fd5.jpg' },
                            jpegThumbnail: null,
                            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊🎉 UN BOT A ÉTÉ PARRAINÉ PAR TOI !*
┊
*┊📱 NUMERO CONNECTÉ : +${number}*
┊
*┊🟢 STATUT : ACTIF*
┊
*┊📊 STATS BOTS :*
*┊🔢 TOTAL PARRAINÉS : ${stats.total}*
*┊🟢 EN VIE : ${stats.alive}*
*┊🔴 DÉCONNECTÉS : ${stats.dead}*
┊
╰─────────────────❂`

                        });

                    } catch (e) {}

                }

            }

        }

        // ── Déconnexion ──
        if (connection === 'close') {

            // Arrêt du ping
            if (pingInterval) {
                clearInterval(pingInterval);
                pingInterval = null;
            }

            const code   = lastDisconnect?.error?.output?.statusCode;
            const reason = lastDisconnect?.error?.message || '';

            console.log(`❌ Bot parrain +${number} déconnecté (code: ${code}, raison: ${reason})`);

            msgHandlerAttached = false;
            confirmationSent   = false;

            // ── Logout définitif ──
            const isLoggedOut =
                code === DisconnectReason.loggedOut ||
                code === 401 ||
                code === 440 ||
                reason.toLowerCase().includes('logged out') ||
                reason.toLowerCase().includes('conflict');

            if (isLoggedOut) {

                console.log(`🚫 Bot parrain +${number} logout définitif`);

                markSessionDead(number);
                activePairSockets.delete(number);

                const sessDir = `./sessions/pair_${number}`;

                try {
                    if (fs.existsSync(sessDir)) fs.rmSync(sessDir, { recursive: true, force: true });
                } catch (e) {}

                const savedPairedBy = getPairedBy(number);
                const stats         = getPairStats();
                const notifTargets  = [];

                if (notifySender) notifTargets.push(notifySender);

                if (savedPairedBy) {
                    const jid = `${savedPairedBy}@s.whatsapp.net`;
                    if (!notifTargets.includes(jid)) notifTargets.push(jid);
                }

                for (const target of notifTargets) {

                    try {

                        if (notifyClient) {

                            await notifyClient.sendMessage(target, {

                                image:   { url: 'https://raw.githubusercontent.com/toge021/Media/main/0ce0.tmp' },
                                caption:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊🔴 BOT DÉCONNECTÉ !*
┊
*┊📱 NUMERO : +${number}*
┊
*┊⚠️ RAISON : APPAREIL SUPPRIMÉ / LOGOUT*
┊
*┊📊 STATS BOTS :*
*┊🔢 TOTAL PARRAINÉS : ${stats.total}*
*┊🟢 EN VIE : ${stats.alive}*
*┊🔴 DÉCONNECTÉS : ${stats.dead}*
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

                // ✅ FIX 11 : Délai max réduit à 15s (30s était trop long)
                const delay = Math.min(3000 * reconnectAttempts, 15000);

                console.log(`🔄 Reconnexion bot parrain +${number} dans ${delay / 1000}s... (tentative ${reconnectAttempts})`);

                const currentSock = sock;
                const sessDir     = `./sessions/pair_${number}`;

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

// ─── Commande .unpair ────────────────────────────────────────────────────────

async function handleUnpairCommand(client, message, args) {

    const sender     = message.key.remoteJid;
    let targetNumber = args[0]?.replace(/[^0-9]/g, '');

    if (!targetNumber || targetNumber.length < 7) {

        return client.sendMessage(sender, {

            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊🔌 DÉCONNECTER UN BOT*
┊
*┊💡 UTILISATION :*
*┊unpair [NUMERO]*
┊
*┊📋 EXEMPLE :*
*┊unpair 221705928204*
┊
╰─────────────────❂`

        });

    }

    const isAlive = activePairSockets.has(targetNumber);

    // ── Ferme le socket actif ──
    if (isAlive) {

        try { activePairSockets.get(targetNumber).ws.close(); } catch {}

        activePairSockets.delete(targetNumber);

    }

    // ── Supprime les fichiers de session ──
    const sessDir = `./sessions/pair_${targetNumber}`;

    try {
        if (fs.existsSync(sessDir)) fs.rmSync(sessDir, { recursive: true, force: true });
    } catch (e) {}

    // ── Marque comme dead dans la liste ──
    markSessionDead(targetNumber);

    const stats = getPairStats();

    await client.sendMessage(sender, {

        text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊✅ BOT DÉCONNECTÉ !*
┊
*┊📱 NUMERO : +${targetNumber}*
┊
*┊🗑️ SESSION SUPPRIMÉE*
┊
*┊📊 STATS BOTS :*
*┊🔢 TOTAL PARRAINÉS : ${stats.total}*
*┊🟢 EN VIE : ${stats.alive}*
*┊🔴 DÉCONNECTÉS : ${stats.dead}*
┊
*┊🔄 TAPE pair ${targetNumber} POUR RECONNECTER*
┊
╰─────────────────❂`

    });

}

// ─── Commande .pairlist ───────────────────────────────────────────────────────

async function handlePairListCommand(client, message) {

    const sender = message.key.remoteJid;

    let list = [];

    try {
        if (fs.existsSync(PAIR_SESSIONS_FILE)) {
            list = JSON.parse(fs.readFileSync(PAIR_SESSIONS_FILE, 'utf-8'));
        }
    } catch (e) {}

    if (list.length === 0) {

        return client.sendMessage(sender, {

            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊📋 LISTE DES BOTS PARRAINÉS*
┊
*┊ Aucun bot parrainé pour l'instant*
┊
*┊💡 TAPE pair [NUMERO] POUR EN AJOUTER UN*
┊
╰─────────────────❂`

        });

    }

    const stats = getPairStats();

    let lines = `╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊📋 LISTE DES BOTS PARRAINÉS*
┊
`;

    list.forEach((entry, i) => {

        const num      = typeof entry === 'object' ? entry.number : entry;
        const pairedBy = typeof entry === 'object' ? entry.pairedBy : null;
        const isDead   = entry?.status === 'dead';
        const isActive = activePairSockets.has(num) && !isDead;
        const status   = isActive ? '🟢 EN VIE' : '🔴 DÉCONNECTÉ';

        lines += `*┊${i + 1}. +${num}*\n`;
        lines += `*┊   ${status}*\n`;

        if (pairedBy) {
            lines += `*┊   Parrainé par : +${pairedBy}*\n`;
        }

        lines += `┊\n`;

    });

    lines += `*┊📊 TOTAL : ${stats.total} | 🟢 ${stats.alive} | 🔴 ${stats.dead}*\n┊\n`;
    lines += `*┊💡 unpair [NUMERO] POUR DÉCONNECTER*\n┊\n`;
    lines += `╰─────────────────❂`;

    await client.sendMessage(sender, { text: lines });

}

// ─── Commande .pair ──────────────────────────────────────────────────────────

async function handlePairCommand(client, message, args) {

    const sender       = message.key.remoteJid;
    const senderNumber = sender.replace('@s.whatsapp.net', '').replace('@g.us', '');
    let targetNumber   = args[0]?.replace(/[^0-9]/g, '');

    // ── Aide (sans numéro) ──
    if (!targetNumber || targetNumber.length < 7) {

        const stats = getPairStats();

        await client.sendMessage(sender, {

            image:         { url: 'https://raw.githubusercontent.com/toge021/Media/main/b9f6.jpg' },
            jpegThumbnail: null,
            caption:
`╭─✧🌹━━━━━━━━━━━━━❂
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
*┊🔢 TOTAL PARRAINÉS : ${stats.total}*
*┊🟢 EN VIE : ${stats.alive}*
*┊🔴 DÉCONNECTÉS : ${stats.dead}*
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
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊⏳ GÉNÉRATION DU CODE...*
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
`╭─✧🌹━━━━━━━━━━━━━❂
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

        const number    = typeof entry === 'object' ? entry.number : entry;
        const pairedBy  = typeof entry === 'object' ? entry.pairedBy : null;
        const sessionDir = `./sessions/pair_${number}`;

        if (!fs.existsSync(sessionDir)) { markSessionDead(number); continue; }

        try {

            await startBotSocket(number, sessionDir, null, null, true, pairedBy);

            // ✅ FIX 12 : Délai entre restaurations réduit à 1.5s
            await new Promise(r => setTimeout(r, 1500));

        } catch (e) {

            console.error(`❌ Restauration +${number}:`, e.message);

        }

    }

}

export { handleUnpairCommand, handlePairListCommand };
export default handlePairCommand;
