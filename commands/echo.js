// commands/echo.js
// @cat: tools

const activeEchos = new Map()

export default async function echoCommand(client, message, args) {
    const remoteJid = message.key.remoteJid

    if (!args[0]) {
        await client.sendMessage(remoteJid, {
            text:
`╭─✧🍉━━━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD - ECHO*
┊
*┊📋 UTILISATION :*
*┊ECHO [NOMBRE] [TEXTE]*
┊
*┊📌 EXEMPLES :*
*┊ECHO 10 SALUT*
*┊ECHO 10 SALUT|ECOLE|CV*
┊
*┊💡 SEPARE LES TEXTES AVEC |*
*┊ILS S'ALTERNERONT AUTOMATIQUEMENT*
┊
*┊⏱️ INTERVALLE : 7 SECONDES*
┊
*┊🛑 POUR ARRETER : ECHO STOP*
┊
╰───────────────────❂`
        })
        return
    }

    // ── Stop ──
    if (args[0].toLowerCase() === 'stop') {
        if (activeEchos.has(remoteJid)) {
            clearTimeout(activeEchos.get(remoteJid).timeout)
            activeEchos.delete(remoteJid)
            await client.sendMessage(remoteJid, {
                text:
`╭─✧🍉━━━━━━━━━━━━━━━❂
┊
*┊🛑 ECHO ARRETE !*
┊
╰───────────────────❂`
            })
        } else {
            await client.sendMessage(remoteJid, {
                text:
`╭─✧🍉━━━━━━━━━━━━━━━❂
┊
*┊❌ AUCUN ECHO EN COURS*
┊
╰───────────────────❂`
            })
        }
        return
    }

    const count = parseInt(args[0])
    const rawText = args.slice(1).join(' ').trim()

    if (isNaN(count) || count < 1) {
        await client.sendMessage(remoteJid, {
            text:
`╭─✧🍉━━━━━━━━━━━━━━━❂
┊
*┊❌ NOMBRE INVALIDE*
┊
*┊📋 EXEMPLE : ECHO 10 SALUT|ECOLE|CV*
┊
╰───────────────────❂`
        })
        return
    }

    if (!rawText) {
        await client.sendMessage(remoteJid, {
            text:
`╭─✧🍉━━━━━━━━━━━━━━━❂
┊
*┊❌ TEXTE MANQUANT*
┊
*┊📋 EXEMPLE : ECHO 10 SALUT|ECOLE|CV*
┊
╰───────────────────❂`
        })
        return
    }

    if (count > 500) {
        await client.sendMessage(remoteJid, {
            text:
`╭─✧🍉━━━━━━━━━━━━━━━❂
┊
*┊❌ MAXIMUM 500 MESSAGES*
┊
╰───────────────────❂`
        })
        return
    }

    // ── Découper les textes avec | ──
    const texts = rawText.split('|').map(t => t.trim()).filter(t => t.length > 0)

    // Si un echo tourne déjà, on l'arrête
    if (activeEchos.has(remoteJid)) {
        clearTimeout(activeEchos.get(remoteJid).timeout)
        activeEchos.delete(remoteJid)
    }

    const textsDisplay = texts.map(t => `*┊• ${t.toUpperCase()}*`).join('\n')

    await client.sendMessage(remoteJid, {
        text:
`╭─✧🍉━━━━━━━━━━━━━━━❂
┊
*┊✅ ECHO LANCE !*
┊
*┊🔢 NOMBRE : ${count}*
┊
*┊💬 TEXTES :*
${textsDisplay}
┊
*┊⏱️ INTERVALLE : 7 SECONDES*
┊
*┊🛑 POUR ARRETER : ECHO STOP*
┊
╰───────────────────❂`
    })

    let sent = 0
    const state = { timeout: null }
    activeEchos.set(remoteJid, state)

    const sendNext = async () => {
        if (sent >= count || !activeEchos.has(remoteJid)) {
            activeEchos.delete(remoteJid)
            return
        }

        // ── Alterner entre les textes ──
        const currentText = texts[sent % texts.length]

        try {
            await client.sendMessage(remoteJid, { text: currentText })
            sent++
        } catch (e) {
            console.error('[ECHO ERROR]', e.message)
            activeEchos.delete(remoteJid)
            return
        }

        if (sent < count && activeEchos.has(remoteJid)) {
            state.timeout = setTimeout(sendNext, 7000)
        } else {
            activeEchos.delete(remoteJid)
        }
    }

    state.timeout = setTimeout(sendNext, 500)
}
