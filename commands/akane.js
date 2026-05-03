// commands/akane.js

import axios from 'axios';

import { applyBotFont } from "./botfont.js";

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

// Messages d'attente sarcastiques

const waitingMessages = [

    "😒 *Patiente, loser...*",

    "🙄 *T'es pressé ?*",

    "😤 *J'ai pas que ça à faire...*",

    "🤨 *T'es sérieux ?*",

    "😏 *Ok, mais dépêche-toi de lire...*",

    "😴 *ZZZ... Ah t'es là ?*",

    "🤔 *Encore toi ?*",

    "😎 *T'as de la chance...*"

];

function limitResponse(text, maxLength = 350) {

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

export default async function akaneCommand(sock, message) {

    try {

        const botNumber = sock.user.id.split(':')[0];

        const remoteJid = message.key?.remoteJid;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const args = messageBody.slice(6).trim();

        if (!args) {

            const helpMessage = 

                "╭─❍ *AKANE IA*\n" +

                "│\n" +

                "│ 👿 *Alors, t'as une question ou tu viens juste me voir ?*\n" +

                "│\n" +

                "│ 📌 `.akane [ta question]`\n" +

                "│\n" +

                "│ 📝 *Exemple:*\n" +

                "│ `.akane C'est qui le boss ?`\n" +

                "│\n" +

                "│ 🔗 *VOIR LA CHAINE*\n" +

                `│ ${CHANNEL_LINK}\n` +

                "│\n" +

                "╰──────────────────";

            

            const styledMessage = applyBotFont(helpMessage, botNumber);

            return await sock.sendMessage(remoteJid, { text: styledMessage });

        }

        const randomWaiting = waitingMessages[Math.floor(Math.random() * waitingMessages.length)];

        const styledWaiting = applyBotFont(randomWaiting, botNumber);

        await sock.sendMessage(remoteJid, { text: styledWaiting });

        const enhancedPrompt = `Tu es Akane, une IA féminine arrogante, insolente et sarcastique.

Tu réponds avec mépris et humour noir.

Tu utilises un langage familier, tu tutoies, jamais de politesse.

RÈGLE IMPORTANTE : 

- Réponds TRÈS COURTE (3-6 lignes maximum).

- Ne développe pas trop, vas droit au but.

- Sois cinglante mais efficace.

- Utilise l'argot et les insultes légères.

Question : ${args}`;

        let reply = null;

        let lastError = null;

        const models = ['chatgpt4', 'chatgpt3'];

        

        for (const model of models) {

            try {

                console.log(`🤖 [akane] Tentative avec ${model}...`);

                reply = await callChatGPT(enhancedPrompt, model);

                if (reply) {

                    console.log(`✅ [akane] Succès avec ${model}`);

                    break;

                }

            } catch (err) {

                console.log(`❌ [akane] Échec avec ${model}: ${err.message}`);

                lastError = err;

            }

        }

        if (!reply) {

            throw lastError || new Error('Toutes les tentatives ont échoué');

        }

        reply = reply.replace(/\n{3,}/g, '\n\n').trim();

        

        const lines = reply.split('\n');

        if (lines.length > 7) {

            reply = lines.slice(0, 6).join('\n') + '\n... (t’en veux pas plus, t’as de la chance)';

        }

        const limitedReply = limitResponse(reply, 400);

        

        const finalMessage = 

            "╭─❍ *AKANE IA*\n" +

            "│\n" +

            `│ 🍒 *AKANE :*\n` +

            `│ ${limitedReply}\n` +

            "│\n" +

            "│ 🔗 *VOIR LA CHAINE*\n" +

            `│ ${CHANNEL_LINK}\n` +

            "│\n" +

            "╰──────────────────";

        

        const styledMessage = applyBotFont(finalMessage, botNumber);

        await sock.sendMessage(remoteJid, { text: styledMessage });

    } catch (error) {

        console.error('Erreur akaneCommand:', error);

        const remoteJid = message.key?.remoteJid;

        const botNumber = sock.user.id.split(':')[0];

        if (remoteJid) {

            const errorMessage = 

                "╭─❍ *ERREUR*\n" +

                "│\n" +

                "│ ❌ *L'API n'a pas répondu. T'as cassé le serveur ?*\n" +

                "│\n" +

                "│ 🔗 *VOIR LA CHAINE*\n" +

                `│ ${CHANNEL_LINK}\n` +

                "│\n" +

                "╰──────────────────";

            

            const styledError = applyBotFont(errorMessage, botNumber);

            await sock.sendMessage(remoteJid, { text: styledError });

        }

    }

}