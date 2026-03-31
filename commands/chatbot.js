// commands/chatbot.js

// @cat: ia et chat-bot

// Version corrigÃ©e - DÃ©sactivation par dÃ©faut et plus humain

import axios from 'axios';

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const CHANNEL_NAME = 'ðŸðƒðŽÌˆðŽÌƒðŒ ð’ð“ðˆð‚ðŠð„ð‘ð’ ðŸŒ¹';

// Stockage des conversations et modes par utilisateur

const conversations = new Map();

const userModes = new Map();

// ==================== APIS CHATGPT ====================

const APIS = [

    { name: 'ChatGPT4', api: 'https://stablediffusion.fr/gpt4/predict2', referer: 'https://stablediffusion.fr/chatgpt4' },

    { name: 'ChatGPT3', api: 'https://stablediffusion.fr/gpt3/predict', referer: 'https://stablediffusion.fr/chatgpt3' }

];

// ==================== PROMPTS PLUS HUMAINS ====================

const modePrompts = {

    normal: `Tu es Sakamoto, un pote cool. Parle naturellement, comme un humain. RÃ©ponds de maniÃ¨re simple et naturelle. Sois concis.`,

    bro: `Tu es Sakamoto, un pote. Parle comme un mec normal. Utilise "frr" parfois. Sois naturel, pas trop familier.`,

    girlfriend: `Tu es Sakamoto. Parle normalement, comme une pote. Sois sympa sans Ãªtre collante.`,

    boyfriend: `Tu es Sakamoto. Parle normalement, comme un pote. Sois sympa sans Ãªtre collant.`,

    ami: `Tu es Sakamoto, un pote. Parle normalement. Sois sympa.`,

    amie: `Tu es Sakamoto, une pote. Parle normalement. Sois sympa.`,

    boy: `Tu es Sakamoto, tu parles Ã  un pote. Sois naturel.`,

    girl: `Tu es Sakamoto, tu parles Ã  une fille. Sois naturel.`

};

// ==================== FONCTION APPEL API ====================

async function callChatGPT(prompt, modelIndex = 0) {

    const api = APIS[modelIndex];

    try {

        const refererResp = await axios.get(api.referer, {

            timeout: 8000,

            headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }

        });

        const setCookie = refererResp.headers && refererResp.headers['set-cookie'];

        const cookieHeader = Array.isArray(setCookie) ? setCookie.join('; ') : undefined;

        const response = await axios.post(api.api, { prompt }, {

            headers: {

                'accept': '*/*',

                'content-type': 'application/json',

                'origin': 'https://stablediffusion.fr',

                'referer': api.referer,

                ...(cookieHeader ? { 'cookie': cookieHeader } : {}),

                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'

            },

            timeout: 25000

        });

        if (response.data && response.data.message) {

            return { success: true, response: response.data.message };

        }

        return { success: false };

    } catch (error) {

        console.error(`Erreur avec ${api.name}:`, error.message);

        return { success: false };

    }

}

// ==================== FONCTION PRINCIPALE ====================

async function getAIResponse(prompt, userId = null) {

    const mode = userModes.get(userId) || 'normal';

    const modePrompt = modePrompts[mode];

    

    let contextPrompt = prompt;

    if (userId && conversations.has(userId)) {

        const history = conversations.get(userId);

        const lastMessages = history.slice(-5);

        if (lastMessages.length > 0) {

            const historyText = lastMessages.map(m => `${m.role === 'user' ? 'Moi' : 'Sakamoto'}: ${m.content}`).join('\n');

            contextPrompt = `${modePrompt}\n\nContexte:\n${historyText}\n\nMessage: ${prompt}\n\nRÃ©ponds simplement:`;

        } else {

            contextPrompt = `${modePrompt}\n\nMessage: ${prompt}\n\nRÃ©ponds simplement:`;

        }

    } else {

        contextPrompt = `${modePrompt}\n\nMessage: ${prompt}\n\nRÃ©ponds simplement:`;

    }

    

    let result = await callChatGPT(contextPrompt, 0);

    if (!result.success) {

        result = await callChatGPT(contextPrompt, 1);

    }

    return result;

}

function setUserMode(userId, mode) {

    if (modePrompts[mode]) {

        userModes.set(userId, mode);

        return true;

    }

    return false;

}

