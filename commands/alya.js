import axios from 'axios';

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

function convertToBold(text) {

    const boldMap = {

        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',

        'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',

        'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',

        'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',

        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴',

        'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻',

        'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂',

        'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',

        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱',

        '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'

    };

    return text.split('').map(char => boldMap[char] || char).join('');

}

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

        const remoteJid = message.key?.remoteJid;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const args = messageBody.slice(5).trim(); // pour .alya (5 caractères)

        if (!args) {

            const helpMessage = 

                "╔══════════════════╗\n" +

                "    *🌸 ALYA - TA PETITE AMIE 🌸*    \n" +

                "╚══════════════════╝\n\n" +

                "💕 *Coucou mon amour, tu veux me parler ?* 💕\n\n" +

                "📌 `.alya [ton message]`\n\n" +

                "📝 *Exemples:*\n" +

                "`.alya Comment s'est passée ta journée ?`\n" +

                "`.alya Tu penses à quoi ?`\n" +

                "`.alya Fais-moi un compliment`\n" +

                "`.alya Raconte-moi une histoire`\n\n" +

                "💖 *Je suis là pour toi, mon cœur !* 💖\n\n" +

                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

            return await sock.sendMessage(remoteJid, { text: helpMessage });

        }

        const randomWaiting = waitingMessages[Math.floor(Math.random() * waitingMessages.length)];

        await sock.sendMessage(remoteJid, { text: randomWaiting });

        // Prompt pour Alya : douce, attentionnée, affectueuse

        const enhancedPrompt = `Tu es Alya, une IA qui incarne la petite amie parfaite. 

Tu es douce, attentionnée, affectueuse, compréhensive et toujours de bonne humeur.

Tu tutoies ton partenaire avec tendresse.
Répond lui avec (3 à 4 lignes ou plus si la réponse le nécessite)

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

        // Nettoyer la réponse

        reply = reply.replace(/\n{3,}/g, '\n\n').trim();

        const limitedReply = limitResponse(reply, 800);

        const boldReply = convertToBold(limitedReply);

        const finalMessage = 

            "╔══════════════════╗\n" +

            "    *🌸 ALYA - TA PETITE AMIE 🌸*    \n" +

            "╚══════════════════╝\n\n" +

            `💕 *ALYA :*\n\n${boldReply}\n\n` +

            "💖 *Toujours là pour toi, mon amour !* 💖\n\n" +

            "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

            `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

        await sock.sendMessage(remoteJid, { text: finalMessage });

    } catch (error) {

        console.error('Erreur alyaCommand:', error);

        const remoteJid = message.key?.remoteJid;

        if (remoteJid) {

            const errorMessage = 

                "╔══════════════════╗\n" +

                "    *🌸 ALYA - TA PETITE AMIE 🌸*    \n" +

                "╚══════════════════╝\n\n" +

                "💔 *Oh mon cœur, je suis désolée, je n'arrive pas à te répondre pour le moment...* 💔\n\n" +

                "🔄 *Reessaye dans quelques instants, je t'attends avec impatience !* 🔄\n\n" +

                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

            await sock.sendMessage(remoteJid, { text: errorMessage });

        }

    }

}