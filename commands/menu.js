import fs from "fs";

import os from "os";

import path from "path";

import { fileURLToPath } from "url";

import configs from "../utils/configmanager.js";

import { getDevice } from "baileys";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// Style BIBLE (bold_fancy)

function styleBible(text) {

    const map = {

        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴',

        'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻',

        'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂',

        'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',

        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',

        'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',

        'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',

        'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',

        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰',

        '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵',

        'é': '𝗲́', 'è': '𝗲̀', 'ê': '𝗲̂', 'ë': '𝗲̈',

        'à': '𝗮̀', 'â': '𝗮̂', 'ç': '𝗰̧', 'ô': '𝗼̂',

        ' ': ' ', '.': '.', ',': ',', '!': '!', '?': '?',

        '-': '-', '_': '_', '/': '/', '\\': '\\',

        '@': '@', '#': '#', '&': '&', '*': '*', '(': '(', ')': ')',

        '[': '[', ']': ']', '{': '{', '}': '}', '<': '<', '>': '>'

    };

    return text.split('').map(char => map[char] || char).join('');

}

function formatUptime(seconds) {

  const h = Math.floor(seconds / 3600);

  const m = Math.floor((seconds % 3600) / 60);

  const s = Math.floor(seconds % 60);

  return `${h}h ${m}m ${s}s`;

}

function getCategoryIcon(category) {

  const c = category.toLowerCase();

  if (c === "premium") return "✨";

  if (c === "ia et chat-bot") return "🤖";

  if (c === "religion") return "📖";

  if (c === "games") return "🎮";

  if (c === "tools") return "☢️";

  if (c === "gc-menu") return "👥";

  if (c === "bot-menu") return "🌹";

  if (c === "langues et études") return "🌐";

  if (c === "media") return "📁";

  if (c === "histoire et citation") return "🌸";

  if (c === "anime-mangas") return "🇯🇵";

  if (c === "dev-menu") return "💻";

  if (c === "sport") return "⚽";

  return "🍏";

}

function getCategoryTitle(category) {

  const c = category.toLowerCase();

  if (c === "premium") return "PREMIUM";

  if (c === "ia") return "IA & CHATBOT";

  if (c === "chatbot") return "IA & CHATBOT";

  if (c === "religion") return "RELIGION";

  if (c === "jeu") return "JEUX & AUTRES";

  if (c === "jeux") return "JEUX & AUTRES";

  if (c === "group") return "GC-MENU";

  if (c === "gc-menu") return "GC-MENU";

  if (c === "bot-menu") return "BOT-MENU";

  if (c === "langues") return "LANGUES & ÉTUDES";

  if (c === "etudes") return "LANGUES & ÉTUDES";

  if (c === "media") return "MEDIA";

  if (c === "histoire") return "HISTOIRES & CITATIONS";

  if (c === "citation") return "HISTOIRES & CITATIONS";

  if (c === "anime") return "ANIME-MANGA";

  if (c === "manga") return "ANIME-MANGA";

  return category.toUpperCase();

}

export default async function info(client, message) {

  try {

    const remoteJid = message.key.remoteJid;

    const userName = message.pushName || "Unknown";

    const usedRam = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);

    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(1);

    const uptime = formatUptime(process.uptime());

    const platform = os.platform();

    const botId = client.user.id.split(":")[0];

    const prefix = configs.config.users?.[botId]?.prefix || "!";

    const now = new Date();

    const days = [

      "DIMANCHE", "LUNDI", "MARDI", "MERCREDI", 

      "JEUDI", "VENDREDI", "SAMEDI"

    ];

    const date = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

    const day = days[now.getDay()];

    const handlerPath = path.join(__dirname, "../akane/akanes.js");

    const handlerCode = fs.readFileSync(handlerPath, "utf-8");

    const commandRegex = /case\s+['"](\w+)['"]\s*:\s*\/\/\s*@cat:\s*([^\n\r]+)/g;

    const categories = {};

    let match;

    while ((match = commandRegex.exec(handlerCode)) !== null) {

      const command = match[1];

      const category = match[2].trim();

      if (!categories[category]) categories[category] = [];

      categories[category].push(command);

    }

    // 🎯 NOUVEL ORDRE DES CATÉGORIES

    // DEV-MENU en bas, GAMES au milieu, RELIGION au milieu

    const categoryOrder = [

      "bot-menu", 

      "media", 

      "tools", 

      "langues et études",

      "histoire et citation", 

      "anime-mangas", 

      "sport", 

      "ia et chat-bot",

      "games",        // GAMES au milieu

      "religion",     // RELIGION au milieu

      "premium", 

      "gc-menu",

      "dev-menu"      // DEV-MENU en bas

    ];

    

    const orderedCategories = [];

    for (const cat of categoryOrder) {

      if (categories[cat]) {

        orderedCategories.push([cat, categories[cat]]);

        delete categories[cat];

      }

    }

    for (const [cat, cmds] of Object.entries(categories)) {

      orderedCategories.push([cat, cmds]);

    }

    // 🎯 MENU PRINCIPAL avec style BIBLE

    let menu = styleBible(

`────────────

*AKANE MD 🍉*

────────────

*👤 UTILISATEUR  :* ${userName}

*🍒 PREFIXE :* *${prefix}*

*📦 VERSION :* *1.0.0*

*⏱️ UPTIME :* *${uptime}*

*🗂 RAM :* *${usedRam}/${totalRam} MB*

*💻 PLATEFORME :* *${platform}*

*📅 DATE :* *${day}* *${date}*

`);

    // Ajout des catégories avec CADRES

    for (const [category, commands] of orderedCategories) {

      const icon = getCategoryIcon(category);

      const title = getCategoryTitle(category);

      

      menu += styleBible(`┌────────────────────┐

│  ${icon} ${title}  

├────────────────────┤

`);

      

      commands.forEach(cmd => {

        menu += styleBible(`│  ✦ ${cmd.toUpperCase()}  

`);

      });

      

      menu += styleBible(`└────────────────────┘

`);

    }

    

    // FOOTER

    menu += styleBible(`

> *DEV : AKANE BIG-DEAL ʕ◕ᴥ◕ʔ🌹*

> *© AKANE-MD 🌹*`);

    try {

      const device = getDevice(message.key.id);

      

      const channelMessage = `\n*CHANNEL_LINK:*\n🔗 https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R`;

      

      if (device === "android") {

        await client.sendMessage(remoteJid, {

          image: { url: "database/menu.jpg" },

          caption: menu + channelMessage,

          contextInfo: {

            participant: "0@s.whatsapp.net",

            remoteJid: "status@broadcast",

            quotedMessage: { conversation: "🍁𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀ʕ◕ᴥ◕ʔ🌹" },

            isForwarded: true,

            forwardingScore: 999

          }

        });

      } else {

        await client.sendMessage(remoteJid, {

          text: menu + channelMessage

        });

      }

    } catch (err) {

      await client.sendMessage(remoteJid, {

        text: "❌ Erreur lors de l'envoi du menu : " + err.message

      });

    }

    console.log(menu);

  } catch (err) {

    console.log("error while displaying menu:", err);

  }

}