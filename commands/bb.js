export default async function bb(client, message) {

    const replies = [

        "> *OUI MON CHOU 😘*",

        "> *OUI LOSER 🐸*",

        "> *YO QUOI DE NEUF 🍊*",

        "> *OUI PERVERS 🍒*"

    ];

    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    await client.sendMessage(message.key.remoteJid, {

        text: randomReply

    });

}