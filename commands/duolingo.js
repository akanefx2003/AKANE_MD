// commands/duolingo.js

// @cat: jeu et autres

// Apprendre les langues façon Duolingo - Version complète

import fs from 'fs';

import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

const USER_DATA_FILE = path.join(DATA_DIR, 'duolingo_users.json');

const RANKING_FILE = path.join(DATA_DIR, 'duolingo_ranking.json');

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const CHANNEL_NAME = '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹';

// Langues disponibles

const languages = {

    anglais: { name: "Anglais", code: "en", flag: "🇬🇧" },

    espagnol: { name: "Espagnol", code: "es", flag: "🇪🇸" },

    francais: { name: "Français", code: "fr", flag: "🇫🇷" },

    allemand: { name: "Allemand", code: "de", flag: "🇩🇪" },

    italien: { name: "Italien", code: "it", flag: "🇮🇹" },

    portugais: { name: "Portugais", code: "pt", flag: "🇵🇹" },

    arabe: { name: "Arabe", code: "ar", flag: "🇸🇦" },

    japonais: { name: "Japonais", code: "ja", flag: "🇯🇵" },

    coreen: { name: "Coréen", code: "ko", flag: "🇰🇷" },

    chinois: { name: "Chinois", code: "zh", flag: "🇨🇳" }

};

// Leçons par langue

const lessons = {

    anglais: [

        { id: 1, question: "Comment dit-on 'Bonjour' en anglais ?", answer: "HELLO", options: ["HELLO", "GOODBYE", "THANKS", "PLEASE"] },

        { id: 2, question: "Traduis 'Chat' en anglais", answer: "CAT", options: ["DOG", "CAT", "BIRD", "FISH"] },

        { id: 3, question: "Que signifie 'Thank you' ?", answer: "MERCI", options: ["S'IL VOUS PLAÎT", "MERCI", "DE RIEN", "BONJOUR"] },

        { id: 4, question: "Comment dit-on 'Maison' en anglais ?", answer: "HOUSE", options: ["HOME", "HOUSE", "ROOM", "BUILDING"] },

        { id: 5, question: "Traduis 'Je t'aime'", answer: "I LOVE YOU", options: ["I LIKE YOU", "I LOVE YOU", "I HATE YOU", "I MISS YOU"] },

        { id: 6, question: "Que signifie 'Friend' ?", answer: "AMI", options: ["AMI", "ENNEMI", "FRÈRE", "SOEUR"] },

        { id: 7, question: "Comment dit-on 'Eau' en anglais ?", answer: "WATER", options: ["WATER", "FIRE", "EARTH", "AIR"] },

        { id: 8, question: "Traduis 'Soleil'", answer: "SUN", options: ["SUN", "MOON", "STAR", "SKY"] },

        { id: 9, question: "Que signifie 'Beautiful' ?", answer: "BEAU", options: ["BEAU", "LAID", "GRAND", "PETIT"] },

        { id: 10, question: "Comment dit-on 'Merci' en anglais ?", answer: "THANK YOU", options: ["THANK YOU", "PLEASE", "SORRY", "HELLO"] }

    ],

    espagnol: [

        { id: 1, question: "Comment dit-on 'Bonjour' en espagnol ?", answer: "HOLA", options: ["HOLA", "ADIOS", "GRACIAS", "POR FAVOR"] },

        { id: 2, question: "Que signifie 'Gracias' ?", answer: "MERCI", options: ["MERCI", "S'IL VOUS PLAÎT", "DE RIEN", "BONJOUR"] },

        { id: 3, question: "Comment dit-on 'Merci' en espagnol ?", answer: "GRACIAS", options: ["POR FAVOR", "GRACIAS", "LO SIENTO", "DE NADA"] },

        { id: 4, question: "Que signifie 'Amigo' ?", answer: "AMI", options: ["ENNEMI", "AMI", "FRÈRE", "SOEUR"] },

        { id: 5, question: "Traduis 'Je m'appelle'", answer: "ME LLAMO", options: ["ME LLAMO", "TE LLAMAS", "SE LLAMA", "NOS LLAMAMOS"] },

        { id: 6, question: "Comment dit-on 'Au revoir' ?", answer: "ADIOS", options: ["HOLA", "ADIOS", "BUENAS", "NOCHE"] },

        { id: 7, question: "Que signifie 'Por favor' ?", answer: "S'IL VOUS PLAÎT", options: ["MERCI", "S'IL VOUS PLAÎT", "DE RIEN", "DÉSOLÉ"] },

        { id: 8, question: "Comment dit-on 'Nuit' ?", answer: "NOCHE", options: ["DIA", "NOCHE", "TARDE", "MANANA"] },

        { id: 9, question: "Traduis 'Le chien'", answer: "EL PERRO", options: ["EL GATO", "EL PERRO", "EL RATON", "EL PAJARO"] },

        { id: 10, question: "Que signifie 'Buenos dias' ?", answer: "BONJOUR", options: ["BONSOIR", "BONJOUR", "BONNE NUIT", "AU REVOIR"] }

    ]

};

