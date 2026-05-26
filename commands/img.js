// commands/img.js

import axios from 'axios';

const IMG_HELP  = 'https://raw.githubusercontent.com/toge021/Media/main/f19b.jpg';
const IMG_ERROR = 'https://raw.githubusercontent.com/toge021/Media/main/b570.jpg';

const UNSPLASH_KEY = 'ypf1YAY0LSKhwS41FDcoa3Zmb-5BAF0cbEWATHpZrZc';

// ─── Verrou anti-spam ────────────────────────────────────────────────────────

const processing = new Set();

// ─── Détection anime/manga ───────────────────────────────────────────────────

const ANIME_KEYWORDS = [
    'naruto', 'bleach', 'one piece', 'dragon ball', 'dbz', 'attack on titan',
    'aot', 'demon slayer', 'kimetsu', 'jujutsu', 'tokyo ghoul', 'sword art',
    'sao', 'hunter x hunter', 'hxh', 'fairy tail', 'black clover', 'boruto',
    'my hero academia', 'mha', 'bnha', 'fullmetal', 'fma', 'death note',
    'evangelion', 'overlord', 're zero', 'rezero', 'konosuba', 'steins gate',
    'anime', 'manga', 'waifu', 'chibi', 'shonen', 'shojo', 'seinen',
    'akane', 'sasuke', 'goku', 'luffy', 'ichigo', 'eren', 'levi',
];

function isAnimeQuery(query) {

    const q = query.toLowerCase();

    return ANIME_KEYWORDS.some(kw => q.includes(kw));

}

// ─── Source 1 : Unsplash (photos réelles) ────────────────────────────────────

async function searchUnsplash(query) {

    try {

        const res = await axios.get(
            'https://api.unsplash.com/search/photos',
            {
                params: {
                    query:    query,
                    per_page: 10,
                    order_by: 'relevant',
                },
                headers: {
                    Authorization: `Client-ID ${UNSPLASH_KEY}`
                },
                timeout: 12000
            }
        );

        if (res.data?.results?.length > 0) {

            return res.data.results.map(img => ({
                url:   img.urls.regular,
                title: img.alt_description || img.description || query
            }));

        }

        return [];

    } catch (e) {

        console.error('Unsplash error:', e.message);
        return [];

    }

}

// ─── Source 2 : Jikan (MyAnimeList) pour anime ───────────────────────────────

async function searchJikan(query) {

    try {

        const res = await axios.get(
            'https://api.jikan.moe/v4/anime',
            {
                params: {
                    q:     query,
                    limit: 8
                },
                timeout: 12000
            }
        );

        const results = res.data?.data || [];

        const images = [];

        for (const anime of results) {

            if (anime.images?.jpg?.large_image_url) {

                images.push({
                    url:   anime.images.jpg.large_image_url,
                    title: anime.title || query
                });

            }

            // Ajoute aussi les images des personnages si disponibles
            if (anime.images?.webp?.large_image_url) {

                images.push({
                    url:   anime.images.webp.large_image_url,
                    title: anime.title_english || anime.title || query
                });

            }

        }

        return images;

    } catch (e) {

        console.error('Jikan error:', e.message);
        return [];

    }

}

// ─── Source 3 : Jikan Characters (personnages anime) ─────────────────────────

async function searchJikanCharacter(query) {

    try {

        const res = await axios.get(
            'https://api.jikan.moe/v4/characters',
            {
                params: {
                    q:     query,
                    limit: 8
                },
                timeout: 12000
            }
        );

        const results = res.data?.data || [];

        const images = [];

        for (const char of results) {

            if (char.images?.jpg?.image_url) {

                images.push({
                    url:   char.images.jpg.image_url,
                    title: char.name || query
                });

            }

        }

        return images;

    } catch (e) {

        console.error('Jikan character error:', e.message);
        return [];

    }

}

// ─── Source 4 : Pinterest (fallback) ─────────────────────────────────────────

async function searchPinterest(query) {

    try {

        const res = await axios.get(
            'https://christus-api.vercel.app/image/Pinterest',
            {
                params: { query: query, limit: 15 },
                timeout: 12000
            }
        );

        if (res.data?.results?.length > 0) {

            return res.data.results
                .filter(item =>
                    item.imageUrl &&
                    /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(item.imageUrl)
                )
                .map(item => ({
                    url:   item.imageUrl,
                    title: (item.title && item.title !== 'No title') ? item.title : query
                }));

        }

        return [];

    } catch (e) {

        console.error('Pinterest error:', e.message);
        return [];

    }

}

