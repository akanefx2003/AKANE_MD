const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            // 🌟 MODIF 1 : Déguiser le bot en Mac OS pour éviter le blocage WhatsApp
            browser: ['Mac OS', 'Safari', '14.0.0'],
            keepAliveIntervalMs: 10000,
            connectTimeoutMs: 60000,
            syncFullHistory: false,
            markOnlineOnConnect: true,
        })

        activeSockets.set(formatted, sock)
        sock.ev.on('creds.update', saveCreds)

        let codeSent = false

        const connectionPromise = new Promise((resolve, reject) => {
            const globalTimeout = setTimeout(() => {
                try { sock.ws.close() } catch {}
                activeSockets.delete(formatted)
                reject(new Error('Timeout de liaison dépassé. Veuillez réessayer.'))
            }, 120000)

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update

                if (!codeSent && connection === 'connecting') {
                    codeSent = true
                    await new Promise(r => setTimeout(r, 4000)) 
                    
                    try {
                        const code = await sock.requestPairingCode(formatted)
                        const fmt = code.match(/.{1,4}/g)?.join('-') || code
                        
                        console.log(`✅ Code généré avec succès pour +${formatted} : ${fmt}`)
                        
                        pendingCodes.set(formatted, { 
                            status: 'ready', 
                            code: fmt, 
                            error: null,
                            number: formatted
                        })
                        
                        resolve(fmt)
                    } catch (e) {
                        clearTimeout(globalTimeout)
                        try { sock.ws.close() } catch {}
                        activeSockets.delete(formatted)
                        reject(e)
                    }
                }

                if (connection === 'open') {
                    clearTimeout(globalTimeout)
                    console.log(`🎉 Liaison validée par l'appareil pour +${formatted} !`)
                    
                    pendingCodes.set(formatted, {
                        status: 'connected',
                        code: null,
                        error: null,
                        number: formatted
                    })

                    // 🌟 MODIF 2 : On donne 15 secondes pleines pour écrire le creds.json sans corrompre la session
                    setTimeout(() => {
                        console.log(`Fermeture propre du socket de pairing pour +${formatted}`)
                        try { sock.ws.close() } catch {}
                        activeSockets.delete(formatted)
                    }, 15000)
                }

                if (connection === 'close') {
                    const reason = lastDisconnect?.error?.output?.statusCode
                    console.log(`ℹ️ Socket fermé (Code: ${reason})`)
                }
            })
        })