// Ajouter des leçons pour les autres langues

const defaultLessons = [

    { id: 1, question: "Première leçon - Traduis ce mot", answer: "BRAVO", options: ["BRAVO", "BIEN", "SUPER", "GENIAL"] },

    { id: 2, question: "Deuxième leçon - Continue comme ça", answer: "CONTINUE", options: ["CONTINUE", "ARRETE", "RECOMMENCE", "PASSE"] },

    { id: 3, question: "Troisième leçon - Bon travail", answer: "EXCELLENT", options: ["EXCELLENT", "MOYEN", "FAIBLE", "NUL"] },

    { id: 4, question: "Quatrième leçon - Garde le rythme", answer: "RYTHME", options: ["RYTHME", "CADENCE", "VITESSE", "LENTEUR"] }

];

for (const lang of Object.keys(languages)) {

    if (!lessons[lang]) {

        lessons[lang] = [...defaultLessons];

    }

}

// Boutique

const shopItems = {

    hearts: [

        { id: 1, name: "5 cœurs", price: 50, hearts: 5 },

        { id: 2, name: "10 cœurs", price: 90, hearts: 10 },

        { id: 3, name: "20 cœurs", price: 150, hearts: 20 },

        { id: 4, name: "50 cœurs", price: 300, hearts: 50 }

    ],

    boosts: [

        { id: 5, name: "Double XP (1 heure)", price: 100, boost: "double_xp", duration: 3600 },

        { id: 6, name: "Protection de série (1 jour)", price: 80, boost: "streak_protect", duration: 86400 },

        { id: 7, name: "Rétablir série", price: 100, boost: "restore_streak" },

        { id: 8, name: "Freeze de série", price: 50, boost: "streak_freeze" }

    ],

    special: [

        { id: 9, name: "Légendaire", price: 500, hearts: 100, xp: 500 },

        { id: 10, name: "Pack Or", price: 1000, hearts: 200, xp: 1000, coins: 200 },

        { id: 11, name: "Pack Diamant", price: 2000, hearts: 500, xp: 2500, coins: 500 },

        { id: 12, name: "Abonnement Premium (30 jours)", price: 5000, premium: true, duration: 30 }

    ]

};

// Stockage

let users = new Map();

let ranking = [];

// Charger les données

function loadData() {

    try {

        if (fs.existsSync(USER_DATA_FILE)) {

            const data = fs.readFileSync(USER_DATA_FILE, 'utf-8');

            const parsed = JSON.parse(data);

            users = new Map(Object.entries(parsed));

            console.log(`📚 ${users.size} utilisateurs Duolingo chargés`);

        }

        if (fs.existsSync(RANKING_FILE)) {

            const data = fs.readFileSync(RANKING_FILE, 'utf-8');

            ranking = JSON.parse(data);

            console.log(`🏆 Classement chargé`);

        }

    } catch (error) {

        console.error("Erreur chargement:", error.message);

    }

}

