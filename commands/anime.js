// commands/anime.js - Recherche d'animes // @cat: media

import axios from 'axios';

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const API_URL = 'https://christus-api.vercel.app/anime/anime';

const TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';

/**

 * Traduit un texte en français via Google Translate API

 */

async function translateToFrench(text) {

    if (!text || text.length < 5) return text;

    

    try {

        const response = await axios.get(TRANSLATE_API, {

            params: {

                client: 'gtx',

                sl: 'auto',

                tl: 'fr',

                dt: 't',

                q: text

            },

            timeout: 10000

        });

        

        if (response.data && response.data[0]) {

            let translated = '';

            for (const segment of response.data[0]) {

                if (segment[0]) {

                    translated += segment[0];

                }

            }

            return translated || text;

        }

        return text;

    } catch (error) {

        console.error('❌ Erreur traduction:', error.message);

        return text;

    }

}

/**

 * Recherche un anime par son titre

 */

async function searchAnime(query, limit = 1) {

    try {

        const response = await axios.get(API_URL, {

            params: {

                q: query,

                limit: limit,

                sfw: true

            },

            timeout: 15000

        });

        

        if (response.data && response.data.status === true && response.data.results) {

            return response.data.results;

        }

        

        return [];

    } catch (error) {

        console.error('❌ Erreur API anime:', error.message);

        return [];

    }

}

/**

 * Traduit les genres en français

 */

function translateGenre(genre) {

    const translations = {

        'Action': 'Action',

        'Adventure': 'Aventure',

        'Fantasy': 'Fantastique',

        'Comedy': 'Comédie',

        'Drama': 'Drame',

        'Romance': 'Romance',

        'Sci-Fi': 'Science-Fiction',

        'Slice of Life': 'Tranche de vie',

        'Mystery': 'Mystère',

        'Horror': 'Horreur',

        'Thriller': 'Thriller',

        'Supernatural': 'Surnaturel',

        'Psychological': 'Psychologique',

        'Ecchi': 'Ecchi',

        'Harem': 'Harem',

        'Sports': 'Sport',

        'Music': 'Musique',

        'Historical': 'Historique',

        'Martial Arts': 'Arts martiaux',

        'Mecha': 'Mecha'

    };

    return translations[genre] || genre;

}

/**

 * Traduit le type d'anime en français

 */

function translateType(type) {

    const types = {

        'TV': 'Série TV',

        'Movie': 'Film',

        'OVA': 'OVA',

        'ONA': 'ONA',

        'Special': 'Spécial',

        'Music': 'Clip musical'

    };

    return types[type] || type;

}

/**

 * Traduit le statut en français

 */

function translateStatus(status) {

    const statuses = {

        'Finished Airing': 'Terminé',

        'Currently Airing': 'En cours de diffusion',

        'Not yet aired': 'Pas encore diffusé'

    };

    return statuses[status] || status;

}

/**

 * Traduit la classification en français

 */

function translateRating(rating) {

    const ratings = {

        'G - All Ages': 'Tout public',

        'PG - Children': 'Enfants',

        'PG-13 - Teens 13 or older': 'Adolescents (+13 ans)',

        'R - 17+ (violence & profanity)': 'Adultes (+17 ans)',

        'R+ - Mild Nudity': 'Nudité légère',

        'Rx - Hentai': 'Hentai (interdit)'

    };

    return ratings[rating] || rating;

}

/**

 * Envoie les détails complets d'un anime

 */

