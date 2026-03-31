// commands/connect.js

// @cat: bot-menu

// Commande pour ajouter plusieurs amis - Code fixe AKANEMD9

import fs from 'fs/promises';

import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const CREW_FILE = path.join(__dirname, '../Digix/crew.js');

const USERS_FILE = path.join(__dirname, '../data/connected_users.json');

// Stockage des utilisateurs connectés

let connectedUsers = new Map();

const FIXED_CODE = 'AKANEMD9';

// ==================== FONCTIONS DE STOCKAGE ====================

async function ensureDataDir() {

    const DATA_DIR = path.join(__dirname, '../data');

    try {

        await fs.access(DATA_DIR);

    } catch {

        await fs.mkdir(DATA_DIR, { recursive: true });

        console.log("📁 Dossier data créé");

    }

}

async function loadConnectedUsers() {

    await ensureDataDir();

    try {

        const data = await fs.readFile(USERS_FILE, 'utf-8');

        const parsed = JSON.parse(data);

        connectedUsers = new Map(Object.entries(parsed));

        console.log(`👥 ${connectedUsers.size} utilisateurs connectés chargés`);

    } catch (error) {

        console.log("📭 Aucun utilisateur connecté trouvé");

        await saveConnectedUsers();

    }

}

async function saveConnectedUsers() {

    await ensureDataDir();

    const obj = Object.fromEntries(connectedUsers);

    await fs.writeFile(USERS_FILE, JSON.stringify(obj, null, 2));

}

// ==================== LIRE LE FICHIER crew.js ====================

async function readCrewFile() {

    try {

        const content = await fs.readFile(CREW_FILE, 'utf-8');

        return content;

    } catch (error) {

        console.error("Erreur lecture crew.js:", error.message);

        return null;

    }

}

async function writeCrewFile(content) {

    try {

        await fs.writeFile(CREW_FILE, content, 'utf-8');

        return true;

    } catch (error) {

        console.error("Erreur écriture crew.js:", error.message);

        return false;

    }

}

// ==================== AJOUTER/MODIFIER LA LISTE DES UTILISATEURS DANS crew.js ====================

