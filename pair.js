// webpair.js
import express from 'express'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason } from '@crysnovax/baileys'
import pino from 'pino'
import fs from 'fs'
import handleIncomingMessage from '.
./akane/akanes.js'

const app = express()
app.use(express.json())

const pendingCodes = new Map()
const activeSockets = new Map()
const SESSIONS_FILE = './sessions/pair_sessions.json'

function saveSession(number) {
    try {
        if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions', { recursive: true })
        let list = fs.existsSync(SESSIONS_FILE) ? JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8')) : []
        if (!list.includes(number)) {
            list.push(number)
            fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list, null, 2))
        }
    } catch (e) {}
}

function removeSession(number) {
    try {
        if (!fs.existsSync(SESSIONS_FILE)) return
        let list = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'))
        list = list.filter(n => n !== number)
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list, null, 2))
    } catch (e) {}
}

async function startSocket(number, isRestore) {
    if (isRestore === undefined) isRestore = false

    if (activeSockets.has(number)) {
        try { activeSockets.get(number).ws.close() } catch (e) {}
        activeSockets.delete(number)
        await new Promise(function(r) { setTimeout(r, 1000) })
    }

    const sessionDir = './sessions/pair_' + number

    if (!isRestore) {
        if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true })
        fs.mkdirSync(sessionDir, { recursive: true })
    }

    const versionInfo = await fetchLatestBaileysVersion()
    const version = versionInfo.version
    const authData = await useMultiFileAuthState(sessionDir)
    const state = authData.state
    const saveCreds = authData.saveCreds

    const sock = makeWASocket({
        version: version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        keepAliveIntervalMs: 5000,
        connectTimeoutMs: 60000,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        retryRequestDelayMs: 1000
    })

    activeSockets.set(number, sock)
    sock.ev.on('creds.update', saveCreds)

    let codeSent = isRestore
    let msgHandlerAttached = false
    let pingInterval = null
    let reconnectAttempts = 0

    sock.ev.on('connection.update', async function(update) {
        const connection = update.connection
        const lastDisconnect = update.lastDisconnect

        if (!codeSent && connection === 'connecting') {
            codeSent = true
            await new Promise(function(r) { setTimeout(r, 1500) })
            try {
                const code = await sock.requestPairingCode(number)
                const fmt = code.match(/.{1,4}/g)
                const formatted = fmt ? fmt.join('-') : code
                pendingCodes.set(number, { status: 'ready', code: formatted, error: null })
                console.log('Code genere pour +' + number + ': ' + formatted)
            } catch (e) {
                pendingCodes.set(number, { status: 'error', code: null, error: e.message })
                console.error('Erreur +' + number + ':', e.message)
                try { sock.ws.close() } catch (e2) {}
                activeSockets.delete(number)
            }
        }

        if (connection === 'open') {
            reconnectAttempts = 0
            console.log('+' + number + ' connecte - bot actif')
            saveSession(number)
            pendingCodes.set(number, { status: 'connected', code: null, error: null })

            if (pingInterval) clearInterval(pingInterval)
            pingInterval = setInterval(async function() {
                try {
                    if (activeSockets.get(number) === sock) {
                        await sock.sendPresenceUpdate('available')
                    } else {
                        clearInterval(pingInterval)
                    }
                } catch (e) { clearInterval(pingInterval) }
            }, 20000)

            if (!msgHandlerAttached) {
                msgHandlerAttached = true
                sock.ev.on('messages.upsert', async function(msg) {
                    try {
                        await handleIncomingMessage(sock, msg)
                    } catch (e) {
                        console.error('Erreur handler:', e.message)
                    }
                })
            }
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output
                ? lastDisconnect.error.output.statusCode : null
            msgHandlerAttached = false
            if (pingInterval) clearInterval(pingInterval)

            if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                console.log('+' + number + ' deconnecte definitivement')
                removeSession(number)
                activeSockets.delete(number)
            } else {
                reconnectAttempts++
                const delay = Math.min(3000 * reconnectAttempts, 30000)
                console.log('Reconnexion +' + number + ' dans ' + (delay / 1000) + 's...')
                setTimeout(async function() {
                    if (activeSockets.get(number) === sock) {
                        activeSockets.delete(number)
                        try { await startSocket(number, true) } catch (e) {
                            console.error('Reconnexion +' + number + ':', e.message)
                        }
                    }
                }, delay)
            }
        }
    })

    return sock
}

