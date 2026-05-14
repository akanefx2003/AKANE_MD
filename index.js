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