async function updateCrewUsers(usersList) {

    try {

        let crewContent = await readCrewFile();

        if (!crewContent) return false;

        

        // Construire la nouvelle liste d'utilisateurs

        let usersArray = [];

        for (const [phone, user] of usersList) {

            usersArray.push(`    {

        phoneNumber: '${phone}',

        displayName: '${user.name}',

        channelLink: 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R',

        channelName: '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ʕ◕ᴥ◕ʔ🌹',

        prefix: '.',

        reaction: '🌸'

    }`);

        }

        

        const usersConfig = usersArray.join(',\n');

        

        // Nouveau contenu du fichier crew.js

        const newContent = `import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';

import readline from 'readline';

import deployAsPremium from '../utils/DigixV.js';

import configmanager from '../utils/configmanager.js';

import pino from 'pino';

import fs from 'fs';

// ==================== CONFIGURATION UTILISATEUR ====================

// 🔧 MODIFIE CES VALEURS AVANT DE LANCER LE BOT

// Liste des utilisateurs autorisés

const USERS_LIST = [

${usersConfig}

];

// Le code de connexion fixe

const CONNECTION_CODE = 'AKANEMD9';

// ==================== NE RIEN MODIFIER EN DESSOUS ====================

// Fonction pour vérifier si un numéro est autorisé

function isAuthorizedUser(phoneNumber) {

    return USERS_LIST.some(user => user.phoneNumber === phoneNumber);

}

// Fonction pour obtenir les infos d'un utilisateur

function getUserInfo(phoneNumber) {

    return USERS_LIST.find(user => user.phoneNumber === phoneNumber);

}

const data = 'sessionData';

async function getUserNumber() {

    return new Promise((resolve) => {

        const rl = readline.createInterface({

            input: process.stdin,

            output: process.stdout,

        });

        rl.question('📲 Enter your WhatsApp number (with country code, e.g., 243xxxx): ', (number) => {

            rl.close();

            resolve(number.trim());

        });

    });

}

async function connectToWhatsapp(handleMessage) {

    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(version);

    const { state, saveCreds } = await useMultiFileAuthState(data);

    const sock = makeWASocket({

        version: version,

        auth: state,

        printQRInTerminal: false,

        syncFullHistory: true,

        markOnlineOnConnect: true,

        logger: pino({ level: 'silent' }),

        keepAliveIntervalMs: 10000,

        connectTimeoutMs: 60000,

        generateHighQualityLinkPreview: true,

    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {

        const { connection, lastDisconnect } = update;

        if (connection === 'close') {

            const statusCode = lastDisconnect?.error?.output?.statusCode;

            const reason = lastDisconnect?.error?.toString() || 'unknown';

            console.log('❌ Disconnected:', reason, 'StatusCode:', statusCode);

            const shouldReconnect =

                statusCode !== DisconnectReason.loggedOut && reason !== 'unknown';

            if (shouldReconnect) {

                console.log('🔄 Reconnecting in 5 seconds...');

                setTimeout(() => connectToWhatsapp(handleMessage), 5000);

            } else {

                console.log('🚫 Logged out permanently. Please reauthenticate manually.');

            }

        } else if (connection === 'connecting') {

            console.log('⏳ Connecting...');

        } else if (connection === 'open') {

            console.log('✅ WhatsApp connection established!');

            

            // Récupérer les infos de l'utilisateur connecté

            const phoneNumber = USER_CONFIG?.phoneNumber || '';

            const userInfo = getUserInfo(phoneNumber);

            const displayName = userInfo?.displayName || 'Utilisateur';

            const prefix = userInfo?.prefix || '.';

            const reaction = userInfo?.reaction || '🌸';

            

            try {

                const chatId = \`\${phoneNumber}@s.whatsapp.net\`;

                const imagePath = './database/DigixCo.jpg';

                if (!fs.existsSync(imagePath)) {

                    console.warn('⚠️ Image not found at path:', imagePath);

                }

                const messageText = 

"╔══════════════════╗\\n" +

"║      *AKANE MD*           ║\\n" +

"╚══════════════════╝\\n\\n" +

"━━━━━━━━━━━━━━━━━━━━━\\n\\n" +

\`👤 *CONNECTÉ COMME* : \${displayName}\\n\` +

\`📱 *NUMÉRO*          : +\${phoneNumber}\\n\` +

\`🔰 *PRÉFIXE*         : \${prefix}\\n\` +

\`💫 *RÉACTION*        : \${reaction}\\n\\n\` +

"━━━━━━━━━━━━━━━━━━━━━\\n\\n" +

\`📢 *REJOINS MA CHAÎNE* 🔥\\n\\n\` +

\`\${userInfo?.channelName || '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ʕ◕ᴥ◕ʔ🌹'}\\n\` +

\`\${userInfo?.channelLink || 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R'}\\n\\n\` +

"━━━━━━━━━━━━━━━━━━━━━\\n\\n" +

\`> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\\n\\n\` +

\`> *_© AKANE-MD 🌹_*\`;

                await sock.sendMessage(chatId, {

                    image: { url: imagePath },

                    caption: messageText

                });

                console.log('📩 Welcome message sent successfully!');

            } catch (err) {

                console.error('❌ Error sending welcome message:', err);

            }

            

            sock.ev.on('messages.upsert', async (msg) => handleMessage(sock, msg));

        }

    });

    setTimeout(async () => {

        if (!state.creds.registered) {

            console.log('⚠️ Not logged in. Preparing pairing process...');

            try {

                const asPremium = true;

                const number = USER_CONFIG?.phoneNumber || '';

                if (asPremium === true) {

                    configmanager.premiums.premiumUser['c'] = { creator: number };

                    configmanager.saveP();

                    configmanager.premiums.premiumUser['p'] = { premium: number };

                    configmanager.saveP();

                }

                console.log(\`🔄 Requesting pairing code for \${number}\`);

                const code = await sock.requestPairingCode(number, CONNECTION_CODE);

                console.log('📲 Pairing Code:', code);

                console.log('👉 Enter this code on your WhatsApp app to pair.');

                setTimeout(() => {

                    configmanager.config.users[number] = {

                        sudoList: [\`\${number}@s.whatsapp.net\`],

                        tagAudioPath: 'tag.mp3',

                        antilink: true,

                        response: true,

                        autoreact: false,

                        prefix: USER_CONFIG?.prefix || '.',

                        reaction: USER_CONFIG?.reaction || '🌸',

                        welcome: true,

                        record: false,

                        type: false,

                        publicMode: false,

                    };

                    configmanager.save();

                }, 2000);

            } catch (e) {

                console.error('❌ Error while requesting pairing code:', e);

            }

        }

    }, 5000);

    return sock;

}

export default connectToWhatsapp;`;

        

        return await writeCrewFile(newContent);

    } catch (error) {

        console.error("Erreur mise à jour crew.js:", error.message);

        return false;

    }

}

// ==================== COMMANDE PRINCIPALE ====================

