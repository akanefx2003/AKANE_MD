import fs from 'fs';

import path from 'path';

import { fileURLToPath } from 'url';

// 🔗 LIEN DE TA CHAÎNE WHATSAPP

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// Fonction pour convertir en police grasse

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

// Template de base pour une nouvelle commande

function createCommandTemplate(commandName, commandDescription) {

    const capitalName = commandName.charAt(0).toUpperCase() + commandName.slice(1);

    

    return `import axios from 'axios';

import stylizedChar from '../utils/fancy.js';

// 🔗 LIEN DE TA CHAÎNE WHATSAPP

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

async function ${commandName}Command(sock, message) {

    try {

        const remoteJid = message.key?.remoteJid;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const args = messageBody.slice(${commandName.length + 2}).trim(); // ".${commandName} " = ${commandName.length + 1} caractères

        if (!args) {

            const helpMessage = 

                "╔══════════════════╗\\n" +

                "    *${commandName.toUpperCase()}*  \\n" +

                "╚══════════════════╝\\n\\n" +

                "━━━━━━━━━━━━━━━━━━━\\n\\n" +

                "${commandDescription}\\n\\n" +

                "📌 *Exemple:* \`.${commandName} [argument]\`\\n\\n" +

                "━━━━━━━━━━━━━━━━━━━\\n\\n" +

                "> *𝐃𝐄𝐕 : 🍁𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀ʕ◕ᴥ◕ʔ🌹*\\n\\n" +

                "*𝗩𝗢𝗜𝗥 𝗟𝗔 𝗖𝗛𝗔𝗜𝗡𝗘* 🔥\\n" +

                \`\${CHANNEL_LINK}\`\\n\\n" +

                "> *_© 𝗔𝗞𝗔𝗡𝗘-𝗠𝗗 🌹_*";

            return await sock.sendMessage(remoteJid, { text: helpMessage });

        }

        // TODO: Implémenter la logique de la commande ${commandName}

        

        const responseMessage = 

            "╔══════════════════╗\\n" +

            "    *${commandName.toUpperCase()} RÉPOND*  \\n" +

            "╚══════════════════╝\\n\\n" +

            "━━━━━━━━━━━━━━━━━━━\\n\\n" +

            \`📝 *Argument reçu:* \${args}\\n\\n\` +

            "━━━━━━━━━━━━━━━━━━━\\n\\n" +

            "> *𝐃𝐄𝐕 : 🍁𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀ʕ◕ᴥ◕ʔ🌹*\\n\\n" +

            "*𝗩𝗢𝗜𝗥 𝗟𝗔 𝗖𝗛𝗔𝗜𝗡𝗘* 🔥\\n" +

            \`\${CHANNEL_LINK}\`\\n\\n" +

            "> *_© 𝗔𝗞𝗔𝗡𝗘-𝗠𝗗 🌹_*";

        await sock.sendMessage(remoteJid, { text: responseMessage });

    } catch (error) {

        console.error('Erreur ${commandName}Command:', error);

        

        const remoteJid = message.key?.remoteJid;

        

        const errorMessage = 

            "╔══════════════════╗\\n" +

            "    *𝗘𝗥𝗥𝗘𝗨𝗥*  \\n" +

            "╚══════════════════╝\\n\\n" +

            "━━━━━━━━━━━━━━━━━━━\\n\\n" +

            "❌ *Erreur lors de l'exécution de la commande*\\n\\n" +

            "━━━━━━━━━━━━━━━━━━━\\n\\n" +

            "> *𝐃𝐄𝐕 : 🍁𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀ʕ◕ᴥ◕ʔ🌹*\\n\\n" +

            "*𝗩𝗢𝗜𝗥 𝗟𝗔 𝗖𝗛𝗔𝗜𝗡𝗘* 🔥\\n" +

            \`\${CHANNEL_LINK}\`\\n\\n" +

            "> *_© 𝗔𝗞𝗔𝗡𝗘-𝗠𝗗 🌹_*";

        await sock.sendMessage(remoteJid, { text: errorMessage });

    }

}

export default ${commandName}Command;

`;

}

