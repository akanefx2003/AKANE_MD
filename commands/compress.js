// commands/compress.js

// @cat: media

// Compresser un message en fichier - Avec nom personnalisé

import fs from 'fs';

import path from 'path';

import { fileURLToPath } from 'url';

import zlib from 'zlib';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, '../temp');

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const CHANNEL_NAME = '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹';

// Créer le dossier temp s'il n'existe pas

if (!fs.existsSync(TEMP_DIR)) {

    fs.mkdirSync(TEMP_DIR, { recursive: true });

}

// Fonction pour créer un zip simple sans adm-zip

function createSimpleZip(fileName, content) {

    const timestamp = Math.floor(Date.now() / 1000);

    const dosTime = ((timestamp >> 16) & 0xFFFF) | ((timestamp >> 8) & 0xFFFF) << 16;

    

    const header = Buffer.alloc(30);

    header.writeUInt32LE(0x04034B50, 0);

    header.writeUInt16LE(20, 4);

    header.writeUInt16LE(0, 6);

    header.writeUInt16LE(0, 8);

    header.writeUInt16LE(dosTime & 0xFFFF, 10);

    header.writeUInt16LE((dosTime >> 16) & 0xFFFF, 12);

    header.writeUInt32LE(0, 14);

    header.writeUInt32LE(content.length, 18);

    header.writeUInt32LE(content.length, 22);

    header.writeUInt16LE(fileName.length, 26);

    header.writeUInt16LE(0, 28);

    

    const nameBuffer = Buffer.from(fileName, 'utf-8');

    const data = Buffer.concat([header, nameBuffer, content]);

    

    const centralHeader = Buffer.alloc(46);

    centralHeader.writeUInt32LE(0x02014B50, 0);

    centralHeader.writeUInt16LE(20, 4);

    centralHeader.writeUInt16LE(20, 6);

    centralHeader.writeUInt16LE(0, 8);

    centralHeader.writeUInt16LE(0, 10);

    centralHeader.writeUInt16LE(dosTime & 0xFFFF, 12);

    centralHeader.writeUInt16LE((dosTime >> 16) & 0xFFFF, 14);

    centralHeader.writeUInt32LE(0, 16);

    centralHeader.writeUInt32LE(content.length, 20);

    centralHeader.writeUInt32LE(content.length, 24);

    centralHeader.writeUInt16LE(fileName.length, 28);

    centralHeader.writeUInt16LE(0, 30);

    centralHeader.writeUInt16LE(0, 32);

    centralHeader.writeUInt16LE(0, 34);

    centralHeader.writeUInt16LE(0, 36);

    centralHeader.writeUInt32LE(0, 38);

    centralHeader.writeUInt32LE(0, 42);

    

    const centralData = Buffer.concat([centralHeader, nameBuffer]);

    

    const eocd = Buffer.alloc(22);

    eocd.writeUInt32LE(0x06054B50, 0);

    eocd.writeUInt16LE(0, 4);

    eocd.writeUInt16LE(0, 6);

    eocd.writeUInt16LE(1, 8);

    eocd.writeUInt16LE(1, 10);

    eocd.writeUInt32LE(centralData.length, 12);

    eocd.writeUInt32LE(data.length, 16);

    eocd.writeUInt16LE(0, 20);

    

    return Buffer.concat([data, centralData, eocd]);

}

