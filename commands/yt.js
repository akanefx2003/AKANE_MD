// commands/yt.js - YouTube video and song downloader // @cat: media

import axios from 'axios';

import fs from 'fs';

import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const API_URL = 'https://christus-api.vercel.app/downloader/youtube';

const API_KEY = 'ytb';

function extractVideoId(url) {

    const patterns = [

        /(?:youtube\.com\/watch\?v=)([^&]+)/,

        /(?:youtu\.be\/)([^?]+)/,

        /(?:youtube\.com\/embed\/)([^?]+)/,

        /(?:youtube\.com\/v\/)([^?]+)/,

        /(?:youtube\.com\/shorts\/)([^?]+)/

    ];

    

    for (const pattern of patterns) {

        const match = url.match(pattern);

        if (match) return match[1];

    }

    return null;

}

// Fonction pour appeler l'API et gérer la redirection

async function fetchFromAPI(params) {

    try {

        // Premier appel à l'API principale

        const firstResponse = await axios.get(API_URL, {

            params: { key: API_KEY, ...params },

            timeout: 15000,

            headers: {

                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

            }

        });

        

        console.log('📡 Premier appel API:', JSON.stringify(firstResponse.data, null, 2));

        

        // Si l'API renvoie un champ "api", on fait un deuxième appel

        if (firstResponse.data && firstResponse.data.api) {

            console.log('🔄 Redirection vers:', firstResponse.data.api);

            

            const secondResponse = await axios.get(firstResponse.data.api, {

                timeout: 20000,

                headers: {

                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

                }

            });

            

            console.log('📡 Deuxième appel API:', JSON.stringify(secondResponse.data, null, 2));

            return secondResponse.data;

        }

        

        return firstResponse.data;

        

    } catch (error) {

        console.error('❌ API Error:', error.message);

        throw error;

    }

}

async function sendYouTubeVideo(client, message, url) {

    try {

        const videoId = extractVideoId(url);

        if (!videoId) {

            await client.sendMessage(message.key.remoteJid, {

                text: '❌ *Lien YouTube invalide !*\n\nExemples :\nhttps://youtu.be/xxxxx\nhttps://youtube.com/shorts/xxxxx'

            });

            return false;

        }

        await client.sendMessage(message.key.remoteJid, { react: { text: '📥', key: message.key } });

        // Appel API avec le lien

        const data = await fetchFromAPI({ url: url });

        

        let videoTitle = 'Vidéo YouTube';

        let videoUrl = null;

        let thumbnail = null;

        // Extraire les données selon différents formats possibles

        if (data) {

            videoTitle = data.title || data.judul || data.video_title || data.name || 'Vidéo YouTube';

            videoUrl = data.url || data.video_url || data.download_url || data.download || data.link || data.video;

            thumbnail = data.thumbnail || data.thumb || data.thumb_url;

        }

        if (!videoUrl) {

            console.error('❌ Aucune URL trouvée dans:', data);

            throw new Error('Aucune URL de téléchargement trouvée');

        }

        // Télécharger la vidéo

        const videoResponse = await axios.get(videoUrl, { 

            responseType: 'arraybuffer', 

            timeout: 60000 

        });

        // Créer le dossier temp

        const tempDir = path.join(__dirname, '../temp');

        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const tempPath = path.join(tempDir, `${videoId}_${Date.now()}.mp4`);

        fs.writeFileSync(tempPath, Buffer.from(videoResponse.data));

        // Envoyer la vidéo

        await client.sendMessage(message.key.remoteJid, {

            video: { url: tempPath },

            caption: `🎬 *${videoTitle}*\n\n📥 Téléchargé avec succès !\n\n> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*`,

            mimetype: 'video/mp4'

        });

        // Nettoyer

        try { fs.unlinkSync(tempPath); } catch(e) {}

        return true;

    } catch (error) {

        console.error('❌ Erreur video:', error.message);

        await client.sendMessage(message.key.remoteJid, { text: `❌ *Erreur :* ${error.message}` });

        return false;

    }

}

