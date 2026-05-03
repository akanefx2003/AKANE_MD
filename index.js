import connectToWhatsapp from './AKANEX/akanex.js'

import handleIncomingMessage from './akane/akanes.js'

(async() => {

    await connectToWhatsapp(handleIncomingMessage)

    console.log('established !')

})()
