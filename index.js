import fs from 'fs'

// ✅ Capture toutes les erreurs non gérées et les sauvegarde dans crash.log
process.on('uncaughtException', (err) => {
    const msg = new Date().toISOString() + '\n' + err.stack + '\n\n'
    fs.appendFileSync('./crash.log', msg)
    console.error('💥 CRASH:', err.stack)
    // Ne pas quitter — laisser le bot se reconnecter
})

process.on('unhandledRejection', (reason) => {
    const msg = new Date().toISOString() + '\nUnhandled Rejection: ' + reason + '\n\n'
    fs.appendFileSync('./crash.log', msg)
    console.error('💥 REJECTION:', reason)
})

import connectToWhatsapp from './AKANEX/akanex.js'
import handleIncomingMessage from './akane/akanes.js'
import { restorePairSessions } from './AKANEX/pair.js'

(async() => {
    console.log('🚀 AKANE MD : Démarrage direct...');

    // Démarrage sans obscurcissement
    await connectToWhatsapp(handleIncomingMessage)
    console.log('✅ Connecté !')

    setTimeout(async () => {
        await restorePairSessions()
        console.log('🔄 Sessions restaurées.');
    }, 5000)
})()