async function uptadeCommand(sock, message) {

    try {

        const remoteJid = message.key?.remoteJid;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const args = messageBody.slice(8).trim(); // ".uptade " = 8 caractères

        if (!args) {

            const helpMessage = 

                "╔══════════════════╗\n" +

                "    *𝗨𝗣𝗧𝗔𝗗𝗘*  \n" +

                "╚══════════════════╝\n\n" +

                "━━━━━━━━━━━━━━━━━━━\n\n" +

                "🚀 *Crée de nouvelles commandes automatiquement !*\n\n" +

                "📝 *Utilisation:*\n" +

                "`.uptade [nom] [description]`\n\n" +

                "📌 *Exemples:*\n" +

                "`.uptade hello Commande de test`\n" +

                "`.uptade ping Vérifie la connexion`\n\n" +

                "━━━━━━━━━━━━━━━━━━━\n\n" +

                "> *𝐃𝐄𝐕 : 🍁𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀ʕ◕ᴥ◕ʔ🌹*\n\n" +

                "*𝗩𝗢𝗜𝗥 𝗟𝗔 𝗖𝗛𝗔𝗜𝗡𝗘* 🔥\n" +

                `${CHANNEL_LINK}\n\n` +

                "> *_© 𝗔𝗞𝗔𝗡𝗘-𝗠𝗗 🌹_*";

            await sock.sendMessage(remoteJid, { text: helpMessage });

            return;

        }

        const parts = args.split(' ');

        const commandName = parts[0].toLowerCase();

        const commandDescription = parts.slice(1).join(' ') || 'Nouvelle commande personnalisée';

        if (!/^[a-zA-Z0-9_]+$/.test(commandName)) {

            await sock.sendMessage(remoteJid, { 

                text: convertToBold("❌ *Nom de commande invalide !*\nUtilise uniquement des lettres, chiffres et underscores.") 

            });

            return;

        }

        const commandFilePath = path.join(__dirname, `${commandName}.js`);

        if (fs.existsSync(commandFilePath)) {

            await sock.sendMessage(remoteJid, { 

                text: convertToBold(`⚠️ *La commande ${commandName} existe déjà !*\nUtilise un autre nom.`) 

            });

            return;

        }

        await sock.sendMessage(remoteJid, { 

            text: convertToBold(`🔄 *Création de la commande ${commandName} en cours...*`)

        });

        const template = createCommandTemplate(commandName, commandDescription);

        fs.writeFileSync(commandFilePath, template, 'utf8');

        const successMessage = 

            "╔══════════════════╗\n" +

            "    *𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗘 𝗖𝗥𝗘́𝗘𝗘*  \n" +

            "╚══════════════════╝\n\n" +

            "━━━━━━━━━━━━━━━━━━━\n\n" +

            `✅ *Nouvelle commande créée :* **.${commandName}**\n\n` +

            `📝 *Description:* ${commandDescription}\n\n` +

            `📁 *Fichier:* /commands/${commandName}.js\n\n` +

            "━━━━━━━━━━━━━━━━━━━\n\n" +

            "🔧 *Pour l'utiliser:*\n" +

            `\`.${commandName} [argument]\`\n\n` +

            "⚠️ *Note:* Redémarre le bot avec `.restart` pour activer la commande !\n\n" +

            "━━━━━━━━━━━━━━━━━━━\n\n" +

            "> *𝐃𝐄𝐕 : 🍁𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀ʕ◕ᴥ◕ʔ🌹*\n\n" +

            "*𝗩𝗢𝗜𝗥 𝗟𝗔 𝗖𝗛𝗔𝗜𝗡𝗘* 🔥\n" +

            `${CHANNEL_LINK}\n\n` +

            "> *_© 𝗔𝗞𝗔𝗡𝗘-𝗠𝗗 🌹_*";

        await sock.sendMessage(remoteJid, { text: successMessage });

    } catch (error) {

        console.error('Erreur uptadeCommand:', error);

        

        const remoteJid = message.key?.remoteJid;

        

        const errorMessage = 

            "╔══════════════════╗\n" +

            "    *𝗘𝗥𝗥𝗘𝗨𝗥*  \n" +

            "╚══════════════════╝\n\n" +

            "━━━━━━━━━━━━━━━━━━━\n\n" +

            "❌ *Erreur lors de la création de la commande*\n\n" +

            "📝 *Vérifie les permissions du dossier commands.*\n\n" +

            "━━━━━━━━━━━━━━━━━━━\n\n" +

            "> *𝐃𝐄𝐕 : 🍁𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀ʕ◕ᴥ◕ʔ🌹*\n\n" +

            "*𝗩𝗢𝗜𝗥 𝗟𝗔 𝗖𝗛𝗔𝗜𝗡𝗘* 🔥\n" +

            `${CHANNEL_LINK}\n\n` +

            "> *_© 𝗔𝗞𝗔𝗡𝗘-𝗠𝗗 🌹_*";

        await sock.sendMessage(remoteJid, { text: errorMessage });

    }

}

export default uptadeCommand;