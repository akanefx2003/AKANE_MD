// commands/menu.js

import fs   from 'fs';
import os   from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import configs from '../utils/configmanager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Config menu persistante ──────────────────────────────────────────────────

const MENU_CONFIG_FILE = './database/menu_config.json';

function loadMenuConfig() {

    try {

        if (fs.existsSync(MENU_CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(MENU_CONFIG_FILE, 'utf-8'));
        }

    } catch {}

    return { style: 1, image: 'https://raw.githubusercontent.com/toge021/Media/main/0eee.tmp' };

}

function saveMenuConfig(cfg) {

    try {

        if (!fs.existsSync('./database')) fs.mkdirSync('./database', { recursive: true });
        fs.writeFileSync(MENU_CONFIG_FILE, JSON.stringify(cfg, null, 2));

    } catch {}

}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUptime(seconds) {

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    return `${h}h ${m}m ${s}s`;

}

function getCategoryIcon(category) {

    const c = category.toLowerCase();

    if (c === 'premium')                               return '✨';
    if (c === 'ia et chat-bot')                        return '🤖';
    if (c === 'religion')                              return '📖';
    if (c === 'games')                                 return '🎮';
    if (c === 'tools')                                 return '☢️';
    if (c === 'gc-menu')                               return '👥';
    if (c === 'bot-menu')                              return '🌹';
    if (c.includes('tudes') || c.includes('langues')) return '🌐';
    if (c === 'media')                                 return '📁';
    if (c === 'histoire et citation')                  return '🍒';
    if (c === 'anime-mangas')                          return '🇯🇵';
    if (c === 'dev-menu')                              return '💻';
    if (c === 'sport')                                 return '⚽';
    if (c.includes('jeu'))                             return '🎲';

    return '🍏';

}

function getCategoryTitle(category) {

    const c = category.toLowerCase();

    if (c === 'premium')                                  return 'PREMIUM';
    if (c === 'ia et chat-bot')                           return 'AI';
    if (c === 'religion')                                 return 'RELIGION';
    if (c.includes('jeu'))                                return 'JEUX';
    if (c === 'gc-menu')                                  return 'GROUP';
    if (c === 'bot-menu')                                 return 'BOT';
    if (c.includes('tudes') || c.includes('langues'))     return 'LANGUES';
    if (c === 'media')                                    return 'MEDIA';
    if (c === 'histoire et citation')                     return 'HISTOIRE';
    if (c === 'anime-mangas')                             return 'ANIME';
    if (c === 'dev-menu')                                 return 'DEV';
    if (c === 'tools')                                    return 'TOOLS';
    if (c === 'games')                                    return 'GAMES';
    if (c === 'sport')                                    return 'SPORT';

    return category.toUpperCase();

}

// ─── Lecture des commandes depuis akanes.js ───────────────────────────────────

