// commands/ytdl.js

// Version avec API https://apis.davidcyril.name.ng

import axios from 'axios';

// ==================== CONFIGURATION ====================

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const CHANNEL_NAME = '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹';

// Stockage des sessions en attente de réponse

const pendingRequests = new Map();

// ==================== RECHERCHE YOUTUBE ====================

async function searchYouTube(query) {

    try {

        const response = await axios.get('https://apis.davidcyril.name.ng/play', {

            params: { query: query },

            timeout: 15000

        });

        

        if (response.data && response.data.status && response.data.data) {

            return {

                success: true,

                title: response.data.data.title,

                channel: response.data.data.channel,

                duration: response.data.data.duration,

                thumbnail: response.data.data.thumbnail,

                url: response.data.data.url,

                videoId: response.data.data.videoId

            };

        }

        return { success: false };

    } catch (error) {

        console.error("Erreur recherche YouTube:", error.message);

        return { success: false };

    }

}

// ==================== TÉLÉCHARGEMENT ====================

async function downloadMedia(url, type) {

    try {

        const response = await axios.get('https://apis.davidcyril.name.ng/download/ytmp3', {

            params: { url: encodeURIComponent(url) },

            timeout: 30000

        });

        

        if (response.data && response.data.success) {

            const result = response.data.result;

            

            if (type === 'video') {

                return {

                    success: true,

                    url: result.video_url,

                    title: result.title,

                    quality: '720p'

                };

            } else if (type === 'audio') {

                return {

                    success: true,

                    url: result.download_url,

                    title: result.title

                };

            }

        }

        return { success: false };

    } catch (error) {

        console.error("Erreur téléchargement:", error.message);

        return { success: false };

    }

}

// ==================== FONCTION POUR ENVOYER LA DEMANDE DE CHOIX ====================

