// commands/quiz.js - QUIZ (ACCESSIBLE À TOUS EN MODE PRIVÉ)

// ========== BASE DE DONNÉES DES QUIZZ ==========

const quizzes = {

  anime: {

    name: "🎴 ANIME",

    icon: "🎴",

    questions: [

      {

        question: "Quel est le vrai nom de 'L' dans Death Note ?",

        options: ["Light Yagami", "L Lawliet", "Near", "Mello"],

        answer: 1,

        explanation: "L Lawliet - Le plus grand détective du monde"

      },

      {

        question: "Quel est le vrai nom de Light Yagami en tant que Kira ?",

        options: ["Kira", "L", "Ryuk", "Misa"],

        answer: 0,

        explanation: "Light utilise le pseudo 'Kira'"

      },

      {

        question: "Dans Attack on Titan, quel est le nom du bataillon d'élite ?",

        options: ["Bataillon 104", "Brigade Spéciale", "Scout Regiment", "Levi Squad"],

        answer: 2,

        explanation: "Le Scout Regiment est l'élite"

      },

      {

        question: "Quel démon est la Lune Supérieure 1 dans Demon Slayer ?",

        options: ["Muzan Kibutsuji", "Kokushibo", "Doma", "Akaza"],

        answer: 1,

        explanation: "Kokushibo - Lune Supérieure 1"

      },

      {

        question: "Qui a tué Rengoku dans Demon Slayer ?",

        options: ["Akaza", "Doma", "Kokushibo", "Muzan"],

        answer: 0,

        explanation: "Akaza - Lune Supérieure 3"

      },

      {

        question: "Dans Jujutsu Kaisen, quel est le vrai nom de Gojo ?",

        options: ["Satoru Gojo", "Suguru Geto", "Toji Fushiguro", "Yuta Okkotsu"],

        answer: 0,

        explanation: "Satoru Gojo - Le plus fort des sorciers"

      },

      {

        question: "Quel fruit du démon a mangé Monkey D. Luffy ?",

        options: ["Mera Mera", "Gomu Gomu", "Hito Hito", "Uo Uo"],

        answer: 1,

        explanation: "Gomu Gomu no Mi - Fruit du caoutchouc"

      },

      {

        question: "Quel est le vrai nom du Gear 5 de Luffy ?",

        options: ["Gomu Gomu", "Nika", "Sun God", "Dawn"],

        answer: 1,

        explanation: "Le modèle Nika du fruit Hito Hito"

      },

      {

        question: "Qui est l'auteur de Naruto ?",

        options: ["Eiichiro Oda", "Masashi Kishimoto", "Tite Kubo", "Hirohiko Araki"],

        answer: 1,

        explanation: "Masashi Kishimoto - Créateur de Naruto"

      },

      {

        question: "Dans Bleach, quel est le bankai d'Ichigo ?",

        options: ["Zangetsu", "Tensa Zangetsu", "Getsuga Tensho", "Mugetsu"],

        answer: 1,

        explanation: "Tensa Zangetsu - La véritable libération"

      },

      {

        question: "Dans Dragon Ball, quelle est la première transformation de Goku ?",

        options: ["Super Saiyan 1", "Super Saiyan 2", "Super Saiyan 3", "Kaioken"],

        answer: 0,

        explanation: "Super Saiyan - Contre Freezer"

      },

      {

        question: "Dans One Piece, qui est le premier compagnon de Luffy ?",

        options: ["Zoro", "Nami", "Usopp", "Sanji"],

        answer: 0,

        explanation: "Roronoa Zoro - Baratie"

      },

      {

        question: "Dans Naruto, qui est le père de Naruto ?",

        options: ["Minato Namikaze", "Jiraiya", "Kakashi", "Orochimaru"],

        answer: 0,

        explanation: "Minato Namikaze - Le 4ème Hokage"

      },

      {

        question: "Quel est le nom du démon à 9 queues ?",

        options: ["Kurama", "Gyuki", "Shukaku", "Matatabi"],

        answer: 0,

        explanation: "Kurama - Le Kyuubi"

      },

      {

        question: "Dans Demon Slayer, quel est le souffle de Tanjiro ?",

        options: ["Souffle de l'Eau", "Souffle du Feu", "Souffle du Tonnerre", "Souffle du Vent"],

        answer: 0,

        explanation: "Souffle de l'Eau - Style de Tanjiro"

      },

      {

        question: "Quel est le nom de la sœur de Tanjiro ?",

        options: ["Nezuko", "Kanao", "Shinobu", "Mitsuri"],

        answer: 0,

        explanation: "Nezuko Kamado"

      },

      {

        question: "Dans Jujutsu Kaisen, qui est le mentor de Yuji ?",

        options: ["Gojo", "Nanami", "Megumi", "Nobara"],

        answer: 0,

        explanation: "Satoru Gojo"

      },

      {

        question: "Qui est le capitaine de la 1ère division dans Bleach ?",

        options: ["Byakuya", "Yamamoto", "Shunsui", "Unohana"],

        answer: 1,

        explanation: "Yamamoto Genryusai"

      },

      {

        question: "Quel est le nom du vaisseau de Luffy ?",

        options: ["Going Merry", "Thousand Sunny", "Victory Hunter", "Red Force"],

        answer: 0,

        explanation: "Le Going Merry"

      },

      {

        question: "Dans Death Note, qui est le Shinigami de Light ?",

        options: ["Ryuk", "Rem", "Gelus", "Sidoh"],

        answer: 0,

        explanation: "Ryuk"

      }

    ]

  },

  manga: {

    name: "📖 MANGA",

    icon: "📖",

    questions: [

      {

        question: "Quel manga est le plus vendu au monde ?",

        options: ["Naruto", "One Piece", "Dragon Ball", "Attack on Titan"],

        answer: 1,

        explanation: "One Piece avec plus de 500M d'exemplaires !"

      },

      {

        question: "Qui a écrit Berserk ?",

        options: ["Kentaro Miura", "Yusuke Murata", "Takehiko Inoue", "Hajime Isayama"],

        answer: 0,

        explanation: "Kentaro Miura - RIP"

      },

      {

        question: "Quel manga a popularisé le 'Battle Shonen' ?",

        options: ["Dragon Ball", "Naruto", "One Piece", "Bleach"],

        answer: 0,

        explanation: "Dragon Ball"

      },

      {

        question: "Qui a écrit Death Note ?",

        options: ["Tsugumi Ohba", "Eiichiro Oda", "Masashi Kishimoto", "Tite Kubo"],

        answer: 0,

        explanation: "Tsugumi Ohba"

      }

    ]

  },

  general: {

    name: "🎮 GENERAL",

    icon: "🎮",

    questions: [

      {

        question: "Que signifie 'Otaku' ?",

        options: ["Fan extrême", "Débutant", "Expert", "Créateur"],

        answer: 0,

        explanation: "Passionné obsessionnel"

      },

      {

        question: "Quel studio a animé Demon Slayer ?",

        options: ["Madhouse", "Ufotable", "Kyoto Animation", "MAPPA"],

        answer: 1,

        explanation: "Ufotable"

      },

      {

        question: "Qu'est-ce qu'un 'Isekai' ?",

        options: ["Monde parallèle", "Combat", "Magie", "Robot"],

        answer: 0,

        explanation: "Transporté dans un autre monde"

      },

      {

        question: "Que veut dire 'Kawaii' ?",

        options: ["Mignon", "Triste", "Content", "Fâché"],

        answer: 0,

        explanation: "Kawaii = Mignon"

      },

      {

        question: "Que veut dire 'Baka' ?",

        options: ["Génie", "Idiot", "Fort", "Faible"],

        answer: 1,

        explanation: "Baka = Idiot"

      },

      {

        question: "Que veut dire 'Senpai' ?",

        options: ["Cadet", "Aîné", "Professeur", "Étudiant"],

        answer: 1,

        explanation: "Senpai = Aîné"

      },

      {

        question: "Que veut dire 'Arigatou' ?",

        options: ["Merci", "Bonjour", "Au revoir", "Désolé"],

        answer: 0,

        explanation: "Arigatou = Merci"

      },

      {

        question: "Que veut dire 'Sayonara' ?",

        options: ["Bonjour", "Merci", "Au revoir", "Bonne nuit"],

        answer: 2,

        explanation: "Sayonara = Au revoir"

      }

    ]

  }

};

