import fs from 'fs'

// ✅ Capture toutes les erreurs non gérées
process.on('uncaughtException', (err) => {
    const msg = new Date().toISOString() + '\n' + err.stack + '\n\n'
    fs.appendFileSync('./crash.log', msg)
    console.error('💥 CRASH:', err.stack)
})

process.on('unhandledRejection', (reason) => {
    const msg = new Date().toISOString() + '\nUnhandled Rejection: ' + reason + '\n\n'
    fs.appendFileSync('./crash.log', msg)
    console.error('💥 REJECTION:', reason)
})

import connectToWhatsapp from './AKANEX/akanex.js'
import handleIncomingMessage from './akane/akanes.js'
import { restorePairSessions } from './AKANEX/pair.js'

// ==================== SYSTÈME ANTI-BAN ====================

const antiBan = {

    // Délai entre chaque message envoyé (ms)
    MESSAGE_DELAY_MIN: 800,
    MESSAGE_DELAY_MAX: 2000,

    // Limite de messages par minute par utilisateur
    MAX_MESSAGES_PER_MINUTE: 20,

    // Limite de messages globaux par minute
    MAX_GLOBAL_PER_MINUTE: 60,

    // File d'attente des messages
    queue: [],
    isProcessing: false,

    // Compteurs par utilisateur
    userCounters: new Map(),

    // Compteur global
    globalCount: 0,
    globalResetTime: Date.now(),

    // Vérifier si un utilisateur est trop actif
    checkUser(jid) {
        const now = Date.now()
        let data = this.userCounters.get(jid)

        if (!data || now - data.resetTime > 60000) {
            data = { count: 0, resetTime: now }
        }

        data.count++
        this.userCounters.set(jid, data)

        if (data.count > this.MAX_MESSAGES_PER_MINUTE) {
            console.warn(`⚠️ [ANTI-BAN] Trop de msgs de ${jid} — ignoré`)
            return false
        }
        return true
    },

    // Vérifier la limite globale
    checkGlobal() {
        const now = Date.now()
        if (now - this.globalResetTime > 60000) {
            this.globalCount = 0
            this.globalResetTime = now
        }
        this.globalCount++
        if (this.globalCount > this.MAX_GLOBAL_PER_MINUTE) {
            console.warn(`⚠️ [ANTI-BAN] Limite globale atteinte — pause`)
            return false
        }
        return true
    },

    // Délai aléatoire humain
    async humanDelay() {
        const delay = Math.floor(
            Math.random() * (this.MESSAGE_DELAY_MAX - this.MESSAGE_DELAY_MIN)
            + this.MESSAGE_DELAY_MIN
        )
        await new Promise(r => setTimeout(r, delay))
    },

    // Nettoyage mémoire toutes les 5 min
    startCleanup() {
        setInterval(() => {
            const now = Date.now()
            for (const [jid, data] of this.userCounters.entries()) {
                if (now - data.resetTime > 120000) {
                    this.userCounters.delete(jid)
                }
            }
        }, 5 * 60 * 1000)
    }
}

antiBan.startCleanup()

// ==================== WRAPPER HANDLER ANTI-BAN ====================

async function safeHandleMessage(client, msg) {
    try {
        const sender = msg.messages?.[0]?.key?.participant
            || msg.messages?.[0]?.key?.remoteJid
            || 'unknown'

        // Ignorer les messages broadcast/status
        if (sender === 'status@broadcast') return
        if (sender?.includes('broadcast')) return

        // Vérifier les limites
        if (!antiBan.checkUser(sender)) return
        if (!antiBan.checkGlobal()) {
            await new Promise(r => setTimeout(r, 3000))
        }

        // Délai humain avant traitement
        await antiBan.humanDelay()

        // Traiter le message
        await handleIncomingMessage(client, msg)

    } catch (e) {
        console.error('❌ Erreur handler:', e.message)
    }
}

// ==================== DÉMARRAGE ====================

;(async () => {
    console.log('🚀 AKANE MD : Démarrage...')

    await connectToWhatsapp(safeHandleMessage)
    console.log('✅ Connecté !')

    setTimeout(async () => {
        await restorePairSessions()
        console.log('🔄 Sessions restaurées.')
    }, 5000)
})()
