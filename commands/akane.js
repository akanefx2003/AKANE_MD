// commands/akane.js

import axios from 'axios';

// Style direct comme song.js

function formatStyle(text) {

    if (text.includes('http://') || text.includes('https://')) {

        const parts = text.split(/(https?:\/\/[^\s]+)/g);

        let result = '';

        for (const part of parts) {

            if (part.match(/^https?:\/\//)) {

                result += part;

            } else {

                result += part.split('').map(char => styleMap[char] || char).join('');

            }

        }

        return result;

    }

    return text.split('').map(char => styleMap[char] || char).join('');

}

const styleMap = {

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

    ':': ':', '-': '-', '_': '_', '/': '/', '\\': '\\',

    '(': '(', ')': ')', '❤️': '❤️', '🍒': '🍒'

};

const waitingMessages = [

    "😒 Patiente...",

    "🙄 T'es pressé ?",

    "😤 J'ai pas que ça à faire...",

    "🤨 T'es sérieux ?",

    "😏 Ok, mais dépêche-toi...",

    "😴 ZZZ... Ah t'es là ?",

    "🤔 Encore toi ?",

    "😎 T'as de la chance..."

];

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const CHANNEL_NAME = '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹';

// Stockage de l'historique

const userHistories = new Map();

let currentApiIndex = 0;

// APIs

const stablediffusionAPIs = [

    { name: 'stablediffusion-fr-1', url: 'https://stablediffusion.fr/gpt4/predict2', referer: 'https://stablediffusion.fr/chatgpt4' },

    { name: 'stablediffusion-fr-2', url: 'https://stablediffusion.fr/gpt4/predict', referer: 'https://stablediffusion.fr/chatgpt4' },

    { name: 'stablediffusion-fr-3', url: 'https://stablediffusion.fr/gpt3/predict2', referer: 'https://stablediffusion.fr/chatgpt3' },

    { name: 'stablediffusion-fr-4', url: 'https://stablediffusion.fr/gpt3/predict', referer: 'https://stablediffusion.fr/chatgpt3' }

];

const backupAPIs = [

    {

        name: 'blackbox',

        url: 'https://www.blackbox.ai/api/chat',

        method: 'post',

        body: (prompt) => ({ messages: [{ role: "user", content: prompt }], model: "llama-3.1-8b" }),

        extract: (data) => typeof data === 'string' && data.length > 10 ? data : null

    }

];

async function callStableDiffusion(prompt, api) {

    try {

        const refererResp = await axios.get(api.referer, { 

            timeout: 8000,

            headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }

        });

        

        const setCookie = refererResp.headers && refererResp.headers['set-cookie'];

        const cookieHeader = Array.isArray(setCookie) ? setCookie.join('; ') : undefined;

        

        const { data } = await axios.post(

            api.url,

            { prompt: prompt },

            {

                headers: {

                    'accept': '*/*',

                    'content-type': 'application/json',

                    'origin': 'https://stablediffusion.fr',

                    'referer': api.referer,

                    ...(cookieHeader ? { 'cookie': cookieHeader } : {}),

                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'

                },

                timeout: 25000

            }

        );

        

        if (data && data.message && data.message.length > 5) {

            return data.message;

        }

        throw new Error('Réponse invalide');

    } catch (error) {

        console.log(`❌ ${api.name}: ${error.message}`);

        return null;

    }

}

async function callBackupAPI(prompt, api) {

    try {

        const response = await axios.post(api.url, api.body(prompt), {

            timeout: 20000,

            headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' }

        });

        const reply = api.extract(response.data);

        if (reply && reply.length > 10 && !reply.includes('<html>')) {

            return reply;

        }

        return null;

    } catch (error) {

        console.log(`❌ backup ${api.name}: ${error.message}`);

        return null;

    }

}

async function callAkaneGPT(prompt) {

    let attempts = 0;

    const maxAttempts = stablediffusionAPIs.length + backupAPIs.length;

    

    while (attempts < maxAttempts) {

        const sdApi = stablediffusionAPIs[currentApiIndex % stablediffusionAPIs.length];

        currentApiIndex++;

        

        console.log(`🔄 Tentative ${sdApi.name}`);

        let reply = await callStableDiffusion(prompt, sdApi);

        

        if (reply && !reply.includes('<html>') && !reply.includes('<body')) {

            console.log(`✅ Succès avec ${sdApi.name}`);

            return reply;

        }

        

        attempts++;

        

        if (attempts >= stablediffusionAPIs.length) {

            for (const backup of backupAPIs) {

                console.log(`🔄 Tentative backup: ${backup.name}`);

                reply = await callBackupAPI(prompt, backup);

                if (reply) {

                    console.log(`✅ Succès avec backup: ${backup.name}`);

                    return reply;

                }

                attempts++;

            }

        }

    }

    throw new Error('Toutes les API sont indisponibles');

}

// Nettoyage historique

setInterval(() => {

    const now = Date.now();

    for (const [userId, data] of userHistories.entries()) {

        if (now - data.lastActivity > 3600000) {

            userHistories.delete(userId);

        }

    }

}, 600000);

// ==================== COMMANDE PRINCIPALE ====================

