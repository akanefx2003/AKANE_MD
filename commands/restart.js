// commands/restart.js
export default async function restartCommand(sock, message) {
    try {
        const remoteJid = message.key?.remoteJid;
        const sender = message.key?.participant || remoteJid;
        
        console.log(`📱 Commande .restart reçue de: ${sender}`);

        const restartMessage = `
﹝╎🍓 𝐑𝐄𝐒𝐓𝐀𝐑𝐓 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐒𝐭𝐚𝐭𝐮𝐬 ⪨
⸙﹝ 🔄 Redémarrage en cours... ﹞✴︎

⋆.˚⪩ 𝐀𝐜𝐭𝐢𝐨𝐧𝐬 ⪨
⸙﹝ 🧹 Nettoyage du cache ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*`;

        await sock.sendMessage(remoteJid, { text: restartMessage });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🔄 Redémarrage du bot...');
        process.exit(0);
        
    } catch (error) {
        console.error('Erreur restartCommand:', error);
    }
}