// ========== SUIVI ==========

const usedQuestions = new Map();

const activeGames = new Map();

function getNewQuestion(theme, remoteJid) {

  const quiz = quizzes[theme];

  if (!quiz) return null;

  

  if (!usedQuestions.has(remoteJid)) {

    usedQuestions.set(remoteJid, new Set());

  }

  

  const used = usedQuestions.get(remoteJid);

  const availableQuestions = quiz.questions.filter((_, idx) => !used.has(idx));

  

  if (availableQuestions.length === 0) {

    usedQuestions.set(remoteJid, new Set());

    return getNewQuestion(theme, remoteJid);

  }

  

  const randomIndex = Math.floor(Math.random() * availableQuestions.length);

  const originalIndex = quiz.questions.findIndex(q => q === availableQuestions[randomIndex]);

  

  used.add(originalIndex);

  

  return {

    theme: theme,

    themeName: quiz.name,

    themeIcon: quiz.icon,

    question: availableQuestions[randomIndex],

    currentQuestionNum: null,

    totalQuestions: null

  };

}

function formatQuestionMessage(game) {

  const { themeName, themeIcon, question } = game.currentQuestion;

  const opts = question.options;

  

  let msg = `╭─❍ *QUIZ* ${themeIcon}\n│\n`;

  msg += `│ 📚 Thème: ${themeName}\n`;

  msg += `│ 📊 Question: ${game.currentQuestionNum}/${game.totalQuestions}\n`;

  msg += `│ 👥 Participants: ${game.players.length}\n`;

  msg += `│ ⭐ +5 points pour le premier qui répond\n`;

  msg += `│\n`;

  msg += `│ ❓ *${question.question}*\n`;

  msg += `│\n`;

  

  opts.forEach((opt, i) => {

    msg += `│ ${i + 1}️⃣ ${opt}\n`;

  });

  

  msg += `│\n`;

  msg += `│ ⏱️ 30 secondes | Réponds avec 1,2,3,4\n`;

  msg += `│ 💡 *join* = jouer | *quit* = quitter\n`;

  msg += `╰──────────────────`;

  

  return msg;

}

