// commands/gpt.js

import axios from 'axios';

import { applyBotFont } from "./botfont.js";

// Messages d'attente neutres

const waitingMessages = [

    "🤔 *Réflexion en cours...*",

    "💭 *Je réfléchis à ta question...*",

    "🔄 *Traitement en cours...*",

    "⚙️ *Analyse de ta demande...*",

    "📝 *Préparation de la réponse...*",

    "🧠 *Je cherche la meilleure réponse...*",

    "✨ *Un instant, s'il te plaît...*",

    "🔍 *Je consulte mes connaissances...*"

];

function limitResponse(text, maxLength = 1000) {

    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength) + '... [coupe]';

}

// Fonction pour appeler l'API ChatGPT gratuite

async function callChatGPT(prompt, model = 'chatgpt4') {

    const model_list = {

        chatgpt4: {

            api: 'https://stablediffusion.fr/gpt4/predict2',

            referer: 'https://stablediffusion.fr/chatgpt4'

        },

        chatgpt3: {

            api: 'https://stablediffusion.fr/gpt3/predict',

            referer: 'https://stablediffusion.fr/chatgpt3'

        }

    };

    const selectedModel = model_list[model];

    

    try {

        const refererResp = await axios.get(selectedModel.referer, { 

            timeout: 8000,

            headers: {

                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36'

            }

        });

        

        const setCookie = refererResp.headers && refererResp.headers['set-cookie'];

        const cookieHeader = Array.isArray(setCookie) ? setCookie.join('; ') : undefined;

        const { data } = await axios.post(

            selectedModel.api,

            { prompt },

            {

                headers: {

                    'accept': '*/*',

                    'content-type': 'application/json',

                    'origin': 'https://stablediffusion.fr',

                    'referer': selectedModel.referer,

                    ...(cookieHeader ? { 'cookie': cookieHeader } : {}),

                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36'

                },

                timeout: 25000

            }

        );

        if (data && data.message) {

            return data.message;

        }

        throw new Error('Réponse invalide de l\'API');

        

    } catch (error) {

        console.error('Erreur callChatGPT:', error.message);

        throw error;

    }

}

export default async function gptCommand(sock, message) {

    try {

        const botNumber = sock.user.id.split(':')[0];

        const remoteJid = message.key?.remoteJid;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const args = messageBody.slice(4).trim();

        if (!args) {

            const helpMessage = 

                "╭─❍ *🤖 GPT - IA*\n" +

                "│\n" +

                "│ 📌 *Assistant IA - Posez vos questions !*\n" +

                "│\n" +

                "│ `.gpt [votre question]`\n" +

                "│\n" +

                "│ 📝 *Exemples:*\n" +

                "│ `.gpt Comment créer un bot WhatsApp ?`\n" +

                "│ `.gpt Explique-moi la programmation`\n" +

                "│ `.gpt C'est quoi l'intelligence artificielle ?`\n" +

                "│\n" +

                "╰──────────────────";

            

            const styledHelp = applyBotFont(helpMessage, botNumber);

            return await sock.sendMessage(remoteJid, { text: styledHelp });

        }

        const randomWaiting = waitingMessages[Math.floor(Math.random() * waitingMessages.length)];

        const styledWaiting = applyBotFont(randomWaiting, botNumber);

        await sock.sendMessage(remoteJid, { text: styledWaiting });

        const enhancedPrompt = `Tu es un assistant IA utile, professionnel et bienveillant.

Tu réponds de manière claire, précise et éducative.

Tu utilises un langage formel mais accessible, tu vouvoies.

Tu donnes des réponses complètes et bien structurées.

Tu es patient et toujours prêt à aider.

Tu réponds en 3 à 6 lignes, plus si la réponse nécessite plus de lignes.

Tu réponds en français.

Question : ${args}`;

        let reply = null;

        let lastError = null;

        const models = ['chatgpt4', 'chatgpt3'];

        

        for (const model of models) {

            try {

                console.log(`🤖 [gpt] Tentative avec ${model}...`);

                reply = await callChatGPT(enhancedPrompt, model);

                if (reply) {

                    console.log(`✅ [gpt] Succès avec ${model}`);

                    break;

                }

            } catch (err) {

                console.log(`❌ [gpt] Échec avec ${model}: ${err.message}`);

                lastError = err;

            }

        }

        if (!reply) {

            throw lastError || new Error('Toutes les tentatives ont échoué');

        }

        reply = reply.replace(/\n{3,}/g, '\n\n').trim();

        const limitedReply = limitResponse(reply, 1000);

        

        const finalMessage = 

            "╭─❍ *🤖 GPT - IA*\n" +

            "│\n" +

            `│ 🤖 *ASSISTANT :*\n` +

            `│ ${limitedReply}\n` +

            "│\n" +

            "╰──────────────────";

        

        const styledMessage = applyBotFont(finalMessage, botNumber);

        await sock.sendMessage(remoteJid, { text: styledMessage });

    } catch (error) {

        console.error('Erreur gptCommand:', error);

        const remoteJid = message.key?.remoteJid;

        const botNumber = sock.user.id.split(':')[0];

        if (remoteJid) {

            const errorMessage = 

                "╭─❍ *🤖 GPT - IA*\n" +

                "│\n" +

                "│ ❌ *Désolé, l'API ne répond pas.*\n" +

                "│\n" +

                "│ 🔄 *Veuillez réessayer plus tard.*\n" +

                "│\n" +

                "╰──────────────────";

            

            const styledError = applyBotFont(errorMessage, botNumber);

            await sock.sendMessage(remoteJid, { text: styledError });

        }

    }

}