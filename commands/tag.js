// commands/tag.js
// @cat: gc-menu

import fs from 'fs'
import { downloadMediaMessage } from'baileys',

const ANTITAG_FILE = './data/antitag.json'

function loadAntitag() {
    try {
        if (!fs.existsSync(ANTITAG_FILE)) return {}
        return JSON.parse(fs.readFileSync(ANTITAG_FILE, 'utf-8'))
    } catch (e) {
        return {}
    }
}

function saveAntitag(data) {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true })
        fs.writeFileSync(ANTITAG_FILE, JSON.stringify(data, null, 2))
    } catch (e) {}
}

function isExcluded(remoteJid, jid) {
    const data    = loadAntitag()
    const number  = jid.split('@')[0]
    const list    = data[remoteJid] || []
    return list.includes(number)
}

function filterExcluded(remoteJid, list) {
    const data     = loadAntitag()
    const excluded = data[remoteJid] || []
    return list.filter(p => !excluded.includes(p.id.split('@')[0]))
}

async function getMeta(client, remoteJid) {
    const meta    = await client.groupMetadata(remoteJid)
    const all     = filterExcluded(remoteJid, meta.participants || [])
    const admins  = all.filter(p => p.admin)
    const members = all.filter(p => !p.admin)
    return { all, admins, members, name: meta.subject }
}

function groupOnlyMessage(command) {
    return {
        text:
`╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
│ ╍─̇─̣⊱ AKANE MD ⊰┈─̇─̣╍
│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣
│✿ ⚠️ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐄 𝐆𝐑𝐎𝐔𝐏𝐄 𝐔𝐍𝐈𝐐𝐔𝐄𝐌𝐄𝐍𝐓
│✿ .${command} 𝐧𝐞 𝐟𝐨𝐧𝐜𝐭𝐢𝐨𝐧𝐧𝐞 𝐪𝐮𝐞 𝐝𝐚𝐧𝐬 𝐥𝐞𝐬 𝐠𝐫𝐨𝐮𝐩𝐞𝐬
╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ AKANE MD`
    }
}

