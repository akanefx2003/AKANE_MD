import connectToWhatsapp from './AKANEX/akanex.js'
import handleIncomingMessage from './akane/akanes.js'
import { restorePairSessions } from './AKANEX/pair.js'

(async() => {

    // ✅ Démarrer le bot principal
    await connectToWhatsapp(handleIncomingMessage)
    console.log('established !')

    // ✅ Restaurer les bots parrains après 5 secondes
    // (laisser le bot principal se connecter d'abord)
    setTimeout(async () => {
        await restorePairSessions()
    }, 5000)

})()
