import axios from 'axios';

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

export default async function tiktokCommand(client, message) {

    try {

        const remoteJid = message.key?.remoteJid;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const args = messageBody.slice(7).trim();

        if (!args || !args.includes('tiktok.com')) {

            await client.sendMessage(remoteJid, { text: "❌ *Envoie un lien TikTok !*" });

            return;

        }

        await client.sendMessage(remoteJid, { text: "⏳ *Telechargement...*" });

        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(args)}`;

        const response = await axios.get(apiUrl, { timeout: 10000 });

        if (response.data && response.data.data) {

            const videoUrl = response.data.data.play;

            const title = response.data.data.title || 'TikTok Video';

            const author = response.data.data.author?.unique_id || 'Inconnu';

            const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });

            const videoBuffer = Buffer.from(videoResponse.data);

            const caption = 

                "╔════════════╗\n" +

                "  🎬 *TIKTOK*  \n" +

                "╚════════════╝\n\n" +

                `📌 *${title}*\n` +

                `👤 @${author}\n` +

                `📥 ✓\n\n` +

                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}\n\n` +

                "*_© AKANE-MD 🌹_*";

            await client.sendMessage(remoteJid, { video: videoBuffer, caption: caption });

        } else {

            await client.sendMessage(remoteJid, { text: "❌ *Aucune video trouvee*" });

        }

    } catch (error) {

        console.error('Erreur TikTok:', error);

        const remoteJid = message.key?.remoteJid;

        if (remoteJid) {

            await client.sendMessage(remoteJid, { text: "❌ *Erreur lors du telechargement*" });

        }

    }

}