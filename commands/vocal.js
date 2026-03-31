import axios from 'axios';

import fs from 'fs';

import path from 'path';

import stylizedChar from '../utils/fancy.js';

// 🔗 LIEN DE TA CHAÎNE WHATSAPP

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

// Dossier temporaire

const tempDir = './temp';

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// Fonction pour nettoyer les fichiers

const scheduleFileDeletion = (filePath, delay = 30000) => {

    setTimeout(async () => {

        try {

            if (fs.existsSync(filePath)) {

                await fs.promises.unlink(filePath);

                console.log(`Fichier supprimé: ${filePath}`);

            }

        } catch (error) {

            console.error(`Erreur suppression:`, error);

        }

    }, delay);

};

// Liste des langues avec drapeaux

const languages = {

    'fr': { name: 'Français', flag: '🇫🇷' },

    'en': { name: 'Anglais', flag: '🇬🇧' },

    'es': { name: 'Espagnol', flag: '🇪🇸' },

    'de': { name: 'Allemand', flag: '🇩🇪' },

    'it': { name: 'Italien', flag: '🇮🇹' },

    'pt': { name: 'Portugais', flag: '🇵🇹' },

    'ru': { name: 'Russe', flag: '🇷🇺' },

    'ja': { name: 'Japonais', flag: '🇯🇵' },

    'ko': { name: 'Coréen', flag: '🇰🇷' },

    'zh': { name: 'Chinois', flag: '🇨🇳' },

    'ar': { name: 'Arabe', flag: '🇸🇦' },

    'nl': { name: 'Néerlandais', flag: '🇳🇱' },

    'pl': { name: 'Polonais', flag: '🇵🇱' },

    'tr': { name: 'Turc', flag: '🇹🇷' },

    'sv': { name: 'Suédois', flag: '🇸🇪' },

    'da': { name: 'Danois', flag: '🇩🇰' },

    'fi': { name: 'Finnois', flag: '🇫🇮' },

    'el': { name: 'Grec', flag: '🇬🇷' },

    'cs': { name: 'Tchèque', flag: '🇨🇿' },

    'ro': { name: 'Roumain', flag: '🇷🇴' },

    'hu': { name: 'Hongrois', flag: '🇭🇺' },

    'th': { name: 'Thaï', flag: '🇹🇭' },

    'vi': { name: 'Vietnamien', flag: '🇻🇳' },

    'id': { name: 'Indonésien', flag: '🇮🇩' }

};

