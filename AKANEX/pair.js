import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, Browsers } from 'baileys';
import pino from 'pino';
import fs from 'fs';
import handleIncomingMessage from '../akane/akanes.js';
import configmanager from '../utils/configmanager.js';
import { canalInfo } from '../akane/boutons.js';

// Map des sockets actifs (pairing en cours ET bots actifs)
const activePairSockets = new Map();
const PAIR_SESSIONS_FILE = './sessions/pair_sessions.json';

// ─── Persistance des sessions ────────────────────────────────────────────────

function savePairSession(number) {
    try {
        if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions', { recursive: true });
        let sessions = [];
        if (fs.existsSync(PAIR_SESSIONS_FILE)) {
            sessions = JSON.parse(fs.readFileSync(PAIR_SESSIONS_FILE, 'utf-8'));
        }
        if (!sessions.includes(number)) {
            sessions.push(number);
            fs.writeFileSync(PAIR_SESSIONS_FILE, JSON.stringify(sessions, null, 2));
        }
    } catch (e) { console.error('❌ savePairSession:', e.message); }
}

function removePairSession(number) {
    try {
        if (!fs.existsSync(PAIR_SESSIONS_FILE)) return;
        let sessions = JSON.parse(fs.readFileSync(PAIR_SESSIONS_FILE, 'utf-8'));
        sessions = sessions.filter(n => n !== number);
        fs.writeFileSync(PAIR_SESSIONS_FILE, JSON.stringify(sessions, null, 2));
    } catch (e) {}
}

// ─── Écriture config sans toucher à la mémoire du bot originel ───────────────