function getCategories() {

    const handlerPath  = path.join(__dirname, '../akane/akanes.js');
    const handlerCode  = fs.readFileSync(handlerPath, 'utf-8');
    const commandRegex = /case\s+['"](\w+)['"]\s*:\s*\/\/\s*@cat:\s*([^\n\r]+)/g;
    const categories   = {};
    let match;

    while ((match = commandRegex.exec(handlerCode)) !== null) {

        const command  = match[1];
        const category = match[2].trim();

        if (!categories[category]) categories[category] = [];
        if (!categories[category].includes(command)) categories[category].push(command);

    }

    const categoryOrder = [
        'ia et chat-bot', 'media', 'gc-menu', 'tools',
        'bot-menu', 'jeux et autres', 'langues et études',
        'histoire et citation', 'anime-mangas', 'sport', 'religion', 'premium', 'dev-menu',
    ];

    const ordered = [];

    for (const cat of categoryOrder) {
        if (categories[cat]) {
            ordered.push([cat, categories[cat]]);
            delete categories[cat];
        }
    }

    for (const [cat, cmds] of Object.entries(categories)) {
        ordered.push([cat, cmds]);
    }

    return ordered;

}

// ═════════════════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════════════════

// Style 1 — AKANE MD par défaut (╭╰)
function buildStyle1(d) {

    let menu =
`*╭────────────────❂*
*┊*
*┊🎨 STYLE : 1*
*┊👤 USER : ${d.userName}*
*┊🍉 PREFIX : ${d.prefix}*
*┊📦 VERSION : 1.0.0*
*┊⏱️ UPTIME : ${d.uptime}*
*┊💾 RAM : ${d.usedRam}/${d.totalRam} MB*
*┊💻 PLATEFORME : ${d.platform}*
*┊📅 ${d.day} ${d.date}*
*┊*
*╰─────────────────❂*

`;

    for (const [cat, cmds] of d.categories) {
        const icon  = getCategoryIcon(cat);
        const title = getCategoryTitle(cat);
        menu += `*╭───${icon} ${title}*\n*┊*\n`;
        cmds.forEach(cmd => { menu += `*┊✦ ${cmd.toUpperCase()}*\n`; });
        menu += `*┊*\n*╰─────────────────❂*\n\n`;
    }

    menu += `> _*© AKANE-MD 🌹*_`;

    return menu;

}

// Style 2 — ╔══╗ centré
function buildStyle2(d) {

    let menu =
`*╔══════════════════════╗*
*     🌸 AKANE - MD 🌸*
*╚══════════════════════╝*

*✦ STYLE : 2*
*✦ USER : ${d.userName}*
*✦ PREFIX : ${d.prefix}*
*✦ VERSION : 1.0.0*
*✦ UPTIME : ${d.uptime}*
*✦ RAM : ${d.usedRam}/${d.totalRam} MB*
*✦ PLATEFORME : ${d.platform}*
*✦ ${d.day} ${d.date}*

`;

    for (const [cat, cmds] of d.categories) {
        const icon  = getCategoryIcon(cat);
        const title = getCategoryTitle(cat);
        menu += `*╭━━ ${icon} ${title} ━━⬣*\n`;
        cmds.forEach(cmd => { menu += `*│ ✦ ${cmd.toUpperCase()}*\n`; });
        menu += `*╰━━━━━━━━━━⬣*\n\n`;
    }

    menu += `> _*© AKANE-MD 🌹*_`;

    return menu;

}

// Style 3 — ╭━━━━╮ header rond
function buildStyle3(d) {

    let menu =
`*╭━━━━━━━━━━━━━━╮*
*   🌹 AKANE MD*
*╰━━━━━━━━━━━━━━╯*

*✦ STYLE : 3*
*✦ USER : ${d.userName}*
*✦ PREFIX : ${d.prefix}*
*✦ VERSION : 1.0.0*
*✦ UPTIME : ${d.uptime}*
*✦ RAM : ${d.usedRam}/${d.totalRam} MB*
*✦ PLATEFORME : ${d.platform}*
*✦ ${d.day} ${d.date}*

`;

    for (const [cat, cmds] of d.categories) {
        const icon  = getCategoryIcon(cat);
        const title = getCategoryTitle(cat);
        menu += `*┏━━ ${icon} ${title}*\n`;
        cmds.forEach(cmd => { menu += `*┃ ✦ ${cmd.toUpperCase()}*\n`; });
        menu += `*┗━━━━━━━━━━*\n\n`;
    }

    menu += `> _*© AKANE-MD 🌹*_`;

    return menu;

}

// Style 4 — ┌─────┐ avec 〔 〕
function buildStyle4(d) {

    let menu =
`*┌─────────────────┐*
*   ✦ AKANE MD ✦*
*└─────────────────┘*

*〔 🎨 〕STYLE : 4*
*〔 👤 〕${d.userName}*
*〔 ⚡ 〕PREFIX : ${d.prefix}*
*〔 📦 〕V1.0.0*
*〔 ⏱️ 〕${d.uptime}*
*〔 💾 〕${d.usedRam}/${d.totalRam} MB*
*〔 💻 〕${d.platform}*
*〔 📅 〕${d.day} ${d.date}*

`;

    for (const [cat, cmds] of d.categories) {
        const icon  = getCategoryIcon(cat);
        const title = getCategoryTitle(cat);
        menu += `*━━━〔 ${icon} ${title} 〕━━━*\n`;
        cmds.forEach(cmd => { menu += `> *✦ ${cmd.toUpperCase()}*\n`; });
        menu += `\n`;
    }

    menu += `> _*© AKANE-MD 🌹*_`;

    return menu;

}

// Style 5 — ┏━━━━┓ minimaliste
function buildStyle5(d) {

    let menu =
`*┏━━━━━━━━━━━━━━┓*
*┃   AKANE MD 🌷*
*┗━━━━━━━━━━━━━━┛*

*✦ STYLE : 5*
*✦ USER : ${d.userName}*
*✦ PREFIX : ${d.prefix}*
*✦ VERSION : 1.0.0*
*✦ UPTIME : ${d.uptime}*
*✦ RAM : ${d.usedRam}/${d.totalRam} MB*
*✦ PLATEFORME : ${d.platform}*
*✦ ${d.day} ${d.date}*

`;

    for (const [cat, cmds] of d.categories) {
        const icon  = getCategoryIcon(cat);
        const title = getCategoryTitle(cat);
        menu += `*━━━━━━━━ ${title} ${icon}*\n`;
        cmds.forEach(cmd => { menu += `*✦ ${cmd.toUpperCase()}*\n`; });
        menu += `\n`;
    }

    menu += `> _*© AKANE-MD 🌹*_`;

    return menu;

}

// Style 6 — ╭─❍ classique
function buildStyle6(d) {

    let menu =
`*┏━━━━━━━━━━━━━━━┓*
*┃ 🌹 AKANE - MD 🌹 ┃*
*┗━━━━━━━━━━━━━━━┛*

*╭─❍「 USER INFO 」*
*│ 🎨 STYLE : 6*
*│ 👤 ${d.userName}*
*│ ⚡ PREFIX : ${d.prefix}*
*│ 📦 V1.0.0*
*│ 💾 RAM : ${d.usedRam}/${d.totalRam} MB*
*│ ⏱️ ${d.uptime}*
*│ 💻 ${d.platform}*
*│ 📅 ${d.day} ${d.date}*
*╰───────────────*

`;

    for (const [cat, cmds] of d.categories) {
        const icon  = getCategoryIcon(cat);
        const title = getCategoryTitle(cat);
        menu += `*╭─❍「 ${icon} ${title} 」*\n`;
        cmds.forEach(cmd => { menu += `*│ ✦ ${cmd.toUpperCase()}*\n`; });
        menu += `*╰───────────────*\n\n`;
    }

    menu += `> _*© AKANE-MD 🌹*_`;

    return menu;

}

// Style 7 — ┏┗⬣ japonais
function buildStyle7(d) {

    let menu =
`*┏━━━〔 🌹 AKANE MD 🌹 〕━━━⬣*
*┃ 🎨 STYLE : 7*
*┃ 👤 ${d.userName}*
*┃ ⚡ ${d.prefix}*
*┃ 📦 V1.0.0*
*┃ ⏱️ ${d.uptime}*
*┃ 💾 ${d.usedRam}/${d.totalRam} MB*
*┃ 💻 ${d.platform}*
*┃ 📅 ${d.day} ${d.date}*
*╰━━━━━━━━━━━━━━━━━━⬣*

`;

    for (const [cat, cmds] of d.categories) {
        const icon  = getCategoryIcon(cat);
        const title = getCategoryTitle(cat);
        menu += `*╭━━〔 ${icon} ${title} 〕*\n`;
        cmds.forEach(cmd => { menu += `*┃ ✧ ${cmd.toUpperCase()}*\n`; });
        menu += `*╰━━━━━━━━━━━━⬣*\n\n`;
    }

    menu += `> _*© AKANE-MD 🌹*_`;

    return menu;

}

// Style 8 — ═════ simple
function buildStyle8(d) {

    let menu =
`*░▒▓█ 🌸 AKANE-MD 🌸 █▓▒░*

*🎨 STYLE : 8*
*👤 ${d.userName}*
*⚡ PREFIX : ${d.prefix}*
*📦 VERSION : 1.0.0*
*⏱️ ${d.uptime}*
*💾 ${d.usedRam}/${d.totalRam} MB*
*💻 ${d.platform}*
*📅 ${d.day} ${d.date}*

`;

    for (const [cat, cmds] of d.categories) {
        const icon  = getCategoryIcon(cat);
        const title = getCategoryTitle(cat);
        menu += `*═════ ${icon} ${title} ═════*\n`;
        cmds.forEach(cmd => { menu += `*➥ ${cmd.toUpperCase()}*\n`; });
        menu += `\n`;
    }

    menu += `> _*© AKANE-MD 🌹*_`;

    return menu;

}

// Style 9 — japonais avec titres JP
function buildStyle9(d) {

    const jpTitles = {
        'AI':      '🤖 AI・チャット',
        'MEDIA':   '🎵 メディア',
        'GROUP':   '👥 グループ',
        'TOOLS':   '📦 ツール',
        'BOT':     '🌹 ボット',
        'JEUX':    '🎲 ゲーム',
        'LANGUES': '🌐 ランゲージ',
    };

    let menu =
`*┏━〔 👤 ユーザー 〕━⬣*
*┃ 🎨 STYLE : 9*
*┃ ✦ ${d.userName}*
*┃ ✦ PREFIX : ${d.prefix}*
*┃ ✦ V1.0.0*
*┃ ✦ ${d.uptime}*
*┃ ✦ ${d.usedRam}/${d.totalRam} MB*
*┃ ✦ ${d.platform}*
*┃ ✦ ${d.day} ${d.date}*
*┗━━━━━━━━━━━━⬣*

`;

    for (const [cat, cmds] of d.categories) {
        const title  = getCategoryTitle(cat);
        const jpTitle = jpTitles[title] || `${getCategoryIcon(cat)} ${title}`;
        menu += `*┏━〔 ${jpTitle} 〕━⬣*\n`;
        cmds.forEach(cmd => { menu += `*┃ ✦ ${cmd.toUpperCase()}*\n`; });
        menu += `*┗━━━━━━━━━━━━⬣*\n\n`;
    }

    menu +=
`*┏━〔 🌸 日本の世界 〕━⬣*
*┃ 「 闇の中でも、*
*┃    桜は咲き続ける 」*
*┗━━━━━━━━━━━━⬣*

> _*© AKANE-MD 🌹*_`;

    return menu;

}

// ─── Builder principal ────────────────────────────────────────────────────────

function buildMenu(style, data) {

    switch (style) {
        case 2:  return buildStyle2(data);
        case 3:  return buildStyle3(data);
        case 4:  return buildStyle4(data);
        case 5:  return buildStyle5(data);
        case 6:  return buildStyle6(data);
        case 7:  return buildStyle7(data);
        case 8:  return buildStyle8(data);
        case 9:  return buildStyle9(data);
        default: return buildStyle1(data);
    }

}

// ─── Commande MENU ────────────────────────────────────────────────────────────

export default async function info(client, message) {

    try {

        const remoteJid  = message.key.remoteJid;
        const userName   = message.pushName || 'Unknown';
        const usedRam    = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
        const totalRam   = (os.totalmem() / 1024 / 1024).toFixed(1);
        const uptime     = formatUptime(process.uptime());
        const platform   = os.platform();
        const botId      = client.user.id.split(':')[0];
        const prefix     = configs.config.users?.[botId]?.prefix || '.';
        const now        = new Date();
        const days       = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
        const date       = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
        const day        = days[now.getDay()];
        const categories = getCategories();
        const menuCfg    = loadMenuConfig();

        const data = { userName, prefix, uptime, usedRam, totalRam, platform, date, day, categories };

        const menu = buildMenu(menuCfg.style, data);

        await client.sendMessage(remoteJid, {
            image:   { url: menuCfg.image },
            caption: menu
        }, { quoted: message });

    } catch (err) {

        console.log('Erreur menu:', err);

        try {
            await client.sendMessage(message.key.remoteJid, {
                text: '❌ Erreur menu : ' + err.message
            });
        } catch {}

    }

}

// ─── Commande SETMENU ─────────────────────────────────────────────────────────

export async function setMenuCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;
    const sub       = args[0]?.toLowerCase();

    // ── setmenu pp [URL] ──────────────────────────────────────────────────────
    if (sub === 'pp') {

        const imageUrl = args[1]?.trim();

        if (!imageUrl) {

            return client.sendMessage(remoteJid, {
                text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🖼️ CHANGER LA PHOTO DU MENU*
┊
*┊💡 UTILISATION :*
*┊setmenu pp [URL]*
┊
╰─────────────────❂`
            });

        }

        const cfg = loadMenuConfig();
        cfg.image = imageUrl;
        saveMenuConfig(cfg);

        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ PHOTO DU MENU CHANGÉE !*
┊
╰─────────────────❂`
        });

    }

    // ── setmenu [1-9] ─────────────────────────────────────────────────────────
    const styleNum = parseInt(sub);

    if (!styleNum || styleNum < 1 || styleNum > 9) {

        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🎨 CHANGER LE STYLE DU MENU*
┊
*┊📝 STYLES DISPONIBLES :*
*┊▸ setmenu 1 → AKANE défaut ╭╰*
*┊▸ setmenu 2 → ╔══╗ centré*
*┊▸ setmenu 3 → ╭━━━╮ rond*
*┊▸ setmenu 4 → ┌───┐ avec 〔〕*
*┊▸ setmenu 5 → ┏━━━┓ minimaliste*
*┊▸ setmenu 6 → ╭─❍ classique*
*┊▸ setmenu 7 → ┏┗⬣ japonais*
*┊▸ setmenu 8 → ═════ simple*
*┊▸ setmenu 9 → 日本 titres JP*
┊
*┊🖼️ PHOTO : setmenu pp [URL]*
┊
╰─────────────────❂`
        });

    }

    const cfg   = loadMenuConfig();
    cfg.style   = styleNum;
    saveMenuConfig(cfg);

    const styleNames = {
        1: 'AKANE défaut ╭╰',
        2: '╔══╗ centré',
        3: '╭━━━╮ rond',
        4: '┌───┐ avec 〔〕',
        5: '┏━━━┓ minimaliste',
        6: '╭─❍ classique',
        7: '┏┗⬣ japonais',
        8: '═════ simple',
        9: '日本 titres JP',
    };

    await client.sendMessage(remoteJid, {
        text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ STYLE ${styleNum} ACTIVÉ !*
*┊${styleNames[styleNum]}*
┊
*┊💡 Tape .menu pour voir.*
┊
╰─────────────────❂`
    });

}
