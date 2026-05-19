// commands/img.js

import axios from 'axios';

const IMG_HELP  = 'https://raw.githubusercontent.com/toge021/Media/main/f19b.jpg';
const IMG_ERROR = 'https://raw.githubusercontent.com/toge021/Media/main/b570.jpg';

// ─── APIs de recherche d'images (essayées dans l'ordre) ──────────────────────

async function searchDuckDuckGo(query) {

    try {

        // DuckDuckGo image search via scraping proxy
        const res = await axios.get(
            `https://api.unsplash.com/search/photos`,
            {
                params: {
                    query:    query,
                    per_page: 8,
                    order_by: 'relevant'
                },
                headers: {
                    Authorization: 'Client-ID 9Qm9M_p6kFqFmZbH_IjI3OJgF3tHBgSzFkRQSNhM3hg'
                },
                timeout: 10000
            }
        );

        if (res.data?.results?.length > 0) {

            return res.data.results.map(img => ({
                url:   img.urls.regular,
                title: img.alt_description || img.description || query
            }));

        }

        return [];

    } catch {

        return [];

    }

}

async function searchPinterest(query) {

    try {

        const res = await axios.get(
            `https://christus-api.vercel.app/image/Pinterest`,
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

    } catch {

        return [];

    }

}

async function searchLexica(query) {

    try {

        const res = await axios.get(
            `https://lexica.art/api/v1/search`,
            {
                params: { q: query },
                timeout: 10000
            }
        );

        if (res.data?.images?.length > 0) {

            return res.data.images.slice(0, 8).map(img => ({
                url:   img.src,
                title: img.prompt?.slice(0, 60) || query
            }));

        }

        return [];

    } catch {

        return [];

    }

}

// ─── Verrou anti-spam ────────────────────────────────────────────────────────

const processing = new Set();

// ─── Commande principale ─────────────────────────────────────────────────────

async function img(message, client) {

    const remoteJid = message.key.remoteJid;
    const sender    = message.key.participant || message.key.remoteJid;

    const text = message.message?.conversation
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
*┊▸ .img anime girl*
*┊▸ .img sunset ocean*
*┊▸ .img city night*
*┊▸ .img dragon ball*
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

        // ─── Recherche sur plusieurs sources ──────────────────────────────────
        let images = [];

        // 1. Essaie Unsplash (meilleure qualité et pertinence)
        images = await searchUnsplash(query);

        // 2. Si pas de résultats → Pinterest
        if (images.length === 0) {

            images = await searchPinterest(query);

        }

        // 3. Si toujours rien → Lexica (pour anime/art)
        if (images.length === 0) {

            images = await searchLexica(query);

        }

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

        let count = 0;

        for (const image of toSend) {

            try {

                await client.sendMessage(remoteJid, {

                    image:   { url: image.url },
                    caption:
`╭─✧🌹━━━━━━━━━━━━━━━❂
┊
*┊🖼️ ${query.toUpperCase()}*
┊
*┊📷 ${image.title.toUpperCase()}*
┊
*┊[${count + 1}/${toSend.length}]*
┊
╰───────────────────❂`

                });

                count++;

                // Délai entre chaque image pour éviter le ban
                await new Promise(r => setTimeout(r, 800));

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
*┊🔍 RAISON : ${error.message}*
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

// ─── Unsplash (remplace DuckDuckGo) ──────────────────────────────────────────

async function searchUnsplash(query) {

    try {

        // API publique sans clé via proxy
        const res = await axios.get(
            `https://api.unsplash.com/search/photos`,
            {
                params: {
                    query:       query,
                    per_page:    8,
                    order_by:    'relevant',
                    orientation: 'any'
                },
                headers: {
                    Authorization: 'Client-ID LbCTDxonRRnGkgAJDxJfEY7CPCZ_YXJM-8s2NeWU-Sg'
                },
                timeout: 10000
            }
        );

        if (res.data?.results?.length > 0) {

            return res.data.results.map(img => ({
                url:   img.urls.regular,
                title: img.alt_description || img.description || query
            }));

        }

        return [];

    } catch {

        return [];

    }

}

export default img;
