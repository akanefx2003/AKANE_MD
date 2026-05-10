import axios from 'axios';

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbCmpwK89inpJICAG21A';

export default async function songCommand(client, message) {

    try {

        const remoteJid = message.key?.remoteJid;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const query = messageBody.slice(5).trim(); // Retire "song " du début

        // ========== HELP ==========

        if (!query) {

            await client.sendMessage(remoteJid, { text:

`🎵 *TÉLÉCHARGER UNE MUSIQUE*

━━━━━━━━━━━━━━━━━━━━

📝 *UTILISATION :*

• *song [titre ou artiste]* - Télécharger une musique

💡 *EXEMPLES :*

• *song Burna Boy Last Last*

• *song Drake God's Plan*

• *song Afrobeat 2024*

━━━━━━━━━━━━━━━━━━━━

> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*` });

            return;

        }

        // ========== RECHERCHE ==========

        await client.sendMessage(remoteJid, { text: `🔍 *Recherche en cours...*\n\n🎵 *"${query}"*\n\n⏳ _Patiente quelques secondes..._` });

        const searchRes = await axios.get(`https://api.davidcyriltech.my.id/youtube/search`, {

            params: { query: query },

            timeout: 15000

        });

        if (!searchRes.data || !searchRes.data.results || searchRes.data.results.length === 0) {

            await client.sendMessage(remoteJid, { text: `❌ *Aucun résultat pour :* _"${query}"_\n\nEssaie avec d'autres mots-clés.` });

            return;

        }

        const video = searchRes.data.results[0];

        const videoUrl = video.url || video.link;

        const title = video.title || query;

        const duration = video.duration || 'Inconnue';

        await client.sendMessage(remoteJid, { text: `✅ *Trouvé !*\n\n🎵 *${title}*\n⏱️ Durée : ${duration}\n\n⬇️ _Téléchargement..._` });

        // ========== TÉLÉCHARGEMENT ==========

        const dlRes = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp3`, {

            params: { url: videoUrl },

            timeout: 30000

        });

        if (!dlRes.data || !dlRes.data.success || !dlRes.data.download_url) {

            throw new Error("Lien de téléchargement introuvable");

        }

        const audioRes = await axios.get(dlRes.data.download_url, {

            responseType: 'arraybuffer',

            timeout: 60000,

            headers: { 'User-Agent': 'Mozilla/5.0' }

        });

        const audioBuffer = Buffer.from(audioRes.data);

        // ========== ENVOI ==========

        await client.sendMessage(remoteJid, {

            audio: audioBuffer,

            mimetype: 'audio/mpeg',

            ptt: false,

            fileName: `${title}.mp3`

        });

        await client.sendMessage(remoteJid, { text:

`✅ *MUSIQUE ENVOYÉE !*

━━━━━━━━━━━━━━━━━━━━

🎵 *Titre :* ${title}

⏱️ *Durée :* ${duration}

🎧 *Format :* MP3

━━━━━━━━━━━━━━━━━━━━

*VOIR LA CHAINE* 🔥

${CHANNEL_LINK}

> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*` });

    } catch (error) {

        console.error('Erreur Song:', error);

        const remoteJid = message.key?.remoteJid;

        if (remoteJid) {

            await client.sendMessage(remoteJid, { text: "❌ *Erreur lors du téléchargement*\n\nEssaie à nouveau ou change les mots-clés." });

        }

    }

}
