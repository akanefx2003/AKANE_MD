// commands/account.js

// @cat: bot-menu

// Système de comptes utilisateurs - Version avec lien d'image

import fs from 'fs/promises';

import path from 'path';

import { fileURLToPath } from 'url';

import crypto from 'crypto';

import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');

const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

const PROFILES_DIR = path.join(DATA_DIR, 'profiles');

// Stockage

let accounts = new Map();

let sessions = new Map();

// ==================== FONCTIONS DE STOCKAGE ====================

async function ensureDataDir() {

    try {

        await fs.access(DATA_DIR);

    } catch {

        await fs.mkdir(DATA_DIR, { recursive: true });

        console.log("📁 Dossier data créé");

    }

    try {

        await fs.access(PROFILES_DIR);

    } catch {

        await fs.mkdir(PROFILES_DIR, { recursive: true });

        console.log("📁 Dossier profiles créé");

    }

}

async function loadAccounts() {

    await ensureDataDir();

    try {

        const data = await fs.readFile(ACCOUNTS_FILE, 'utf-8');

        const parsed = JSON.parse(data);

        accounts = new Map(Object.entries(parsed));

        console.log(`👥 ${accounts.size} comptes chargés`);

    } catch (error) {

        console.log("📭 Aucun compte trouvé");

        await saveAccounts();

    }

}

async function saveAccounts() {

    await ensureDataDir();

    const obj = Object.fromEntries(accounts);

    await fs.writeFile(ACCOUNTS_FILE, JSON.stringify(obj, null, 2));

}

async function loadSessions() {

    await ensureDataDir();

    try {

        const data = await fs.readFile(SESSIONS_FILE, 'utf-8');

        const parsed = JSON.parse(data);

        sessions = new Map(Object.entries(parsed));

        console.log(`🔑 ${sessions.size} sessions actives`);

    } catch (error) {

        console.log("📭 Aucune session trouvée");

        await saveSessions();

    }

}

async function saveSessions() {

    await ensureDataDir();

    const obj = Object.fromEntries(sessions);

    await fs.writeFile(SESSIONS_FILE, JSON.stringify(obj, null, 2));

}

// ==================== FONCTIONS DE CRYPTAGE ====================

function hashPassword(password) {

    return crypto.createHash('sha256').update(password).digest('hex');

}

function generateToken() {

    return crypto.randomBytes(32).toString('hex');

}

// ==================== STRUCTURE DE PROGRESSION ====================

function getDefaultProgress() {

    return {

        pray: { total: 0, streak: 0, lastPray: null },

        bible: { versesRead: [], lastVerse: null, totalVerses: 0 },

        histoire: { storiesRead: [], lastStory: null, totalStories: 0 },

        footquiz: { score: 0, gamesPlayed: 0, bestScore: 0, wins: 0 },

        tts: { score: 0, gamesPlayed: 0, bestScore: 0, wins: 0 },

        mail: { emails: [], lastEmail: null, totalEmails: 0 },

        box: { boxesOpened: 0, items: [] },

        vocal: { soundsPlayed: 0, lastSound: null },

        fancy: { textsGenerated: 0, lastText: null },

        anime: { animeWatched: [], lastAnime: null },

        createdAt: Date.now(),

        lastLogin: Date.now()

    };

}// PARTIE 2/4 - Sauvegarde et progression

// ==================== SAUVEGARDE AUTOMATIQUE ====================

async function autoSaveProgress(username, game, data) {

    const account = accounts.get(username);

    if (!account) return false;

    

    if (!account.progress[game]) {

        account.progress[game] = {};

    }

    

    Object.assign(account.progress[game], data);

    account.lastLogin = Date.now();

    accounts.set(username, account);

    await saveAccounts();

    return true;

}

