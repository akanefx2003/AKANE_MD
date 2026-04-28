import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempZipPath = path.join(process.cwd(), 'temp', 'AKANE_MD.zip');

// Fonction pour styliser les titres
function boldTitle(text) {
    const map = {
        'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆',
        'H':'𝐇','I':'𝐈','J':'𝐉','K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍',
        'O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓','U':'𝐔',
        'V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙',
        'a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠',
        'h':'𝐡','i':'𝐢','j':'𝐣','k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧',
        'o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭','u':'𝐮',
        'v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳'
    };
    return text.split('').map(c => map[c] || c).join('');
}

export default async function zip(client, message) {
    const remoteJid = message.key.remoteJid;
    
    // Message d'attente
    await client.sendMessage(remoteJid, { text: `⏳ *Téléchargement du bot en cours...*` });
    
    try {
        // URL du ZIP GitHub (branche main)
        const zipUrl = 'https://github.com/akanefx2003/AKANE_MD/archive/refs/heads/main.zip';
        
        // Télécharger le fichier
        const response = await axios({
            method: 'GET',
            url: zipUrl,
            responseType: 'stream',
            timeout: 60000
        });
        
        // Créer le dossier temp s'il n'existe pas
        if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
            fs.mkdirSync(path.join(process.cwd(), 'temp'), { recursive: true });
        }
        
        // Sauvegarder le fichier
        const writer = fs.createWriteStream(tempZipPath);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        
        // Envoyer le fichier
        await client.sendMessage(remoteJid, {
            document: { url: tempZipPath },
            mimetype: 'application/zip',
            fileName: 'AKANE_MD.zip',
            caption: `${boldTitle('AKANE MD - TÉLÉCHARGEMENT')}\n┃\n┃  📦 *Bot complet*\n┃\n┃  ✅ Version prête à déployer\n┃\n┃  🔧 npm install puis npm start\n┃\n> *_AKANE MD_*`
        });
        
        // Supprimer le fichier temporaire après envoi
        fs.unlinkSync(tempZipPath);
        
    } catch (error) {
        console.error('Erreur téléchargement ZIP:', error);
        await client.sendMessage(remoteJid, { 
            text: `${boldTitle('AKANE MD - ERREUR')}\n┃\n┃  ❌ *Téléchargement impossible*\n┃\n┃  📥 Télécharge directement :\n┃  https://github.com/akanefx2003/AKANE_MD/archive/refs/heads/main.zip\n┃\n> *_AKANE MD_*`
        });
    }
}