function saveData() {

    try {

        const dir = path.dirname(USER_DATA_FILE);

        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const obj = Object.fromEntries(users);

        fs.writeFileSync(USER_DATA_FILE, JSON.stringify(obj, null, 2));

        

        // Mettre à jour le classement

        updateRanking();

        fs.writeFileSync(RANKING_FILE, JSON.stringify(ranking, null, 2));

    } catch (error) {

        console.error("Erreur sauvegarde:", error.message);

    }

}

// Mettre à jour le classement

function updateRanking() {

    ranking = Array.from(users.entries())

        .map(([id, user]) => ({

            id: id,

            name: user.name,

            xp: user.xp,

            level: user.level,

            streak: user.streak,

            language: user.language

        }))

        .sort((a, b) => b.xp - a.xp)

        .slice(0, 50);

}

// Créer un nouvel utilisateur

function createUser(userId, userName) {

    return {

        id: userId,

        name: userName,

        language: "anglais",

        level: 1,

        xp: 0,

        hearts: 5,

        coins: 100,

        streak: 0,

        bestStreak: 0,

        lastLesson: null,

        lastLogin: Date.now(),

        lessonsCompleted: [],

        currentLesson: null,

        dailyRewardClaimed: false,

        premium: false,

        premiumUntil: null,

        boosts: [],

        xpMultiplier: 1,

        xpMultiplierUntil: null,

        streakProtect: false,

        streakProtectUntil: null,

        totalQuestions: 0,

        correctAnswers: 0,

        winRate: 0

    };

}

// Obtenir la récompense quotidienne

function getDailyReward(streak) {

    if (streak === 0) return { coins: 10, hearts: 1, xp: 5 };

    if (streak >= 100) return { coins: 200, hearts: 10, xp: 100, special: "🏆" };

    if (streak >= 50) return { coins: 100, hearts: 8, xp: 75 };

    if (streak >= 30) return { coins: 75, hearts: 5, xp: 50 };

    if (streak >= 14) return { coins: 50, hearts: 3, xp: 30 };

    if (streak >= 7) return { coins: 30, hearts: 2, xp: 20 };

    return { coins: 15 + Math.floor(streak / 7) * 5, hearts: 1, xp: 10 + streak };

}

// Vérifier la série quotidienne

function checkStreak(user) {

    const now = new Date();

    const today = now.toDateString();

    const lastLessonDate = user.lastLesson ? new Date(user.lastLesson).toDateString() : null;

    

    if (lastLessonDate === today) return user.streak;

    

    // Vérifier le freeze de série
const hasFreeze = user.boosts?.some(b => b.type === 'streak_freeze' && b.active) ?? false;

    if (hasFreeze) {

        user.boosts = user.boosts.filter(b => !(b.type === 'streak_freeze' && b.active));

        saveData();

        return user.streak;

    }

    

    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayStr = yesterday.toDateString();

    

    if (lastLessonDate === yesterdayStr) {

        user.streak++;

        if (user.streak > user.bestStreak) user.bestStreak = user.streak;

    } else if (lastLessonDate !== today) {

        if (user.streakProtect && user.streakProtectUntil > Date.now()) {

            // Série protégée

        } else {

            user.streak = 0;

        }

    }

    

    return user.streak;

}

// Générer une question aléatoire

function getRandomQuestion(language, difficulty = 'normal') {

    const langLessons = lessons[language] || lessons.anglais;

    return langLessons[Math.floor(Math.random() * langLessons.length)];

}

// IA pour le match

function getAIResponse(question, userLevel) {

    // L'IA répond correctement selon la difficulté basée sur le niveau de l'utilisateur

    const aiLevel = Math.min(5, Math.max(1, Math.floor(userLevel / 2) + 1));

    const baseChance = 0.7 + (aiLevel * 0.05);

    const isCorrect = Math.random() < baseChance;

    

    if (isCorrect) {

        const correctIndex = question.options.findIndex(opt => opt.toUpperCase() === question.answer);

        return { isCorrect: true, answerIndex: correctIndex, answer: question.answer };

    } else {

        const wrongOptions = question.options.filter(opt => opt.toUpperCase() !== question.answer);

        const wrongIndex = question.options.findIndex(opt => opt === wrongOptions[Math.floor(Math.random() * wrongOptions.length)]);

        return { isCorrect: false, answerIndex: wrongIndex, answer: question.options[wrongIndex] };

    }

}// PARTIE 2/5 - Commandes principales (Profil, Daily, Languages)

