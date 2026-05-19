// commands/uptime.js

const IMG = 'https://raw.githubusercontent.com/toge021/Media/main/9563.jpg';

export async function runtime(client, message) {

    const jid = message.key.remoteJid;

    // ─── Faux ping ────────────────────────────────────────────────────────────
    const fakePing = Math.floor(Math.random() * (1573 - 990 + 1)) + 990;

    // ─── Uptime ───────────────────────────────────────────────────────────────
    const uptimeSeconds = process.uptime();

    const days    = Math.floor(uptimeSeconds / 86400);
    const hours   = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    const uptimeString = `${days > 0 ? `${days}j ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`;

    // ─── RAM ──────────────────────────────────────────────────────────────────
    const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    // ─── Envoi ────────────────────────────────────────────────────────────────
    await client.sendMessage(jid, {

        image: { url: IMG },
        caption:
`╭─✧🌹━━━━━━━━━━━━━━━❂
┊
*┊⏳ STATUS AKANE MD*
┊
*┊📡 STATUT : EN LIGNE ✅*
┊
*┊🚀 VITESSE : ${fakePing} MS*
┊
*┊⏱️ EN VIE DEPUIS : ${uptimeString}*
┊
*┊📂 MÉMOIRE : ${ramUsage} MB / 1GO*
┊
╰───────────────────❂`

    }, { quoted: message });

}

export default runtime;