function formatScoreMessage(game) {

  let msg = `╭─❍ *CLASSEMENT FINAL* 🏆\n│\n`;

  const sorted = [...game.players].sort((a, b) => b.score - a.score);

  

  sorted.forEach((player, i) => {

    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📌";

    msg += `│ ${medal} ${player.name}: ${player.score} pts\n`;

  });

  

  msg += `│\n│ ✅ Quiz terminé !\n│ 🎮 *!quiz* pour rejouer\n╰──────────────────`;

  return msg;

}

// ========== COMMANDE PRINCIPALE ==========

export default async function quiz(client, message, args) {

  try {

    const remoteJid = message.key.remoteJid;

    const senderId = message.key.participant || message.key.remoteJid;

    const userName = message.pushName || "Joueur";

    

    if (activeGames.has(remoteJid)) {

      return await client.sendMessage(remoteJid, {

        text: "❌ Un quiz est déjà en cours ! Tape *join* pour participer."

      });

    }

    

    let theme = args[0]?.toLowerCase();

    let numberOfQuestions = parseInt(args[1]) || 5;

    

    if (numberOfQuestions < 1) numberOfQuestions = 1;

    if (numberOfQuestions > 30) numberOfQuestions = 30;

    

    if (!theme || !quizzes[theme]) {

      const list = Object.keys(quizzes).map(t => `│ ${quizzes[t].icon} *${t}*`).join('\n');

      return await client.sendMessage(remoteJid, {

        text: `╭─❍ *QUIZ*\n│\n│ 📚 Thèmes:\n${list}\n│\n│ 💡 *!quiz anime 20*\n│ 💡 *!quiz manga*\n╰──────────────────`

      });

    }

    

    const availableCount = quizzes[theme].questions.length;

    if (numberOfQuestions > availableCount) {

      return await client.sendMessage(remoteJid, {

        text: `❌ Il n'y a que ${availableCount} questions.\n\nMaximum: *!quiz ${theme} ${availableCount}*`

      });

    }

    

    usedQuestions.set(remoteJid, new Set());

    

    const firstQuestion = getNewQuestion(theme, remoteJid);

    if (!firstQuestion) {

      return await client.sendMessage(remoteJid, { text: "❌ Erreur: Aucune question." });

    }

    

    firstQuestion.currentQuestionNum = 1;

    firstQuestion.totalQuestions = numberOfQuestions;

    

    const newGame = {

      theme: theme,

      currentQuestion: firstQuestion,

      players: [{ id: senderId, name: userName, score: 0 }],

      currentQuestionNum: 1,

      totalQuestions: numberOfQuestions,

      active: true,

      questionAnswered: false,

      timeoutId: null

    };

    

    activeGames.set(remoteJid, newGame);

    

    const msg = formatQuestionMessage(newGame);

    await client.sendMessage(remoteJid, { text: msg });

    

    const timeoutId = setTimeout(() => checkTimeout(client, remoteJid), 30000);

    newGame.timeoutId = timeoutId;

    

  } catch (error) {

    console.error("❌ Quiz error:", error);

  }

}

