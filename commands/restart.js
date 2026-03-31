const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

export default async function restartCommand(sock, message) {

    try {

        const remoteJid = message.key?.remoteJid;

        const sender = message.key?.participant || remoteJid;

        console.log(`📱 Commande .restart recue de: ${sender}`);

        const restartMessage = 

            "╔════════════╗\n" +

            "  *RESTART*  \n" +

            "╚════════════╝\n\n" +

            "🔄 *Redemarrage en cours...*\n\n" +

            "⏳ *Quelques secondes*\n\n" +

            "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

            `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

        await sock.sendMessage(remoteJid, { text: restartMessage });

        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('🔄 Redemarrage du bot...');

        process.exit(0);

    } catch (error) {

        console.error('Erreur restartCommand:', error);

    }

}