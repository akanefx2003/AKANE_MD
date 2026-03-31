const players = new Map();

export default async function boxGame(client, message, args) {

    const sender = message.key.participant || message.key.remoteJid;

    const sub = args?.[0]?.toLowerCase();

    if (!players.has(sender)) {

        players.set(sender, {

            coins: 0,

            win: 0,

            lose: 0

        });

    }

    const user = players.get(sender);

    // ===== INVENTAIRE =====

    if (sub === "inv") {

        return client.sendMessage(sender, {

text:

`🎒 TON INVENTAIRE

💰 Coins : ${user.coins}

🏆 Victoires : ${user.win}

💀 Défaites : ${user.lose}

DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹`

        });

    }

    // ===== JEU =====

    const rewards = [

        { type: "coins", value: 50 },

        { type: "coins", value: 100 },

        { type: "trap", value: -50 },

        { type: "jackpot", value: 300 },

        { type: "nothing", value: 0 }

    ];

    const rand = rewards[Math.floor(Math.random() * rewards.length)];

    let result = "";

    if (rand.type === "coins") {

        user.coins += rand.value;

        user.win++;

        result =

`🎁 BOÎTE OUVERTE

💰 Tu gagnes ${rand.value} coins !

🔥 Bien joué`;

    } else if (rand.type === "jackpot") {

        user.coins += rand.value;

        user.win++;

        result =

`💎 JACKPOT !!!

💰 +${rand.value} coins

😈 Tu es chanceux !`;

    } else if (rand.type === "trap") {

        user.coins += rand.value;

        user.lose++;

        result =

`💀 PIÈGE !

-${Math.abs(rand.value)} coins

😭 Dommage...`;

    } else {

        result =

`📦 BOÎTE VIDE

😶 Rien trouvé...`;

    }

    return client.sendMessage(sender, {

text:

`${result}

━━━━━━━━━━━━━━━

🎮 Tape ".box inv" pour voir ton score

DEV : 🍁AKANE KUROGAWAʕ◕ᴥ◕ʔ🌹`

    });

}