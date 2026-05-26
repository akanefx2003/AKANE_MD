// commands/sudo.js
// @cat: bot-menu

import configmanager from '../utils/configmanager.js'
import fs from 'fs'

const TRUSTED_FILE = './AKANEX/trusted.js'

// ─── Lire/écrire trusted.js ───────────────────────────────────────────────────

function getTrustedNumbers() {
    try {
        const content = fs.readFileSync(TRUSTED_FILE, 'utf-8')
        const match = content.match(/TRUSTED_NUMBERS\s*=\s*\[([\s\S]*?)\]/)
        if (!match) return []
        return match[1]
            .split('\n')
            .map(l => l.replace(/['"`,\s]/g, '').replace(/\/\/.*/, '').trim())
            .filter(l => /^\d{7,15}$/.test(l))
    } catch { return [] }
}

function saveTrustedNumbers(numbers) {
    try {
        const content = fs.readFileSync(TRUSTED_FILE, 'utf-8')
        const lines = numbers.map(n => `    '${n}',`).join('\n')
        const newContent = content.replace(
            /TRUSTED_NUMBERS\s*=\s*\[([\s\S]*?)\]/,
            `TRUSTED_NUMBERS = [\n${lines}\n]`
        )
        fs.writeFileSync(TRUSTED_FILE, newContent, 'utf-8')
        return true
    } catch { return false }
}

// ─── Commande .sudo ───────────────────────────────────────────────────────────

export async function sudoCommand(client, message, args) {
    const jid = message.key.remoteJid
    const number = client.user.id.split(':')[0]
    const prefix = configmanager.config.users[number]?.prefix || '.'

    // Récupérer le numéro cible (mention ou argument)
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
    let targetJid = mentioned || null
    let targetNumber = args[0]?.replace(/[^0-9]/g, '')

    if (!targetJid && targetNumber && targetNumber.length >= 7) {
        targetJid = `${targetNumber}@s.whatsapp.net`
    }

    if (!targetJid) {
        await client.sendMessage(jid, {
            text:
`╭─✧🍓━━━━━━━━━━━━━━━❂
┊
*┊🛡️ COMMANDE SUDO*
┊
*┊📝 Usage :*
*┊${prefix}sudo @mention*
*┊${prefix}sudo 221XXXXXXXXX*
┊
*┊📝 Pour retirer :*
*┊${prefix}desudo @mention*
*┊${prefix}desudo 221XXXXXXXXX*
┊
╰───────────────────❂`
        })
        return
    }

    targetNumber = targetJid.replace('@s.whatsapp.net', '').split(':')[0]

    // Ajouter dans sudoList locale
    const userConfig = configmanager.config.users[number]
    if (!userConfig.sudoList) userConfig.sudoList = [`${number}@s.whatsapp.net`]

    if (userConfig.sudoList.includes(targetJid)) {
        await client.sendMessage(jid, {
            text:
`╭─✧🍓━━━━━━━━━━━━━━━❂
┊
*┊⚠️ DÉJÀ SUDO*
┊
*┊+${targetNumber} est déjà*
*┊dans la liste sudo !*
┊
╰───────────────────❂`
        })
        return
    }

    userConfig.sudoList.push(targetJid)
    configmanager.save()

    // Ajouter aussi dans trusted.js (accès global)
    const trusted = getTrustedNumbers()
    if (!trusted.includes(targetNumber)) {
        trusted.push(targetNumber)
        saveTrustedNumbers(trusted)
    }

    await client.sendMessage(jid, {
        text:
`╭─✧🍓━━━━━━━━━━━━━━━❂
┊
*┊✅ SUDO AJOUTÉ !*
┊
*┊👤 Numéro :* +${targetNumber}
*┊🛡️ Accès :* Toutes les commandes
*┊🌍 Global :* Oui (trusted.js)
┊
╰───────────────────❂`,
        mentions: [targetJid]
    })
}

// ─── Commande .desudo ─────────────────────────────────────────────────────────

export async function desudoCommand(client, message, args) {
    const jid = message.key.remoteJid
    const number = client.user.id.split(':')[0]

    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
    let targetJid = mentioned || null
    let targetNumber = args[0]?.replace(/[^0-9]/g, '')

    if (!targetJid && targetNumber && targetNumber.length >= 7) {
        targetJid = `${targetNumber}@s.whatsapp.net`
    }

    if (!targetJid) {
        await client.sendMessage(jid, {
            text: `╭─✧🍓━━━━━━━━━━━━━━━❂\n┊\n*┊❌ Mentionne quelqu'un ou donne un numéro !*\n┊\n╰───────────────────❂`
        })
        return
    }

    targetNumber = targetJid.replace('@s.whatsapp.net', '').split(':')[0]

    // Supprimer de sudoList locale
    const userConfig = configmanager.config.users[number]
    if (!userConfig?.sudoList) {
        await client.sendMessage(jid, {
            text: `╭─✧🍓━━━━━━━━━━━━━━━❂\n┊\n*┊⚠️ +${targetNumber} n'est pas dans la liste sudo !*\n┊\n╰───────────────────❂`
        })
        return
    }

    const ownerJid = `${number}@s.whatsapp.net`
    if (targetJid === ownerJid) {
        await client.sendMessage(jid, {
            text: `╭─✧🍓━━━━━━━━━━━━━━━❂\n┊\n*┊❌ Tu ne peux pas te desudo toi-même !*\n┊\n╰───────────────────❂`
        })
        return
    }

    const before = userConfig.sudoList.length
    userConfig.sudoList = userConfig.sudoList.filter(j => j !== targetJid)
    configmanager.save()

    // Supprimer aussi de trusted.js
    const trusted = getTrustedNumbers()
    const newTrusted = trusted.filter(n => n !== targetNumber)
    saveTrustedNumbers(newTrusted)

    if (userConfig.sudoList.length === before) {
        await client.sendMessage(jid, {
            text: `╭─✧🍓━━━━━━━━━━━━━━━❂\n┊\n*┊⚠️ +${targetNumber} n'était pas dans la liste sudo !*\n┊\n╰───────────────────❂`
        })
        return
    }

    await client.sendMessage(jid, {
        text:
`╭─✧🍓━━━━━━━━━━━━━━━❂
┊
*┊🗑️ SUDO RETIRÉ !*
┊
*┊👤 Numéro :* +${targetNumber}
*┊🛡️ Accès :* Retiré
*┊🌍 Global :* Retiré de trusted.js
┊
╰───────────────────❂`,
        mentions: [targetJid]
    })
}

// ─── Commande .sudolist ───────────────────────────────────────────────────────

export async function sudoListCommand(client, message) {
    const jid = message.key.remoteJid
    const number = client.user.id.split(':')[0]

    const sudoList = configmanager.config.users[number]?.sudoList || []
    const trusted = getTrustedNumbers()

    let text =
`╭─✧🍓━━━━━━━━━━━━━━━❂
┊
*┊🛡️ LISTE SUDO*
┊
*┊👥 Sudo locaux (${sudoList.length}) :*
`
    if (sudoList.length === 0) {
        text += `*┊ Aucun*\n`
    } else {
        sudoList.forEach(j => {
            const n = j.replace('@s.whatsapp.net', '')
            text += `*┊ ✦ +${n}*\n`
        })
    }

    text += `┊\n*┊🌍 Trusted globaux (${trusted.length}) :*\n`
    if (trusted.length === 0) {
        text += `*┊ Aucun*\n`
    } else {
        trusted.forEach(n => {
            text += `*┊ ✦ +${n}*\n`
        })
    }

    text += `┊\n╰───────────────────❂`

    await client.sendMessage(jid, { text })
}