async function duolingoCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;

    const sender = message.key.participant || message.key.remoteJid;

    const senderName = message.pushName || sender.split('@')[0];

    const subCommand = args[0]?.toLowerCase();

    

    loadData();

    

    let user = users.get(sender);

    if (!user) {

        user = createUser(sender, senderName);

        users.set(sender, user);

        saveData();

    }

    

    // Vérifier la série

    const currentStreak = checkStreak(user);

    if (currentStreak !== user.streak) {

        user.streak = currentStreak;

        saveData();

    }

    

    // Vérifier les boosts expirés

    const now = Date.now();

    if (user.xpMultiplierUntil && user.xpMultiplierUntil < now) {

        user.xpMultiplier = 1;

        user.xpMultiplierUntil = null;

    }

    if (user.streakProtectUntil && user.streakProtectUntil < now) {

        user.streakProtect = false;

        user.streakProtectUntil = null;

    }

    if (user.premiumUntil && user.premiumUntil < now) {

        user.premium = false;

        user.premiumUntil = null;

    }

    

    // ========== HELP ==========

    if (!subCommand || subCommand === 'help') {

        const helpText = 

`🦉 *DUOLINGO*

━━━━━━━━━━━━━━━━━━━━

📝 *COMMANDES :*

• *duo* - Voir ton profil

• *duo learn* - Faire une leçon

• *duo language [langue]* - Changer de langue

• *duo languages* - Voir les langues disponibles

• *duo daily* - Réclamer la récompense quotidienne

• *duo shop* - Voir la boutique

• *duo buy [id]* - Acheter un article

• *duo stats* - Voir tes statistiques

• *duo match* - Affronter l'IA

• *duo ranking* - Voir le classement

• *duo gift [id] [montant]* - Envoyer des pièces

• *duo premium* - Infos premium

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: helpText });

        return;

    }

    

    // ========== PROFIL ==========

    if (subCommand === 'profile' || !subCommand) {

        const langInfo = languages[user.language];

        const nextLevelXp = user.level * 100;

        const progress = Math.floor((user.xp % 100) / 100 * 10);

        const progressBar = "▓".repeat(progress) + "░".repeat(10 - progress);

        const winRate = user.totalQuestions > 0 ? Math.floor((user.correctAnswers / user.totalQuestions) * 100) : 0;

        

        const profileText = 

`🦉 *DUOLINGO - ${user.name.toUpperCase()}*

━━━━━━━━━━━━━━━━━━━━

*${langInfo.flag} LANGUE :* ${langInfo.name}

*📊 NIVEAU :* ${user.level}

*📈 XP :* ${user.xp}/${nextLevelXp}

*📊 PROGRÈS :* [${progressBar}]

━━━━━━━━━━━━━━━━━━━━

*❤️ CŒURS :* ${'❤️'.repeat(Math.min(user.hearts, 5))}${'🖤'.repeat(Math.max(0, 5 - user.hearts))}

*💰 PIÈCES :* ${user.coins} 🪙

*🔥 SÉRIE :* ${user.streak} jours (max: ${user.bestStreak})

*🎯 PRÉCISION :* ${winRate}%

━━━━━━━━━━━━━━━━━━━━

*${user.premium ? '👑 PREMIUM ACTIF' : '⭐ COMPTE GRATUIT'}*

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: profileText });

        return;

    }    // ========== RÉCOMPENSE QUOTIDIENNE ==========

    if (subCommand === 'daily') {

        const now = new Date();

        const today = now.toDateString();

        const lastClaim = user.lastLogin ? new Date(user.lastLogin).toDateString() : null;

        

        if (lastClaim === today && user.dailyRewardClaimed) {

            await client.sendMessage(remoteJid, { text: "⏰ *Récompense déjà réclamée aujourd'hui !*\n\nReviens demain pour une nouvelle récompense !" });

            return;

        }

        

        const reward = getDailyReward(user.streak);

        user.coins += reward.coins;

        user.hearts = Math.min(user.hearts + reward.hearts, 5);

        user.xp += reward.xp;

        user.lastLogin = Date.now();

        user.dailyRewardClaimed = true;

        

        if (user.xp >= user.level * 100) {

            user.level++;

            await client.sendMessage(remoteJid, { text: `🎉 *FÉLICITATIONS !* 🎉\n\nTu es passé au niveau ${user.level} !` });

        }

        

        saveData();

        

        await client.sendMessage(remoteJid, { text: 

`🎁 *RÉCOMPENSE QUOTIDIENNE !*

━━━━━━━━━━━━━━━━━━━━

🔥 *Série :* ${user.streak} jours

💰 *+${reward.coins} pièces* 🪙

❤️ *+${reward.hearts} cœurs* 

📈 *+${reward.xp} XP*

${reward.special ? `✨ *${reward.special} SPÉCIAL !* ✨` : ''}

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWA🌹*` });

        return;

    }

    

    // ========== CHANGER DE LANGUE ==========

    if (subCommand === 'language') {

        const newLang = args[1]?.toLowerCase();

        

        if (!newLang || !languages[newLang]) {

            const langList = Object.keys(languages).map(l => `• *${l}* ${languages[l].flag}`).join('\n');

            await client.sendMessage(remoteJid, { text: 

`🌍 *LANGUES DISPONIBLES*

━━━━━━━━━━━━━━━━━━━━

${langList}

━━━━━━━━━━━━━━━━━━━━

💡 *Utilisation :* \`duo language [nom]\`

Exemple : \`duo language anglais\`` });

            return;

        }

        

        user.language = newLang;

        saveData();

        

        await client.sendMessage(remoteJid, { text: `✅ *Langue changée !*\n\nTu apprends maintenant *${languages[newLang].name}* ${languages[newLang].flag}` });

        return;

    }

    

    // ========== VOIR LANGUES ==========

    if (subCommand === 'languages') {

        let langText = `🌍 *LANGUES DISPONIBLES*\n\n━━━━━━━━━━━━━━━━━━━━\n`;

        for (const [key, lang] of Object.entries(languages)) {

            langText += `• *${key}* ${lang.flag} - ${lang.name}\n`;

        }

        langText += `\n━━━━━━━━━━━━━━━━━━━━\n💡 *Changer :* \`duo language [nom]\``;

        

        await client.sendMessage(remoteJid, { text: langText });

        return;

    }

    

    // ========== STATISTIQUES ==========

    if (subCommand === 'stats') {

        const completedCount = user.lessonsCompleted.length;

        const langInfo = languages[user.language];

        const winRate = user.totalQuestions > 0 ? Math.floor((user.correctAnswers / user.totalQuestions) * 100) : 0;

        

        await client.sendMessage(remoteJid, { text: 

`📊 *STATISTIQUES DUOLINGO*

━━━━━━━━━━━━━━━━━━━━

*👤 UTILISATEUR :* ${user.name}

*${langInfo.flag} LANGUE :* ${langInfo.name}

*📊 NIVEAU :* ${user.level}

*📈 XP TOTAL :* ${user.xp}

*❤️ CŒURS :* ${user.hearts}

*💰 PIÈCES :* ${user.coins}

*🔥 SÉRIE :* ${user.streak} jours (max: ${user.bestStreak})

*📚 LEÇONS :* ${completedCount}

*🎯 PRÉCISION :* ${winRate}%

*✅ BONNES RÉPONSES :* ${user.correctAnswers}

*❌ MAUVAISES :* ${user.totalQuestions - user.correctAnswers}

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWA🌹*` });

        return;

    }// PARTIE 3/5 - Boutique et Achats

    // ========== BOUTIQUE ==========

    if (subCommand === 'shop') {

        let shopText = 

`🛒 *BOUTIQUE DUOLINGO*

━━━━━━━━━━━━━━━━━━━━

💰 *Tes pièces :* ${user.coins} 🪙

━━━━━━━━━━━━━━━━━━━━

*❤️ CŒURS :*

`;

        for (const item of shopItems.hearts) {

            shopText += `${item.id}. *${item.name}* - ${item.price} 🪙\n`;

        }

        

        shopText += `\n*⚡ BOOSTS :*\n`;

        for (const item of shopItems.boosts) {

            shopText += `${item.id}. *${item.name}* - ${item.price} 🪙\n`;

        }

        

        shopText += `\n*💎 SPÉCIAUX :*\n`;

        for (const item of shopItems.special) {

            shopText += `${item.id}. *${item.name}* - ${item.price} 🪙\n`;

        }

        

        shopText += `\n━━━━━━━━━━━━━━━━━━━━

💡 *Acheter :* \`duo buy [id]\`

Exemple : \`duo buy 1\` (5 cœurs)

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: shopText });

        return;

    }

    

    // ========== ACHETER ==========

    if (subCommand === 'buy') {

        const itemId = parseInt(args[1]);

        

        if (isNaN(itemId)) {

            await client.sendMessage(remoteJid, { text: "❌ *Utilisation :* `duo buy [id]`\n\nVoir `duo shop` pour les IDs." });

            return;

        }

        

        let item = null;

        let category = null;

        

        for (const cat of ['hearts', 'boosts', 'special']) {

            const found = shopItems[cat].find(i => i.id === itemId);

            if (found) {

                item = found;

                category = cat;

                break;

            }

        }

        

        if (!item) {

            await client.sendMessage(remoteJid, { text: "❌ *Article invalide !*\n\nVoir `duo shop` pour la liste." });

            return;

        }

        

        if (user.coins < item.price) {

            await client.sendMessage(remoteJid, { text: `❌ *Pas assez de pièces !*\n\n💰 Tu as ${user.coins} pièces, il te manque ${item.price - user.coins} pièces.` });

            return;

        }

        

        user.coins -= item.price;

        let message = "";

        

        if (category === 'hearts') {

            user.hearts = Math.min(user.hearts + item.hearts, 99);

            message = `✅ *Tu as acheté ${item.name} !*\n\n❤️ +${item.hearts} cœurs`;

        } else if (category === 'boosts') {

            if (item.boost === 'double_xp') {

                user.xpMultiplier = 2;

                user.xpMultiplierUntil = Date.now() + (item.duration * 1000);

                message = `✅ *Tu as acheté ${item.name} !*\n\n⚡ XP doublé pendant 1 heure !`;

            } else if (item.boost === 'streak_protect') {

                user.streakProtect = true;

                user.streakProtectUntil = Date.now() + (item.duration * 1000);

                message = `✅ *Tu as acheté ${item.name} !*\n\n🛡️ Ta série est protégée pendant 24h !`;

            } else if (item.boost === 'restore_streak') {

                if (user.streak === 0) user.streak = 1;

                message = `✅ *Tu as acheté ${item.name} !*\n\n🔥 Ta série a été rétablie à ${user.streak} jours !`;

            } else if (item.boost === 'streak_freeze') {

                user.boosts.push({ type: 'streak_freeze', active: true });

                message = `✅ *Tu as acheté ${item.name} !*\n\n❄️ Ta prochaine journée manquée ne cassera pas ta série !`;

            }

        } else if (category === 'special') {

            if (item.hearts) user.hearts = Math.min(user.hearts + item.hearts, 999);

            if (item.xp) user.xp += item.xp;

            if (item.coins) user.coins += item.coins;

            if (item.premium) {

                user.premium = true;

                user.premiumUntil = Date.now() + (item.duration * 24 * 60 * 60 * 1000);

                message = `✅ *Tu as acheté ${item.name} !*\n\n👑 Tu es maintenant PREMIUM pour ${item.duration} jours !`;

            } else {

                message = `✅ *Tu as acheté ${item.name} !*\n\n❤️ +${item.hearts || 0} cœurs\n📈 +${item.xp || 0} XP\n💰 +${item.coins || 0} pièces`;

            }

        }

        

        // Monter de niveau

        if (user.xp >= user.level * 100) {

            user.level++;

            message += `\n\n🎉 *FÉLICITATIONS ! NIVEAU ${user.level} !* 🎉`;

        }

        

        saveData();

        

        await client.sendMessage(remoteJid, { text: 

`${message}

━━━━━━━━━━━━━━━━━━━━

❤️ *Cœurs :* ${user.hearts}

💰 *Pièces restantes :* ${user.coins}

🔥 *Série :* ${user.streak} jours

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWA🌹*` });

        return;

    }

    

    // ========== CLASSEMENT ==========

    if (subCommand === 'ranking' || subCommand === 'rank') {

        if (ranking.length === 0) {

            await client.sendMessage(remoteJid, { text: "📭 *Aucun classement disponible pour le moment.*" });

            return;

        }

        

        let rankText = `🏆 *CLASSEMENT DUOLINGO*\n\n━━━━━━━━━━━━━━━━━━━━\n`;

        

        for (let i = 0; i < Math.min(ranking.length, 20); i++) {

            const r = ranking[i];

            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}.`;

            const langFlag = languages[r.language]?.flag || "🌍";

            rankText += `${medal} *${r.name}* ${langFlag}\n`;

            rankText += `   📊 Niv.${r.level} | ${r.xp} XP | 🔥${r.streak}j\n\n`;

        }

        

        // Position de l'utilisateur

        const userRank = ranking.findIndex(r => r.id === sender) + 1;

        if (userRank > 0) {

            rankText += `━━━━━━━━━━━━━━━━━━━━\n📍 *TA POSITION :* #${userRank}\n`;

        }

        

        rankText += `\n━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: rankText });

        return;

    }

    

    // ========== ENVOYER DES PIÈCES ==========

    if (subCommand === 'gift') {

        const targetId = args[1]?.replace('@', '') + '@s.whatsapp.net';

        const amount = parseInt(args[2]);

        

        if (!targetId || isNaN(amount) || amount <= 0) {

            await client.sendMessage(remoteJid, { text: "❌ *Utilisation :* `duo gift [@user] [montant]`\n\nExemple : `duo gift @jean 50`" });

            return;

        }

        

        const targetUser = users.get(targetId);

        if (!targetUser) {

            await client.sendMessage(remoteJid, { text: "❌ *Utilisateur non trouvé !*" });

            return;

        }

        

        if (user.coins < amount) {

            await client.sendMessage(remoteJid, { text: `❌ *Pas assez de pièces !*\n\n💰 Tu as ${user.coins} pièces.` });

            return;

        }

        

        user.coins -= amount;

        targetUser.coins += amount;

        saveData();

        

        await client.sendMessage(remoteJid, { text: 

`🎁 *CADEAU ENVOYÉ !*