export default async function akaneCommand(sock, message, args) {

    try {

        const remoteJid = message.key?.remoteJid;

        const senderId = message.key?.participant || message.key?.remoteJid;

        const query = args.join(' ').trim();

        if (!query) {

            const helpMessage = 

`﹝╎🍒 𝐀𝐊𝐀𝐍𝐄 𝐈𝐀 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐔𝐭𝐢𝐥𝐢𝐬𝐚𝐭𝐢𝐨𝐧 ⪨

⸙﹝ akane [ta question] ﹞✴︎

⋆.˚⪩ 𝐄𝐱𝐞𝐦𝐩𝐥𝐞𝐬 ⪨

⸙﹝ akane Qui est le boss ? ﹞✴︎

⸙﹝ akane Donne-moi une vanne ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*`;

            

            const styledHelp = formatStyle(helpMessage);

            return await sock.sendMessage(remoteJid, { text: styledHelp });

        }

        const randomWaiting = waitingMessages[Math.floor(Math.random() * waitingMessages.length)];

        await sock.sendMessage(remoteJid, { text: formatStyle(`⏳ ${randomWaiting}`) });

        // Historique

        let userHistory = userHistories.get(senderId);

        if (!userHistory) {

            userHistory = { messages: [], lastActivity: Date.now() };

        }

        userHistory.lastActivity = Date.now();

        userHistory.messages.push({ role: 'user', content: query });

        if (userHistory.messages.length > 10) {

            userHistory.messages = userHistory.messages.slice(-10);

        }

        // Prompt

        let prompt = '';

        for (const msg of userHistory.messages.slice(0, -1)) {

            if (msg.role === 'user') {

                prompt += `Utilisateur: ${msg.content}\n`;

            } else {

                prompt += `Akane: ${msg.content}\n`;

            }

        }

        prompt += `Utilisateur: ${query}\nAkane: Tu es Akane, une IA insolente et sarcastique. Réponds de manière cinglante, avec humour noir, en 3-4 lignes max, en français.`;

        let reply = await callAkaneGPT(prompt);

        

        if (!reply || reply.length < 2 || reply.includes('<html>')) {

            throw new Error('Réponse invalide');

        }

        reply = reply.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, '');

        reply = reply.replace(/\n+/g, '\n').trim();

        

        if (reply.length > 400) {

            reply = reply.substring(0, 397) + '...';

        }

        userHistory.messages.push({ role: 'assistant', content: reply });

        userHistories.set(senderId, userHistory);

        const finalMessage = 

`﹝╎🍒 𝐀𝐊𝐀𝐍𝐄 𝐈𝐀 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐑𝐞́𝐩𝐨𝐧𝐬𝐞 ⪨

⸙﹝ ${reply} ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*`;

        

        const styledMessage = formatStyle(finalMessage);

        await sock.sendMessage(remoteJid, { text: styledMessage });

    } catch (error) {

        console.error('Erreur akaneCommand:', error);

        const remoteJid = message.key?.remoteJid;

        if (remoteJid) {

            const errorMessage = 

`﹝╎🍒 𝐀𝐊𝐀𝐍𝐄 𝐈𝐀 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐄𝐫𝐫𝐞𝐮𝐫 ⪨

⸙﹝ API indisponible, réessaie plus tard. ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*`;

            

            const styledError = formatStyle(errorMessage);

            await sock.sendMessage(remoteJid, { text: styledError });

        }

    }

}

// ==================== VOIR HISTORIQUE ====================

export async function showAkaneHistory(client, message) {

    const senderId = message.key?.participant || message.key?.remoteJid;

    const userHistory = userHistories.get(senderId);

    

    if (!userHistory || userHistory.messages.length === 0) {

        const noHistoryMessage = 

`﹝╎🍒 𝐀𝐊𝐀𝐍𝐄 𝐈𝐀 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐇𝐢𝐬𝐭𝐨𝐫𝐢𝐪𝐮𝐞 ⪨

⸙﹝ Rien à voir, loser. ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*`;

        

        const styledNoHistory = formatStyle(noHistoryMessage);

        return await client.sendMessage(message.key.remoteJid, { text: styledNoHistory });

    }

    

    let historyText = `﹝╎🍒 𝐇𝐈𝐒𝐓𝐎𝐑𝐈𝐐𝐔𝐄 ╎˼\n⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔\n\n`;

    historyText += `⋆.˚⪩ ${userHistory.messages.length} messages ⪨\n\n`;

    

    for (let i = 0; i < userHistory.messages.length; i++) {

        const msg = userHistory.messages[i];

        if (msg.role === 'user') {

            historyText += `⸙﹝ 👤 TOI : ${msg.content.substring(0, 40)}${msg.content.length > 40 ? '...' : ''} ﹞✴︎\n`;

        } else {

            historyText += `⸙﹝ 🍒 AKANE : ${msg.content.substring(0, 40)}${msg.content.length > 40 ? '...' : ''} ﹞✴︎\n`;

        }

    }

    

    historyText += `\n𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍\n\n> *© AKANE MD 🌹*`;

    

    const styledHistory = formatStyle(historyText);

    await client.sendMessage(message.key.remoteJid, { text: styledHistory });

}

// ==================== RESET HISTORIQUE ====================

export async function resetAkaneHistory(client, message) {

    const senderId = message.key?.participant || message.key?.remoteJid;

    if (userHistories.has(senderId)) {

        userHistories.delete(senderId);

        const resetMessage = 

`﹝╎🍒 𝐀𝐊𝐀𝐍𝐄 𝐈𝐀 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐑𝐞́𝐢𝐧𝐢𝐭𝐢𝐚𝐥𝐢𝐬𝐚𝐭𝐢𝐨𝐧 ⪨

⸙﹝ Historique effacé ! ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*`;

        

        const styledReset = formatStyle(resetMessage);

        await client.sendMessage(message.key.remoteJid, { text: styledReset });

    } else {

        const noHistoryMessage = 

`﹝╎🍒 𝐀𝐊𝐀𝐍𝐄 𝐈𝐀 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐇𝐢𝐬𝐭𝐨𝐫𝐢𝐪𝐮𝐞 ⪨

⸙﹝ Aucun historique trouvé. ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*`;

        

        const styledNoHistory = formatStyle(noHistoryMessage);

        await client.sendMessage(message.key.remoteJid, { text: styledNoHistory });

    }

}