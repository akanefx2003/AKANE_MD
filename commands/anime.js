// commands/anime.js - Recherche d'animes // @cat: media
import axios from 'axios';

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';
const API_URL = 'https://christus-api.vercel.app/anime/anime';
const TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';

// Style BIBLE intégré (ne dépend d'aucun fichier) - sans affecter les liens
function styleBible(text) {
    // Protéger les URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = [];
    const textWithoutUrls = text.replace(urlRegex, (match) => {
        urls.push(match);
        return `__URL_${urls.length - 1}__`;
    });
    
    const map = {
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴',
        'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻',
        'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂',
        'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',
        'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',
        'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',
        'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰',
        '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵',
        'é': '𝗲́', 'è': '𝗲̀', 'ê': '𝗲̂', 'ë': '𝗲̈',
        'à': '𝗮̀', 'â': '𝗮̂', 'ç': '𝗰̧', 'ô': '𝗼̂',
        ' ': ' ', '.': '.', ',': ',', '!': '!', '?': '?',
        '-': '-', '_': '_', '/': '/', '\\': '\\',
        '@': '@', '#': '#', '&': '&', '*': '*', '(': '(', ')': ')',
        '[': '[', ']': ']', '{': '{', '}': '}', '<': '<', '>': '>'
    };
    
    let styledText = textWithoutUrls.split('').map(char => map[char] || char).join('');
    urls.forEach((url, i) => {
        styledText = styledText.replace(`__URL_${i}__`, url);
    });
    return styledText;
}

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

function translateGenre(genre) {
    const translations = {
        'Action': 'Action', 'Adventure': 'Aventure', 'Fantasy': 'Fantastique',
        'Comedy': 'Comédie', 'Drama': 'Drame', 'Romance': 'Romance',
        'Sci-Fi': 'Science-Fiction', 'Slice of Life': 'Tranche de vie',
        'Mystery': 'Mystère', 'Horror': 'Horreur', 'Thriller': 'Thriller',
        'Supernatural': 'Surnaturel', 'Psychological': 'Psychologique',
        'Ecchi': 'Ecchi', 'Harem': 'Harem', 'Sports': 'Sport', 'Music': 'Musique',
        'Historical': 'Historique', 'Martial Arts': 'Arts martiaux', 'Mecha': 'Mecha'
    };
    return translations[genre] || genre;
}

function translateType(type) {
    const types = { 'TV': 'Série TV', 'Movie': 'Film', 'OVA': 'OVA',
        'ONA': 'ONA', 'Special': 'Spécial', 'Music': 'Clip musical'
    };
    return types[type] || type;
}

function translateStatus(status) {
    const statuses = {
        'Finished Airing': 'Terminé', 'Currently Airing': 'En cours de diffusion',
        'Not yet aired': 'Pas encore diffusé'
    };
    return statuses[status] || status;
}

function translateRating(rating) {
    const ratings = {
        'G - All Ages': 'Tout public', 'PG - Children': 'Enfants',
        'PG-13 - Teens 13 or older': 'Adolescents (+13 ans)',
        'R - 17+ (violence & profanity)': 'Adultes (+17 ans)',
        'R+ - Mild Nudity': 'Nudité légère', 'Rx - Hentai': 'Hentai (interdit)'
    };
    return ratings[rating] || rating;
}

async function sendAnimeDetails(client, message, anime) {
    try {
        await client.sendMessage(message.key.remoteJid, { react: { text: '🌍', key: message.key } });
        
        let synopsis = anime.synopsis || 'Synopsis non disponible.';
        synopsis = synopsis.replace(/\[.*?\]/g, '').trim();
        
        const translatedSynopsis = await translateToFrench(synopsis);
        
        if (translatedSynopsis.length > 2000) {
            const truncated = translatedSynopsis.substring(0, 2000);
            const lastSpace = truncated.lastIndexOf(' ');
            synopsis = truncated.substring(0, lastSpace) + '...';
        } else {
            synopsis = translatedSynopsis;
        }
        
        const genres = anime.genres && anime.genres.length > 0 
            ? anime.genres.map(g => translateGenre(g)).join(', ')
            : 'Non disponible';
        
        const animeType = translateType(anime.type || 'Inconnu');
        const animeStatus = translateStatus(anime.status || 'Inconnu');
        const animeRating = translateRating(anime.rating || 'Non classé');
        
        const year = anime.year || '???';
        const score = anime.score || '?';
        const popularity = anime.popularity || '?';
        
        const messageText = 
`╭─❍ *🎬 ${anime.title}*
│
│ 🌐 *Type :* ${animeType}
│ 📺 *Épisodes :* ${anime.episodes || '?'}
│ 📅 *Année :* ${year}
│ ⭐ *Note :* ${score}/10
│ 🔥 *Popularité :* #${popularity}
│ 📊 *Statut :* ${animeStatus}
│ 🔞 *Classification :* ${animeRating}
│
│ 🏷️ *Genres :*
│ ${genres}
│
│ 📖 *Synopsis :*
│ ${synopsis}
│
│ 🔗 *VOIR LA CHAÎNE*
│ ${CHANNEL_LINK}
│
╰──────────────────`;
        
        const styledMessage = styleBible(messageText);
        
        if (anime.image) {
            await client.sendMessage(message.key.remoteJid, {
                image: { url: anime.image },
                caption: styledMessage,
                mimetype: 'image/jpeg'
            });
        } else {
            await client.sendMessage(message.key.remoteJid, { text: styledMessage });
        }
        
    } catch (error) {
        console.error('❌ Erreur envoi anime:', error.message);
        await client.sendMessage(message.key.remoteJid, { text: "❌ *Erreur lors de l'affichage*" });
    }
}

export default async function animeCommand(client, message, args) {
    try {
        if (!args || args.length === 0) {
            const help = 
`╭─❍ *🎬 COMMANDE ANIME*
│
│ 📌 *Utilisation :*
│ .anime [nom de l'anime]
│
│ 📝 *Exemples :*
│ .anime Naruto
│ .anime One Piece
│ .anime Death Note
│
│ 🔗 *VOIR LA CHAÎNE*
│ ${CHANNEL_LINK}
│
╰──────────────────`;
            
            const styledHelp = styleBible(help);
            return await client.sendMessage(message.key.remoteJid, { text: styledHelp });
        }

        const query = args.join(' ');
        
        if (query.length < 2) {
            const errorMsg = styleBible("❌ *Titre trop court*\n\nLe titre doit contenir au moins 2 caractères.\n\n💡 *Exemple :* .anime Naruto");
            await client.sendMessage(message.key.remoteJid, { text: errorMsg });
            return;
        }
        
        await client.sendMessage(message.key.remoteJid, { react: { text: '🔍', key: message.key } });
        
        const results = await searchAnime(query, 1);
        
        if (!results || results.length === 0) {
            const errorMsg = styleBible(`❌ *Aucun anime trouvé*\n\nLe mot *${query}* n'existe pas dans notre base de données.\n\n💡 *Exemples :* Naruto, One Piece, Death Note`);
            await client.sendMessage(message.key.remoteJid, { text: errorMsg });
            return;
        }
        
        await sendAnimeDetails(client, message, results[0]);
        
    } catch (error) {
        console.error('❌ Erreur animeCommand:', error);
        const errorMsg = styleBible("❌ *Erreur lors de la recherche*\n\nRéessaie plus tard.");
        await client.sendMessage(message.key.remoteJid, { text: errorMsg });
    }
}