async function compressCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;

    const sender = message.key.participant || message.key.remoteJid;

    

    // Analyser les arguments

    let customFileName = null;

    let format = null;

    let textContent = null;

    

    // Parcourir les arguments

    for (let i = 0; i < args.length; i++) {

        const arg = args[i];

        if (arg === '-n' || arg === '--name') {

            customFileName = args[i + 1];

            i++;

        } else if (!format && (arg === 'txt' || arg === 'js' || arg === 'zip' || arg === 'json' || arg === 'html' || arg === 'css' || arg === 'xml' || arg === 'md' || arg === 'py' || arg === 'gz')) {

            format = arg;

        } else if (!textContent) {

            textContent = args.slice(i).join(' ');

            break;

        }

    }

    

    const subCommand = format;

    

    // ========== HELP ==========

    if (!subCommand || subCommand === 'help') {

        const helpText = 

`🗜️ *COMPRESS*

📝 *COMMANDES :*

• *compress txt* - Compresser en .txt

• *compress js* - Compresser en .js

• *compress zip* - Compresser en .zip

• *compress json* - Compresser en .json

• *compress html* - Compresser en .html

• *compress gz* - Compresser en .gz

📌 *AVEC NOM PERSONNALISÉ :*

• *compress js -n index.js* (répondre à un message)

• *compress js -n moncode.js console.log("test")*

• *compress zip -n monfichier.zip*

💡 *EXEMPLES :*

• *compress txt -n message.txt* (en répondant)

• *compress js -n test.js const a = 1;*

• *compress zip -n archive.zip* (en répondant)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: helpText });

        return;

    }

    

    const validFormats = ['txt', 'js', 'zip', 'json', 'html', 'css', 'xml', 'md', 'py', 'gz'];

    

    if (!validFormats.includes(subCommand)) {

        await client.sendMessage(remoteJid, { text: `❌ *Format invalide !*\n\nFormats disponibles : ${validFormats.join(', ')}` });

        return;

    }

    

    // Récupérer le contenu à compresser

    let content = '';

    let fileName = customFileName || `fichier_${Date.now()}.${subCommand}`;

    

    // S'assurer que l'extension est correcte

    if (!fileName.endsWith(`.${subCommand}`) && subCommand !== 'zip' && subCommand !== 'gz') {

        fileName = `${fileName}.${subCommand}`;

    }

    if (subCommand === 'zip' && !fileName.endsWith('.zip')) {

        fileName = `${fileName}.zip`;

    }

    if (subCommand === 'gz' && !fileName.endsWith('.gz')) {

        fileName = `${fileName}.gz`;

    }

    

    // Méthode 1: Répondre à un message

    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (quotedMsg) {

        if (quotedMsg.conversation) {

            content = quotedMsg.conversation;

        } else if (quotedMsg.extendedTextMessage?.text) {

            content = quotedMsg.extendedTextMessage.text;

        } else if (quotedMsg.imageMessage?.caption) {

            content = quotedMsg.imageMessage.caption;

        } else if (quotedMsg.videoMessage?.caption) {

            content = quotedMsg.videoMessage.caption;

        }

    }

    

    // Méthode 2: Texte dans la commande

    if (!content && textContent) {

        content = textContent;

    }

    

    // Méthode 3: Demander à l'utilisateur

    if (!content) {

        const waitingUsers = global.waitingForCompress || new Map();

        waitingUsers.set(sender, { format: subCommand, fileName: customFileName, timestamp: Date.now() });

        global.waitingForCompress = waitingUsers;

        

        await client.sendMessage(remoteJid, { text: 

`📝 *ENVOIE TON TEXTE*

━━━━━━━━━━━━━━━━━━━━

Format : *${subCommand.toUpperCase()}*

Fichier : *${fileName}*

Envoie le texte que tu veux compresser.

Tu as 60 secondes.

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWA🌹*` });

        

        setTimeout(() => {

            if (global.waitingForCompress?.has(sender)) {

                global.waitingForCompress.delete(sender);

            }

        }, 60000);

        

        return;

    }

    

    // Créer le fichier

    const filePath = path.join(TEMP_DIR, fileName);

    fs.writeFileSync(filePath, content, 'utf-8');

    

    let finalFilePath = filePath;

    let finalFileName = fileName;

    let mimetype = `text/${subCommand}`;

    

    if (subCommand === 'zip') {

        const zipBuffer = createSimpleZip(fileName.replace('.zip', '.txt'), Buffer.from(content, 'utf-8'));

        const zipPath = path.join(TEMP_DIR, fileName);

        fs.writeFileSync(zipPath, zipBuffer);

        finalFilePath = zipPath;

        mimetype = 'application/zip';

    } else if (subCommand === 'gz') {

        const gzipBuffer = zlib.gzipSync(Buffer.from(content, 'utf-8'));

        const gzPath = path.join(TEMP_DIR, fileName);

        fs.writeFileSync(gzPath, gzipBuffer);

        finalFilePath = gzPath;

        mimetype = 'application/gzip';

    }

    

    // Obtenir la taille

    const stats = fs.statSync(finalFilePath);

    const fileSizeKB = (stats.size / 1024).toFixed(2);

    

    // Envoyer le fichier

    await client.sendMessage(remoteJid, {

        document: fs.readFileSync(finalFilePath),

        fileName: finalFileName,

        mimetype: mimetype,

        caption: `🗜️ *FICHIER COMPRESSÉ*

━━━━━━━━━━━━━━━━━━━━

📄 *Nom :* ${finalFileName}

📊 *Taille :* ${fileSizeKB} KB

🎨 *Format :* ${subCommand.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWA🌹*`

    });

    

    // Nettoyer les fichiers temporaires

    try {

        fs.unlinkSync(filePath);

        if (subCommand === 'zip' || subCommand === 'gz') {

            fs.unlinkSync(finalFilePath);

        }

    } catch (e) {}

}

// ==================== GESTION DES RÉPONSES TEXTE ====================

export async function handleCompressResponse(client, message, messageBody) {

    const remoteJid = message.key.remoteJid;

    const sender = message.key.participant || message.key.remoteJid;

    

    if (!global.waitingForCompress?.has(sender)) return false;

    

    const waiting = global.waitingForCompress.get(sender);

    const format = waiting.format;

    let fileName = waiting.fileName || `texte_${Date.now()}.${format}`;

    const content = messageBody;

    

    if (!content || content.length === 0) return false;

    

    global.waitingForCompress.delete(sender);

    

    // S'assurer que l'extension est correcte

    if (!fileName.endsWith(`.${format}`) && format !== 'zip' && format !== 'gz') {

        fileName = `${fileName}.${format}`;

    }

    if (format === 'zip' && !fileName.endsWith('.zip')) {

        fileName = `${fileName}.zip`;

    }

    if (format === 'gz' && !fileName.endsWith('.gz')) {

        fileName = `${fileName}.gz`;

    }

    

    const filePath = path.join(TEMP_DIR, fileName);

    fs.writeFileSync(filePath, content, 'utf-8');

    

    let finalFilePath = filePath;

    let finalFileName = fileName;

    let mimetype = `text/${format}`;

    

    if (format === 'zip') {

        const zipBuffer = createSimpleZip(fileName.replace('.zip', '.txt'), Buffer.from(content, 'utf-8'));

        const zipPath = path.join(TEMP_DIR, fileName);

        fs.writeFileSync(zipPath, zipBuffer);

        finalFilePath = zipPath;

        mimetype = 'application/zip';

    } else if (format === 'gz') {

        const gzipBuffer = zlib.gzipSync(Buffer.from(content, 'utf-8'));

        const gzPath = path.join(TEMP_DIR, fileName);

        fs.writeFileSync(gzPath, gzipBuffer);

        finalFilePath = gzPath;

        mimetype = 'application/gzip';

    }

    

    const stats = fs.statSync(finalFilePath);

    const fileSizeKB = (stats.size / 1024).toFixed(2);

    

    await client.sendMessage(remoteJid, {

        document: fs.readFileSync(finalFilePath),

        fileName: finalFileName,

        mimetype: mimetype,

        caption: `🗜️ *FICHIER COMPRESSÉ*

━━━━━━━━━━━━━━━━━━━━

📄 *Nom :* ${finalFileName}

📊 *Taille :* ${fileSizeKB} KB

🎨 *Format :* ${format.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWA🌹*`

    });

    

    try {

        fs.unlinkSync(filePath);

        if (format === 'zip' || format === 'gz') {

            fs.unlinkSync(finalFilePath);

        }

    } catch (e) {}

    

    return true;

}

export default compressCommand;