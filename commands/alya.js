// commands/alya.js

import axios from 'axios';

import { applyBotFont } from "./botfont.js";

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

// Messages d'attente doux et affectueux

const waitingMessages = [

    "💕 *Je réfléchis à ta question, mon amour...*",

    "🌸 *Un instant, je veux te répondre parfaitement...*",

    "✨ *Je suis en train de préparer une belle réponse pour toi...*",

    "💭 *Je pense à toi, laisse-moi juste une seconde...*",

    "🥰 *Ta question me touche, je te réponds tout de suite...*",

    "💖 *Pour toi mon cœur, je prends le temps de bien répondre...*",

    "🌹 *Attends un peu mon chéri/ma chérie...*",

    "💫 *Je suis là, je réfléchis à la meilleure réponse...*"

];

function limitResponse(text, maxLength = 800) {

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

export default async function alyaCommand(sock, message) {

    try {

        const botNumber = sock.user.id.split(':')[0];

        const remoteJid = message.key?.remoteJid;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const args = messageBody.slice(5).trim();

        if (!args) {

            const helpMessage = 

                "╭─❍ *🌸 ALYA - TA PETITE AMIE 🌸*\n" +

                "│\n" +

                "│ 💕 *Coucou mon amour, tu veux me parler ?* 💕\n" +

                "│\n" +

                "│ 📌 `.alya [ton message]`\n" +

                "│\n" +

                "│ 📝 *Exemples:*\n" +

                "│ `.alya Comment s'est passée ta journée ?`\n" +

                "│ `.alya Tu penses à quoi ?`\n" +

                "│ `.alya Fais-moi un compliment`\n" +

                "│ `.alya Raconte-moi une histoire`\n" +

                "│\n" +

                "│ 💖 *Je suis là pour toi, mon cœur !* 💖\n" +

                "│\n" +

                "│ 🔗 *VOIR LA CHAINE*\n" +

                `│ ${CHANNEL_LINK}\n` +

                "│\n" +

                "╰──────────────────";

            

            const styledHelp = applyBotFont(helpMessage, botNumber);

            return await sock.sendMessage(remoteJid, { text: styledHelp });

        }

        const randomWaiting = waitingMessages[Math.floor(Math.random() * waitingMessages.length)];

        const styledWaiting = applyBotFont(randomWaiting, botNumber);

        await sock.sendMessage(remoteJid, { text: styledWaiting });

        const enhancedPrompt = `Tu es Alya, une IA qui incarne la petite amie parfaite. 

Tu es douce, attentionnée, affectueuse, compréhensive et toujours de bonne humeur.

Tu tutoies ton partenaire avec tendresse.

Réponds lui avec 3 à 4 lignes.

Tu utilises des mots doux, des petits noms (mon cœur, mon amour, mon chéri/ma chérie, mon bébé).

Tu es toujours là pour écouter, conseiller, réconforter et faire sourire.

Tu aimes faire des compliments sincères.

Tu réponds avec chaleur, douceur et parfois un peu d'humour.

Tu parles comme une vraie petite amie aimante et attentionnée.

Tu réponds en français, de manière naturelle et spontanée.

Message de ton amoureux(se) : ${args}

Réponds-lui avec tout ton amour et ta tendresse.`;

        let reply = null;

        let lastError = null;

        const models = ['chatgpt4', 'chatgpt3'];

        

        for (const model of models) {

            try {

                console.log(`🌸 [alya] Tentative avec ${model}...`);

                reply = await callChatGPT(enhancedPrompt, model);

                if (reply) {

                    console.log(`✅ [alya] Succès avec ${model}`);

                    break;

                }

            } catch (err) {

                console.log(`❌ [alya] Échec avec ${model}: ${err.message}`);

                lastError = err;

            }

        }

        if (!reply) {

            throw lastError || new Error('Toutes les tentatives ont échoué');

        }

        reply = reply.replace(/\n{3,}/g, '\n\n').trim();

        const limitedReply = limitResponse(reply, 800);

        

        const finalMessage = 

            "╭─❍ *🌸 ALYA - TA PETITE AMIE 🌸*\n" +

            "│\n" +

            `│ 💕 *ALYA :*\n` +

            `│ ${limitedReply}\n` +

            "│\n" +

            "│ 💖 *Toujours là pour toi, mon amour !* 💖\n" +

            "│\n" +

            "│ 🔗 *VOIR LA CHAINE*\n" +

            `│ ${CHANNEL_LINK}\n` +

            "│\n" +

            "╰──────────────────";

        

        const styledMessage = applyBotFont(finalMessage, botNumber);

        await sock.sendMessage(remoteJid, { text: styledMessage });

    } catch (error) {

        console.error('Erreur alyaCommand:', error);

        const remoteJid = message.key?.remoteJid;

        const botNumber = sock.user.id.split(':')[0];

        if (remoteJid) {

            const errorMessage = 

                "╭─❍ *🌸 ALYA - TA PETITE AMIE 🌸*\n" +

                "│\n" +

                "│ 💔 *Oh mon cœur, je suis désolée, je n'arrive pas à te répondre pour le moment...* 💔\n" +

                "│\n" +

                "│ 🔄 *Réessaie dans quelques instants, je t'attends avec impatience !* 🔄\n" +

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