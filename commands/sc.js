// commands/recrut.js

// @cat: jeu et autres

// Commandes pour les styles d'écriture

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const CHANNEL_NAME = '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹';

// Liste des styles "big deal" classés par catégorie

const styles = {

    // WhatsApp Messenger (1-14)

    whatsapp: {

        1: "𝘣𝘪𝘨 𝘥𝘦𝘢𝘭",

        2: "乃丨Ꮆ ᗪ乇卂ㄥ",

        3: "ʙɪɢ ᴅᴇᴀʟ",

        4: "✰ big deal ✰",

        5: "☁︎ big deal ☁︎",

        6: "✿ big deal ✿",

        7: "❖ big deal ❖",

        8: "✧･ﾟ: ✧･ﾟ: big deal :･ﾟ✧:･ﾟ✧",

        9: "🄱🄸🄶 🄳🄴🄰🄻",

        10: "🅑🅘🅖 🅓🅔🅐🅛",

        11: "ცıɠ ძɛąƖ",

        12: "вιg ∂єαℓ",

        13: "bïg dëål",

        14: "ɓɨɠ ɗɛαℓ"

    },

    // WhatsApp Business (15-28)

    business: {

        15: "乃ig ᗪeal",

        16: "𝖇𝖎𝖌 𝖉𝖊𝖆𝖑",

        17: "𝚋𝚒𝚐 𝚍𝚎𝚊𝚕",

        18: "𝙗𝙞𝙜 𝙙𝙚𝙖𝙡",

        19: "𝐛𝐢𝐠 𝐝𝐞𝐚𝐥",

        20: "𝔟𝔦𝔤 𝔡𝔢𝔞𝔩",

        21: "ＢＩＧ ＤＥＡＬ",

        22: "𝓫𝓲𝓰 𝓭𝓮𝓪𝓵",

        23: "𝕓𝕚𝕘 𝕕𝕖𝕒𝕝",

        24: "𝒷𝒾𝑔 𝒹𝑒𝒶𝓁",

        25: "𝗯𝗶𝗴 𝗱𝗲𝗮𝗹",

        26: "𝘣𝘪𝘨 𝘥𝘦𝘢𝘭",

        27: "乃丨Ꮆ ᗪ乇卂ㄥ",

        28: "乃ig ᗪeal"

    }

};

// Stockage pour savoir qui a demandé le menu

const waitingForChoice = new Map();

async function recrutCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;

    const sender = message.key.participant || message.key.remoteJid;

    const subCommand = args[0]?.toLowerCase();

    

    // ========== AFFICHER LE MENU ==========

    if (!subCommand || subCommand === 'menu' || subCommand === 'list') {

        let menuText = 

`> *WhatsApp Messenger🍒*

`;

        for (let i = 1; i <= 14; i++) {

            if (styles.whatsapp[i]) {

                menuText += `${i}. ${styles.whatsapp[i]}\n`;

            }

        }

        

        menuText += `\n> *WhatsApp Business🍉*\n\n`;

        

        for (let i = 15; i <= 28; i++) {

            if (styles.business[i]) {

                menuText += `${i}. ${styles.business[i]}\n`;

            }

        }

        

        menuText += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 *Choisis un numéro (1 à 28)*

📌 *Exemple :* tape \`1\`

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWA🌹*`;

        

        waitingForChoice.set(sender, { active: true, timestamp: Date.now() });

        

        setTimeout(() => {

            if (waitingForChoice.has(sender)) {

                waitingForChoice.delete(sender);

            }

        }, 60000);

        

        await client.sendMessage(remoteJid, { text: menuText });

        return;

    }

    

    await client.sendMessage(remoteJid, { text: "❌ *Commande invalide !*\n\nUtilise `recrut` pour voir la liste." });

}

// ==================== GESTION DES RÉPONSES ====================

export async function handleRecrutResponse(client, message, messageBody) {

    const remoteJid = message.key.remoteJid;

    const sender = message.key.participant || message.key.remoteJid;

    const answer = messageBody.trim();

    

    if (!waitingForChoice.has(sender)) return false;

    

    const num = parseInt(answer);

    if (isNaN(num) || num < 1 || num > 28) return false;

    

    let styleText = null;

    

    if (num >= 1 && num <= 14) {

        styleText = styles.whatsapp[num];

    } else if (num >= 15 && num <= 28) {

        styleText = styles.business[num];

    }

    

    if (!styleText) return false;

    

    waitingForChoice.delete(sender);

    

    // Envoyer UNIQUEMENT le texte, sans présentation

    await client.sendMessage(remoteJid, { text: styleText });

    return true;

}

export default recrutCommand;