import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import configs from "../utils/configmanager.js";

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
    if (c === "premium") return "✨";
    if (c === "ia et chat-bot") return "🤖";
    if (c === "religion") return "📖";
    if (c === "games") return "🎮";
    if (c === "tools") return "☢️";
    if (c === "gc-menu") return "👥";
    if (c === "bot-menu") return "🌹";
    if (c === "langues et études" || c === "langues et etudes" || c.includes("tudes")) return "🌐";
    if (c === "media") return "📁";
    if (c === "histoire et citation") return "🍒";
    if (c === "anime-mangas") return "🇯🇵";
    if (c === "dev-menu") return "💻";
    if (c === "sport") return "⚽";
    if (c === "jeu et autres" || c.includes("jeu")) return "🎲";
    return "🍏";
}

function getCategoryTitle(category) {
    const c = category.toLowerCase();
    if (c === "premium") return "PREMIUM";
    if (c === "ia et chat-bot") return "IA ET CHAT-BOT";
    if (c === "religion") return "RELIGION";
    if (c.includes("jeu")) return "JEUX & AUTRES";
    if (c === "gc-menu") return "GC-MENU";
    if (c === "bot-menu") return "BOT-MENU";
    if (c.includes("tudes") || c.includes("langues")) return "LANGUES & ETUDES";
    if (c === "media") return "MEDIA";
    if (c === "histoire et citation") return "HISTOIRE & CITATION";
    if (c === "anime-mangas") return "ANIME-MANGAS";
    if (c === "dev-menu") return "DEV-MENU";
    if (c === "tools") return "TOOLS";
    if (c === "games") return "GAMES";
    if (c === "sport") return "SPORT";
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
        const prefix = configs.config.users?.[botId]?.prefix || ".";
        const now = new Date();
        const days = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
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
            if (!categories[category].includes(command)) {
                categories[category].push(command);
            }
        }

        const categoryOrder = [
            "games", "tools", "dev-menu", "bot-menu",
            "jeux et autres", "langues et études", "ia et chat-bot",
            "gc-menu", "media", "histoire et citation",
            "anime-mangas", "sport", "religion", "premium",
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

        // ─── HEADER ───────────────────────────────────────────────────────
        let menu =
`╭────────────────❂
┊
*┊👤 UTILISATEUR :* ${userName}
┊
*┊🍉 PREFIXE :* ${prefix}
┊
*┊📦 VERSION :* *1.0.0*
┊
*┊⏱️ UPTIME :* *${uptime}*
┊
*┊💾 RAM :* *${usedRam}/${totalRam} MB*
┊
*┊💻 PLATEFORME :* *${platform}*
┊
*┊📅* *${day}* *${date}*
┊
╰─────────────────❂

`;

        // ─── CATÉGORIES ──────────────────────────────────────────────────
        for (const [category, commands] of orderedCategories) {
            const icon = getCategoryIcon(category);
            const title = getCategoryTitle(category);
            menu += `╭───${icon} *${title}*\n┊\n`;
            commands.forEach(cmd => {
                menu += `*┊✦ ${cmd.toUpperCase()}*\n`;
            });
            menu += `┊\n╰─────────────────❂\n\n`;
        }

        // ─── FOOTER ──────────────────────────────────────────────────────
        menu +=
`> *AKANE-MD 🌹*`;

        await client.sendMessage(remoteJid, {
            image: { url: "https://raw.githubusercontent.com/toge021/Media/main/0eee.tmp" },
            caption: menu
        }, { quoted: message });

    } catch (err) {
        console.log("Erreur menu:", err);
        try {
            await client.sendMessage(message.key.remoteJid, {
                text: "❌ Erreur lors de l'affichage du menu : " + err.message
            });
        } catch {}
    }
}