async function restoreSessions() {
    if (!fs.existsSync(SESSIONS_FILE)) return
    let list = []
    try { list = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8')) } catch (e) { return }
    if (list.length === 0) return

    console.log('Restauration de ' + list.length + ' session(s)...')
    for (let i = 0; i < list.length; i++) {
        const number = list[i]
        const sessionDir = './sessions/pair_' + number
        if (!fs.existsSync(sessionDir)) { removeSession(number); continue }
        try {
            await startSocket(number, true)
            await new Promise(function(r) { setTimeout(r, 1500) })
        } catch (e) {
            console.error('Restauration +' + number + ':', e.message)
        }
    }
}

app.post('/pair', async function(req, res) {
    const number = req.body.number
    if (!number || number.replace(/[^0-9]/g, '').length < 7) {
        return res.json({ error: 'Numero invalide' })
    }

    const clean = number.replace(/[^0-9]/g, '')
    pendingCodes.set(clean, { status: 'pending', code: null, error: null })

    startSocket(clean, false).catch(function(e) {
        pendingCodes.set(clean, { status: 'error', code: null, error: e.message })
    })

    res.json({ ok: true, number: clean })
})

app.get('/code/:number', function(req, res) {
    const clean = req.params.number.replace(/[^0-9]/g, '')
    const entry = pendingCodes.get(clean)
    if (!entry) return res.json({ status: 'not_found' })
    res.json(entry)
})

app.get('/ping', function(req, res) { res.send('pong') })

setInterval(function() {
    console.log('keep-alive ping')
}, 4 * 60 * 1000)

app.get('/', function(req, res) {
    res.send(buildHtmlPage())
})

function buildHtmlPage() {
    const lines = []
    lines.push('<!DOCTYPE html>')
    lines.push('<html lang="fr">')
    lines.push('<head>')
    lines.push('<meta charset="UTF-8">')
    lines.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    lines.push('<title>AKANE MD - Pairing</title>')
    lines.push('<style>')
    lines.push('* { margin:0; padding:0; box-sizing:border-box; }')
    lines.push('body { min-height: 100vh; background: #0a0a0a; font-family: "Segoe UI", sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }')
    lines.push('.card { background: #111; border: 1px solid #1e1e1e; border-radius: 24px; padding: 44px 36px; width: 100%; max-width: 440px; box-shadow: 0 0 60px rgba(233,30,140,0.06); }')
    lines.push('.logo { text-align:center; margin-bottom:36px; }')
    lines.push('.logo h1 { font-size: 30px; background: linear-gradient(135deg, #e91e8c, #ff6b35); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; letter-spacing: 3px; }')
    lines.push('.logo p { color:#444; font-size:13px; margin-top:8px; }')
    lines.push('.badge { display: inline-block; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 20px; padding: 4px 12px; font-size: 11px; color: #555; margin-top: 10px; letter-spacing: 1px; }')
    lines.push('.label { color:#666; font-size:11px; margin-bottom:8px; letter-spacing:1.5px; text-transform:uppercase; }')
    lines.push('input { width: 100%; background: #161616; border: 1px solid #242424; border-radius: 14px; padding: 15px 18px; color: #fff; font-size: 16px; outline: none; transition: border 0.2s, box-shadow 0.2s; }')
    lines.push('input:focus { border-color: #e91e8c; box-shadow: 0 0 0 3px rgba(233,30,140,0.08); }')
    lines.push('input::placeholder { color:#333; }')
    lines.push('button#pairBtn { width: 100%; margin-top: 14px; padding: 16px; background: linear-gradient(135deg, #e91e8c, #ff6b35); border: none; border-radius: 14px; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; letter-spacing: 1px; transition: opacity 0.2s, transform 0.1s; }')
    lines.push('button#pairBtn:hover { opacity:0.88; transform:translateY(-1px); }')
    lines.push('button#pairBtn:active { transform:translateY(0); }')
    lines.push('button#pairBtn:disabled { opacity:0.35; cursor:not-allowed; transform:none; }')
    lines.push('.status { margin-top:24px; padding:20px; border-radius:16px; text-align:center; display:none; }')
    lines.push('.status.loading { display:block; background:#161616; color:#666; font-size:14px; }')
    lines.push('.status.success { display:block; background:#0a1a0a; border:1px solid #1a2e1a; }')
    lines.push('.status.error { display:block; background:#1a0a0a; border:1px solid #2e1a1a; color:#ff6b6b; font-size:14px; }')
    lines.push('.status.connected { display:block; background:#0a1a14; border:1px solid #1a3e2e; color:#25d366; font-size:14px; }')
    lines.push('.code-label { color:#555; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px; }')
    lines.push('.code-display { font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #25d366; font-family: "Courier New", monospace; text-shadow: 0 0 20px rgba(37,211,102,0.3); }')
    lines.push('.copy-btn { margin-top: 14px; padding: 10px 24px; background: #0d1f0d; border: 1px solid #25d366; color: #25d366; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; display: inline-block; transition: background 0.2s; }')
    lines.push('.copy-btn:hover { background: #142814; }')
    lines.push('.expire { color:#ff9800; font-size:12px; margin-top:10px; }')
    lines.push('.steps { margin-top: 16px; text-align: left; color: #555; font-size: 12px; line-height: 2; background: #0e0e0e; border-radius: 10px; padding: 12px 14px; }')
    lines.push('.steps b { color: #777; }')
    lines.push('.spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid #222; border-top-color: #e91e8c; border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle; margin-right: 10px; }')
    lines.push('@keyframes spin { to { transform: rotate(360deg); } }')
    lines.push('footer { margin-top: 32px; color: #2a2a2a; font-size: 11px; letter-spacing: 1px; }')
    lines.push('</style>')
    lines.push('</head>')
    lines.push('<body>')
    lines.push('<div class="card">')
    lines.push('<div class="logo"><h1>AKANE MD</h1><p>Connectez votre WhatsApp au bot</p><span class="badge">MULTI USER - AI POWERED - SECURE</span></div>')
    lines.push('<div class="label">Numero WhatsApp</div>')
    lines.push('<input id="num" type="tel" placeholder="221705928204  (sans + ni espaces)" />')
    lines.push('<button id="pairBtn" onclick="requestCode()">Obtenir le code de connexion</button>')
    lines.push('<div id="status" class="status"></div>')
    lines.push('</div>')
    lines.push('<footer>AKANE MD - akanefx2003</footer>')
    lines.push('<script>')
    lines.push('var polling = null;')
    lines.push('function requestCode() {')
    lines.push('  var number = document.getElementById("num").value.replace(/[^0-9]/g, "");')
    lines.push('  if (number.length < 7) { showError("Entre un numero valide"); return; }')
    lines.push('  document.getElementById("pairBtn").disabled = true;')
    lines.push('  showLoading("Connexion a WhatsApp...");')
    lines.push('  fetch("/pair", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number: number }) })')
    lines.push('    .then(function(res) { return res.json(); })')
    lines.push('    .then(function(data) {')
    lines.push('      if (data.error) { showError(data.error); document.getElementById("pairBtn").disabled = false; return; }')
    lines.push('      showLoading("Generation du code en cours...");')
    lines.push('      if (polling) clearInterval(polling);')
    lines.push('      polling = setInterval(function() { checkCode(number); }, 1500);')
    lines.push('    })')
    lines.push('    .catch(function(e) { showError("Erreur de connexion au serveur"); document.getElementById("pairBtn").disabled = false; });')
    lines.push('}')
    lines.push('function checkCode(number) {')
    lines.push('  fetch("/code/" + number).then(function(res) { return res.json(); }).then(function(data) {')
    lines.push('    if (data.status === "ready") {')
    lines.push('      clearInterval(polling);')
    lines.push('      showCode(data.code, number);')
    lines.push('      polling = setInterval(function() { checkConnected(number); }, 2000);')
    lines.push('    } else if (data.status === "error") {')
    lines.push('      clearInterval(polling);')
    lines.push('      showError(data.error || "Erreur inconnue");')
    lines.push('      document.getElementById("pairBtn").disabled = false;')
    lines.push('    } else if (data.status === "connected") {')
    lines.push('      clearInterval(polling);')
    lines.push('      showConnected(number);')
    lines.push('    }')
    lines.push('  }).catch(function(e) {});')
    lines.push('}')
    lines.push('function checkConnected(number) {')
    lines.push('  fetch("/code/" + number).then(function(res) { return res.json(); }).then(function(data) {')
    lines.push('    if (data.status === "connected") { clearInterval(polling); showConnected(number); }')
    lines.push('  }).catch(function(e) {});')
    lines.push('}')
    lines.push('function showLoading(msg) {')
    lines.push('  var s = document.getElementById("status");')
    lines.push('  s.className = "status loading";')
    lines.push('  s.innerHTML = "<span class=\\"spinner\\"></span>" + msg;')
    lines.push('}')
    lines.push('function showCode(code, number) {')
    lines.push('  var s = document.getElementById("status");')
    lines.push('  s.className = "status success";')
    lines.push('  var html = "<div class=\\"code-label\\">Ton code de connexion WhatsApp</div>";')
    lines.push('  html += "<div class=\\"code-display\\">" + code + "</div>";')
    lines.push('  html += "<button class=\\"copy-btn\\" onclick=\\"copyCode(this.dataset.code)\\" data-code=\\"" + code + "\\">Copier le code</button>";')
    lines.push('  html += "<div class=\\"expire\\">Code expire dans 60 secondes ! Entre-le vite.</div>";')
    lines.push('  html += "<div class=\\"steps\\"><b>1.</b> Ouvre WhatsApp sur ton telephone<br>";')
    lines.push('  html += "<b>2.</b> Parametres -&gt; Appareils lies<br>";')
    lines.push('  html += "<b>3.</b> Lier un appareil -&gt; Lier avec un numero<br>";')
    lines.push('  html += "<b>4.</b> Entre le code ci-dessus</div>";')
    lines.push('  s.innerHTML = html;')
    lines.push('}')
    lines.push('function showConnected(number) {')
    lines.push('  var s = document.getElementById("status");')
    lines.push('  s.className = "status connected";')
    lines.push('  var html = "<div style=\\"font-size:18px;font-weight:700;\\">Bot connecte !</div>";')
    lines.push('  html += "<div style=\\"margin-top:8px;color:#888;font-size:13px;\\">+" + number + " est maintenant actif.<br>Tu peux utiliser le bot sur WhatsApp.</div>";')
    lines.push('  s.innerHTML = html;')
    lines.push('  document.getElementById("pairBtn").disabled = false;')
    lines.push('}')
    lines.push('function showError(msg) {')
    lines.push('  var s = document.getElementById("status");')
    lines.push('  s.className = "status error";')
    lines.push('  s.innerHTML = "Erreur: " + msg;')
    lines.push('}')
    lines.push('function copyCode(code) {')
    lines.push('  navigator.clipboard.writeText(code).then(function() {')
    lines.push('    var btn = document.querySelector(".copy-btn");')
    lines.push('    btn.textContent = "Copie !";')
    lines.push('    setTimeout(function() { btn.textContent = "Copier le code"; }, 2000);')
    lines.push('  });')
    lines.push('}')
    lines.push('</script>')
    lines.push('</body>')
    lines.push('</html>')
    return lines.join('\n')
}

const PORT = process.env.PORT || 3000
app.listen(PORT, async function() {
    console.log('AKANE MD Web Pair Server -> http://localhost:' + PORT)
    await restoreSessions()
})
