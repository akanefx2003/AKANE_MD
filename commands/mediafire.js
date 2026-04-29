// commands/mediafire.js - Téléchargement MediaFire
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(process.cwd(), 'temp');

// Créer le dossier temp s'il n'existe pas
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

export default async function mediafire(client, message, args) {
    const remoteJid = message.key.remoteJid;
    const url = args[0];

    if (!url) {
        await client.sendMessage(remoteJid, {
            text: `╭━━━❰ *MEDIAFIRE* ❱━━━╮
┃
┃  📥 *Téléchargeur MediaFire*
┃
┃  📝 Utilisation:
┃  .mediafire <lien>
┃
┃  📌 Exemple:
┃  .mediafire https://www.mediafire.com/file/xxx/file.zip
┃
╰━━━━━━━━━━━━━━━━━━━━━╯

> *AKANE MD 🍁*`
        });
        return;
    }

    // Vérifier si le lien est valide
    if (!url.includes('mediafire.com')) {
        await client.sendMessage(remoteJid, { text: '❌ Lien MediaFire invalide.' });
        return;
    }

    await client.sendMessage(remoteJid, { text: `⏳ *Téléchargement en cours...*\n🔗 ${url}` });

    try {
        // 1. Récupérer la page MediaFire
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        const html = response.data;

        // 2. Extraire le lien direct de téléchargement
        let directLink = null;
        
        // Chercher le pattern du lien direct
        const linkMatch = html.match(/https?:\/\/download[^"]*\.mediafire\.com[^"]+/);
        if (linkMatch) {
            directLink = linkMatch[0];
        } else {
            // Alternative: chercher data-key
            const keyMatch = html.match(/data-key="([^"]+)"/);
            if (keyMatch) {
                const fileKey = keyMatch[1];
                directLink = `https://download.mediafire.com/download/${fileKey}`;
            }
        }

        if (!directLink) {
            throw new Error('Impossible de trouver le lien de téléchargement');
        }

        // 3. Extraire le nom du fichier
        let fileName = 'fichier';
        const nameMatch = html.match(/filename="([^"]+)"/);
        if (nameMatch) {
            fileName = nameMatch[1];
        } else {
            const urlParts = url.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            fileName = lastPart.split('?')[0] || 'fichier';
        }

        // 4. Télécharger le fichier
        const fileResponse = await axios({
            method: 'GET',
            url: directLink,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 120000
        });

        const tempPath = path.join(tempDir, `mediafire_${Date.now()}_${fileName}`);
        const writer = fs.createWriteStream(tempPath);
        fileResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // 5. Envoyer le fichier
        const fileSize = fs.statSync(tempPath).size;
        const sizeMB = (fileSize / 1024 / 1024).toFixed(2);

        // Déterminer le type de fichier
        const ext = path.extname(fileName).toLowerCase();
        let messageOptions = {};

        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            messageOptions = { image: { url: tempPath }, caption: `📥 *Téléchargé depuis MediaFire*\n📁 ${fileName}\n📊 ${sizeMB} MB` };
        } else if (['.mp4', '.mkv', '.avi', '.mov'].includes(ext)) {
            messageOptions = { video: { url: tempPath }, caption: `📥 *Téléchargé depuis MediaFire*\n📁 ${fileName}\n📊 ${sizeMB} MB` };
        } else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
            messageOptions = { audio: { url: tempPath }, mimetype: 'audio/mpeg', caption: `📥 *Téléchargé depuis MediaFire*\n📁 ${fileName}\n📊 ${sizeMB} MB` };
        } else {
            messageOptions = { document: { url: tempPath }, mimetype: 'application/octet-stream', fileName: fileName, caption: `📥 *Téléchargé depuis MediaFire*\n📁 ${fileName}\n📊 ${sizeMB} MB` };
        }

        await client.sendMessage(remoteJid, messageOptions);

        // Supprimer le fichier temporaire
        fs.unlinkSync(tempPath);
        
        console.log(`✅ Fichier téléchargé: ${fileName}`);

    } catch (error) {
        console.error('Erreur MediaFire:', error.message);
        await client.sendMessage(remoteJid, { 
            text: `❌ *Erreur lors du téléchargement*\n\n📝 Vérifie que le lien est public et réessaie.` 
        });
    }
}