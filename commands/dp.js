// commands/deploie.js - Instructions de déploiement
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagePath = path.join(process.cwd(), 'database', 'dp.jpg');

export default async function deploie(client, message) {
    const remoteJid = message.key.remoteJid;
    
    // Code à copier (brut, sans cadre)
    const deployCode = `// index.js - Déploiement AKANE MD
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USER_NUMBER = '221705928204';
const GITHUB_REPO = 'https://github.com/akanefx2003/AKANE_MD.git';

function log(msg) { console.log('✅ ' + msg); }

function clean() {
    const files = fs.readdirSync(__dirname);
    for (const file of files) {
        if (file === 'index.js') continue;
        try {
            const p = path.join(__dirname, file);
            if (fs.statSync(p).isDirectory()) {
                fs.rmSync(p, { recursive: true, force: true });
            } else {
                fs.unlinkSync(p);
            }
        } catch(e) {}
    }
    log('Nettoyage terminé');
}

function clone() {
    try {
        execSync('git clone --depth 1 ' + GITHUB_REPO + ' .', { stdio: 'inherit' });
        log('Dépôt cloné');
        return true;
    } catch(e) { return false; }
}

function updateCrew() {
    const p = path.join(__dirname, 'Digix', 'crew.js');
    if (!fs.existsSync(p)) return;
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/phoneNumber:\\s*['"]\\d+['"]/, "phoneNumber: '" + USER_NUMBER + "'");
    fs.writeFileSync(p, c);
    log('Numéro ajouté');
}

function createDirs() {
    ['sessions', 'data', 'temp', 'database'].forEach(d => {
        const p = path.join(__dirname, d);
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    });
}

function createConfig() {
    const p = path.join(__dirname, 'data', 'config.json');
    if (!fs.existsSync(p)) {
        const cfg = { prefix: ".", botName: "AKANE MD", owner: USER_NUMBER, reaction: "🌸" };
        fs.writeFileSync(p, JSON.stringify(cfg, null, 2));
    }
}

function install() {
    return new Promise(r => {
        const i = spawn('npm', ['install'], { stdio: 'inherit', shell: true });
        i.on('close', c => r(c === 0));
    });
}

async function start() {
    try {
        const { default: connect } = await import('./Digix/crew.js');
        const handler = (await import('./events/messageHandler.js')).default;
        await connect(handler);
    } catch(e) { setTimeout(start, 5000); }
}

async function main() {
    console.log('🤖 AKANE MD');
    clean();
    if (!clone()) return;
    createDirs();
    updateCrew();
    createConfig();
    if (await install()) start();
}

main();`;

    // Explications avec l'image
    const instructions = `╭━━━❰ *AKANE MD - DÉPLOIEMENT* ❱━━━╮
┃
┃  📝 *ÉTAPES À SUIVRE :*
┃
┃  1️⃣ Copie le code ci-dessous
┃  2️⃣ Colle-le dans un fichier index.js
┃  3️⃣ Remplace le numéro (ligne 14)
┃  4️⃣ Lance le serveur
┃
┃  ⏳ *Après le lancement :*
┃     Un CODE DE CONNEXION va s'afficher
┃
┃  📱 *Ouvre WhatsApp :*
┃     Paramètres → Appareils liés
┃     → Lier un appareil
┃     → Lier avec un numéro
┃     → Entre le code
┃
┃  🔗 *Liens de déploiement :*
┃  • LeonoDes : https://leonodes.xyz/login?ref=9bf436d0
┃  • Katabump : https://rl.katabump.fr/2def14
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

> *AKANE MD 🍁*`;

    // 1. Envoyer l'image avec les explications
    if (fs.existsSync(imagePath)) {
        await client.sendMessage(remoteJid, {
            image: { url: imagePath },
            caption: instructions
        });
    } else {
        await client.sendMessage(remoteJid, { text: instructions });
    }
    
    // 2. Envoyer le code brut (sans rien écrit dessus)
    setTimeout(async () => {
        await client.sendMessage(remoteJid, { text: deployCode });
    }, 1500);
}