import fs from "fs";

import os from "os";

import path from "path";

import { fileURLToPath } from "url";

import configs from "../utils/configmanager.js";

import { getDevice } from "baileys";

import stylizedChar from "../utils/fancy.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

function formatUptime(seconds) {

  const h = Math.floor(seconds / 3600);

  const m = Math.floor((seconds % 3600) / 60);

  const s = Math.floor(seconds % 60);

  return `${h}h ${m}m ${s}s`;

}

function getCategoryIcon(category) {

  const c = category.toLowerCase();

  // 🔥 SEULEMENT LES CATÉGORIES DEMANDÉES

  if (c === "premium") return "✨";

  if (c === "ia et chat-bot" || c === "") return "🤖";

  if (c === "religion") return "📖";

  if (c === "jeu et autres" || c === "") return "🎮";

  if (c === "" || c === "gc-menu") return "👥";

  if (c === "bot-menu") return "🌹";

  if (c === "langues et études" || c === "") return "🌐";

  if (c === "media") return "📁";

  if (c === "histoire et citation" || c === "") return "🍒";

  if (c === "anime-mangas" || c === "") return "🇯🇵";
    
     if (c === "sport" || c === "") return "⚽";

  

  return "📖"; 

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

    const handlerPath = path.join(__dirname, "../events/messageHandler.js");

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

    // 🎯 MENU PRINCIPAL

    let menu = 

`────────────
*AKANE MD 🍉*
────────────

*👤 UTILISATEUR  :* ${stylizedChar(userName)}

*🔰 PREFIXE :* *${prefix}*

*📦 VERSION :* *1.0.0*

*⏱️ UPTIME :* *${uptime}*

*💾 RAM :* *${usedRam}/${totalRam} MB*

*💻 PLATEFORME :* *${platform}*

*📅 DATE :* *${day}* *${date}*

`;

    // Ajout des catégories avec CADRES

    for (const [category, commands] of Object.entries(categories)) {

      const icon = getCategoryIcon(category);

      const title = getCategoryTitle(category);

      

      menu += `┌────────────────────┐\n`;

      menu += `│  ${icon} ${title}  \n`;

      menu += `├────────────────────┤\n`;

      

      commands.forEach(cmd => {

        menu += `│  ✦ ${stylizedChar(cmd.toUpperCase())}  \n`;

      });

      

      menu += `└────────────────────┘\n\n`;
    }
  // FOOTER
      menu += `
> *DEV : 🍁AKANE ʕ◕ᴥ◕ʔ🌹*
> *© AKANE-MD 🌹*`;

    try {

      const device = getDevice(message.key.id);

      if (device === "android") {

        await client.sendMessage(remoteJid, {

          image: { url: "database/menu.jpg" },

          caption: stylizedChar(menu),

          contextInfo: {

            participant: "0@s.whatsapp.net",

            remoteJid: "status@broadcast",

            quotedMessage: { conversation: "🍁𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀ʕ◕ᴥ◕ʔ🌹" },

            isForwarded: true,

            forwardingScore: 999

          }

        });

      } else {

        await client.sendMessage(

          remoteJid,

          {

            video: { url: "database/DigiX.mp3" },

            caption: stylizedChar(menu),

            contextInfo: {

              forwardingScore: 999,

              isForwarded: true

            }

          },

          { quoted: message }

        );

      }

    } catch (err) {

      await client.sendMessage(

        remoteJid,

        { text: "❌ Erreur lors de l'envoi du menu : " + err.message },

        { quoted: message }

      );

    }

    console.log(menu);

  } catch (err) {

    console.log("error while displaying menu:", err);

  }

}