// commands/bible.js
import axios from 'axios';

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

// Style BIBLE intégré (ne dépend d'aucun fichier) - sans affecter les liens
function styleBible(text) {
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

const bibleBooks = {
    'genèse': 'Genesis', 'genese': 'Genesis',
    'exode': 'Exodus',
    'lévitique': 'Leviticus', 'levitique': 'Leviticus',
    'nombres': 'Numbers',
    'deutéronome': 'Deuteronomy', 'deuteronome': 'Deuteronomy',
    'josué': 'Joshua', 'josue': 'Joshua',
    'juges': 'Judges',
    'ruth': 'Ruth',
    '1 samuel': '1 Samuel', 'i samuel': '1 Samuel',
    '2 samuel': '2 Samuel', 'ii samuel': '2 Samuel',
    '1 rois': '1 Kings', 'i rois': '1 Kings',
    '2 rois': '2 Kings', 'ii rois': '2 Kings',
    '1 chroniques': '1 Chronicles', 'i chroniques': '1 Chronicles',
    '2 chroniques': '2 Chronicles', 'ii chroniques': '2 Chronicles',
    'esdras': 'Ezra',
    'néhémie': 'Nehemiah', 'nehemie': 'Nehemiah',
    'esther': 'Esther',
    'job': 'Job',
    'psaumes': 'Psalms', 'psaume': 'Psalms',
    'proverbes': 'Proverbs',
    'ecclésiaste': 'Ecclesiastes', 'ecclesiaste': 'Ecclesiastes',
    'cantique': 'Song of Solomon',
    'ésaïe': 'Isaiah', 'esaie': 'Isaiah',
    'jérémie': 'Jeremiah', 'jeremie': 'Jeremiah',
    'lamentations': 'Lamentations',
    'ézéchiel': 'Ezekiel', 'ezechiel': 'Ezekiel',
    'daniel': 'Daniel',
    'osée': 'Hosea', 'osee': 'Hosea',
    'joël': 'Joel', 'joel': 'Joel',
    'amos': 'Amos',
    'abdias': 'Obadiah',
    'jonas': 'Jonah',
    'michée': 'Micah', 'michee': 'Micah',
    'nahum': 'Nahum',
    'habacuc': 'Habakkuk',
    'sophonie': 'Zephaniah',
    'aggée': 'Haggai', 'aggee': 'Haggai',
    'zacharie': 'Zechariah',
    'malachie': 'Malachi',
    'matthieu': 'Matthew',
    'marc': 'Mark',
    'luc': 'Luke',
    'jean': 'John',
    'actes': 'Acts',
    'romains': 'Romans',
    '1 corinthiens': '1 Corinthians', 'i corinthiens': '1 Corinthians',
    '2 corinthiens': '2 Corinthians', 'ii corinthiens': '2 Corinthians',
    'galates': 'Galatians',
    'éphésiens': 'Ephesians', 'ephesiens': 'Ephesians',
    'philippiens': 'Philippians',
    'colossiens': 'Colossians',
    '1 thessaloniciens': '1 Thessalonians', 'i thessaloniciens': '1 Thessalonians',
    '2 thessaloniciens': '2 Thessalonians', 'ii thessaloniciens': '2 Thessalonians',
    '1 timothée': '1 Timothy', 'i timothée': '1 Timothy',
    '2 timothée': '2 Timothy', 'ii timothée': '2 Timothy',
    'tite': 'Titus',
    'philémon': 'Philemon', 'philemon': 'Philemon',
    'hébreux': 'Hebrews', 'hebreux': 'Hebrews',
    'jacques': 'James',
    '1 pierre': '1 Peter', 'i pierre': '1 Peter',
    '2 pierre': '2 Peter', 'ii pierre': '2 Peter',
    '1 jean': '1 John', 'i jean': '1 John',
    '2 jean': '2 John', 'ii jean': '2 John',
    '3 jean': '3 John', 'iii jean': '3 John',
    'jude': 'Jude',
    'apocalypse': 'Revelation'
};

function translateReference(ref) {
    ref = ref.toLowerCase().trim();
    for (const [fr, en] of Object.entries(bibleBooks)) {
        if (ref.startsWith(fr)) {
            return en + ref.substring(fr.length);
        }
    }
    return ref;
}

export default async function bibleCommand(client, message) {
    try {
        const remoteJid = message.key?.remoteJid;
        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
        const args = messageBody.slice(6).trim();
        
        if (!args) {
            const helpMessage = 
`╭─❍ *📖 VERSET BIBLE*
│
│ 📝 *Utilisation:*
│ .bible [reference]
│
│ 📌 *Exemple:*
│ .bible Jean 3:16
│
│ 🔗 *VOIR LA CHAINE*
│ ${CHANNEL_LINK}
│
╰──────────────────`;
            
            const styledHelp = styleBible(helpMessage);
            return await client.sendMessage(remoteJid, { text: styledHelp });
        }

        const progressMsg = styleBible(`🔍 *Recherche de "${args}"...*`);
        await client.sendMessage(remoteJid, { text: progressMsg });

        const englishRef = translateReference(args);
        const apiUrl = `https://labs.bible.org/api/?passage=${encodeURIComponent(englishRef)}&type=json`;
        const response = await axios.get(apiUrl, { timeout: 10000 });

        if (!response.data || response.data.length === 0) {
            throw new Error('Verset non trouve');
        }

        const verseData = response.data[0];
        const bookname = verseData.bookname;
        const chapter = verseData.chapter;
        const verse = verseData.verse;
        const englishText = verseData.text.replace(/\(.*?\)/g, '').trim();

        const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fr&dt=t&q=${encodeURIComponent(englishText)}`;
        const translateResponse = await axios.get(translateUrl, { timeout: 10000 });

        let frenchText = '';
        if (translateResponse.data && translateResponse.data[0]) {
            frenchText = translateResponse.data[0].map(item => item[0]).join(' ');
        }

        if (!frenchText) throw new Error('Traduction echouee');

        const bibleMessage = 
`╭─❍ *📖 VERSET BIBLE*
│
│ 📖 *${bookname} ${chapter}:${verse}*
│
│ *"${frenchText}"*
│
│ 📌 *Traduction auto*
│
│ 🔗 *VOIR LA CHAINE*
│ ${CHANNEL_LINK}
│
╰──────────────────`;
        
        const styledMessage = styleBible(bibleMessage);
        await client.sendMessage(remoteJid, { text: styledMessage });

    } catch (error) {
        console.error('Erreur bible:', error);
        const errorMessage = 
`╭─❍ *📖 BIBLE*
│
│ ❌ *Verset non trouvé*
│
│ 🔗 *VOIR LA CHAINE*
│ ${CHANNEL_LINK}
│
╰──────────────────`;
        
        const styledError = styleBible(errorMessage);
        await client.sendMessage(message.key?.remoteJid, { text: styledError });
    }
}