// commands/tag.js
// @cat: gc-menu

async function getMeta(client, remoteJid) {
    const meta    = await client.groupMetadata(remoteJid)
    const all     = meta.participants || []
    const admins  = all.filter(p => p.admin)
    const members = all.filter(p => !p.admin)
    return { all, admins, members, name: meta.subject }
}

function buildText(title, list, customText) {
    const mentions = list.map(p => p.id)
    const tags     = list.map(p => `@${p.id.split('@')[0]}`).join('\n')
    const text     =
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊${title}*
${customText ? `┊\n*┊📢 ${customText}*\n` : ''}┊
${tags}
┊
╰─────────────────❂`
    return { text, mentions }
}

// ══════════════════════════════════════════
// .tagall — tag tout le monde
// ══════════════════════════════════════════
export async function tagallCommand(client, message, args) {
    const remoteJid  = message.key.remoteJid
    if (!remoteJid.endsWith('@g.us')) return

    try {
        const { all }   = await getMeta(client, remoteJid)
        const customText = args.join(' ').trim()
        const { text, mentions } = buildText(`📢 TAG ALL — ${all.length} membres`, all, customText)

        await client.sendMessage(remoteJid, { text, mentions }, { quoted: message })
    } catch (err) {
        console.error('❌ tagall:', err.message)
        await client.sendMessage(remoteJid, { text: `❌ *Erreur : ${err.message}*` })
    }
}

// ══════════════════════════════════════════
// .tagadmin — tag seulement les admins
// ══════════════════════════════════════════
export async function tagadminCommand(client, message, args) {
    const remoteJid = message.key.remoteJid
    if (!remoteJid.endsWith('@g.us')) return

    try {
        const { admins } = await getMeta(client, remoteJid)

        if (!admins.length) {
            return client.sendMessage(remoteJid, {
                text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ AUCUN ADMIN TROUVÉ*
┊
╰─────────────────❂`
            }, { quoted: message })
        }

        const customText = args.join(' ').trim()
        const { text, mentions } = buildText(`👑 TAG ADMINS — ${admins.length} admins`, admins, customText)

        await client.sendMessage(remoteJid, { text, mentions }, { quoted: message })
    } catch (err) {
        console.error('❌ tagadmin:', err.message)
        await client.sendMessage(remoteJid, { text: `❌ *Erreur : ${err.message}*` })
    }
}

// ══════════════════════════════════════════
// .tagmembers — tag seulement les non-admins
// ══════════════════════════════════════════
export async function tagmembersCommand(client, message, args) {
    const remoteJid = message.key.remoteJid
    if (!remoteJid.endsWith('@g.us')) return

    try {
        const { members } = await getMeta(client, remoteJid)

        if (!members.length) {
            return client.sendMessage(remoteJid, {
                text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊❌ AUCUN MEMBRE TROUVÉ*
┊
╰─────────────────❂`
            }, { quoted: message })
        }

        const customText = args.join(' ').trim()
        const { text, mentions } = buildText(`👤 TAG MEMBRES — ${members.length} membres`, members, customText)

        await client.sendMessage(remoteJid, { text, mentions }, { quoted: message })
    } catch (err) {
        console.error('❌ tagmembers:', err.message)
        await client.sendMessage(remoteJid, { text: `❌ *Erreur : ${err.message}*` })
    }
}
