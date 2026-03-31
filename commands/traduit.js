import axios from 'axios';

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const languages = {

    "fr": { name: "Francais", flag: "🇫🇷" },

    "en": { name: "Anglais", flag: "🇬🇧" },

    "es": { name: "Espagnol", flag: "🇪🇸" },

    "de": { name: "Allemand", flag: "🇩🇪" },

    "it": { name: "Italien", flag: "🇮🇹" },

    "pt": { name: "Portugais", flag: "🇵🇹" },

    "nl": { name: "Neerlandais", flag: "🇳🇱" },

    "ru": { name: "Russe", flag: "🇷🇺" },

    "ja": { name: "Japonais", flag: "🇯🇵" },

    "ko": { name: "Coreen", flag: "🇰🇷" },

    "zh": { name: "Chinois", flag: "🇨🇳" },

    "ar": { name: "Arabe", flag: "🇸🇦" },

    "hi": { name: "Hindi", flag: "🇮🇳" },

    "tr": { name: "Turc", flag: "🇹🇷" },

    "pl": { name: "Polonais", flag: "🇵🇱" },

    "sv": { name: "Suedois", flag: "🇸🇪" },

    "da": { name: "Danois", flag: "🇩🇰" },

    "fi": { name: "Finnois", flag: "🇫🇮" },

    "el": { name: "Grec", flag: "🇬🇷" },

    "cs": { name: "Tcheque", flag: "🇨🇿" },

    "ro": { name: "Roumain", flag: "🇷🇴" },

    "hu": { name: "Hongrois", flag: "🇭🇺" },

    "th": { name: "Thai", flag: "🇹🇭" },

    "vi": { name: "Vietnamien", flag: "🇻🇳" },

    "id": { name: "Indonesien", flag: "🇮🇩" },

    "ms": { name: "Malais", flag: "🇲🇾" },

    "he": { name: "Hebreu", flag: "🇮🇱" },

    "uk": { name: "Ukrainien", flag: "🇺🇦" }

};

function detectLanguage(text) {

    const frenchChars = /[éèêëàâäîïôöûüçœæ]/i;

    const spanishChars = /[ñáéíóúü¿¡]/i;

    const germanChars = /[äöüß]/i;

    const japaneseChars = /[ぁ-んァ-ン一-龥]/;

    const chineseChars = /[一-龥]/;

    const russianChars = /[а-яА-Я]/;

    const arabicChars = /[أ-ي]/;

    const koreanChars = /[가-힣]/;

    const thaiChars = /[ก-๙]/;

    

    if (frenchChars.test(text)) return 'fr';

    if (spanishChars.test(text)) return 'es';

    if (germanChars.test(text)) return 'de';

    if (japaneseChars.test(text)) return 'ja';

    if (chineseChars.test(text)) return 'zh';

    if (russianChars.test(text)) return 'ru';

    if (arabicChars.test(text)) return 'ar';

    if (koreanChars.test(text)) return 'ko';

    if (thaiChars.test(text)) return 'th';

    return 'en';

}

export default async function traduitCommand(client, message) {

    try {

        const remoteJid = message.key?.remoteJid;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const args = messageBody.slice(8).trim();

        if (!args) {

            const langList = Object.entries(languages).map(([code, { name, flag }]) => `${flag} *${code}*: ${name}`).join('\n');

            const helpMessage = 

                "╔══════════════════╗\n" +

                "     *TRADUCTEUR*    \n" +

                "╚══════════════════╝\n\n" +

                "📝 `.traduit [langue] [texte]`\n\n" +

                "📚 *Langues:*\n" + langList + '\n\n' +

                "📌 *Ex:* `.traduit en Bonjour`\n\n" +

                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

            await client.sendMessage(remoteJid, { text: helpMessage });

            return;

        }

        const parts = args.split(' ');

        const targetLang = parts[0].toLowerCase();

        const textToTranslate = parts.slice(1).join(' ');

        if (!textToTranslate) {

            const errorMessage = 

                "╔══════════════════╗\n" +

                "       *ERREUR*      \n" +

                "╚══════════════════╝\n\n" +

                "❌ *Texte manquant !*\n\n" +

                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

            await client.sendMessage(remoteJid, { text: errorMessage });

            return;

        }

        if (!languages[targetLang]) {

            const errorMessage = 

                "╔══════════════════╗\n" +

                "       *ERREUR*      \n" +

                "╚══════════════════╝\n\n" +

                `❌ Langue *${targetLang}* non supportee\n\n` +

                "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

            await client.sendMessage(remoteJid, { text: errorMessage });

            return;

        }

        const sourceLang = detectLanguage(textToTranslate);

        const sourceLangInfo = languages[sourceLang] || { name: sourceLang, flag: '🌐' };

        await client.sendMessage(remoteJid, { text: `🔄 ${sourceLangInfo.flag} → ${languages[targetLang].flag}` });

        try {

            const googleUrl = 'https://translate.googleapis.com/translate_a/single';

            const response = await axios.get(googleUrl, {

                params: {

                    client: 'gtx',

                    sl: sourceLang,

                    tl: targetLang,

                    dt: 't',

                    q: textToTranslate

                },

                timeout: 8000

            });

            if (response.data && response.data[0]) {

                const translatedText = response.data[0][0][0];

                const translationMessage = 

                    "╔══════════════════╗\n" +

                    "     *TRADUCTION*    \n" +

                    "╚══════════════════╝\n\n" +

                    `${sourceLangInfo.flag} *${textToTranslate}*\n\n` +

                    `${languages[targetLang].flag} *${translatedText}*\n\n` +

                    "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                    `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

                await client.sendMessage(remoteJid, { text: translationMessage });

                return;

            }

        } catch (googleError) {

            console.log('Google Translate echoue, essai MyMemory...');

        }

        try {

            const response = await axios.get('https://api.mymemory.translated.net/get', {

                params: {

                    q: textToTranslate,

                    langpair: `${sourceLang}|${targetLang}`,

                    de: 'akane.md@gmail.com'

                },

                timeout: 8000

            });

            if (response.data && response.data.responseData) {

                const translatedText = response.data.responseData.translatedText;

                const translationMessage = 

                    "╔══════════════════╗\n" +

                    "     *TRADUCTION*    \n" +

                    "╚══════════════════╝\n\n" +

                    `${sourceLangInfo.flag} *${textToTranslate}*\n\n` +

                    `${languages[targetLang].flag} *${translatedText}*\n\n` +

                    "> *DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹*\n\n" +

                    `*VOIR LA CHAINE* 🔥\n${CHANNEL_LINK}`;

                await client.sendMessage(remoteJid, { text: translationMessage });

                return;

            }

        } catch (memoryError) {

            console.log('MyMemory echoue');

        }

    } catch (error) {

        console.error('Erreur traduit:', error);

    }

}