async function sendAnimeDetails(client, message, anime) {

    try {

        await client.sendMessage(message.key.remoteJid, { react: { text: '🌍', key: message.key } });

        

        // Traduire le synopsis avec l'API

        let synopsis = anime.synopsis || 'Synopsis non disponible.';

        

        // Nettoyer le synopsis des crochets

        synopsis = synopsis.replace(/\[.*?\]/g, '').trim();

        

        // Traduction

        const translatedSynopsis = await translateToFrench(synopsis);

        

        if (translatedSynopsis.length > 2000) {

            const truncated = translatedSynopsis.substring(0, 2000);

            const lastSpace = truncated.lastIndexOf(' ');

            synopsis = truncated.substring(0, lastSpace) + '...';

        } else {

            synopsis = translatedSynopsis;

        }

        

        // Genres traduits

        const genres = anime.genres && anime.genres.length > 0 

            ? anime.genres.map(g => translateGenre(g)).join(', ')

            : 'Non disponible';

        

        // Traductions

        const animeType = translateType(anime.type || 'Inconnu');

        const animeStatus = translateStatus(anime.status || 'Inconnu');

        const animeRating = translateRating(anime.rating || 'Non classé');

        

        const year = anime.year || '???';

        const score = anime.score || '?';

        const popularity = anime.popularity || '?';

        

        const messageText = 

`╔══════════════════╗

   *🎬 ${anime.title}*   

╚══════════════════╝

━━━━━━━━━━━━━━━━━━━━━━

🌐 *Type :* ${animeType}

📺 *Épisodes :* ${anime.episodes || '?'}

📅 *Année :* ${year}

⭐ *Note :* ${score}/10

🔥 *Popularité :* #${popularity}

📊 *Statut :* ${animeStatus}

🔞 *Classification :* ${animeRating}

━━━━━━━━━━━━━━━━━━━━━━

🏷️ *Genres :*

${genres}

━━━━━━━━━━━━━━━━━━━━━━

📖 *Synopsis :*

${synopsis}

━━━━━━━━━━━━━━━━━━━━━━

> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*

*VOIR LA CHAÎNE* 🔥

${CHANNEL_LINK}`;

        if (anime.image) {

            await client.sendMessage(message.key.remoteJid, {

                image: { url: anime.image },

                caption: messageText,

                mimetype: 'image/jpeg'

            });

        } else {

            await client.sendMessage(message.key.remoteJid, { text: messageText });

        }

        

    } catch (error) {

        console.error('❌ Erreur envoi anime:', error.message);

        await client.sendMessage(message.key.remoteJid, { text: '❌ *Erreur lors de l\'affichage*' });

    }

}

// ==================== COMMANDE PRINCIPALE ====================

export default async function animeCommand(client, message, args) {

    try {

        if (!args || args.length === 0) {

            const help = 

`╔══════════════════╗

   *🎬 COMMANDE ANIME*   

╚══════════════════╝

━━━━━━━━━━━━━━━━━━━━━━

📌 *Utilisation :*

.anime [nom de l\'anime]

📝 *Exemples :*

.anime Naruto

.anime One Piece

.anime Death Note

━━━━━━━━━━━━━━━━━━━━━━

📋 *Informations affichées :*

• Titre et type (TV, Film...)

• Nombre d'épisodes

• Note /10 et popularité

• Genres

• Synopsis (traduit en français)

• Image de couverture

━━━━━━━━━━━━━━━━━━━━━━

> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*

*VOIR LA CHAÎNE* 🔥

${CHANNEL_LINK}`;

            return await client.sendMessage(message.key.remoteJid, { text: help });

        }

        const query = args.join(' ');

        

        if (query.length < 2) {

            await client.sendMessage(message.key.remoteJid, {

                text: `❌ *Titre trop court*\n\nLe titre doit contenir au moins 2 caractères.\n\n💡 *Exemple :* .anime Naruto`

            });

            return;

        }

        

        await client.sendMessage(message.key.remoteJid, { react: { text: '🔍', key: message.key } });

        

        const results = await searchAnime(query, 1);

        

        if (!results || results.length === 0) {

            await client.sendMessage(message.key.remoteJid, {

                text: `❌ *Aucun anime trouvé*\n\nLe mot *${query}* n'existe pas dans notre base de données.\n\n💡 *Exemples :* Naruto, One Piece, Death Note`

            });

            return;

        }

        

        await sendAnimeDetails(client, message, results[0]);

        

    } catch (error) {

        console.error('❌ Erreur animeCommand:', error);

        await client.sendMessage(message.key.remoteJid, {

            text: '❌ *Erreur lors de la recherche*\n\nRéessaie plus tard.'

        });

    }

}