╭━━━❰ *AKANE MD - DÉPLOIEMENT* ❱
┃
┃  📝 *ÉTAPES À SUIVRE :*
┃
┃  1️⃣ Copie le code ci-dessous
┃  2️⃣ Colle-le dans un fichier deploy.js
┃  3️⃣ Le numéro est déjà pré-configuré (221705928204)
┃  4️⃣ Lance : node deploy.js
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
╰━━━━━━━━━━━━━━━━━━━━━

> *AKANE MD 🍁*  
> Suivre la chaîne 🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ʕ◕ᴥ◕ʔ🌹 sur WhatsApp :  
> https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R

---

## 🚀 deploy.js - Copiez ce code

```javascript
// deploy.js - Script de déploiement AKANE MD
const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");

const USER_NUMBER = "221705928204";
const GITHUB_REPO = "https://github.com/akanefx2003/AKANE_MD.git";

function log(msg) { console.log("✅ " + msg); }
function logInfo(msg) { console.log("📢 " + msg); }
function logError(msg) { console.log("❌ " + msg); }

function clean() {
    logInfo("Nettoyage du dossier...");
    const files = fs.readdirSync(__dirname);
    for (const file of files) {
        if (file === "deploy.js") continue;
        try {
            const p = path.join(__dirname, file);
            if (fs.statSync(p).isDirectory()) {
                fs.rmSync(p, { recursive: true, force: true });
            } else {
                fs.unlinkSync(p);
            }
        } catch(e) {}
    }
    log("Nettoyage terminé");
}

function clone() {
    logInfo("Clonage du dépôt GitHub...");
    try {
        execSync(`git clone ${GITHUB_REPO} .`, { stdio: "inherit" });
        log("Dépôt cloné avec succès");
        return true;
    } catch(e) {
        logError("Échec du clonage");
        return false;
    }
}

function updateCrew() {
    const crewPath = path.join(__dirname, "Digix", "crew.js");
    if (!fs.existsSync(crewPath)) {
        logError("crew.js introuvable");
        return false;
    }
    let content = fs.readFileSync(crewPath, "utf8");
    content = content.replace(/phoneNumber:\s*['"]\d+['"]/, `phoneNumber: '${USER_NUMBER}'`);
    fs.writeFileSync(crewPath, content);
    log(`Numéro ${USER_NUMBER} ajouté dans crew.js`);
    return true;
}

function createDirs() {
    const dirs = ["sessions", "data", "temp", "database"];
    dirs.forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            log(`Dossier ${dir} créé`);
        }
    });
}

function createConfig() {
    const configPath = path.join(__dirname, "data", "config.json");
    if (!fs.existsSync(configPath)) {
        const config = {
            prefix: ".",
            botName: "AKANE MD",
            owner: USER_NUMBER,
            reaction: "🌸",
            channelLink: "https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R"
        };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        log("config.json créé");
    }
}

function installDeps() {
    return new Promise((resolve) => {
        logInfo("Installation des dépendances...");
        const install = spawn("npm", ["install"], { stdio: "inherit", shell: true });
        install.on("close", (code) => {
            if (code === 0) {
                log("Dépendances installées");
                resolve(true);
            } else {
                logError("Erreur installation");
                resolve(false);
            }
        });
    });
}

async function startBot() {
    logInfo("Démarrage d'AKANE MD...");
    try {
        const { default: connect } = await import("./Digix/crew.js");
        const { default: handler } = await import("./events/messageHandler.js");
        await connect(handler);
    } catch (err) {
        logError(`Erreur: ${err.message}`);
        setTimeout(startBot, 5000);
    }
}

async function main() {
    console.log("\x1b[35m");
    console.log("╔═══════════════════════════════════════╗");
    console.log("║      🤖 AKANE MD - DEPLOYEUR 🤖       ║");
    console.log("╚═══════════════════════════════════════╝");
    console.log("\x1b[0m");
    logInfo(`Numéro configuré: ${USER_NUMBER}`);
    clean();
    if (!clone()) return;
    createDirs();
    updateCrew();
    createConfig();
    const ok = await installDeps();
    if (ok) startBot();
}

main();
```

---

## 📞 *Liens de contact*

| Type | Lien |
|---|---|
| 🐞 **Signaler un bug** | [Cliquez ici](https://api.whatsapp.com/send?phone=221705928204&text=🐞%20BUG%20SIGNALÉ%20:%20[Description]%0AProjet%20:%20AKANE_MD) |
| 💬 **Me contacter** | [Cliquez ici](https://api.whatsapp.com/send?phone=221705928204&text=Bonjour%20AKANE%2C%20je%20suis%20intéressé%20par%20ton%20projet) |
| 📺 **Chaîne WhatsApp** | [Rejoindre la chaîne](https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R) |

---

*Dernière mise à jour : Mai 2026*
