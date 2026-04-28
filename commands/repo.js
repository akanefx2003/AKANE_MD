// commands/repo.js - Lien GitHub du bot
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagePath = path.join(process.cwd(), 'database', 'imgs.jpg');

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

// Fonction pour envoyer un message avec image
async function sendWithImage(client, jid, text) {
    if (fs.existsSync(imagePath)) {
        await client.sendMessage(jid, {
            image: { url: imagePath },
            caption: text
        });
    } else {
        await client.sendMessage(jid, { text: text });
    }
}

export default async function repo(client, message) {
    const remoteJid = message.key.remoteJid;
    
    const repoText = `
${boldTitle('AKANE MD - GITHUB')}
┃
┃  💻 *Dépôt officiel*
┃  🔗 https://github.com/akanefx2003/AKANE_MD
┃
┃  ⭐ *N'oublie pas la petite étoile !*
┃  🍴 *Fork et partage*
┃
┃  🔥 *Rejoins la communauté*
┃  💬 *Signale des bugs*
┃  ✨ *Propose des idées*
┃
┃  🙏 *Merci pour ton soutien !*
┃
> *_AKANE MD_*
    `;
    
    await sendWithImage(client, remoteJid, repoText);
}