import axios from 'axios';

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

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

export default async function saveCommand(client, message) {

    try {

        const remoteJid = message.key?.remoteJid;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const args = messageBody.slice(6).trim();

        if (!args) {

            const helpMessage = 

                "╔════════════╗\n" +

                "  *VERSET BIBLE*  \n" +

                "╚════════════╝\n\n" +

                "📝 `.save [reference]`\n\n" +

                "📌 *Ex:* `.save Jean 3:16`\n\n" +

                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

            return await client.sendMessage(remoteJid, { text: helpMessage });

        }

        await client.sendMessage(remoteJid, { 

            text: `🔍 *Recherche de "${args}"...*`

        });

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

            "╔════════════╗\n" +

            "  *VERSET BIBLE*  \n" +

            "╚════════════╝\n\n" +

            `📖 *${bookname} ${chapter}:${verse}*\n\n` +

            `"${frenchText}"\n\n` +

            "📌 _Traduction auto_\n\n" +

            "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

            `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

        await client.sendMessage(remoteJid, { text: bibleMessage });

    } catch (error) {

        console.error('Erreur save:', error);

        const errorMessage = 

            "╔════════════╗\n" +

            "  *ERREUR*  \n" +

            "╚════════════╝\n\n" +

            "❌ *Verset non trouve*\n\n" +

            "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

            `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

        await client.sendMessage(message.key?.remoteJid, { text: errorMessage });

    }

}