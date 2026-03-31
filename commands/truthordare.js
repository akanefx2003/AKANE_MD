// commands/truthordare.js

// @cat: jeu et autres

// Jeu Action ou Vérité

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbBzhyQ4NVisPH1NSe1R';

const CHANNEL_NAME = '🍁𝐃𝐎̈𝐎̃𝐌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌹';

// Questions Vérité

const truthQuestions = [

    "Quel est ton plus grand secret ?",

    "Qui est ton crush secret ?",

    "Quelle est la chose la plus embarrassante qui t'est arrivée ?",

    "As-tu déjà menti à un ami proche ?",

    "Quelle est ta plus grande peur ?",

    "Qui est la personne que tu admires le plus ?",

    "As-tu déjà triché à un examen ?",

    "Quel est le mensonge le plus gros que tu aies dit ?",
    
    "Est ce que tu regardes du hentail",
    
    "Est tu vierge",
    
    "Qui est ton/ta première amour",
    
    "ES ce que tu es pervers",
    
    "ES ce que tu veux sortir avec moi",

    "Quelle est ta plus grande honte ?",

    "As-tu déjà eu un coup de foudre ?",

    "Quelle est la chose que tu regrettes le plus ?",

    "As-tu déjà pleuré devant un film ?"

];

// Actions Défi

const dareActions = [

    "Fais 10 pompes maintenant !",

    "Chante le refrain d'une chanson connue",

    "Envoie un message mignon à un ami",

    "Fais une danse et envoie la vidéo",

    "Poste une photo de toi en train de faire une grimace",

    "Raconte une blague",

    "Fais le cri de ton animal préféré",
    
    "Envoi une photo de toi pervers",
    
    "Envoi une photo de toi embrassante",

    "Imite une célébrité",

    "Fais un compliment à la personne à côté de toi",

    "Montre ta photo la plus drôle",

    "Fais le singe",

    "Dit moi je t'aime"

];

// Stockage des parties

const games = new Map();// PARTIE 2/5 - Classe du jeu

class TruthOrDareGame {

    constructor(creatorId, creatorName, chatId) {

        this.creator = { id: creatorId, name: creatorName };

        this.players = new Map();

        this.chatId = chatId;

        this.gameActive = true;

        this.currentTurn = null;

        this.waitingForChoice = false;

        this.timeout = null;

        this.questionsAsked = [];

        this.actionsGiven = [];

        this.turnOrder = [];

    }

    addPlayer(id, name) {

        if (this.players.size >= 6) return false;

        if (this.players.has(id)) return false;

        

        this.players.set(id, { name });

        this.turnOrder.push(id);

        return true;

    }

    getNextPlayer() {

        if (this.turnOrder.length === 0) return null;

        if (!this.currentTurn) return this.turnOrder[0];

        

        const currentIndex = this.turnOrder.indexOf(this.currentTurn);

        const nextIndex = (currentIndex + 1) % this.turnOrder.length;

        return this.turnOrder[nextIndex];

    }

    getRandomTruth() {

        const available = truthQuestions.filter(q => !this.questionsAsked.includes(q));

        if (available.length === 0) {

            this.questionsAsked = [];

            return truthQuestions[Math.floor(Math.random() * truthQuestions.length)];

        }

        const question = available[Math.floor(Math.random() * available.length)];

        this.questionsAsked.push(question);

        return question;

    }

    getRandomDare() {

        const available = dareActions.filter(a => !this.actionsGiven.includes(a));

        if (available.length === 0) {

            this.actionsGiven = [];

            return dareActions[Math.floor(Math.random() * dareActions.length)];

        }

        const action = available[Math.floor(Math.random() * available.length)];

        this.actionsGiven.push(action);

        return action;

    }

    getGameState() {

        let playersList = "";

        for (const [id, player] of this.players) {

            playersList += `• ${player.name}\n`;

        }

        

        let turnText = "";

        if (this.currentTurn) {

            const player = this.players.get(this.currentTurn);

            turnText = `\n🎯 Tour : ${player.name}\n📌 Choisis : vérité ou action\n`;

        }

        

        return `🎲 ACTION OU VÉRITÉ

━━━━━━━━━━━━━━━━━━━━

👥 Joueurs (${this.players.size}/6) :

${playersList}${turnText}

━━━━━━━━━━━━━━━━━━━━

📢 REJOINS MA CHAÎNE 🔥

${CHANNEL_NAME}

${CHANNEL_LINK}

> *DEV : _© 𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀 🍒_*`;

    }

}// PARTIE 3/5 - Gestion des réponses

