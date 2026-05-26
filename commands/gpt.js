// commands/gpt.js

import axios from 'axios';

// Style BIBLE intégré
function styleBible(text) {
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
    '(': '(', ')': ')'
};

const waitingMessages = [
    "🤔 Réflexion...",
    "💭 Je réfléchis...",
    "🔄 Traitement...",
    "⚙️ Analyse..."
];

// Stockage de l'historique
const userHistories = new Map();

// Index pour alterner entre les APIs
let currentApiIndex = 0;

// Liste des APIs stablediffusion
const stablediffusionAPIs = [
    {
        name: 'stablediffusion-fr-1',
        url: 'https://stablediffusion.fr/gpt4/predict2',
        referer: 'https://stablediffusion.fr/chatgpt4'
    },
    {
        name: 'stablediffusion-fr-2',
        url: 'https://stablediffusion.fr/gpt4/predict',
        referer: 'https://stablediffusion.fr/chatgpt4'
    },
    {
        name: 'stablediffusion-fr-3',
        url: 'https://stablediffusion.fr/gpt3/predict2',
        referer: 'https://stablediffusion.fr/chatgpt3'
    },
    {
        name: 'stablediffusion-fr-4',
        url: 'https://stablediffusion.fr/gpt3/predict',
        referer: 'https://stablediffusion.fr/chatgpt3'
    }
];

// APIs de secours
const backupAPIs = [
    {
        name: 'blackbox',
        url: 'https://www.blackbox.ai/api/chat',
        method: 'post',
        body: (prompt) => ({ messages: [{ role: "user", content: prompt }], model: "llama-3.1-8b" }),
        extract: (data) => typeof data === 'string' && data.length > 10 ? data : null
    },
    {
        name: 'vyro',
        url: 'https://api.vyro.ai/v1/gpt4o',
        method: 'get',
        params: (prompt) => ({ prompt: prompt }),
        extract: (data) => data.response || null
    }
];

