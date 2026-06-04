// commands/admin.js
// @cat: gc-menu

async function getTargets(client, message, remoteJid) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted    = message.message?.extendedTextMessage?.contextInfo?.participant
    const targets   = [...mentioned]
    if (quoted && !targets.includes(quoted)) targets.push(quoted)
    return targets
}

async function checkBotAdmin(client, remoteJid) {
    return true // WhatsApp retourne not-authorized si le bot n'est pas admin
}

export async function promoteCommand(client, message, args) {
    const remoteJid = message.key.remoteJid

    if (!remoteJid.endsWith('@g.us')) {
        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ GROUPE UNIQUEMENT !*
┊
╰─────────────────❂`
        }, { quoted: message })
    }

    const isAdmin = await checkBotAdmin(client, remoteJid)
    if (!isAdmin) {
        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ J'AI BESOIN D'ÊTRE ADMIN*
┊
╰─────────────────❂`
        }, { quoted: message })
    }

    const targets = await getTargets(client, message, remoteJid)

    if (!targets.length) {
        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📝 UTILISATION :*
*┊.promote @mention*
*┊ou cite un message*
┊
╰─────────────────❂`
        }, { quoted: message })
    }

    try {
        await client.groupParticipantsUpdate(remoteJid, targets, 'promote')

        const names = targets.map(j => `@${j.split('@')[0]}`).join(', ')

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ PROMU ADMIN !*
┊
*┊👑 ${names}*
┊
╰─────────────────❂`,
            mentions: targets
        }, { quoted: message })

    } catch (err) {
        console.error('❌ promote:', err.message)
        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ ERREUR : ${err.message}*
┊
╰─────────────────❂`
        }, { quoted: message })
    }
}

export async function demoteCommand(client, message, args) {
    const remoteJid = message.key.remoteJid

    if (!remoteJid.endsWith('@g.us')) {
        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ GROUPE UNIQUEMENT !*
┊
╰─────────────────❂`
        }, { quoted: message })
    }

    const isAdmin = await checkBotAdmin(client, remoteJid)
    if (!isAdmin) {
        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ J'AI BESOIN D'ÊTRE ADMIN*
┊
╰─────────────────❂`
        }, { quoted: message })
    }

    const targets = await getTargets(client, message, remoteJid)

    if (!targets.length) {
        return client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊📝 UTILISATION :*
*┊.demote @mention*
*┊ou cite un message*
┊
╰─────────────────❂`
        }, { quoted: message })
    }

    try {
        await client.groupParticipantsUpdate(remoteJid, targets, 'demote')

        const names = targets.map(j => `@${j.split('@')[0]}`).join(', ')

        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ RETIRÉ ADMIN !*
┊
*┊👤 ${names}*
┊
╰─────────────────❂`,
            mentions: targets
        }, { quoted: message })

    } catch (err) {
        console.error('❌ demote:', err.message)
        await client.sendMessage(remoteJid, {
            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ ERREUR : ${err.message}*
┊
╰─────────────────❂`
        }, { quoted: message })
    }
}