async function checkTimeout(client, remoteJid) {

  const game = activeGames.get(remoteJid);

  if (!game || !game.active) return;

  

  if (!game.questionAnswered) {

    const q = game.currentQuestion.question;

    await client.sendMessage(remoteJid, {

      text: `⏰ *Temps écoulé !*\n\n✓ Réponse: ${q.options[q.answer]}\n📖 ${q.explanation}\n\n⏩ Question suivante...`

    });

    await nextQuestion(client, remoteJid, game);

  }

}

async function nextQuestion(client, remoteJid, game) {

  if (!game.active) return;

  

  if (game.timeoutId) {

    clearTimeout(game.timeoutId);

  }

  

  game.currentQuestionNum++;

  game.questionAnswered = false;

  

  if (game.currentQuestionNum > game.totalQuestions) {

    game.active = false;

    await client.sendMessage(remoteJid, { text: formatScoreMessage(game) });

    activeGames.delete(remoteJid);

    usedQuestions.delete(remoteJid);

    return;

  }

  

  const newQuestion = getNewQuestion(game.theme, remoteJid);

  if (!newQuestion) {

    await client.sendMessage(remoteJid, { text: "❌ Plus de questions !" });

    activeGames.delete(remoteJid);

    return;

  }

  

  newQuestion.currentQuestionNum = game.currentQuestionNum;

  newQuestion.totalQuestions = game.totalQuestions;

  game.currentQuestion = newQuestion;

  

  const msg = formatQuestionMessage(game);

  await client.sendMessage(remoteJid, { text: msg });

  

  const timeoutId = setTimeout(() => checkTimeout(client, remoteJid), 30000);

  game.timeoutId = timeoutId;

}

// ========== GESTION DES RÉPONSES (JOIN SANS PRÉFIXE POUR TOUS) ==========

