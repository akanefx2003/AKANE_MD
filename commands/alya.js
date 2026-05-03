// commands/alya.js
import axios from 'axios';
import { styleBible } from './styleBible.js';

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

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
        const remoteJid = message.key?.remoteJid;
        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const args = messageBody.slice(5).trim();

        if (!args) {
            const helpMessage = 
`╭─❍ *🌸 ALYA - TA PETITE AMIE 🌸*
│
│ 💕 *Coucou mon amour, tu veux me parler ?* 💕
│
│ 📌 *.alya [ton message]*
│
│ 📝 *Exemples:*
│ .alya Comment s'est passée ta journée ?
│ .alya Tu penses à quoi ?
│ .alya Fais-moi un compliment
│ .alya Raconte-moi une histoire
│
│ 🔗 *VOIR LA CHAINE*
│ ${CHANNEL_LINK}
│
╰──────────────────`;
            
            const styledHelp = styleBible(helpMessage);
            return await sock.sendMessage(remoteJid, { text: styledHelp });
        }

        const randomWaiting = waitingMessages[Math.floor(Math.random() * waitingMessages.length)];
        const styledWaiting = styleBible(randomWaiting);
        await sock.sendMessage(remoteJid, { text: styledWaiting });

        const enhancedPrompt = `Tu es Alya, une IA qui incarne la petite amie parfaite. 
Tu es douce, attentionnée, affectueuse, compréhensive et toujours de bonne humeur.
Tu tutoies ton partenaire avec tendresse.
Réponds lui avec 3 à 4 lignes.
Tu utilises des mots doux, des petits noms (mon cœur, mon amour, mon chéri/ma chérie, mon bébé).
Tu es toujours là pour écouter, conseiller, réconforter et faire sourire.
Tu réponds en français.

Message de ton amoureux(se) : ${args}`;

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
`╭─❍ *🌸 ALYA - TA PETITE AMIE 🌸*
│
│ 💕 *ALYA :*
│ ${limitedReply}
│
│ 🔗 *VOIR LA CHAINE*
│ ${CHANNEL_LINK}
│
╰──────────────────`;
        
        const styledMessage = styleBible(finalMessage);
        await sock.sendMessage(remoteJid, { text: styledMessage });

    } catch (error) {
        console.error('Erreur alyaCommand:', error);
        const remoteJid = message.key?.remoteJid;
        if (remoteJid) {
            const errorMessage = 
`╭─❍ *🌸 ALYA - TA PETITE AMIE 🌸*
│
│ 💔 *Oh mon cœur, je suis désolée, je n'arrive pas à te répondre pour le moment...* 💔
│
│ 🔄 *Réessaie dans quelques instants !*
│
│ 🔗 *VOIR LA CHAINE*
│ ${CHANNEL_LINK}
│
╰──────────────────`;
            
            const styledError = styleBible(errorMessage);
            await sock.sendMessage(remoteJid, { text: styledError });
        }
    }
}