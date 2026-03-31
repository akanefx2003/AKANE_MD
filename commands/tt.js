// commands/tt.js - Jeu de Morpion CORRIGÉ

// Stockage des parties

const games = {};

// Classe du jeu

class TicTacToe {

    constructor(playerX, playerO) {

        this.playerX = playerX;

        this.playerO = playerO;

        this.currentTurn = playerX;

        this.board = Array(9).fill(null);

        this.turns = 0;

        this.winner = null;

    }

    play(player, position) {

        if (this.winner) return false;

        if (player !== this.currentTurn) return false;

        if (this.board[position] !== null) return false;

        const symbol = player === this.playerX ? 'X' : 'O';

        this.board[position] = symbol;

        this.turns++;

        if (this.checkWin()) {

            this.winner = player;

        } else if (this.turns === 9) {

            this.winner = 'draw';

        } else {

            this.currentTurn = player === this.playerX ? this.playerO : this.playerX;

        }

        return true;

    }

    checkWin() {

        const winPatterns = [

            [0,1,2], [3,4,5], [6,7,8],

            [0,3,6], [1,4,7], [2,5,8],

            [0,4,8], [2,4,6]

        ];

        for (let pattern of winPatterns) {

            const [a,b,c] = pattern;

            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {

                return true;

            }

        }

        return false;

    }

    getBoard() {

        return this.board.map((cell, i) => {

            if (cell === 'X') return '❌';

            if (cell === 'O') return '⭕';

            return ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'][i];

        });

    }

}

// Commande principale

export default async function tt(client, message, args) {

    try {

        const remoteJid = message.key.remoteJid;

        const senderId = message.key.participant || message.key.remoteJid;

        

        console.log('🎮 Commande tt reçue de:', senderId);

        // Vérifier si le joueur est déjà dans une partie

        const existingGame = Object.values(games).find(g => 

            g && [g.playerX, g.playerO].includes(senderId) && !g.winner

        );

        if (existingGame) {

            return await client.sendMessage(remoteJid, { 

                text: '❌ Tu es déjà dans une partie ! Tape *abandonner* pour quitter.'

            });

        }

        // Chercher une partie en attente

        const waitingGame = Object.values(games).find(g => g && !g.playerO);

        if (waitingGame) {

            // Rejoindre la partie

            waitingGame.playerO = senderId;

            waitingGame.currentTurn = waitingGame.playerX;

            

            const board = waitingGame.getBoard();

            const msg = 

`🎮 *MORPION - PARTIE COMMENCÉE !*

C'est au tour de : @${waitingGame.playerX.split('@')[0]} (❌)

${board[0]} ${board[1]} ${board[2]}

${board[3]} ${board[4]} ${board[5]}

${board[6]} ${board[7]} ${board[8]}

*Règles :*

• Tape un chiffre 1-9 pour jouer

• Tape *abandonner* pour quitter

Joueur ❌ : @${waitingGame.playerX.split('@')[0]}

Joueur ⭕ : @${waitingGame.playerO.split('@')[0]}`;

            await client.sendMessage(remoteJid, { 

                text: msg,

                mentions: [waitingGame.playerX, waitingGame.playerO]

            });

            

            console.log('✅ Partie démarrée entre', waitingGame.playerX, 'et', waitingGame.playerO);

            

        } else {

            // Créer nouvelle partie

            const newGame = new TicTacToe(senderId, null);

            const gameId = Date.now().toString();

            games[gameId] = newGame;

            

            await client.sendMessage(remoteJid, { 

                text: '⏳ *Partie créée !* En attente d\'un adversaire...\n\nTape *tt* pour rejoindre !'

            });

            

            console.log('✅ Partie créée par', senderId);

        }

    } catch (error) {

        console.error('❌ Erreur tt:', error);

        await client.sendMessage(message.key.remoteJid, { 

            text: '❌ Erreur lors de la création de la partie.'

        });

    }

}

// Gestion des coups

export async function handleMove(client, message, text) {

    try {

        const remoteJid = message.key.remoteJid;

        const senderId = message.key.participant || message.key.remoteJid;

        

        console.log('🎯 Coup reçu:', text, 'de', senderId);

        // Trouver la partie du joueur

        const gameEntry = Object.entries(games).find(([id, g]) => 

            g && [g.playerX, g.playerO].includes(senderId) && !g.winner

        );

        if (!gameEntry) return false;

        

        const [gameId, game] = gameEntry;

        // Abandon

        if (text === 'abandonner') {

            const winner = senderId === game.playerX ? game.playerO : game.playerX;

            const winnerName = winner ? `@${winner.split('@')[0]}` : 'personne';

            

            await client.sendMessage(remoteJid, { 

                text: `🏳️ @${senderId.split('@')[0]} a abandonné !\n🎉 ${winnerName} remporte la partie !`,

                mentions: [senderId, winner].filter(Boolean)

            });

            delete games[gameId];

            return true;

        }

        // Vérifier si c'est un chiffre

        const position = parseInt(text) - 1;

        if (isNaN(position) || position < 0 || position > 8) return false;

        // Jouer le coup en utilisant la méthode de la classe

        const success = game.play(senderId, position);

        if (!success) {

            if (game.currentTurn !== senderId) {

                await client.sendMessage(remoteJid, { 

                    text: '❌ Ce n\'est pas ton tour !' 

                });

            } else {

                await client.sendMessage(remoteJid, { 

                    text: '❌ Case déjà prise ! Choisis-en une autre.' 

                });

            }

            return true;

        }

        // Afficher le plateau

        const board = game.getBoard();

        

        let msg;

        if (game.winner === senderId) {

            msg = 

`🎉 *VICTOIRE !*

Félicitations à @${senderId.split('@')[0]} (${senderId === game.playerX ? '❌' : '⭕'})

${board[0]} ${board[1]} ${board[2]}

${board[3]} ${board[4]} ${board[5]}

${board[6]} ${board[7]} ${board[8]}

*Partie terminée !*`;

            

            await client.sendMessage(remoteJid, { 

                text: msg,

                mentions: [senderId]

            });

            

            delete games[gameId];

            

        } else if (game.winner === 'draw') {

            msg = 

`🤝 *MATCH NUL !*

Personne n'a gagné...

${board[0]} ${board[1]} ${board[2]}

${board[3]} ${board[4]} ${board[5]}

${board[6]} ${board[7]} ${board[8]}

*Partie terminée !*`;

            

            await client.sendMessage(remoteJid, { text: msg });

            delete games[gameId];

            

        } else {

            msg = 

`🎮 *MORPION*

C'est au tour de : @${game.currentTurn.split('@')[0]} (${game.currentTurn === game.playerX ? '❌' : '⭕'})

${board[0]} ${board[1]} ${board[2]}

${board[3]} ${board[4]} ${board[5]}

${board[6]} ${board[7]} ${board[8]}

Joueur ❌ : @${game.playerX.split('@')[0]}

Joueur ⭕ : @${game.playerO.split('@')[0]}

Tape un chiffre (1-9) ou *abandonner*`;

            await client.sendMessage(remoteJid, { 

                text: msg,

                mentions: [game.playerX, game.playerO, game.currentTurn].filter(Boolean)

            });

        }

        return true;

    } catch (error) {

        console.error('❌ Erreur handleMove:', error);

        return false;

    }

}

// Nettoyage automatique

setInterval(() => {

    const now = Date.now();

    for (let id in games) {

        if (games[id] && now - parseInt(id) > 30 * 60 * 1000) {

            delete games[id];

        }

    }

}, 5 * 60 * 1000);