export async function handleQuizAnswer(client, message, text) {

  try {

    const remoteJid = message.key.remoteJid;

    const senderId = message.key.participant || message.key.remoteJid;

    const userName = message.pushName || "Joueur";

    

    const game = activeGames.get(remoteJid);

    if (!game || !game.active) return false;

    

    const lowerText = text.toLowerCase().trim();

    

    // 🔥 JOIN - ACCESSIBLE À TOUT LE MONDE (même en mode privé !)

    if (lowerText === 'join') {

      // Vérifier si déjà dans la partie

      if (game.players.find(p => p.id === senderId)) {

        await client.sendMessage(remoteJid, {

          text: `✅ @${userName} est déjà dans le quiz !`,

          mentions: [senderId]

        });

        return true;

      }

      

      // Ajouter le joueur (même s'il n'est pas dans sudoList)

      game.players.push({ id: senderId, name: userName, score: 0 });

      

      await client.sendMessage(remoteJid, {

        text: `✅ @${userName} a rejoint le quiz !\n\n👥 Participants: ${game.players.length}`,

        mentions: [senderId]

      });

      return true;

    }

    

    // QUIT

    if (lowerText === 'quit' || lowerText === 'abandonner') {

      const index = game.players.findIndex(p => p.id === senderId);

      if (index === -1) return true;

      

      game.players.splice(index, 1);

      await client.sendMessage(remoteJid, {

        text: `🚪 @${userName} a quitté ! Restants: ${game.players.length}`,

        mentions: [senderId]

      });

      

      if (game.players.length === 0) {

        if (game.timeoutId) clearTimeout(game.timeoutId);

        await client.sendMessage(remoteJid, { text: "❌ Quiz terminé - Plus de joueurs !" });

        activeGames.delete(remoteJid);

        usedQuestions.delete(remoteJid);

      }

      return true;

    }

    

    // RÉPONSES (1,2,3,4)

    if (!['1', '2', '3', '4'].includes(lowerText)) {

      return false;

    }

    

    // 🔥 SI LE JOUEUR N'EST PAS INSCRIT, IL PEUT QUAND MÊME RÉPONDRE !

    let player = game.players.find(p => p.id === senderId);

    if (!player) {

      // Auto-inscription

      player = { id: senderId, name: userName, score: 0 };

      game.players.push(player);

      await client.sendMessage(remoteJid, {

        text: `✅ @${userName} a automatiquement rejoint le quiz !`,

        mentions: [senderId]

      });

    }

    

    // Vérifier si la question a déjà une réponse

    if (game.questionAnswered) {

      await client.sendMessage(remoteJid, {

        text: `❌ @${userName}, la question a déjà trouvé réponse ! Attend la suivante.`,

        mentions: [senderId]

      });

      return true;

    }

    

    const answerNum = parseInt(lowerText) - 1;

    const currentQ = game.currentQuestion.question;

    

    if (answerNum < 0 || answerNum > 3) return true;

    

    const isCorrect = (answerNum === currentQ.answer);

    

    if (isCorrect) {

      game.questionAnswered = true;

      player.score += 5;

      

      if (game.timeoutId) {

        clearTimeout(game.timeoutId);

      }

      

      await client.sendMessage(remoteJid, {

        text: `🎉 *${userName}* a trouvé la bonne réponse ! +5 pts\n\n✓ ${currentQ.options[currentQ.answer]}\n📖 ${currentQ.explanation}\n\n⏩ Passage à la question suivante...`,

        mentions: [senderId]

      });

      

      await nextQuestion(client, remoteJid, game);

    } else {

      await client.sendMessage(remoteJid, {

        text: `❌ @${userName} - Mauvaise réponse ! La bonne était: ${currentQ.options[currentQ.answer]}`,

        mentions: [senderId]

      });

    }

    

    return true;

    

  } catch (error) {

    console.error("❌ Quiz answer error:", error);

    return false;

  }

}