function helpMessage(command) {

    const usages = {
        tagall:     ['.tagall [message]', 'Mentionne tout le monde avec la liste visible'],
        tagadmin:   ['.tagadmin [message]', 'Mentionne uniquement les admins'],
        tagmembers: ['.tagmembers [message]', 'Mentionne uniquement les non-admins'],
        hidetag:    ['.hidetag [message]', 'Mentionne tout le monde SANS afficher la liste (notif silencieuse)'],
        antitag:    ['.antitag on / .antitag off', 'Activer/désactiver tes propres mentions par @tous, @admins, @membres, hidetag']
    }

    const [usage, desc] = usages[command]

    return {
        text:
`╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
│ ╍─̇─̣⊱ AKANE MD ⊰┈─̇─̣╍
│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣
│✿ 📖 𝐀𝐈𝐃𝐄 : .${command}
│✿ 📝 𝐔𝐬𝐚𝐠𝐞 : ${usage}
│✿ 💡 ${desc}
│✿ ⚠️ 𝐆𝐫𝐨𝐮𝐩𝐞 𝐮𝐧𝐢𝐪𝐮𝐞𝐦𝐞𝐧𝐭
╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ AKANE MD`
    }
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

    if ((args[0] || '').toLowerCase() === 'aide' || (args[0] || '').toLowerCase() === 'help') {
        return client.sendMessage(remoteJid, helpMessage('tagall'), { quoted: message })
    }

    if (!remoteJid.endsWith('@g.us')) {
        return client.sendMessage(remoteJid, groupOnlyMessage('tagall'), { quoted: message })
    }

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

    if ((args[0] || '').toLowerCase() === 'aide' || (args[0] || '').toLowerCase() === 'help') {
        return client.sendMessage(remoteJid, helpMessage('tagadmin'), { quoted: message })
    }

    if (!remoteJid.endsWith('@g.us')) {
        return client.sendMessage(remoteJid, groupOnlyMessage('tagadmin'), { quoted: message })
    }

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
// .antitag — s'exclure / se réinclure des @tous, @admins, @membres
// ══════════════════════════════════════════
export async function antitagCommand(client, message, args) {
    const remoteJid = message.key.remoteJid

    if ((args[0] || '').toLowerCase() === 'aide' || (args[0] || '').toLowerCase() === 'help') {
        return client.sendMessage(remoteJid, helpMessage('antitag'), { quoted: message })
    }

    if (!remoteJid.endsWith('@g.us')) {
        return client.sendMessage(remoteJid, groupOnlyMessage('antitag'), { quoted: message })
    }

    try {
        const sender = message.key.participant || message.key.remoteJid
        const number = sender.split('@')[0]
        const action  = (args[0] || '').toLowerCase()

        const data = loadAntitag()
        data[remoteJid] = data[remoteJid] || []

        if (action === 'off') {

            if (!data[remoteJid].includes(number)) {
                return client.sendMessage(remoteJid, {
                    text:
`╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
│ ╍─̇─̣⊱ AKANE MD ⊰┈─̇─̣╍
│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣
│✿ ℹ️ 𝐀𝐍𝐓𝐈𝐓𝐀𝐆 𝐝𝐞́𝐣𝐚̀ 𝐝𝐞́𝐬𝐚𝐜𝐭𝐢𝐯𝐞́
│✿ 𝐓𝐮 𝐩𝐞𝐮𝐱 𝐭𝐨𝐮𝐣𝐨𝐮𝐫𝐬 𝐞̂𝐭𝐫𝐞 𝐭𝐚𝐠𝐠𝐞́
╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ AKANE MD`
                }, { quoted: message })
            }

            data[remoteJid] = data[remoteJid].filter(n => n !== number)
            saveAntitag(data)

            return client.sendMessage(remoteJid, {
                text:
`╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
│ ╍─̇─̣⊱ AKANE MD ⊰┈─̇─̣╍
│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣
│✿ ✅ 𝐓𝐮 𝐩𝐞𝐮𝐱 𝐝𝐞 𝐧𝐨𝐮𝐯𝐞𝐚𝐮 𝐞̂𝐭𝐫𝐞 𝐭𝐚𝐠𝐠𝐞́
│✿ (@tous, @admins, @membres)
╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ AKANE MD`
            }, { quoted: message })

        }

        // Par défaut (ou .antitag on) → activer l'exclusion
        if (data[remoteJid].includes(number)) {
            return client.sendMessage(remoteJid, {
                text:
`╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
│ ╍─̇─̣⊱ AKANE MD ⊰┈─̇─̣╍
│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣
│✿ ℹ️ 𝐀𝐍𝐓𝐈𝐓𝐀𝐆 𝐝𝐞́𝐣𝐚̀ 𝐚𝐜𝐭𝐢𝐯𝐞́
│✿ 𝐓𝐮 𝐧𝐞 𝐬𝐞𝐫𝐚𝐬 𝐩𝐥𝐮𝐬 𝐦𝐞𝐧𝐭𝐢𝐨𝐧𝐧𝐞́
╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ AKANE MD`
            }, { quoted: message })
        }

        data[remoteJid].push(number)
        saveAntitag(data)

        await client.sendMessage(remoteJid, {
            text:
`╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
│ ╍─̇─̣⊱ AKANE MD ⊰┈─̇─̣╍
│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣
│✿ 🔇 𝐀𝐍𝐓𝐈𝐓𝐀𝐆 𝐀𝐂𝐓𝐈𝐕𝐄́
│✿ 𝐓𝐮 𝐧𝐞 𝐬𝐞𝐫𝐚𝐬 𝐩𝐥𝐮𝐬 𝐦𝐞𝐧𝐭𝐢𝐨𝐧𝐧𝐞́
│✿ 𝐩𝐚𝐫 @tous, @admins, @membres
│✿ 💡 .antitag off 𝐩𝐨𝐮𝐫 𝐝𝐞́𝐬𝐚𝐜𝐭𝐢𝐯𝐞𝐫
╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ AKANE MD`
        }, { quoted: message })

    } catch (err) {
        console.error('❌ antitag:', err.message)
        await client.sendMessage(remoteJid, { text: `❌ *Erreur : ${err.message}*` })
    }
}

// ══════════════════════════════════════════
// .hidetag — mentionne tout le monde sans afficher la liste
// ══════════════════════════════════════════
export async function hidetagCommand(client, message, args) {
    const remoteJid = message.key.remoteJid

    if ((args[0] || '').toLowerCase() === 'aide' || (args[0] || '').toLowerCase() === 'help') {
        return client.sendMessage(remoteJid, helpMessage('hidetag'), { quoted: message })
    }

    if (!remoteJid.endsWith('@g.us')) {
        return client.sendMessage(remoteJid, groupOnlyMessage('hidetag'), { quoted: message })
    }

    try {
        const { all } = await getMeta(client, remoteJid)
        const mentions = all.map(p => p.id)

        const contextInfo = message.message?.extendedTextMessage?.contextInfo
        const quoted      = contextInfo?.quotedMessage
        const customText  = args.join(' ').trim()

        // ── Cas 1 : réponse à une image ou vidéo ─────────────────────────
        if (quoted?.imageMessage || quoted?.videoMessage) {

            const quotedMsg = {
                key: {
                    remoteJid,
                    id: contextInfo.stanzaId,
                    participant: contextInfo.participant
                },
                message: quoted
            }

            const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {})

            const caption = customText
                || quoted.imageMessage?.caption
                || quoted.videoMessage?.caption
                || ''

            if (quoted.imageMessage) {
                await client.sendMessage(remoteJid, { image: buffer, caption, mentions })
            } else {
                await client.sendMessage(remoteJid, {
                    video: buffer,
                    caption,
                    mentions,
                    mimetype: quoted.videoMessage?.mimetype || 'video/mp4'
                })
            }

        } else {

            // ── Cas 2 : texte (donné ou cité) ────────────────────────────
            const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text

            if (!customText && !quotedText) {
                return client.sendMessage(remoteJid, {
                    text:
`╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
│ ╍─̇─̣⊱ AKANE MD ⊰┈─̇─̣╍
│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣
│✿ ❓ 𝐓𝐮 𝐝𝐨𝐢𝐬 𝐞́𝐜𝐫𝐢𝐫𝐞 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐞
│✿ 📝 𝐔𝐬𝐚𝐠𝐞 : .hidetag [𝐭𝐨𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐞]
│✿ 💡 𝐄𝐱 : .hidetag salut tout le monde
╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ AKANE MD`
                }, { quoted: message })
            }

            const text = customText || quotedText
            await client.sendMessage(remoteJid, { text, mentions })

        }

        // ── Supprimer le message de commande (.hidetag ...) ──────────────
        try {
            await client.sendMessage(remoteJid, { delete: message.key })
        } catch (e) {}

    } catch (err) {
        console.error('❌ hidetag:', err.message)
        await client.sendMessage(remoteJid, { text: `❌ *Erreur : ${err.message}*` })
    }
}


// ══════════════════════════════════════════
// .tagmembers — tag seulement les non-admins
// ══════════════════════════════════════════
export async function tagmembersCommand(client, message, args) {
    const remoteJid = message.key.remoteJid

    if ((args[0] || '').toLowerCase() === 'aide' || (args[0] || '').toLowerCase() === 'help') {
        return client.sendMessage(remoteJid, helpMessage('tagmembers'), { quoted: message })
    }

    if (!remoteJid.endsWith('@g.us')) {
        return client.sendMessage(remoteJid, groupOnlyMessage('tagmembers'), { quoted: message })
    }

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