async function sendSong(client, message, songTitle) {

    try {

        if (!songTitle || songTitle.length < 2) {

            await client.sendMessage(message.key.remoteJid, {

                text: '❌ *Titre de chanson requis !*\nExemple : .song imagine dragons'

            });

            return false;

        }

        await client.sendMessage(message.key.remoteJid, { react: { text: '🎵', key: message.key } });

        // Appel API avec le titre

        const data = await fetchFromAPI({ song: songTitle });

        

        let songName = songTitle;

        let artist = 'Artiste inconnu';

        let audioUrl = null;

        // Extraire les données

        if (data) {

            songName = data.title || data.judul || data.song_name || data.name || songTitle;

            artist = data.artist || data.author || data.uploader || 'Artiste inconnu';

            audioUrl = data.url || data.audio_url || data.download_url || data.download || data.link || data.audio;

        }

        if (!audioUrl) {

            console.error('❌ Aucune URL audio trouvée dans:', data);

            throw new Error('Chanson non trouvée');

        }

        // Télécharger l'audio

        const audioResponse = await axios.get(audioUrl, { 

            responseType: 'arraybuffer', 

            timeout: 60000 

        });

        const tempDir = path.join(__dirname, '../temp');

        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const tempPath = path.join(tempDir, `song_${Date.now()}.mp3`);

        fs.writeFileSync(tempPath, Buffer.from(audioResponse.data));

        // Envoyer l'audio

        await client.sendMessage(message.key.remoteJid, {

            audio: { url: tempPath },

            mimetype: 'audio/mpeg',

            ptt: false,

            caption: `🎵 *${songName}*\n🎤 *${artist}*\n\n📥 Téléchargé avec succès !\n\n> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*`

        });

        // Nettoyer

        try { fs.unlinkSync(tempPath); } catch(e) {}

        return true;

    } catch (error) {

        console.error('❌ Erreur song:', error.message);

        await client.sendMessage(message.key.remoteJid, { text: `❌ *Chanson non trouvée :* "${songTitle}"` });

        return false;

    }

}

async function sendRandomVideo(client, message) {

    try {

        await client.sendMessage(message.key.remoteJid, { react: { text: '🎲', key: message.key } });

        // Appel API random

        const data = await fetchFromAPI({ random: true });

        

        let videoTitle = 'Vidéo aléatoire';

        let videoUrl = null;

        // Extraire les données

        if (data) {

            videoTitle = data.title || data.judul || data.name || 'Vidéo aléatoire';

            videoUrl = data.url || data.video_url || data.download_url || data.download || data.link || data.video;

        }

        if (!videoUrl) {

            console.error('❌ Aucune URL trouvée dans:', data);

            throw new Error('Aucune vidéo trouvée');

        }

        // Télécharger la vidéo

        const videoResponse = await axios.get(videoUrl, { 

            responseType: 'arraybuffer', 

            timeout: 60000 

        });

        const tempDir = path.join(__dirname, '../temp');

        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const tempPath = path.join(tempDir, `random_${Date.now()}.mp4`);

        fs.writeFileSync(tempPath, Buffer.from(videoResponse.data));

        // Envoyer la vidéo

        await client.sendMessage(message.key.remoteJid, {

            video: { url: tempPath },

            caption: `🎬 *${videoTitle}*\n\n🎲 Vidéo aléatoire\n\n> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*`,

            mimetype: 'video/mp4'

        });

        // Nettoyer

        try { fs.unlinkSync(tempPath); } catch(e) {}

        return true;

    } catch (error) {

        console.error('❌ Erreur random:', error.message);

        await client.sendMessage(message.key.remoteJid, { text: `❌ *Erreur vidéo aléatoire*` });

        return false;

    }

}

// ==================== COMMANDE PRINCIPALE ====================

export default async function ytCommand(client, message, args) {

    try {

        if (!args || args.length === 0) {

            const help = 

`╔════════════════════════╗

   *🎬 YOUTUBE DOWNLOADER*   

╚════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *COMMANDES :*

• *yt [lien]* - Télécharge une vidéo

  Ex: .yt https://youtu.be/xxxxx

• *song [titre]* - Télécharge une chanson

  Ex: .song imagine dragons

• *yt random* - Vidéo aléatoire

  Ex: .yt random

━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ *FONCTIONS :*

• Vidéos YouTube (normales et Shorts)

• Musiques en MP3

• Vidéo aléatoire

• Gestion automatique de l'API

━━━━━━━━━━━━━━━━━━━━━━━━━━

> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*

*VOIR LA CHAÎNE* 🔥

${CHANNEL_LINK}`;

            return await client.sendMessage(message.key.remoteJid, { text: help });

        }

        const firstArg = args[0].toLowerCase();

        const fullInput = args.join(' ');

        // Commande random

        if (firstArg === 'random') {

            return await sendRandomVideo(client, message);

        }

        // Vérifier si c'est un lien YouTube

        const isYoutubeLink = fullInput.includes('youtube.com') || fullInput.includes('youtu.be');

        

        if (isYoutubeLink) {

            return await sendYouTubeVideo(client, message, fullInput);

        }

        

        // Sinon, recherche de chanson

        return await sendSong(client, message, fullInput);

        

    } catch (error) {

        console.error('❌ Erreur ytCommand:', error);

        await client.sendMessage(message.key.remoteJid, { text: '❌ *Erreur lors de la commande*\n\nRéessaie plus tard.' });

    }

}

export { sendYouTubeVideo, sendSong, sendRandomVideo };