async function connectCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;

    const sender = message.key.participant || message.key.remoteJid;

    const senderName = message.pushName || sender.split('@')[0];

    const subCommand = args[0]?.toLowerCase();

    

    await loadConnectedUsers();

    

    // ========== HELP ==========

    if (!subCommand || subCommand === 'help') {

        const helpText = 

`🔌 *CONNEXION BOT*

📝 *COMMANDES :*

• *connect [numéro] [nom]* - Ajouter un ami

• *connect list* - Voir les amis connectés

• *connect remove [numéro]* - Supprimer un ami

• *connect sync* - Synchroniser avec crew.js

💡 *EXEMPLES :*

• *connect 221771234567 Jean*

• *connect list*

• *connect remove 221771234567*

• *connect sync*

🔑 *CODE DE CONNEXION :* \`${FIXED_CODE}\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹

https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R

> *DEV : 🍁AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: helpText });

        return;

    }

    

    // ========== LISTER ==========

    if (subCommand === 'list') {

        if (connectedUsers.size === 0) {

            await client.sendMessage(remoteJid, { text: "📭 *Aucun ami connecté*" });

            return;

        }

        

        let listText = `👥 *AMIS CONNECTÉS*\n\n━━━━━━━━━━━━━━━━━━━━\n`;

        let index = 1;

        for (const [phone, user] of connectedUsers) {

            listText += `*${index}.* 📱 *${user.name}*\n`;

            listText += `   🔢 Numéro : +${phone}\n`;

            listText += `   🔑 Code : \`${FIXED_CODE}\`\n`;

            listText += `   📅 Ajouté : ${new Date(user.date).toLocaleDateString()}\n\n`;

            index++;

        }

        listText += `━━━━━━━━━━━━━━━━━━━━\n💡 Utilise *connect remove [numéro]* pour supprimer`;

        

        await client.sendMessage(remoteJid, { text: listText });

        return;

    }

    

    // ========== SYNC (mettre à jour crew.js) ==========

    if (subCommand === 'sync') {

        await client.sendMessage(remoteJid, { text: "🔄 *Synchronisation en cours...*" });

        

        const success = await updateCrewUsers(connectedUsers);

        

        if (success) {

            await client.sendMessage(remoteJid, { text: `✅ *Synchronisation réussie !*\n\n👥 ${connectedUsers.size} utilisateur(s) ajouté(s) dans crew.js` });

        } else {

            await client.sendMessage(remoteJid, { text: "❌ *Erreur lors de la synchronisation*" });

        }

        return;

    }

    

    // ========== SUPPRIMER ==========

    if (subCommand === 'remove') {

        const phoneNumber = args[1]?.replace(/[^0-9]/g, '');

        

        if (!phoneNumber) {

            await client.sendMessage(remoteJid, { text: "❌ *Utilisation :* `connect remove [numéro]`" });

            return;

        }

        

        if (!connectedUsers.has(phoneNumber)) {

            await client.sendMessage(remoteJid, { text: `❌ *Aucun ami trouvé avec le numéro +${phoneNumber}*` });

            return;

        }

        

        const user = connectedUsers.get(phoneNumber);

        connectedUsers.delete(phoneNumber);

        await saveConnectedUsers();

        

        // Mettre à jour crew.js

        await updateCrewUsers(connectedUsers);

        

        await client.sendMessage(remoteJid, { text: `✅ *${user.name} (+${phoneNumber}) a été supprimé !*` });

        return;

    }

    

    // ========== AJOUTER UN AMI ==========

    const phoneNumber = args[0]?.replace(/[^0-9]/g, '');

    const userName = args.slice(1).join(' ');

    

    if (!phoneNumber || !userName) {

        await client.sendMessage(remoteJid, { text: "❌ *Utilisation :* `connect [numéro] [nom]`\n\nExemple : `connect 221771234567 Jean`" });

        return;

    }

    

    if (phoneNumber.length < 9) {

        await client.sendMessage(remoteJid, { text: "❌ *Numéro invalide !*\n\nUtilise le format : 221771234567" });

        return;

    }

    

    if (connectedUsers.has(phoneNumber)) {

        const existing = connectedUsers.get(phoneNumber);

        await client.sendMessage(remoteJid, { text: 

`⚠️ *Ce numéro est déjà enregistré !*

👤 *Nom :* ${existing.name}

🔑 *Code :* \`${FIXED_CODE}\`

💡 Utilise *connect remove ${phoneNumber}* pour supprimer et recréer.` });

        return;

    }

    

    // Sauvegarder l'utilisateur

    connectedUsers.set(phoneNumber, {

        name: userName,

        code: FIXED_CODE,

        date: Date.now(),

        addedBy: sender

    });

    await saveConnectedUsers();

    

    // Mettre à jour crew.js

    await updateCrewUsers(connectedUsers);

    

    const messageText = 

`🔌 *AMI AJOUTÉ AVEC SUCCÈS !*

━━━━━━━━━━━━━━━━━━━━

👤 *Nom :* ${userName}

📱 *Numéro :* +${phoneNumber}

🔑 *Code de connexion :* \`${FIXED_CODE}\`

━━━━━━━━━━━━━━━━━━━━

📝 *INSTRUCTIONS POUR ${userName.toUpperCase()} :*

1. Lance le bot

2. Entre ton numéro : \`${phoneNumber}\`

3. Utilise le code : \`${FIXED_CODE}\`

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹

https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R

> *DEV : 🍁AKANE KUROGAWA🌹*`;

    

    await client.sendMessage(remoteJid, { text: messageText });

}

export default connectCommand;