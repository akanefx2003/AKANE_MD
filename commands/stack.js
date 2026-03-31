// commands/stack.js

// @cat: media

// Commande pour envoyer plusieurs stickers d'un personnage

import axios from 'axios';

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const CHANNEL_NAME = '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹';

// Base de données des personnages et leurs stickers

const characters = {

    akane: {

        name: "Akane",

        stickers: [

            "https://files.catbox.moe/akane1.webp",

            "https://files.catbox.moe/akane2.webp",

            "https://files.catbox.moe/akane3.webp",

            "https://files.catbox.moe/akane4.webp",

            "https://files.catbox.moe/akane5.webp",

            "https://files.catbox.moe/akane6.webp",

            "https://files.catbox.moe/akane7.webp",

            "https://files.catbox.moe/akane8.webp",

            "https://files.catbox.moe/akane9.webp",

            "https://files.catbox.moe/akane10.webp"

        ]

    },

    sakamoto: {

        name: "Sakamoto",

        stickers: [

            "https://files.catbox.moe/sakamoto1.webp",

            "https://files.catbox.moe/sakamoto2.webp",

            "https://files.catbox.moe/sakamoto3.webp",

            "https://files.catbox.moe/sakamoto4.webp",

            "https://files.catbox.moe/sakamoto5.webp",

            "https://files.catbox.moe/sakamoto6.webp",

            "https://files.catbox.moe/sakamoto7.webp",

            "https://files.catbox.moe/sakamoto8.webp",

            "https://files.catbox.moe/sakamoto9.webp",

            "https://files.catbox.moe/sakamoto10.webp"

        ]

    },

    spider: {

        name: "Spider-Man",

        stickers: [

            "https://files.catbox.moe/spider1.webp",

            "https://files.catbox.moe/spider2.webp",

            "https://files.catbox.moe/spider3.webp",

            "https://files.catbox.moe/spider4.webp",

            "https://files.catbox.moe/spider5.webp",

            "https://files.catbox.moe/spider6.webp",

            "https://files.catbox.moe/spider7.webp",

            "https://files.catbox.moe/spider8.webp",

            "https://files.catbox.moe/spider9.webp",

            "https://files.catbox.moe/spider10.webp"

        ]

    },

    alya: {

        name: "Alya",

        stickers: [

            "https://files.catbox.moe/alya1.webp",

            "https://files.catbox.moe/alya2.webp",

            "https://files.catbox.moe/alya3.webp",

            "https://files.catbox.moe/alya4.webp",

            "https://files.catbox.moe/alya5.webp",

            "https://files.catbox.moe/alya6.webp",

            "https://files.catbox.moe/alya7.webp",

            "https://files.catbox.moe/alya8.webp",

            "https://files.catbox.moe/alya9.webp",

            "https://files.catbox.moe/alya10.webp"

        ]

    },

    goku: {

        name: "Goku",

        stickers: [

            "https://files.catbox.moe/goku1.webp",

            "https://files.catbox.moe/goku2.webp",

            "https://files.catbox.moe/goku3.webp",

            "https://files.catbox.moe/goku4.webp",

            "https://files.catbox.moe/goku5.webp",

            "https://files.catbox.moe/goku6.webp",

            "https://files.catbox.moe/goku7.webp",

            "https://files.catbox.moe/goku8.webp",

            "https://files.catbox.moe/goku9.webp",

            "https://files.catbox.moe/goku10.webp"

        ]

    },

    naruto: {

        name: "Naruto",

        stickers: [

            "https://files.catbox.moe/naruto1.webp",

            "https://files.catbox.moe/naruto2.webp",

            "https://files.catbox.moe/naruto3.webp",

            "https://files.catbox.moe/naruto4.webp",

            "https://files.catbox.moe/naruto5.webp",

            "https://files.catbox.moe/naruto6.webp",

            "https://files.catbox.moe/naruto7.webp",

            "https://files.catbox.moe/naruto8.webp",

            "https://files.catbox.moe/naruto9.webp",

            "https://files.catbox.moe/naruto10.webp"

        ]

    },

    luffy: {

        name: "Luffy",

        stickers: [

            "https://files.catbox.moe/luffy1.webp",

            "https://files.catbox.moe/luffy2.webp",

            "https://files.catbox.moe/luffy3.webp",

            "https://files.catbox.moe/luffy4.webp",

            "https://files.catbox.moe/luffy5.webp",

            "https://files.catbox.moe/luffy6.webp",

            "https://files.catbox.moe/luffy7.webp",

            "https://files.catbox.moe/luffy8.webp",

            "https://files.catbox.moe/luffy9.webp",

            "https://files.catbox.moe/luffy10.webp"

        ]

    }

};

// Personnages disponibles

const availableChars = Object.keys(characters).join(', ');

async function stackCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;

    

    // Extraire le nombre et le nom

    let count = parseInt(args[0]);

    let character = args[1]?.toLowerCase();

    

    // Si l'utilisateur a tapé "stack akane 7" au lieu de "stack 7 akane"

    if (isNaN(count) && character) {

        count = parseInt(args[1]);

        character = args[0]?.toLowerCase();

    }

    

    // Vérifier les paramètres

    if (isNaN(count) || !character) {

        const helpText = 

`📦 *STACK STICKERS*

📝 *COMMANDE :*

• *stack [nombre] [personnage]* - Envoie plusieurs stickers

💡 *EXEMPLES :*

• *stack 5 akane*

• *stack 3 sakamoto*

• *stack 7 spider*

🎭 *PERSONNAGES DISPONIBLES :*

${availableChars}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*`;

        

        await client.sendMessage(remoteJid, { text: helpText });

        return;

    }

    

    // Limiter le nombre maximum de stickers (pour éviter le spam)

    if (count > 15) {

        await client.sendMessage(remoteJid, { text: "❌ *Maximum 15 stickers par commande !*" });

        return;

    }

    

    if (count < 1) {

        await client.sendMessage(remoteJid, { text: "❌ *Le nombre doit être supérieur à 0 !*" });

        return;

    }

    

    // Vérifier si le personnage existe

    const charData = characters[character];

    if (!charData) {

        await client.sendMessage(remoteJid, { text: `❌ *Personnage "${character}" non trouvé !*\n\nPersonnages disponibles : ${availableChars}` });

        return;

    }

    

    const stickers = charData.stickers;

    const charName = charData.name;

    

    await client.sendMessage(remoteJid, { text: `📦 *Envoi de ${count} stickers ${charName}...*` });

    

    // Envoyer les stickers

    let sent = 0;

    for (let i = 0; i < count; i++) {

        // Prendre un sticker aléatoire dans la liste

        const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];

        

        try {

            await client.sendMessage(remoteJid, {

                sticker: { url: randomSticker }

            });

            sent++;

            

            // Petit délai entre chaque sticker pour éviter les problèmes

            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {

            console.error(`Erreur envoi sticker ${i+1}:`, error.message);

        }

    }

    

    await client.sendMessage(remoteJid, { text: `✅ *${sent}/${count} stickers ${charName} envoyés !*` });

}

export default stackCommand;