async function callStableDiffusion(prompt, api) {
    try {
        const refererResp = await axios.get(api.referer, { 
            timeout: 8000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
            }
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
        console.log(`❌ [GPT] ${api.name}: ${error.message}`);
        return null;
    }
}

async function callBackupAPI(prompt, api) {
    try {
        let response;

        if (api.method === 'post') {
            response = await axios.post(api.url, api.body(prompt), {
                timeout: 20000,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                }
            });
        } else {
            response = await axios.get(api.url, {
                params: api.params(prompt),
                timeout: 20000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
        }

        const reply = api.extract(response.data);

        if (reply && reply.length > 10 && !reply.includes('<html>')) {
            return reply;
        }

        return null;

    } catch (error) {
        console.log(`❌ [GPT] backup ${api.name}: ${error.message}`);
        return null;
    }
}

async function callGPT(prompt) {
    let attempts = 0;
    const maxAttempts = stablediffusionAPIs.length + backupAPIs.length;

    while (attempts < maxAttempts) {
        const sdApi = stablediffusionAPIs[currentApiIndex % stablediffusionAPIs.length];
        currentApiIndex++;

        console.log(`🔄 [GPT] Tentative ${sdApi.name}`);
        let reply = await callStableDiffusion(prompt, sdApi);

        if (reply && !reply.includes('<html>') && !reply.includes('<body')) {
            console.log(`✅ [GPT] Succès avec ${sdApi.name}`);
            return reply;
        }

        attempts++;

        if (attempts >= stablediffusionAPIs.length) {
            for (const backup of backupAPIs) {
                console.log(`🔄 [GPT] Tentative backup: ${backup.name}`);
                reply = await callBackupAPI(prompt, backup);

                if (reply) {
                    console.log(`✅ [GPT] Succès avec backup: ${backup.name}`);
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

// ==================== VOIR HISTORIQUE ====================

export async function showGptHistory(client, message) {
    const senderId = message.key?.participant || message.key?.remoteJid;
    const userHistory = userHistories.get(senderId);

    if (!userHistory || userHistory.messages.length === 0) {
        const noHistoryMessage = styleBible(
`╭─✧🌹━━━━━━━━━━━━━━❂
┊
*┊📭 Aucun historique trouvé*
┊
*┊💡 Commence à discuter avec .gpt*
┊
╰─────────────────❂`
        );
        return await client.sendMessage(message.key.remoteJid, { text: noHistoryMessage });
    }

    let historyText = `╭─✧🌹━━━━━━━━━━━━━━❂
┊
*┊👤 ${userHistory.messages.length} messages*
*┊⏰ ${Math.floor((Date.now() - userHistory.lastActivity) / 60000)} min*
┊
*┊💬 CONVERSATION :*
┊
`;

    for (let i = 0; i < userHistory.messages.length; i++) {
        const msg = userHistory.messages[i];
        if (msg.role === 'user') {
            historyText += `*┊👤 ${msg.content.substring(0, 25)}${msg.content.length > 25 ? '...' : ''}*\n┊\n`;
        } else {
            historyText += `*┊🤖 ${msg.content.substring(0, 25)}${msg.content.length > 25 ? '...' : ''}*\n┊\n`;
        }
    }

    historyText += `╰─────────────────❂`;

    const styledHistory = styleBible(historyText);
    await client.sendMessage(message.key.remoteJid, { text: styledHistory });
}

// ==================== RESET HISTORIQUE ====================

export async function resetHistory(client, message) {
    const senderId = message.key?.participant || message.key?.remoteJid;

    if (userHistories.has(senderId)) {
        userHistories.delete(senderId);
        const resetMessage = styleBible(`✅ *Historique GPT réinitialisé !*`);
        await client.sendMessage(message.key.remoteJid, { text: resetMessage });
    } else {
        const noHistoryMessage = styleBible(`ℹ️ *Aucun historique à réinitialiser*`);
        await client.sendMessage(message.key.remoteJid, { text: noHistoryMessage });
    }
}

// ==================== COMMANDE PRINCIPALE ====================

export default async function gptCommand(sock, message) {
    try {
        const remoteJid = message.key?.remoteJid;
        const senderId = message.key?.participant || message.key?.remoteJid;
        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const args = messageBody.slice(4).trim();

        if (!args) {
            // Afficher l'aide avec image
            await sock.sendMessage(remoteJid, {
                image: { url: 'https://raw.githubusercontent.com/toge021/Media/main/5cef.tmp' },
                caption: 
`╭─✧🌹━━━━━━━━━━━━━━❂
┊
*┊🤖 GPT - IA*
┊
*┊📌 .gpt [ta question]*
┊
*┊📝 Exemple:*
*┊.gpt quel est la plus grand continent au monde*
┊
*┊💡 Le bot se souvient de toi !*
┊
╰─────────────────❂`
            });
            return;
        }

        const randomWaiting = waitingMessages[Math.floor(Math.random() * waitingMessages.length)];
        const styledWaiting = styleBible(`⏳ ${randomWaiting}`);
        await sock.sendMessage(remoteJid, { text: styledWaiting });

        // Récupérer l'historique
        let userHistory = userHistories.get(senderId);
        if (!userHistory) {
            userHistory = { messages: [], lastActivity: Date.now() };
        }

        userHistory.lastActivity = Date.now();
        userHistory.messages.push({ role: 'user', content: args });

        if (userHistory.messages.length > 10) {
            userHistory.messages = userHistory.messages.slice(-10);
        }

        // Construire le prompt avec historique
        let prompt = '';
        for (const msg of userHistory.messages.slice(0, -1)) {
            if (msg.role === 'user') {
                prompt += `Utilisateur: ${msg.content}\n`;
            } else {
                prompt += `Assistant: ${msg.content}\n`;
            }
        }

        prompt += `Utilisateur: ${args}\nAssistant: Réponds brièvement en français (max 200 caractères).`;

        let reply = await callGPT(prompt);

        if (!reply || reply.length < 2 || reply.includes('<html>')) {
            throw new Error('Réponse invalide');
        }

        reply = reply.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, '');
        reply = reply.replace(/\n+/g, '\n').trim();

        // LIMITER À 200 CARACTÈRES MAX
        if (reply.length > 200) {
            reply = reply.substring(0, 197) + '...';
        }

        userHistory.messages.push({ role: 'assistant', content: reply });
        userHistories.set(senderId, userHistory);

        // Envoyer la réponse avec image et TOUT EN GRAS
        await sock.sendMessage(remoteJid, {
            image: { url: 'https://raw.githubusercontent.com/toge021/Media/main/514e.tmp' },
            caption:
`╭─✧🌹━━━━━━━━━━━━━━❂
┊
*┊🤖 ${reply}*
┊
╰─────────────────❂`
        });

    } catch (error) {
        console.error('Erreur gptCommand:', error);
        const remoteJid = message.key?.remoteJid;

        if (remoteJid) {
            const errorMessage = 
`╭─✧🌹━━━━━━━━━━━━━━❂
┊
*┊⚠️ API momentanément indisponible*
┊
*┊🔄 Réessaie dans 30 secondes*
┊
╰─────────────────❂`;

            const styledError = styleBible(errorMessage);
            await sock.sendMessage(remoteJid, { text: styledError });
        }
    }
}