function getUserMode(userId) {

    return userModes.get(userId) || 'normal';

}

// ==================== COMMANDE PRINCIPALE ====================

async function chatbotCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;

    const userId = message.key.participant || message.key.remoteJid;

    const subCommand = args[0]?.toLowerCase();

    const prompt = args.slice(1).join(' ');

    

    // GESTION DES MODES

    if (subCommand === 'on' && args[1] === 'bro') {

        setUserMode(userId, 'bro');

        await client.sendMessage(remoteJid, { text: "ðŸ’ Mode bro activÃ©" });

        return;

    }

    if (subCommand === 'on' && args[1] === 'girlfriend') {

        setUserMode(userId, 'girlfriend');

        await client.sendMessage(remoteJid, { text: "ðŸ’ Mode girlfriend activÃ©" });

        return;

    }

    if (subCommand === 'on' && args[1] === 'boyfriend') {

        setUserMode(userId, 'boyfriend');

        await client.sendMessage(remoteJid, { text: "ðŸ’ Mode boyfriend activÃ©" });

        return;

    }

    if (subCommand === 'on' && args[1] === 'ami') {

        setUserMode(userId, 'ami');

        await client.sendMessage(remoteJid, { text: "ðŸ’ Mode ami activÃ©" });

        return;

    }

    if (subCommand === 'on' && args[1] === 'amie') {

        setUserMode(userId, 'amie');

        await client.sendMessage(remoteJid, { text: "ðŸ’ Mode amie activÃ©" });

        return;

    }

    if (subCommand === 'on' && args[1] === 'boy') {

        setUserMode(userId, 'boy');

        await client.sendMessage(remoteJid, { text: "ðŸ’ Mode boy activÃ©" });

        return;

    }

    if (subCommand === 'on' && args[1] === 'girl') {

        setUserMode(userId, 'girl');

        await client.sendMessage(remoteJid, { text: "ðŸ’ Mode girl activÃ©" });

        return;

    }

    if (subCommand === 'on' && !args[1]) {

        setUserMode(userId, 'normal');

        await client.sendMessage(remoteJid, { text: "ðŸ’ Mode normal activÃ©" });

        return;

    }

    if (subCommand === 'mode') {

        const currentMode = getUserMode(userId);

        await client.sendMessage(remoteJid, { text: `ðŸ’ Mode actuel : ${currentMode}` });

        return;

    }

    

    // HELP

    if (!subCommand || subCommand === 'help') {

        const helpText = 

`ðŸ’ *SAKAMOTO*

ðŸ“ *COMMANDES :*

â€¢ *chat [message]* - Discuter

â€¢ *chat clear* - Effacer historique

â€¢ *chat mode* - Voir mode actuel

â€¢ *chat on* - Mode normal

â€¢ *chat on bro* - Mode pote

â€¢ *chat on girlfriend* - Mode copine

â€¢ *chat on boyfriend* - Mode copain

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

ðŸ“¢ *REJOINS MA CHAÃŽNE* ðŸ”¥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWAðŸŒ¹*`;

        

        await client.sendMessage(remoteJid, { text: helpText });

        return;

    }

    

    // CLEAR

    if (subCommand === 'clear') {

        conversations.delete(userId);

        await client.sendMessage(remoteJid, { text: "ðŸ§¹ Historique effacÃ©" });

        return;

    }

    

    // CHAT

    if (!prompt) {

        await client.sendMessage(remoteJid, { text: "âŒ Utilisation : chat [message]" });

        return;

    }

    

    let history = conversations.get(userId) || [];

    history.push({ role: 'user', content: prompt });

    

    const result = await getAIResponse(prompt, userId);

    if (!result.success) {

        await client.sendMessage(remoteJid, { text: "âŒ Erreur, rÃ©essaie plus tard" });

        return;

    }

    

    history.push({ role: 'assistant', content: result.response });

    if (history.length > 15) history = history.slice(-15);

    conversations.set(userId, history);

    

    let responseText = result.response;

    if (responseText && responseText.length > 500) responseText = responseText.substring(0, 500) + "...";

    

    await client.sendMessage(remoteJid, { text: responseText });

}

export default chatbotCommand;

export { getAIResponse, setUserMode, getUserMode };