async function saveGameProgress(username, game) {

    const account = accounts.get(username);

    if (!account) return false;

    

    let data = {};

    

    switch(game) {

        case 'pray':

            const lastPray = account.progress.pray?.lastPray;

            const now = new Date().toISOString().split('T')[0];

            let newStreak = account.progress.pray?.streak || 0;

            

            if (lastPray === now) {

                data = { ...account.progress.pray };

            } else {

                const yesterday = new Date();

                yesterday.setDate(yesterday.getDate() - 1);

                const yesterdayStr = yesterday.toISOString().split('T')[0];

                

                if (lastPray === yesterdayStr) {

                    newStreak++;

                } else {

                    newStreak = 1;

                }

                

                data = {

                    total: (account.progress.pray?.total || 0) + 1,

                    streak: newStreak,

                    lastPray: now

                };

            }

            break;

            

        case 'bible':

            data = {

                versesRead: account.progress.bible?.versesRead || [],

                totalVerses: (account.progress.bible?.totalVerses || 0) + 1,

                lastVerse: new Date().toISOString()

            };

            break;

            

        case 'footquiz':

            data = {

                gamesPlayed: (account.progress.footquiz?.gamesPlayed || 0) + 1,

                score: account.progress.footquiz?.score || 0,

                bestScore: Math.max(account.progress.footquiz?.bestScore || 0, account.progress.footquiz?.score || 0)

            };

            break;

            

        case 'tts':

            data = {

                gamesPlayed: (account.progress.tts?.gamesPlayed || 0) + 1,

                score: account.progress.tts?.score || 0,

                bestScore: Math.max(account.progress.tts?.bestScore || 0, account.progress.tts?.score || 0)

            };

            break;

            

        case 'mail':

            data = {

                totalEmails: (account.progress.mail?.totalEmails || 0) + 1,

                lastEmail: new Date().toISOString()

            };

            break;

            

        case 'box':

            data = {

                boxesOpened: (account.progress.box?.boxesOpened || 0) + 1

            };

            break;

            

        case 'vocal':

            data = {

                soundsPlayed: (account.progress.vocal?.soundsPlayed || 0) + 1,

                lastSound: new Date().toISOString()

            };

            break;

            

        case 'fancy':

            data = {

                textsGenerated: (account.progress.fancy?.textsGenerated || 0) + 1,

                lastText: new Date().toISOString()

            };

            break;

            

        case 'anime':

            data = {

                animeWatched: account.progress.anime?.animeWatched || [],

                lastAnime: new Date().toISOString()

            };

            break;

    }

    

    return await autoSaveProgress(username, game, data);

}

function getProgress(username, game = null) {

    const account = accounts.get(username);

    if (!account) return null;

    

    if (game) {

        return account.progress[game] || {};

    }

    return account.progress;

}

// ==================== SAUVEGARDER LA PHOTO DE PROFIL ====================

async function saveProfilePicture(username, imageBuffer) {

    const account = accounts.get(username);

    if (!account) return false;

    

    const fileName = `${username}_${Date.now()}.jpg`;

    const filePath = path.join(PROFILES_DIR, fileName);

    

    await fs.writeFile(filePath, imageBuffer);

    

    account.profilePicture = fileName;

    accounts.set(username, account);

    await saveAccounts();

    return true;

}

// ==================== RÉCUPÉRER LA PHOTO DE PROFIL ====================

async function getProfilePicture(username) {

    const account = accounts.get(username);

    if (!account || !account.profilePicture) return null;

    

    const filePath = path.join(PROFILES_DIR, account.profilePicture);

    try {

        await fs.access(filePath);

        return filePath;

    } catch {

        return null;

    }

}// PARTIE 3/4 - Commandes principales

// ==================== COMMANDE PRINCIPALE ====================

