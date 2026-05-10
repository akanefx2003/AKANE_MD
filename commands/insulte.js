// commands/insulte.js
const insults = [
    "T'es comme un nuage. Quand tu disparais, c'est une belle journée !",
    "Tu apportes tellement de joie... quand tu quittes la pièce !",
    "T'es pas bête, t'as juste de la malchance quand tu réfléchis.",
    "T'es la preuve que l'évolution prend des pauses parfois.",
    "Ton cerveau tourne sous Windows 95 — lent et dépassé."
];

export default async function insultCommand(client, message) {
    const remoteJid = message.key.remoteJid;
    let userToInsult;

    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToInsult = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToInsult = message.message.extendedTextMessage.contextInfo.participant;
    } else {
        await client.sendMessage(remoteJid, { text: "👀 *Mentionne quelqu'un !*" });
        return;
    }

    const insult = insults[Math.floor(Math.random() * insults.length)];
    const response = `
﹝╎🍓 𝐈𝐍𝐒𝐔𝐋𝐓𝐄 ╎˼
⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 🎀 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⋆.˚⪩ 𝐂𝐢𝐛𝐥𝐞 ⪨
⸙﹝ 👤 @${userToInsult.split('@')[0]} ﹞✴︎

⋆.˚⪩ 𝐈𝐧𝐬𝐮𝐥𝐭𝐞 ⪨
⸙﹝ 💬 "${insult}" ﹞✴︎

𖤍⋅‏ ┈─━ ━━ ━ • ˹ ୨ৎ ˼ • ━ ━━ ━─┈ ⋅𖤍

> *© AKANE MD 🌹*`;

    await client.sendMessage(remoteJid, { text: response, mentions: [userToInsult] });
}