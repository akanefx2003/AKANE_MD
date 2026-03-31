// commands/spider.js

// @cat: menu

// Commande SPIDER-MENU avec 3 catégories

import os from 'os';

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbCmpwK89inpJICAG21A';

const CHANNEL_NAME = '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹';

const PREFIX = '-';

const imageUrl = 'https://files.catbox.moe/onpl3h.jpg';

// Citations Spider-Man

const quotes = [

    "Avec un grand pouvoir vient une grande responsabilité.",

    "Je suis Spider-Man. Je protège les gens.",

    "Tout le monde peut porter le masque.",

    "Tu es bien plus fort que tu ne le penses.",

    "Peu importe le masque, c'est ce qu'il y a en dessous qui compte.",

    "Ne me dis pas quoi faire !",

    "Le masque, c'est qui tu es vraiment."

];

// Citations d'intro

const intros = [

    "🕷️ *Un homme en pyjama rouge surgit de l'ombre...*",

    "🕸️ *Une toile tombe du ciel, Spider-Man atterrit devant toi...*",

    "🕷️ *Le sens d'araignée vibre... Spider-Man est là !*",

    "🕸️ *Une silhouette suspendue au plafond... C'est l'Homme-Araignée !*",

    "🕷️ *Thwip ! Une toile se tend, Spider-Man apparaît !*",

    "🕸️ *Un cri retentit dans la nuit... Spider-Man répond présent !*"

];

// Calcul de l'uptime

let startTime = Date.now();

function getUptime() {

    const uptime = Date.now() - startTime;

    const hours = Math.floor(uptime / (1000 * 60 * 60));

    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;

}

function getRamUsage() {

    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    const total = os.totalmem() / 1024 / 1024;

    return `${used.toFixed(1)}/${total.toFixed(1)} MB`;

}

function getDate() {

    const date = new Date();

    const days = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];

    const dayName = days[date.getDay()];

    const day = date.getDate();

    const month = date.getMonth() + 1;

    const year = date.getFullYear();

    return `${dayName} ${day}/${month}/${year}`;

}

// Menu principal avec 3 catégories

const menuText = (uptime, ram, date) => `━━━━━━━━━━━━━━
🕷️ SPIDER-MENU 🕸️
━━━━━━━━━━━━━━
━━━━━━━━━━━━━━━━━━━━━━━━
*👤 SPIDER-CIBLE :* 𝐌𝐫 𝐬𝐚𝐤𝐚𝐦𝐨𝐭𝐨

*🍒 SPIDER-PREFIXE :* ${PREFIX}

*📦 SPIDER-VERS :* 1.0.0

*⏱️ SPIDER-UPTIME :* ${uptime}

*📁 SPIDER-RAM :* ${ram}

*💻 SPIDER-PLATEFORME :* ${os.platform()}

*🕷️ SPIDER-DATE :* ${date}

━━━━━━━━━━━━━━━━━━━━━━━━

*🕸️ SPIDER-HACK :*

• *bug* - Signaler un bug

• *mail* - Contacter le dev

• *get* - Récupérer un fichier

• *restart* - Redémarrer le bot

• *public* - Activer/désactiver le mode public

• *setprefix* - Changer le préfixe

━━━━━━━━━━━━━━━━━━━━━━━━

*🎮 SPIDER-JEUX :*

• *tt* - Jouer au morpion

• *insulte* - Insulte aléatoire 

• *insulte* - Insulte aléatoire

• *insulte* - Insulte aléatoire

• *insulte* - Insulte aléatoire

• *fancy* - Texte stylisé

━━━━━━━━━━━━━━━━━━━━━━━━
*🤖 SPIDER-IA :*

• *alya* - Discuter avec Alya

• *akane* - Discuter avec Akane

• *gpt* - ChatGPT

• *chat* - Sakamoto chatbot

━━━━━━━━━━━━━━━━━━━━━━━━

📢 *SPIDER CHANNEL* 🕸️

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*`;

async function spiderCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;

    const subCommand = args[0]?.toUpperCase();

    

    // ========== MENU PRINCIPAL AVEC INTRO ==========

    if (!subCommand || subCommand === 'SPIDER' || subCommand === 'MENU') {

        // Intro Spider-Man

        const randomIntro = intros[Math.floor(Math.random() * intros.length)];

        await client.sendMessage(remoteJid, { text: randomIntro });

        

        // Petit délai pour l'effet

        await new Promise(resolve => setTimeout(resolve, 1500));

        

        const uptime = getUptime();

        const ram = getRamUsage();

        const date = getDate();

        

        try {

            await client.sendMessage(remoteJid, {

                image: { url: imageUrl },

                caption: menuText(uptime, ram, date)

            });

        } catch (error) {

            console.error("Erreur envoi image:", error.message);

            await client.sendMessage(remoteJid, { text: menuText(uptime, ram, date) });

        }

        return;

    }

    

    // ========== CITATION ALÉATOIRE ==========

    if (subCommand === 'QUOTE') {

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        const quoteText = 

`🕷️ *SPIDER-QUOTE*

━━━━━━━━━━━━━━━━━━━━

*"${randomQuote}"*

— *Spider-Man*

━━━━━━━━━━━━━━━━━━━━

> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*`;

        

        await client.sendMessage(remoteJid, { text: quoteText });

        return;

    }

    

    // ========== INFO SPIDER-MAN ==========

    if (subCommand === 'INFO') {

        const infoText = 

`🕷️ *SPIDER-INFO*

━━━━━━━━━━━━━━━━━━━━

*Nom :* Peter Parker / Miles Morales

*Créateurs :* Stan Lee & Steve Ditko

*1ère apparition :* Amazing Fantasy #15 (1962)

*Pouvoirs :* Force surhumaine, agilité, sens d'araignée

*Devise :* "Un grand pouvoir implique de grandes responsabilités"

━━━━━━━━━━━━━━━━━━━━

> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*`;

        

        await client.sendMessage(remoteJid, { text: infoText });

        return;

    }

    

    // Commande invalide

    await client.sendMessage(remoteJid, { text: 

`🕷️ *Commande SPIDER invalide !*

📝 *Commandes disponibles :*

• *SPIDER* - Menu principal

• *SPIDER QUOTE* - Citation aléatoire

• *SPIDER INFO* - Infos Spider-Man

━━━━━━━━━━━━━━━━━━━━

> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*` });

}

export default spiderCommand;