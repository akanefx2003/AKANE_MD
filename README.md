![Logo AKANE MD](database/menu.jpg)



**AKANE_MD - DÉPLOIEMENT**

**ETAPES À SUIVRE :**

**1. Copie le code ci-dessous**

**Créé un fichier que que tu va nommer index.js et colle le code dedans**

**3. Remplacer le numéro qui est dedans par votre numéro puis enregistré**

**4. Lance le serveur puis patientez**

**5. Après le lancement : Un CODE DE CONNEXION va s'afficher**

**Ouvre WhatsApp :**

**Paramètres 
→ Appareils connectés 
→ Connecté à un appareil 
→ Lier avec un numéro
→ Entre le code**

**⚠️ Liens de déploiement :**

**• LeonoDes : https://leonodes.xyz/login?ref=9bf436d0**

**• Katabump : https://rl.katabump.fr/2def14**
**VOICI LE NOUVEAU SITE DE DÉPLOIEMENT DU BOT : https://akanemd-production.up.railway.app/**

## 📱 Me contacter

| Pour quoi faire ? | Cliquez ici |
|---|---|
| 📛 **Signaler un bug** | [Signaler un problème sur WhatsApp](https://wa.me/221705928204?text=🐞%20BUG%20SIGNALÉ%20:%20[Description%20courte%20du%20problème]%0A%0A-%20Projet%20:%20AKANE_MD%0A-%20Étape%20qui%20pose%20problème%20:%20...%0A-%20Capture%20d'écran%20:%20[optionnel]) |
| 🧠 **Proposez des idées ou collabs** | [Discuter avec AKANE sur WhatsApp](https://wa.me/221705928204?text=Bonjour%20AKANE%2C%20je%20suis%20intéressé%20par%20ton%20projet%20et%20j'1aimerais%20échanger.) |

**AKANE MD 🍁**

**channel:**
**https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R**

**✨ MERCI POUR VOTRE SOUTIEN ! ✨**

**N'oubliez pas de mettre une ⭐ étoile sur ce dépôt GitHub**

**🙏 Votre soutien me motive à continuer ! Merci infiniment ! 🙏**

<br>

<div align="center">
  
  [![Fork le projet](https://img.shields.io/badge/🍴-FORK_LE_PROJET-ffffff?style=for-the-badge&logo=github&logoColor=white&color=blue)](https://github.com/akanefx2003/AKANE_MD/fork)
 [![Étoile le projet](https://img.shields.io/badge/⭐-METTRE_UNE_ÉTOILE-ffd700?style=for-the-badge&logo=github&logoColor=black)](https://github.com/akanefx2003/AKANE_MD) [![Télécharger ZIP](https://img.shields.io/badge/📥-TÉLÉCHARGER_LE_FICHIER_ZIP-0078D4?style=for-the-badge&logo=github&logoColor=white)](https://github.com/akanefx2003/AKANE_MD/archive/refs/heads/main.zip)  
</div>

<div align="center">
  
![Maintenance](https://img.shields.io/badge/statut-ACTIF-brightgreen?style=flat-square) ![Node](https://img.shields.io/badge/node-v18+-green?style=flat-square)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Bot-25D366?style=flat-square&logo=whatsapp) ![Visiteurs](https://komarev.com/ghpvc/?username=akanefx2003&label=Visiteurs&color=blue)

**🚀 index.js - Copiez ce code et coller le dans votre serveur**

```js
const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");

const USER_NUMBER = "221705928204";
const GITHUB_REPO = "https://github.com/akanefx2003/AKANE_MD.git";

const c = {
    reset:  "\x1b[0m",
    pink:   "\x1b[35m",
    green:  "\x1b[32m",
    red:    "\x1b[31m",
    cyan:   "\x1b[36m",
    yellow: "\x1b[33m",
    bold:   "\x1b[1m",
}

const ok  = (m) => console.log(`${c.green}  ✔  ${m}${c.reset}`)
const err = (m) => console.log(`${c.red}  ✘  ${m}${c.reset}`)
const inf = (m) => console.log(`${c.cyan}  ◈  ${m}${c.reset}`)

function banner() {
    console.clear()
    console.log(`${c.pink}${c.bold}`)
    console.log(`  ┌────────────────────────────────────┐`)
    console.log(`  │       🌸  AKANE MD DÉPLOIEMENT  🌸   │`)
    console.log(`  └────────────────────────────────────┘`)
    console.log(`${c.reset}`)
}

async function progress(label, fn) {
    const frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏']
    let i = 0
    process.stdout.write(`\r${c.yellow}  ${frames[0]}  ${label}...${c.reset}`)
    const timer = setInterval(() => {
        process.stdout.write(`\r${c.yellow}  ${frames[i++ % frames.length]}  ${label}...${c.reset}`)
    }, 80)
    try {
        const result = await fn()
        clearInterval(timer)
        process.stdout.write(`\r${c.green}  ✔  ${label}${c.reset}\n`)
        return result
    } catch(e) {
        clearInterval(timer)
        process.stdout.write(`\r${c.red}  ✘  ${label}${c.reset}\n`)
        throw e
    }
}

function clean() {
    fs.readdirSync(__dirname).forEach(file => {
        if (file === "deploy.js") return
        try {
            const p = path.join(__dirname, file)
            fs.statSync(p).isDirectory()
                ? fs.rmSync(p, { recursive: true, force: true })
                : fs.unlinkSync(p)
        } catch(e) {}
    })
}

function setup() {
    ["sessions", "data", "temp", "database"].forEach(d => {
        fs.mkdirSync(path.join(__dirname, d), { recursive: true })
    })
    const cfg = path.join(__dirname, "data", "config.json")
    if (!fs.existsSync(cfg)) {
        fs.writeFileSync(cfg, JSON.stringify({
            prefix: ".",
            botName: "AKANE MD",
            owner: USER_NUMBER,
            reaction: "🌸",
            channelLink: "https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R"
        }, null, 2))
    }
    const ax = path.join(__dirname, "AKANEX", "akanex.js")
    if (fs.existsSync(ax)) {
        fs.writeFileSync(ax,
            fs.readFileSync(ax, "utf8")
              .replace(/phoneNumber:\s*['"]\d+['"]/, `phoneNumber: '${USER_NUMBER}'`)
        )
    }
}

function installDeps() {
    return new Promise((resolve, reject) => {
        const p = spawn("npm", ["install"], { stdio: "pipe", shell: true })
        p.on("close", code => code === 0 ? resolve() : reject(new Error("npm install failed")))
    })
}

async function startBot() {
    inf("Démarrage d'AKANE MD...")
    try {
        const { default: connect } = await import("./AKANEX/akanex.js")
        const { default: handler } = await import("./akane/akanes.js")
        await connect(handler)
    } catch(e) {
        err(`Erreur: ${e.message}`)
        setTimeout(startBot, 5000)
    }
}

async function main() {
    banner()
    inf(`Numéro : ${USER_NUMBER}\n`)
    try {
        await progress("Nettoyage", async () => clean())
        await progress("Clonage GitHub", async () => execSync(`git clone ${GITHUB_REPO} .`, { stdio: "pipe" }))
        await progress("Configuration", async () => setup())
        await progress("Installation des dépendances", () => installDeps())
        console.log(`\n${c.pink}${c.bold}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
        ok("Déploiement terminé — lancement du bot...\n")
        await startBot()
    } catch(e) {
        err(`Déploiement échoué : ${e.message}`)
        process.exit(1)
    }
}

main()
```

</div>