━━━━━━━━━━━━━━━━━━━━

👤 *De :* ${user.name}

👤 *À :* ${targetUser.name}

💰 *Montant :* ${amount} 🪙

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWA🌹*` });

        return;

    }

    

    // ========== PREMIUM INFO ==========

    if (subCommand === 'premium') {

        const premiumText = 

`👑 *DUOLINGO PREMIUM*

━━━━━━━━━━━━━━━━━━━━

*AVANTAGES PREMIUM :*

• ✨ XP doublé en permanence

• ❤️ Cœurs illimités

• 🎁 Récompenses spéciales

• 🏆 Badges exclusifs

• 🔥 Protection de série automatique

• 💰 500 pièces offertes par mois

━━━━━━━━━━━━━━━━━━━━

*PRIX :* 5000 pièces pour 30 jours

━━━━━━━━━━━━━━━━━━━━

💡 *Acheter :* \`duo buy 12\`

━━━━━━━━━━━━━━━━━━━━

📢 *REJOINS MA CHAÎNE* 🔥

*${CHANNEL_NAME}*

${CHANNEL_LINK}

> *DEV : AKANE KUROGAWA🌹*`;

        

        await client.sendMessage(remoteJid, { text: premiumText });

        return;

    }// PARTIE 4/5 - Match contre IA et Learn