async function sendChoiceMessage(client, remoteJid, video, message) {

    const text = `*🎵 TITRE :* ${video.title}\n` +

                 `*👤 AUTEUR :* ${video.channel}\n` +

                 `*⏱️ DURÉE :* ${video.duration}\n\n` +

                 `➠ *Choisis :*\n\n` +

                 `1️⃣ *Audio (MP3)*\n` +

                 `2️⃣ *Vidéo (MP4)*\n\n` +

                 `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +

                 `📢 *REJOINS MA CHAÎNE* 🔥\n\n` +

                 `*${CHANNEL_NAME}*\n` +

                 `${CHANNEL_LINK}\n\n` +

                 `> *DEV : 🍁AKANE KUROGAWA🌹*`;

    

    const msg = await client.sendMessage(remoteJid, {

        image: { url: video.thumbnail },

        caption: text

    }, { quoted: message });

    

    return msg;

}

// ==================== COMMANDE PRINCIPALE ====================

async function ytdlCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;

    const sender = message.key.participant || message.key.remoteJid;

    const subCommand = args[0]?.toLowerCase();

    const query = args.slice(1).join(' ');

    

    // ========== HELP ==========

    if (!subCommand || subCommand === 'help') {

        const helpText = 

`📹 *YOUTUBE DOWNLOADER*

📝 *COMMANDES :*

• *ytdl play [titre]* - Rechercher et télécharger

• *ytdl video [lien]* - Télécharger vidéo directe

• *ytdl song [lien]* - Télécharger audio directe

💡 *EXEMPLES :*

• *ytdl play faded*

• *ytdl play shape of you*

• *ytdl video https://youtu.be/xxx*

• *ytdl song https://youtu.be/xxx*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : 🍁AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: helpText });

        return;

    }

    

    // ========== PLAY (Recherche + choix) ==========

    if (subCommand === 'play' || subCommand === 'p') {

        if (!query) {

            await client.sendMessage(remoteJid, { text: "❌ *Utilisation :* `ytdl play [titre]`" });

            return;

        }

        

        await client.sendMessage(remoteJid, { text: `🔍 *Recherche de "${query}"...*` });

        

        const result = await searchYouTube(query);

        

        if (!result.success) {

            await client.sendMessage(remoteJid, { text: "❌ *Aucune vidéo trouvée*\nRéessaie avec un autre titre." });

            return;

        }

        

        const video = {

            title: result.title,

            channel: result.channel,

            duration: result.duration,

            thumbnail: result.thumbnail,

            url: result.url

        };

        

        // Envoyer le message de choix

        const msg = await sendChoiceMessage(client, remoteJid, video, message);

        

        // Sauvegarder la session en attente

        const sessionId = `${sender}_${remoteJid}`;

        pendingRequests.set(sessionId, {

            url: video.url,

            title: video.title,

            thumbnail: video.thumbnail,

            messageId: msg.key.id,

            createdAt: Date.now()

        });

        

        // Auto-nettoyage après 2 minutes

        setTimeout(() => {

            if (pendingRequests.has(sessionId)) {

                pendingRequests.delete(sessionId);

                client.sendMessage(remoteJid, { text: "⏰ *Session expirée.* Relance la commande." }).catch(() => {});

            }

        }, 120000);

        

        return;

    }

    

    // ========== VIDÉO DIRECTE ==========

    if (subCommand === 'video' || subCommand === 'v') {

        const url = query;

        if (!url || !url.includes('youtu')) {

            await client.sendMessage(remoteJid, { text: "❌ *Utilisation :* `ytdl video [lien YouTube]`" });

            return;

        }

        

        await client.sendMessage(remoteJid, { text: `📥 *Téléchargement de la vidéo...*` });

        

        const result = await downloadMedia(url, 'video');

        

        if (!result.success) {

            await client.sendMessage(remoteJid, { text: "❌ *Erreur lors du téléchargement.*\nRéessaie plus tard." });

            return;

        }

        

        let caption = `*📹 ${result.title}*\n\n`;

        caption += `🎬 *Qualité :* ${result.quality || "720p"}\n\n`;

        caption += `*🔗 TÉLÉCHARGER :*\n${result.url}\n\n`;

        caption += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        caption += `📢 *REJOINS MA CHAÎNE* 🔥\n\n`;

        caption += `*${CHANNEL_NAME}*\n`;

        caption += `${CHANNEL_LINK}\n\n`;

        caption += `> *DEV : 🍁AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: caption });

        return;

    }

    

    // ========== AUDIO DIRECT ==========

    if (subCommand === 'song' || subCommand === 'audio' || subCommand === 's') {

        const url = query;

        if (!url || !url.includes('youtu')) {

            await client.sendMessage(remoteJid, { text: "❌ *Utilisation :* `ytdl song [lien YouTube]`" });

            return;

        }

        

        await client.sendMessage(remoteJid, { text: `🎵 *Téléchargement de l'audio...*` });

        

        const result = await downloadMedia(url, 'audio');

        

        if (!result.success) {

            await client.sendMessage(remoteJid, { text: "❌ *Erreur lors du téléchargement.*\nRéessaie plus tard." });

            return;

        }

        

        let caption = `*🎵 ${result.title}*\n\n`;

        caption += `🎧 *Format :* MP3\n\n`;

        caption += `*🔗 TÉLÉCHARGER :*\n${result.url}\n\n`;

        caption += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        caption += `📢 *REJOINS MA CHAÎNE* 🔥\n\n`;

        caption += `*${CHANNEL_NAME}*\n`;

        caption += `${CHANNEL_LINK}\n\n`;

        caption += `> *DEV : 🍁AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: caption });

        return;

    }

    

    await client.sendMessage(remoteJid, { text: "❌ *Commande invalide !*\nUtilise `ytdl help` pour voir les commandes." });

}

// ==================== GESTION DES RÉPONSES (1, 2) ====================

export async function handleYtdlResponse(client, message, text) {

    const remoteJid = message.key.remoteJid;

    const sender = message.key.participant || message.key.remoteJid;

    const choice = text.trim();

    

    // Vérifier si c'est un choix (1 ou 2)

    if (!['1', '2'].includes(choice)) return false;

    

    const sessionId = `${sender}_${remoteJid}`;

    const session = pendingRequests.get(sessionId);

    

    if (!session) return false;

    

    // Supprimer la session

    pendingRequests.delete(sessionId);

    

    // Déterminer le type de téléchargement

    let type = 'audio';

    let typeText = '🎵 *Téléchargement de l\'audio...*';

    

    if (choice === '1') {

        type = 'audio';

        typeText = '🎵 *Téléchargement de l\'audio...*';

    } else if (choice === '2') {

        type = 'video';

        typeText = '📥 *Téléchargement de la vidéo...*';

    }

    

    await client.sendMessage(remoteJid, { text: typeText });

    

    const result = await downloadMedia(session.url, type);

    

    if (!result.success) {

        await client.sendMessage(remoteJid, { text: "❌ *Erreur lors du téléchargement.*\nRéessaie plus tard." });

        return true;

    }

    

    let caption = type === 'audio' 

        ? `*🎵 ${result.title}*\n\n🎧 *Format :* MP3\n\n`

        : `*📹 ${result.title}*\n\n🎬 *Qualité :* ${result.quality || "720p"}\n\n`;

    

    caption += `*🔗 TÉLÉCHARGER :*\n${result.url}\n\n`;

    caption += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    caption += `📢 *REJOINS MA CHAÎNE* 🔥\n\n`;

    caption += `*${CHANNEL_NAME}*\n`;

    caption += `${CHANNEL_LINK}\n\n`;

    caption += `> *DEV : 🍁AKANE KUROGAWA🌹*`;

    

    if (session.thumbnail) {

        try {

            await client.sendMessage(remoteJid, {

                image: { url: session.thumbnail },

                caption: caption

            });

        } catch (e) {

            await client.sendMessage(remoteJid, { text: caption });

        }

    } else {

        await client.sendMessage(remoteJid, { text: caption });

    }

    

    return true;

}

export default ytdlCommand;