async function accountCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;

    const sender = message.key.participant || message.key.remoteJid;

    const subCommand = args[0]?.toLowerCase();

    

    await loadAccounts();

    await loadSessions();

    

    // ========== HELP ==========

    if (!subCommand || subCommand === 'help') {

        const helpText = 

`👤 *COMPTE UTILISATEUR*

📝 *COMMANDES :*

• *account register [pseudo] [mdp]* - Créer un compte

• *account login [pseudo] [mdp]* - Se connecter

• *account logout* - Se déconnecter

• *account profile* - Voir son profil

• *account save [jeu]* - Sauvegarder la progression

• *account load [jeu]* - Charger la progression

• *account setpp [lien]* - Changer photo de profil

• *account delete* - Supprimer son compte

🎮 *JEUX DISPONIBLES :*

pray, bible, footquiz, tts, mail, box, vocal, fancy, anime

💡 *EXEMPLES :*

• *account save pray*

• *account load footquiz*

• *account setpp https://lien-image.jpg*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹

https://whatsapp.com/channel/0029VbCmpwK89inpJICAG21A

> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*`;

        

        await client.sendMessage(remoteJid, { text: helpText });

        return;

    }

    

    // ========== CRÉER UN COMPTE ==========

    if (subCommand === 'register' || subCommand === 'reg') {

        const username = args[1];

        const password = args[2];

        

        if (!username || !password) {

            await client.sendMessage(remoteJid, { text: "❌ *Utilisation :* `account register [pseudo] [mot de passe]`" });

            return;

        }

        

        if (username.length < 3) {

            await client.sendMessage(remoteJid, { text: "❌ *Pseudo trop court* (minimum 3 caractères)" });

            return;

        }

        

        if (password.length < 4) {

            await client.sendMessage(remoteJid, { text: "❌ *Mot de passe trop court* (minimum 4 caractères)" });

            return;

        }

        

        if (accounts.has(username)) {

            await client.sendMessage(remoteJid, { text: "❌ *Ce pseudo existe déjà !*" });

            return;

        }

        

        const hashedPassword = hashPassword(password);

        

        accounts.set(username, {

            username: username,

            password: hashedPassword,

            createdAt: Date.now(),

            lastLogin: Date.now(),

            progress: getDefaultProgress(),

            whatsappId: sender,

            profilePicture: null

        });

        

        await saveAccounts();

        

        const token = generateToken();

        sessions.set(sender, {

            username: username,

            token: token,

            loginAt: Date.now()

        });

        await saveSessions();

        

        await client.sendMessage(remoteJid, { text: 

`✅ *COMPTE CRÉÉ AVEC SUCCÈS !*

━━━━━━━━━━━━━━━━━━━━

👤 *Pseudo :* ${username}

🕐 *Créé le :* ${new Date().toLocaleString()}

🎮 *Tu es automatiquement connecté !*

💡 *Commandes :*

• *account profile* - Voir ton profil

• *account save [jeu]* - Sauvegarder ta progression

• *account setpp [lien]* - Ajouter une photo de profil

━━━━━━━━━━━━━━━━━━━━

> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*` });

        return;

    }

    

    // ========== SE CONNECTER ==========

    if (subCommand === 'login') {

        const username = args[1];

        const password = args[2];

        

        if (!username || !password) {

            await client.sendMessage(remoteJid, { text: "❌ *Utilisation :* `account login [pseudo] [mot de passe]`" });

            return;

        }

        

        const account = accounts.get(username);

        if (!account) {

            await client.sendMessage(remoteJid, { text: "❌ *Compte inexistant !*" });

            return;

        }

        

        if (account.password !== hashPassword(password)) {

            await client.sendMessage(remoteJid, { text: "❌ *Mot de passe incorrect !*" });

            return;

        }

        

        const token = generateToken();

        sessions.set(sender, {

            username: username,

            token: token,

            loginAt: Date.now()

        });

        await saveSessions();

        

        account.lastLogin = Date.now();

        accounts.set(username, account);

        await saveAccounts();

        

        await client.sendMessage(remoteJid, { text: 

`✅ *CONNEXION RÉUSSIE !*

━━━━━━━━━━━━━━━━━━━━

👤 *Bienvenue ${username} !*

🕐 *Dernière connexion :* ${new Date(account.lastLogin).toLocaleString()}

📊 *Tes stats :*

• Prières : ${account.progress.pray?.total || 0}

• Série : ${account.progress.pray?.streak || 0}

• Jeux footquiz : ${account.progress.footquiz?.gamesPlayed || 0}

━━━━━━━━━━━━━━━━━━━━

> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*` });

        return;

    }

    

    // ========== SE DÉCONNECTER ==========

    if (subCommand === 'logout') {

        if (sessions.has(sender)) {

            sessions.delete(sender);

            await saveSessions();

            await client.sendMessage(remoteJid, { text: "✅ *Déconnexion réussie !*" });

        } else {

            await client.sendMessage(remoteJid, { text: "❌ *Tu n'es pas connecté !*" });

        }

        return;

    }

    

    // ========== VOIR SON PROFIL AVEC PHOTO ==========

    if (subCommand === 'profile' || subCommand === 'me') {

        const session = sessions.get(sender);

        if (!session) {

            await client.sendMessage(remoteJid, { text: "❌ *Tu dois d'abord te connecter !*" });

            return;

        }

        

        const account = accounts.get(session.username);

        if (!account) {

            await client.sendMessage(remoteJid, { text: "❌ *Compte introuvable !*" });

            return;

        }

        

        const prayProgress = account.progress.pray || {};

        const bibleProgress = account.progress.bible || {};

        const footquizProgress = account.progress.footquiz || {};

        const ttsProgress = account.progress.tts || {};

        const mailProgress = account.progress.mail || {};

        

        const profileText = 

`👤 *PROFIL UTILISATEUR*

━━━━━━━━━━━━━━━━━━━━

👤 *Pseudo :* ${account.username}

🕐 *Membre depuis :* ${new Date(account.createdAt).toLocaleDateString()}

📅 *Dernière connexion :* ${new Date(account.lastLogin).toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━

*🕊️ PRIÈRES :*

• Total : ${prayProgress.total || 0}

• Série actuelle : ${prayProgress.streak || 0}

━━━━━━━━━━━━━━━━━━━━

*📖 BIBLE :*

• Versets lus : ${bibleProgress.totalVerses || 0}

━━━━━━━━━━━━━━━━━━━━

*⚽ FOOTQUIZ :*

• Parties jouées : ${footquizProgress.gamesPlayed || 0}

• Meilleur score : ${footquizProgress.bestScore || 0}

━━━━━━━━━━━━━━━━━━━━

*🎮 TTS :*

• Parties jouées : ${ttsProgress.gamesPlayed || 0}

• Meilleur score : ${ttsProgress.bestScore || 0}

━━━━━━━━━━━━━━━━━━━━

*📧 MAIL :*

• Emails reçus : ${mailProgress.totalEmails || 0}

━━━━━━━━━━━━━━━━━━━━

> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*`;

        

        // Récupérer la photo de profil

        const profilePicPath = await getProfilePicture(session.username);

        

        if (profilePicPath) {

            try {

                const imageBuffer = await fs.readFile(profilePicPath);

                await client.sendMessage(remoteJid, {

                    image: imageBuffer,

                    caption: profileText

                });

            } catch (error) {

                console.error("Erreur envoi photo:", error.message);

                await client.sendMessage(remoteJid, { text: profileText });

            }

        } else {

            await client.sendMessage(remoteJid, { text: profileText });

        }

        return;

    }// PARTIE 4/4 - Save, Load, Setpp, Delete et Export

    //  ========== SAUVEGARDER AUTOMATIQUEMENT ==========

    if (subCommand === 'save') {

        const session = sessions.get(sender);

        if (!session) {

            await client.sendMessage(remoteJid, { text: "❌ *Tu dois d'abord te connecter !*" });

            return;

        }

        

        const game = args[1];

        

        if (!game) {

            await client.sendMessage(remoteJid, { text: "❌ *Utilisation :* `account save [jeu]`\n\nJeux disponibles : pray, bible, footquiz, tts, mail, box, vocal, fancy, anime" });

            return;

        }

        

        const validGames = ['pray', 'bible', 'footquiz', 'tts', 'mail', 'box', 'vocal', 'fancy', 'anime'];

        if (!validGames.includes(game)) {

            await client.sendMessage(remoteJid, { text: `❌ *Jeu "${game}" invalide !*` });

            return;

        }

        

        const success = await saveGameProgress(session.username, game);

        

        if (success) {

            const account = accounts.get(session.username);

            const progress = account.progress[game];

            

            let details = "";

            switch(game) {

                case 'pray':

                    details = `Total: ${progress?.total || 0} | Série: ${progress?.streak || 0}`;

                    break;

                case 'bible':

                    details = `Versets lus: ${progress?.totalVerses || 0}`;

                    break;

                case 'footquiz':

                    details = `Parties: ${progress?.gamesPlayed || 0} | Meilleur score: ${progress?.bestScore || 0}`;

                    break;

                case 'tts':

                    details = `Parties: ${progress?.gamesPlayed || 0} | Meilleur score: ${progress?.bestScore || 0}`;

                    break;

                case 'mail':

                    details = `Emails reçus: ${progress?.totalEmails || 0}`;

                    break;

                case 'box':

                    details = `Box ouvertes: ${progress?.boxesOpened || 0}`;

                    break;

                case 'vocal':

                    details = `Sons joués: ${progress?.soundsPlayed || 0}`;

                    break;

                case 'fancy':

                    details = `Textes générés: ${progress?.textsGenerated || 0}`;

                    break;

                case 'anime':

                    details = `Animes vus: ${progress?.animeWatched?.length || 0}`;

                    break;

            }

            

            await client.sendMessage(remoteJid, { text: `✅ *Progression sauvegardée pour ${game} !*\n\n📊 ${details}` });

        } else {

            await client.sendMessage(remoteJid, { text: "❌ *Erreur lors de la sauvegarde*" });

        }

        return;

    }

    

    // ========== CHARGER UNE PROGRESSION ==========

    if (subCommand === 'load') {

        const session = sessions.get(sender);

        if (!session) {

            await client.sendMessage(remoteJid, { text: "❌ *Tu dois d'abord te connecter !*" });

            return;

        }

        

        const game = args[1];

        

        if (!game) {

            await client.sendMessage(remoteJid, { text: "❌ *Utilisation :* `account load [jeu]`" });

            return;

        }

        

        const progress = getProgress(session.username, game);

        

        if (!progress || Object.keys(progress).length === 0) {

            await client.sendMessage(remoteJid, { text: `📭 *Aucune progression sauvegardée pour ${game}*` });

            return;

        }

        

        let progressText = "";

        switch(game) {

            case 'pray':

                progressText = `📊 *PROGRESSION PRAY*\n\n• Total prières : ${progress.total || 0}\n• Série actuelle : ${progress.streak || 0}\n• Dernière prière : ${progress.lastPray || 'Jamais'}`;

                break;

            case 'bible':

                progressText = `📊 *PROGRESSION BIBLE*\n\n• Versets lus : ${progress.totalVerses || 0}\n• Dernier verset : ${progress.lastVerse || 'Jamais'}`;

                break;

            case 'footquiz':

                progressText = `📊 *PROGRESSION FOOTQUIZ*\n\n• Parties jouées : ${progress.gamesPlayed || 0}\n• Score total : ${progress.score || 0}\n• Meilleur score : ${progress.bestScore || 0}`;

                break;

            case 'tts':

                progressText = `📊 *PROGRESSION TTS*\n\n• Parties jouées : ${progress.gamesPlayed || 0}\n• Score total : ${progress.score || 0}\n• Meilleur score : ${progress.bestScore || 0}`;

                break;

            case 'mail':

                progressText = `📊 *PROGRESSION MAIL*\n\n• Emails reçus : ${progress.totalEmails || 0}\n• Dernier email : ${progress.lastEmail || 'Jamais'}`;

                break;

            case 'box':

                progressText = `📊 *PROGRESSION BOX*\n\n• Box ouvertes : ${progress.boxesOpened || 0}`;

                break;

            case 'vocal':

                progressText = `📊 *PROGRESSION VOCAL*\n\n• Sons joués : ${progress.soundsPlayed || 0}`;

                break;

            case 'fancy':

                progressText = `📊 *PROGRESSION FANCY*\n\n• Textes générés : ${progress.textsGenerated || 0}`;

                break;

            case 'anime':

                progressText = `📊 *PROGRESSION ANIME*\n\n• Animes vus : ${progress.animeWatched?.length || 0}`;

                break;

        }

        

        await client.sendMessage(remoteJid, { text: `${progressText}\n\n━━━━━━━━━━━━━━━━━━━━\n> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*` });

        return;

    }

    

    // ========== CHANGER PHOTO DE PROFIL (VIA LIEN) ==========

    if (subCommand === 'setpp') {

        const session = sessions.get(sender);

        if (!session) {

            await client.sendMessage(remoteJid, { text: "❌ *Tu dois d'abord te connecter !*" });

            return;

        }

        

        const imageUrl = args[1];

        

        if (!imageUrl) {

            await client.sendMessage(remoteJid, { text: 

`❌ *Utilisation :* \`account setpp [lien de l'image]\`

📝 *Exemple :*

\`account setpp https://files.catbox.moe/onpl3h.jpg\`

💡 *Pour obtenir un lien :*

1. Envoie ton image

2. Tape \`.geturl\` en réponse à l'image

━━━━━━━━━━━━━━━━━━━━

> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*` });

            return;

        }

        

        try {

            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

            const imageBuffer = Buffer.from(response.data);

            

            const success = await saveProfilePicture(session.username, imageBuffer);

            

            if (success) {

                await client.sendMessage(remoteJid, { text: "✅ *Photo de profil mise à jour !*\n\nUtilise `account profile` pour la voir." });

            } else {

                await client.sendMessage(remoteJid, { text: "❌ *Erreur lors de la mise à jour*" });

            }

        } catch (error) {

            await client.sendMessage(remoteJid, { text: "❌ *Lien invalide ou image introuvable !*\n\nVérifie que le lien pointe bien vers une image." });

        }

        return;

    }

    

    // ========== SUPPRIMER SON COMPTE ==========

    if (subCommand === 'delete' || subCommand === 'del') {

        const session = sessions.get(sender);

        if (!session) {

            await client.sendMessage(remoteJid, { text: "❌ *Tu n'es pas connecté !*" });

            return;

        }

        

        const confirm = args[1]?.toLowerCase();

        

        if (confirm !== 'confirm') {

            await client.sendMessage(remoteJid, { text: 

`⚠️ *SUPPRESSION DE COMPTE*

━━━━━━━━━━━━━━━━━━━━

Tu es sur le point de supprimer définitivement ton compte *${session.username}*.

⚠️ *Cette action est irréversible !*

Pour confirmer, tape :

\`account delete confirm\`

━━━━━━━━━━━━━━━━━━━━

> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*` });

            return;

        }

        

        accounts.delete(session.username);

        sessions.delete(sender);

        await saveAccounts();

        await saveSessions();

        

        await client.sendMessage(remoteJid, { text: 

`🗑️ *COMPTE SUPPRIMÉ*

━━━━━━━━━━━━━━━━━━━━

👤 *${session.username}* a été supprimé définitivement.

Tu peux recréer un compte avec \`account register\`

━━━━━━━━━━━━━━━━━━━━

> *© 𝐌𝐫 𝐒𝐀𝐊𝐀𝐌𝐎𝐓𝐎 🍒*` });

        return;

    }

    

    await client.sendMessage(remoteJid, { text: "❌ *Commande invalide !*\n\nUtilise `account help` pour voir les commandes." });

}

export default accountCommand;

export { saveGameProgress, getProgress, autoSaveProgress };