// ─── Commande principale ─────────────────────────────────────────────────────

async function img(message, client) {

    const remoteJid = message.key.remoteJid;
    const sender    = message.key.participant || message.key.remoteJid;

    const text  = message.message?.conversation
        || message.message?.extendedTextMessage?.text
        || '';

    const args  = text.trim().split(/\s+/).slice(1);
    const query = args.join(' ').trim();

    // ─── Pas de requête → aide ────────────────────────────────────────────────
    if (!query) {

        return client.sendMessage(remoteJid, {

            image: { url: IMG_HELP },
            caption:
`╭─✧🌹━━━━━━━━━━━━━━━❂
┊
*┊🖼️ RECHERCHE D'IMAGES*
┊
*┊⚠️ FOURNIS DES MOTS-CLÉS !*
┊
*┊💡 EXEMPLES :*
*┊▸ .img naruto*
*┊▸ .img sunset ocean*
*┊▸ .img goku dragon ball*
*┊▸ .img anime girl*
┊
*┊📌 LE BOT ENVOIE*
*┊LES 5 MEILLEURES IMAGES*
┊
╰───────────────────❂`

        });

    }

    // ─── Anti-spam ────────────────────────────────────────────────────────────
    if (processing.has(sender)) {

        return client.sendMessage(remoteJid, {

            text: '⏳ *Une recherche est déjà en cours...*'

        });

    }

    processing.add(sender);

    try {

        await client.sendMessage(remoteJid, {

            text: `🔍 *Recherche de "${query}"...*`

        });

        let images = [];

        const isAnime = isAnimeQuery(query);

        if (isAnime) {

            // ── Anime → Jikan personnages d'abord, puis titres ──────────────
            images = await searchJikanCharacter(query);

            if (images.length < 3) {

                const animeResults = await searchJikan(query);
                images = [...images, ...animeResults];

            }

            // Fallback Pinterest si toujours pas assez
            if (images.length < 3) {

                const pinterestResults = await searchPinterest(query);
                images = [...images, ...pinterestResults];

            }

        } else {

            // ── Non-anime → Unsplash d'abord ─────────────────────────────────
            images = await searchUnsplash(query);

            // Fallback Pinterest
            if (images.length < 3) {

                const pinterestResults = await searchPinterest(query);
                images = [...images, ...pinterestResults];

            }

        }

        // Dédoublonnage des URLs
        const seen  = new Set();
        images = images.filter(img => {

            if (seen.has(img.url)) return false;
            seen.add(img.url);
            return true;

        });

        if (images.length === 0) {

            return client.sendMessage(remoteJid, {

                image: { url: IMG_ERROR },
                caption:
`╭─✧🌹━━━━━━━━━━━━━━━❂
┊
*┊❌ AUCUNE IMAGE TROUVÉE*
┊
*┊Essaie avec d'autres*
*┊mots-clés.*
┊
╰───────────────────❂`

            });

        }

        // ─── Envoi des 5 meilleures images ────────────────────────────────────
        const toSend = images.slice(0, 5);
        let   count  = 0;

        for (const image of toSend) {

            try {

                const title = (image.title || query)
                    .replace(/[^\w\s\-àâéèêëïîôùûüç]/gi, '')
                    .trim()
                    .toUpperCase()
                    .slice(0, 50);

                await client.sendMessage(remoteJid, {

                    image:   { url: image.url },
                    caption:
`╭─✧🌹━━━━━━━━━━━━━━━❂
┊
*┊🖼️ ${query.toUpperCase()}*
┊
*┊📷 ${title}*
┊
*┊[${count + 1}/${toSend.length}]*
┊
╰───────────────────❂`

                });

                count++;

                await new Promise(r => setTimeout(r, 900));

            } catch {

                continue;

            }

        }

    } catch (error) {

        console.error('❌ IMG ERROR:', error.message);

        await client.sendMessage(remoteJid, {

            image: { url: IMG_ERROR },
            caption:
`╭─✧🌹━━━━━━━━━━━━━━━❂
┊
*┊❌ ERREUR DE RECHERCHE*
┊
*┊💡 Réessaie dans quelques*
*┊secondes.*
┊
╰───────────────────❂`

        });

    } finally {

        processing.delete(sender);

    }

}

export default img;
