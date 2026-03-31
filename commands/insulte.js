const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const insults = [

    "T'es comme un nuage. Quand tu disparais, c'est une belle journee !",

    "Tu apportes tellement de joie aux gens... quand tu quittes la piece !",

    "Je serais d'accord avec toi, mais apres on aurait tous les deux tort.",

    "T'es pas bete, t'as juste de la malchance quand tu reflechis.",

    "Tes secrets sont toujours en securite avec moi. Je ne les ecoute meme jamais.",

    "T'es la preuve que meme l'evolution prend des pauses parfois.",

    "T'as un truc sur le menton... non, le troisieme en bas.",

    "T'es comme une mise a jour logicielle. Des que je te vois, je me dis 'J'ai vraiment besoin de ca maintenant ?'",

    "Tu rends tout le monde heureux... tu sais, quand tu t'en vas.",

    "T'es comme une piece de monnaie—deux faces et pas beaucoup de valeur.",

    "T'as quelque chose en tete... oh attends, never mind.",

    "T'es la raison pour laquelle ils mettent des modes d'emploi sur les bouteilles de shampooing.",

    "T'es comme un nuage. Toujours a flotter sans vrai but.",

    "Tes blagues sont comme du lait perime—aigres et difficiles a digerer.",

    "T'es comme une bougie dans le vent... inutile quand les choses deviennent difficiles.",

    "T'as quelque chose d'unique—ta capacite a enerver tout le monde egalement.",

    "T'es comme un signal Wi-Fi—toujours faible quand on a le plus besoin.",

    "T'es la preuve que tout le monde n'a pas besoin d'un filtre pour etre desagreable.",

    "Ton energie est comme un trou noir—elle aspire juste la vie de la piece.",

    "T'as le visage parfait pour la radio.",

    "T'es comme un embouteillage—personne ne te veut, mais te voila.",

    "T'es comme un crayon casse—sans interet.",

    "Tes idees sont tellement originales, je suis sur de les avoir deja toutes entendues.",

    "T'es la preuve vivante que meme les erreurs peuvent etre productives.",

    "T'es pas paresseux, t'es juste tres motive a ne rien faire.",

    "Ton cerveau tourne sous Windows 95—lent et depasse.",

    "T'es comme un ralentisseur—personne ne t'aime, mais tout le monde doit te supporter.",

    "T'es comme un nuage de moustiques—juste irritant.",

    "Tu rassembles les gens... pour parler de a quel point t'es enervant."

];

export default async function insultCommand(client, message) {

    try {

        const remoteJid = message.key?.remoteJid;

        if (!message || !remoteJid) return;

        let userToInsult;

        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {

            userToInsult = message.message.extendedTextMessage.contextInfo.mentionedJid[0];

        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {

            userToInsult = message.message.extendedTextMessage.contextInfo.participant;

        }

        if (!userToInsult) {

            await client.sendMessage(remoteJid, { text: "👀 *Mentionne quelqu'un !*" });

            return;

        }

        const insult = insults[Math.floor(Math.random() * insults.length)];

        const insultMessage = 

            "╔════════════╗\n" +

            "  *INSULTE*  \n" +

            "╚════════════╝\n\n" +

            `👤 @${userToInsult.split('@')[0]}\n\n` +

            `💬 "${insult}"\n\n` +

            "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

            `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

        await client.sendMessage(remoteJid, { text: insultMessage, mentions: [userToInsult] });

    } catch (error) {

        console.error('Erreur insult:', error);

        await client.sendMessage(message.key?.remoteJid, { text: "❌ *Erreur*" });

    }

}