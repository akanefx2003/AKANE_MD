// commands/links.js - Toutes les commandes de liens
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagePath = path.join(process.cwd(), 'database', 'imgs.jpg');
const zipPath = path.join(process.cwd(), 'database', 'AKANE_MD.zip');

// Fonction pour styliser les titres en gras
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

export default async function links(client, message, args) {
    const remoteJid = message.key.remoteJid;
    const cmd = args[0]?.toLowerCase() || 'all';
    
    // === TOUS LES LIENS ===
    const allLinks = `
${boldTitle('AKANE MD - TOUS LES LIENS')}
┃
┃  📢 *Chaîne WhatsApp*
┃  https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R
┃
┃  👥 *Groupe de support*
┃  https://chat.whatsapp.com/KFfpPr1lOSeHuo6m4RFkOq
┃
┃  🚀 *Déploiement*
┃  • LeonoDes : https://leonodes.xyz/login?ref=9bf436d0
┃  • Katabump : https://rl.katabump.fr/2def14
┃
┃  💻 *GitHub*
┃  https://github.com/akanefx2003/AKANE_MD
┃
┃  📦 *Téléchargement ZIP*
┃  https://github.com/akanefx2003/AKANE_MD/archive/refs/heads/main.zip
┃
> *_AKANE MD_*
    `;
    
    // === REPO (seulement le lien GitHub) ===
    const repoLink = `
${boldTitle('AKANE MD - GITHUB')}
┃
┃  💻 *Dépôt officiel*
┃  https://github.com/akanefx2003/AKANE_MD
┃
┃  ⭐ *Star & Fork* pour soutenir le projet
┃
> *_AKANE MD_*
    `;
    
    // === SERVEUR (liens de déploiement uniquement) ===
    const serveurLink = `
${boldTitle('AKANE MD - DÉPLOIEMENT')}
┃
┃  🚀 *Hébergeurs gratuits*
┃
┃  • LeonoDes
┃    https://leonodes.xyz/login?ref=9bf436d0
┃
┃  • Katabump
┃    https://rl.katabump.fr/2def14
┃
> *_Déploie ton bot !_*
    `;
    
    // === WHATSAPP (chaîne et groupe) ===
    const whatsappLink = `
${boldTitle('AKANE MD - WHATSAPP')}
┃
┃  📢 *Chaîne officielle*
┃  https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R
┃
┃  👥 *Groupe de support*
┃  https://chat.whatsapp.com/KFfpPr1lOSeHuo6m4RFkOq
┃
> *_Rejoins-nous !_*
    `;
    
    // === ZIP (envoie le fichier directement) ===
    if (cmd === 'zip' || cmd === 'download' || cmd === 'telechargement') {
        if (fs.existsSync(zipPath)) {
            await client.sendMessage(remoteJid, {
                document: { url: zipPath },
                mimetype: 'application/zip',
                fileName: 'AKANE_MD.zip',
                caption: `${boldTitle('AKANE MD - TÉLÉCHARGEMENT')}\n┃\n┃  📦 *Bot complet*\n┃\n┃  Version prête à déployer\n┃\n> *_AKANE MD_*`
            });
        } else {
            await client.sendMessage(remoteJid, { 
                text: `${boldTitle('AKANE MD - TÉLÉCHARGEMENT')}\n┃\n┃  ❌ *Fichier ZIP introuvable*\n┃\n┃  📥 Télécharge-le ici :\n┃  https://github.com/akanefx2003/AKANE_MD/archive/refs/heads/main.zip\n┃\n> *_AKANE MD_*`
            });
        }
        return;
    }
    
    let response = allLinks;
    
    switch (cmd) {
        case 'repo':
        case 'github':
        case 'git':
        case 'code':
            response = repoLink;
            break;
        case 'serveur':
        case 'deploy':
        case 'deploiement':
        case 'host':
        case 'hebergement':
            response = serveurLink;
            break;
        case 'whatsapp':
        case 'wa':
        case 'chaine':
        case 'groupe':
            response = whatsappLink;
            break;
        case 'all':
        default:
            response = allLinks;
            break;
    }
    
    await sendWithImage(client, remoteJid, response);
}