async function vocalCommand(client, message) {

    try {

        const remoteJid = message.key?.remoteJid;

        const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';

        const args = messageBody.slice(7).trim(); // ".vocal " = 7 caractères

        

        if (!args) {

            const langList = Object.entries(languages)

                .map(([code, { name, flag }]) => `${flag} *${code}*: ${name}`)

                .join('\n');

            

            const helpMessage = 

                "╔══════════════════╗\n" +

                "    *TEXTE → VOCAL*  \n" +

                "╚══════════════════╝\n\n" +

                "━━━━━━━━━━━━━━━━━━━\n\n" +

                "📝 *Comment utiliser:*\n" +

                "`.vocal [langue] [texte]`\n\n" +

                "🌍 *Langues disponibles:*\n" +

                `${langList}\n\n` +

                "━━━━━━━━━━━━━━━━━━━\n\n" +

                "📌 *Exemples:*\n" +

                "`.vocal fr Bonjour tout le monde` 🇫🇷\n" +

                "`.vocal en Hello everyone` 🇬🇧\n" +

                "`.vocal es Hola mundo` 🇪🇸\n\n" +

                "━━━━━━━━━━━━━━━━━━━\n\n" +

                "> *𝐃𝐄𝐕 : 𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀*\n\n" +

                "*Voir la chaîne* 🔥\n" +

                `${CHANNEL_LINK}\n\n` +

                "━━━━━━━━━━━━━━━━━━━\n" +

                "> *_© 𝐀𝐊𝐀𝐍𝐄-𝐌𝐃 🌹_*";

            await client.sendMessage(remoteJid, { 

                text: helpMessage

            });

            return;

        }

        // Extraire la langue et le texte

        const parts = args.split(' ');

        const langCode = parts[0].toLowerCase();

        const textToSpeak = parts.slice(1).join(' ');

        if (!textToSpeak) {

            const errorMessage = 

                "╔══════════════════╗\n" +

                "    *ERREUR*  \n" +

                "╚══════════════════╝\n\n" +

                "━━━━━━━━━━━━━━━━━━━\n\n" +

                "❌ *Texte manquant !*\n\n" +

                "📝 *Exemple:* `.vocal fr Bonjour`\n\n" +

                "━━━━━━━━━━━━━━━━━━━\n\n" +

                "> *𝐃𝐄𝐕 : 𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀*\n\n" +

                "*Voir la chaîne* 🔥\n" +

                `${CHANNEL_LINK}\n\n` +

                "━━━━━━━━━━━━━━━━━━━\n" +

                "> *_© 𝐀𝐊𝐀𝐍𝐄-𝐌𝐃 🌹_*";

            await client.sendMessage(remoteJid, { 

                text: errorMessage

            });

            return;

        }

        // Vérifier si la langue est supportée

        if (!languages[langCode]) {

            const errorMessage = 

                "╔══════════════════╗\n" +

                "    *ERREUR*  \n" +

                "╚══════════════════╝\n\n" +

                "━━━━━━━━━━━━━━━━━━━\n\n" +

                `❌ Langue *${langCode}* non supportée !\n\n` +

                "🌍 *Langues dispo:* " + Object.keys(languages).join(', ') + "\n\n" +

                "━━━━━━━━━━━━━━━━━━━\n\n" +

                "> *𝐃𝐄𝐕 : 𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀*\n\n" +

                "*Voir la chaîne* 🔥\n" +

                `${CHANNEL_LINK}\n\n` +

                "━━━━━━━━━━━━━━━━━━━\n" +

                "> *_© 𝐀𝐊𝐀𝐍𝐄-𝐌𝐃 🌹_*";

            await client.sendMessage(remoteJid, { 

                text: errorMessage

            });

            return;

        }

        await client.sendMessage(remoteJid, { 

            text: ` 🔊 Génération du vocal en ${languages[langCode].name}...`

        });

        try {

            // Utiliser l'API Google Translate TTS (gratuite et fiable)

            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textToSpeak)}&tl=${langCode}&client=tw-ob`;

            

            const response = await axios.get(ttsUrl, {

                responseType: 'arraybuffer',

                timeout: 15000,

                headers: {

                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

                }

            });

            const audioBuffer = Buffer.from(response.data);

            // Message de confirmation

            const successMessage = 

                "╔══════════════════╗\n" +

                "    *TEXTE → VOCAL*  \n" +

                "╚══════════════════╝\n\n" +

                "━━━━━━━━━━━━━━━━━━━\n\n" +

                "📝 *Texte:*\n" +

                `${textToSpeak}\n\n` +

                "🌍 *Langue:*\n" +

                `${languages[langCode].flag} ${languages[langCode].name}\n\n` +

                "━━━━━━━━━━━━━━━━━━━\n\n" +

                "> *𝐃𝐄𝐕 : 𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀*\n\n" +

                "*Voir la chaîne* 🔥\n" +

                `${CHANNEL_LINK}\n\n` +

                "━━━━━━━━━━━━━━━━━━━\n" +

                "> *_© 𝐀𝐊𝐀𝐍𝐄-𝐌𝐃 🌹_*";

            await client.sendMessage(remoteJid, { 

                text: successMessage

            });

            // Envoyer le message vocal

            await client.sendMessage(remoteJid, { 

                audio: audioBuffer,

                mimetype: 'audio/mpeg',

                ptt: true  // true = message vocal (le cercle bleu)

            });

        } catch (ttsError) {

            console.error('Erreur TTS:', ttsError);

            

            // API de secours (Streamlabs)

            try {

                const backupUrl = `https://streamlabs.com/polly/speak?voice=${langCode}&text=${encodeURIComponent(textToSpeak)}`;

                

                const backupResponse = await axios.get(backupUrl, {

                    responseType: 'arraybuffer',

                    timeout: 15000

                });

                const audioBuffer = Buffer.from(backupResponse.data);

                const successMessage = 

                    "╔══════════════════╗\n" +

                    "    *TEXTE → VOCAL*  \n" +

                    "╚══════════════════╝\n\n" +

                    "━━━━━━━━━━━━━━━━━━━\n\n" +

                    "📝 *Texte:*\n" +

                    `${textToSpeak}\n\n` +

                    "🌍 *Langue:*\n" +

                    `${languages[langCode].flag} ${languages[langCode].name}\n\n` +

                    "━━━━━━━━━━━━━━━━━━━\n\n" +

                    "> *𝐃𝐄𝐕 : 𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀*\n\n" +

                    "*Voir la chaîne* 🔥\n" +

                    `${CHANNEL_LINK}\n\n` +

                    "━━━━━━━━━━━━━━━━━━━\n" +

                    "> *_© 𝐀𝐊𝐀𝐍𝐄-𝐌𝐃 🌹_*";

                await client.sendMessage(remoteJid, { 

                    text: successMessage

                });

                await client.sendMessage(remoteJid, { 

                    audio: audioBuffer,

                    mimetype: 'audio/mpeg',

                    ptt: true

                });

                return;

            } catch (backupError) {

                console.log('Backup TTS échoué');

                

                const errorMessage = 

                    "╔══════════════════╗\n" +

                    "    *ERREUR*  \n" +

                    "╚══════════════════╝\n\n" +

                    "━━━━━━━━━━━━━━━━━━━\n\n" +

                    "❌ *Impossible de générer le vocal.*\n\n" +

                    "📝 *Texte trop long ou problème réseau*\n\n" +

                    "━━━━━━━━━━━━━━━━━━━\n\n" +

                    "> *𝐃𝐄𝐕 : 𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀*\n\n" +

                    "*Voir la chaîne* 🔥\n" +

                    `${CHANNEL_LINK}\n\n` +

                    "━━━━━━━━━━━━━━━━━━━\n" +

                    "> *_© 𝐀𝐊𝐀𝐍𝐄-𝐌𝐃 🌹_*";

                await client.sendMessage(remoteJid, { 

                    text: errorMessage

                });

            }

        }

    } catch (error) {

        console.error('Erreur commande vocal:', error);

        

        const errorMessage = 

            "╔══════════════════╗\n" +

            "    *ERREUR*  \n" +

            "╚══════════════════╝\n\n" +

            "━━━━━━━━━━━━━━━━━━━\n\n" +

            `❌ *${error.message}*\n\n` +

            "━━━━━━━━━━━━━━━━━━━\n\n" +

            "> *𝐃𝐄𝐕 : 𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀*\n\n" +

            "*Voir la chaîne* 🔥\n" +

            `${CHANNEL_LINK}\n\n` +

            "━━━━━━━━━━━━━━━━━━━\n" +

            "> *_© 𝐀𝐊𝐀𝐍𝐄-𝐌𝐃 🌹_*";

        await client.sendMessage(message.key?.remoteJid, { 

            text: errorMessage

        });

    }

}

export default vocalCommand;