async function handleTruthOrDareResponse(client, message, messageBody) {

    const remoteJid = message.key.remoteJid;

    const sender = message.key.participant || message.key.remoteJid;

    const senderName = message.pushName || sender.split('@')[0];

    const lowerMessage = messageBody.toLowerCase();

    

    let activeGame = null;

    for (const [id, game] of games) {

        if (game.chatId === remoteJid && game.gameActive) {

            activeGame = game;

            break;

        }

    }

    

    if (!activeGame) return false;

    

    // Choix vérité ou action

    if (activeGame.waitingForChoice && activeGame.currentTurn === sender && 

        (lowerMessage === 'vérité' || lowerMessage === 'verite' || lowerMessage === 'action')) {

        

        const choice = lowerMessage === 'action' ? 'action' : 'vérité';

        clearTimeout(activeGame.timeout);

        

        if (choice === 'vérité') {

            const question = activeGame.getRandomTruth();

            await client.sendMessage(remoteJid, { text: 

`🎲 VÉRITÉ

━━━━━━━━━━━━━━━━━━━━

📌 ${senderName}, réponds :

${question}

⏱️ 30 secondes` });

            

            activeGame.waitingForChoice = false;

            activeGame.timeout = setTimeout(async () => {

                if (activeGame.gameActive) {

                    await client.sendMessage(remoteJid, { text: `⏰ Temps écoulé ! ${senderName} n'a pas répondu.` });

                    activeGame.currentTurn = activeGame.getNextPlayer();

                    activeGame.waitingForChoice = true;

                    await client.sendMessage(remoteJid, { text: activeGame.getGameState() });

                }

            }, 30000);

            

        } else {

            const action = activeGame.getRandomDare();

            await client.sendMessage(remoteJid, { text: 

`🎲 ACTION

━━━━━━━━━━━━━━━━━━━━

💪 ${senderName}, relève le défi :

${action}

⏱️ 30 secondes` });

            

            activeGame.waitingForChoice = false;

            activeGame.timeout = setTimeout(async () => {

                if (activeGame.gameActive) {

                    await client.sendMessage(remoteJid, { text: `⏰ Temps écoulé ! ${senderName} n'a pas réalisé l'action.` });

                    activeGame.currentTurn = activeGame.getNextPlayer();

                    activeGame.waitingForChoice = true;

                    await client.sendMessage(remoteJid, { text: activeGame.getGameState() });

                }

            }, 30000);

        }

        return true;

    }

    

    // Réponse à la question

    if (!activeGame.waitingForChoice && activeGame.currentTurn === sender && messageBody.length > 0) {

        clearTimeout(activeGame.timeout);

        

        await client.sendMessage(remoteJid, { text: 

`✅ RÉPONSE ENREGISTRÉE !

💬 ${senderName} : ${messageBody}

🎯 Prochain tour...` });

        

        activeGame.currentTurn = activeGame.getNextPlayer();

        activeGame.waitingForChoice = true;

        

        await new Promise(resolve => setTimeout(resolve, 3000));

        await client.sendMessage(remoteJid, { text: activeGame.getGameState() });

        

        activeGame.timeout = setTimeout(async () => {

            if (activeGame.waitingForChoice && activeGame.gameActive) {

                activeGame.gameActive = false;

                games.delete(activeGame.chatId);

                await client.sendMessage(remoteJid, { text: "⏰ Partie terminée !" });

            }

        }, 30000);

        return true;

    }

    

    return false;

}// PARTIE 4/5 - Commande principale

async function truthOrDareCommand(client, message, args) {

    const remoteJid = message.key.remoteJid;

    const sender = message.key.participant || message.key.remoteJid;

    const senderName = message.pushName || sender.split('@')[0];

    const subCommand = args[0]?.toLowerCase();

    

    let existingGame = null;

    for (const [id, game] of games) {

        if (game.chatId === remoteJid) {

            existingGame = game;

            break;

        }

    }

    

    // CRÉER

    if (subCommand === 'new' || subCommand === 'create') {

        if (existingGame) {

            await client.sendMessage(remoteJid, { text: "❌ Partie déjà en cours ! Utilise `tod join`" });

            return;

        }

        

        const gameId = Date.now().toString();

        const game = new TruthOrDareGame(sender, senderName, remoteJid);

        game.addPlayer(sender, senderName);

        games.set(gameId, game);

        

        await client.sendMessage(remoteJid, { text: 

`*🎲 PARTIE CRÉÉE !*

━━━━━━━━━━━━━━━━━━━━

*🍉 Créateur :* ${senderName}

*👥 Joueurs : 1/6*

*📌 Rejoindre : tod join*

*🍒 Commencer : tod start*

> *DEV : _© 𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀 🍒_*` });

        return;

    }

    

    // REJOINDRE

    if (subCommand === 'join') {

        if (!existingGame) {

            await client.sendMessage(remoteJid, { text: "❌ Aucune partie ! Crée avec `tod new`" });

            return;

        }

        

        if (!existingGame.addPlayer(sender, senderName)) {

            await client.sendMessage(remoteJid, { text: "❌ Partie pleine ou tu es déjà dedans !" });

            return;

        }

        

        await client.sendMessage(remoteJid, { text: `✅ ${senderName} a rejoint ! (${existingGame.players.size}/6)` });

        return;

    }

    

    // COMMENCER

    if (subCommand === 'start') {

        if (!existingGame) {

            await client.sendMessage(remoteJid, { text: "❌ Aucune partie !" });

            return;

        }

        

        if (existingGame.players.size < 2) {

            await client.sendMessage(remoteJid, { text: "❌ Il faut au moins 2 joueurs !" });

            return;

        }

        

        existingGame.currentTurn = existingGame.getNextPlayer();

        existingGame.waitingForChoice = true;

        

        await client.sendMessage(remoteJid, { text: existingGame.getGameState() });

        

        existingGame.timeout = setTimeout(async () => {

            if (existingGame.waitingForChoice && existingGame.gameActive) {

                existingGame.gameActive = false;

                games.delete(existingGame.chatId);

                await client.sendMessage(remoteJid, { text: "⏰ Partie expirée !" });

            }

        }, 30000);

        return;

    }

    

    // HELP

    const helpText = 

`🎲 ACTION OU VÉRITÉ

━━━━━━━━━━━━━━━━━━━━

📝 COMMANDES :

• tod new - Créer une partie

• tod join - Rejoindre

• tod start - Commencer

• vérité ou action - Choisir

💡 EXEMPLES :

tod new

tod join

tod start

> *DEV : _© 𝐀𝐊𝐀𝐍𝐄 𝐊𝐔𝐑𝐎𝐆𝐀𝐖𝐀 🍒_*`;

    await client.sendMessage(remoteJid, { text: helpText });

}// PARTIE 5/5 - Export

export default truthOrDareCommand;

export { handleTruthOrDareResponse };