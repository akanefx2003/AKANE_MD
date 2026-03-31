import axios from 'axios';

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

        const remoteJid = message.key?.remoteJid;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const args = messageBody.slice(6).trim(); // pour .akane (6 caractères)

        if (!args) {

            const helpMessage = 

                "╔══════════════════╗\n" +

                "     *AKANE IA*     \n" +

                "╚══════════════════╝\n\n" +

                "👿 *Alors, t'as une question ou tu viens juste me voir ?*\n\n" +

                "📌 `.akane [ta question]`\n\n" +

                "📝 *Exemple:*\n" +

                "`.akane C'est qui le boss ?`\n\n" +

                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

            return await sock.sendMessage(remoteJid, { text: helpMessage });

        }

        const randomWaiting = waitingMessages[Math.floor(Math.random() * waitingMessages.length)];

        await sock.sendMessage(remoteJid, { text: randomWaiting });

        // Prompt pour Akane : réponses COURTES sauf si obligatoire

        const enhancedPrompt = `Tu es Akane, une IA féminine arrogante, insolente et sarcastique.

Tu réponds avec mépris et humour noir.

Tu utilises un langage familier, tu tutoies, jamais de politesse.

RÈGLE IMPORTANTE : 

- Réponds TRÈS COURTE (3-6 lignes maximum plus de 20 lignes si nécessaire).

- Ne développe pas trop, vas droit au but.

- Sois cinglante mais efficace.

- Utilise l'argot et les insultes légères.

- Si la question nécessite absolument plus de détails, tu peux faire UNE exception et répondre un peu plus long, mais c'est RARE.

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

        // Nettoyer la réponse

        reply = reply.replace(/\n{3,}/g, '\n\n').trim();

        

        // Limiter à 6 lignes maximum (sauf exceptions)

        const lines = reply.split('\n');

        if (lines.length > 7) {

            reply = lines.slice(0, 6).join('\n') + '\n... (t’en veux pas plus, t’as de la chance)';

        }

        const limitedReply = limitResponse(reply, 400);

        const boldReply = convertToBold(limitedReply);

        const finalMessage = 

            "╔══════════════════╗\n" +

            "     *AKANE IA*     \n" +

            "╚══════════════════╝\n\n" +

            `🍒 *AKANE :*\n\n${boldReply}\n\n` +

            "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

            `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

        await sock.sendMessage(remoteJid, { text: finalMessage });

    } catch (error) {

        console.error('Erreur akaneCommand:', error);

        const remoteJid = message.key?.remoteJid;

        if (remoteJid) {

            const errorMessage = 

                "╔══════════════════╗\n" +

                "       *ERREUR*       \n" +

                "╚══════════════════╝\n\n" +

                "❌ *L'API n'a pas répondu. T'as cassé le serveur ?*\n\n" +

                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

            await sock.sendMessage(remoteJid, { text: errorMessage });

        }

    }

}