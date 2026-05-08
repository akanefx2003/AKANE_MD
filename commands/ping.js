async function ping(client, message) {
    const start = Date.now()
    const sent = await client.sendMessage(message.key.remoteJid, {
        text: '🏓 *Calcul...*'
    })
    const end = Date.now()
    const ms = end - start

    await client.sendMessage(message.key.remoteJid, {
        text:
`╔══════════════════╗
║      🏓 *PING*           ║
╚══════════════════╝

━━━━━━━━━━━━━━━━━━━━━

⚡ *Vitesse :* ${ms}ms
🟢 *Statut :* En ligne

━━━━━━━━━━━━━━━━━━━━━

> *© AKANE-MD 🌹*`,
        edit: sent.key
    })
}

export default ping