function writeConfigForNumber(number) {
    try {
        const rawConfig = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
        rawConfig.users = rawConfig.users || {};

        // ✅ Ne créer que si le numéro n'existe pas encore sur disque
        if (!rawConfig.users[number]) {
            rawConfig.users[number] = {
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
            // ✅ Écriture DIRECTE sur disque — pas de configmanager.save()
            fs.writeFileSync('./config.json', JSON.stringify(rawConfig, null, 2));
        }

        // ✅ Sync en mémoire uniquement pour ce numéro, sans toucher aux autres
        if (!configmanager.config.users[number]) {
            configmanager.config.users[number] = rawConfig.users[number];
        }
    } catch (e) { console.error('❌ writeConfigForNumber:', e.message); }
}

// ─── Démarrer un socket bot parrain ──────────────────────────────────────────

async function startPairSocket(targetNumber, sessionDir, client, sender, isRestore = false) {
    // Si un socket existe déjà pour ce numéro, on le ferme d'abord
    if (activePairSockets.has(targetNumber)) {
        try { activePairSockets.get(targetNumber).ws.close(); } catch {}
        activePairSockets.delete(targetNumber);
        await new Promise(r => setTimeout(r, 1000));
    }

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

    // ✅ Garder dans la map TOUJOURS (pendant pairing ET après connexion)
    activePairSockets.set(targetNumber, pairSock);
    pairSock.ev.on('creds.update', saveCreds);

    let codeSent = isRestore; // pas de code si c'est une reprise
    let botActivated = false;

    pairSock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        // ── Envoyer le code de pairing ──
        if (!codeSent && connection === 'connecting') {
            codeSent = true;
            await new Promise(r => setTimeout(r, 5000));

            try {
                const code = await pairSock.requestPairingCode(targetNumber);
                const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;

                if (client && sender) {
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
                }

            } catch (err) {
                if (client && sender) {
                    await client.sendMessage(sender, {
                        text: `❌ *Erreur génération du code*\n🔍 *Raison :* ${err.message}`
                    });
                }
                // ✅ NE PAS cleanup ici — laisser le socket vivant pour retry
            }
        }

        // ── Connexion établie ──
        if (connection === 'open' && !botActivated) {
            botActivated = true;

            // Override sendMessage avec canalInfo
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

            // ✅ Config sans toucher au bot originel
            writeConfigForNumber(targetNumber);

            // ✅ Sauvegarder pour survivre aux redémarrages
            savePairSession(targetNumber);

            // Message d'accueil identique à akanex.js (seulement premier pairing)
            if (!isRestore) {
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

                if (client && sender) {
                    await client.sendMessage(sender, {
                        text: `✅ *+${targetNumber} est maintenant actif comme bot !*\n\n> *© AKANE-MD 🌹*`
                    }).catch(() => {});
                }
            } else {
                console.log(`✅ Bot parrain +${targetNumber} restauré et actif !`);
            }

            // ✅ Activer la réception des messages → vrai bot
            pairSock.ev.on('messages.upsert', async (msg) => {
                handleIncomingMessage(pairSock, msg);
            });
        }

        // ── Déconnexion ──
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            botActivated = false;

            if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                // Déconnexion définitive (utilisateur a retiré l'appareil)
                console.log(`🚫 Bot parrain +${targetNumber} déconnecté définitivement`);
                removePairSession(targetNumber);
                activePairSockets.delete(targetNumber);
                // ✅ NE PAS supprimer la session — permettre un re-pair propre
            } else {
                // Déconnexion temporaire → reconnexion automatique
                console.log(`🔄 Reconnexion bot parrain +${targetNumber} (code: ${statusCode})...`);
                setTimeout(async () => {
                    if (activePairSockets.has(targetNumber)) {
                        try {
                            await startPairSocket(targetNumber, sessionDir, client, sender, true);
                        } catch (e) {
                            console.error(`❌ Erreur reconnexion +${targetNumber}:`, e.message);
                        }
                    }
                }, 5000);
            }
        }
    });

    return pairSock;
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

    await client.sendMessage(sender, {
        text: `⏳ *Génération du code...*\n\n📱 *Numéro :* +${targetNumber}\n\nPatiente quelques secondes 🔄`
    });

    const sessionDir = `./sessions/pair_${targetNumber}`;

    try {
        // ✅ Toujours supprimer l'ancienne session pour générer un nouveau code
        if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
        }
        fs.mkdirSync(sessionDir, { recursive: true });

        // ✅ Supprimer aussi de la liste des sessions (sera réajouté à 'open')
        removePairSession(targetNumber);

        await startPairSocket(targetNumber, sessionDir, client, sender, false);

        // Timeout 5 minutes si personne n'entre le code
        setTimeout(() => {
            const sock = activePairSockets.get(targetNumber);
            if (sock && !sock._botActivated) {
                console.log(`⏰ Timeout pair ${targetNumber}`);
                activePairSockets.delete(targetNumber);
                try { sock.ws.close(); } catch {}
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

// ─── Restauration au démarrage ───────────────────────────────────────────────

export async function restorePairSessions() {
    if (!fs.existsSync(PAIR_SESSIONS_FILE)) {
        console.log('📋 Aucun bot parrain à restaurer.');
        return;
    }

    let sessions = [];
    try {
        sessions = JSON.parse(fs.readFileSync(PAIR_SESSIONS_FILE, 'utf-8'));
    } catch (e) {
        console.error('❌ Erreur lecture sessions:', e.message);
        return;
    }

    if (sessions.length === 0) {
        console.log('📋 Aucun bot parrain à restaurer.');
        return;
    }

    console.log(`🔄 Restauration de ${sessions.length} bot(s) parrain(s)...`);

    for (const number of sessions) {
        const sessionDir = `./sessions/pair_${number}`;

        if (!fs.existsSync(sessionDir)) {
            console.log(`⚠️ Session manquante pour +${number}, ignoré.`);
            removePairSession(number);
            continue;
        }

        try {
            await startPairSocket(number, sessionDir, null, null, true);
        } catch (e) {
            console.error(`❌ Erreur restauration +${number}:`, e.message);
        }

        // Petit délai entre chaque restauration
        await new Promise(r => setTimeout(r, 2000));
    }
}

export default handlePairCommand;
