import express from 'express'
import {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    Browsers,
    DisconnectReason
} from '@crysnovax/baileys'
import pino from 'pino'
import fs from 'fs'

// ─── Gestion des erreurs non gérées ──────────────────────────────────────────
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

// ─── Config ───────────────────────────────────────────────────────────────────
const app = express()
app.use(express.json())

const pendingCodes  = new Map()   // number => { status, code, error }
const activeSockets = new Map()   // number => sock
const connectedNow  = new Set()   // numbers actifs en ce moment

const SESSIONS_FILE = './sessions/pair_sessions.json'
if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions', { recursive: true })

// ─── Helpers sessions ─────────────────────────────────────────────────────────
function saveSession(number) {
    try {
        let list = fs.existsSync(SESSIONS_FILE)
            ? JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'))
            : []
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

function getConnectedCount() {
    return connectedNow.size
}

// ─── Démarrage d'une session WhatsApp ────────────────────────────────────────
async function startSocket(number, isRestore = false) {
    if (activeSockets.has(number)) {
        try { activeSockets.get(number).ws.close() } catch (e) {}
        activeSockets.delete(number)
        await new Promise(r => setTimeout(r, 1000))
    }

    const sessionDir = `./sessions/pair_${number}`

    if (!isRestore) {
        if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true })
        fs.mkdirSync(sessionDir, { recursive: true })
    }

    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir)

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        retryRequestDelayMs: 1000
    })

    activeSockets.set(number, sock)
    sock.ev.on('creds.update', saveCreds)

    let codeSent        = isRestore
    let pingInterval    = null
    let reconnectCount  = 0

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update

        // Génération du code
        if (!codeSent && connection === 'connecting') {
            codeSent = true
            await new Promise(r => setTimeout(r, 1500))
            try {
                const code = await sock.requestPairingCode(number)
                const fmt  = code.match(/.{1,4}/g)?.join('-') || code
                pendingCodes.set(number, { status: 'ready', code: fmt, error: null })
                console.log(`🔑 Code +${number}: ${fmt}`)
            } catch (e) {
                pendingCodes.set(number, { status: 'error', code: null, error: e.message })
                try { sock.ws.close() } catch {}
                activeSockets.delete(number)
            }
        }

        // Connecté
        if (connection === 'open') {
            reconnectCount = 0
            connectedNow.add(number)
            saveSession(number)
            pendingCodes.set(number, { status: 'connected', code: null, error: null })
            console.log(`✅ +${number} connecté`)

            // Ping keep-alive 7j/7 24h/24
            if (pingInterval) clearInterval(pingInterval)
            pingInterval = setInterval(async () => {
                try {
                    if (activeSockets.get(number) === sock) {
                        await sock.sendPresenceUpdate('available')
                    } else {
                        clearInterval(pingInterval)
                    }
                } catch { clearInterval(pingInterval) }
            }, 20000)

            // Message de confirmation WhatsApp
            try {
                await sock.sendMessage(`${number}@s.whatsapp.net`, {
                    text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊✅ AKANE MD ACTIVÉ !*
┊
*┊📱 NUMERO : +${number}*
┊
*┊🤖 Ton bot est maintenant actif !*
*┊Tu peux utiliser toutes les*
*┊commandes dès maintenant.*
┊
*┊📢 REJOINS LA CHAÎNE :*
*┊https://whatsapp.com/channel/0029VbCrJRnGufIyytPXy606*
┊
╰─────────────────❂`
                })
            } catch (e) {
                console.error(`❌ Msg confirmation +${number}:`, e.message)
            }

            // Écoute des messages
            sock.ev.on('messages.upsert', async (msg) => {
                try {
                    // Import dynamique du handler du bot principal
                    const { default: handleIncomingMessage } = await import('./akane/akanes.js')
                    await handleIncomingMessage(sock, msg)
                } catch (e) {
                    console.error('❌ Handler:', e.message)
                }
            })
        }

        // Déconnecté
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode
            connectedNow.delete(number)
            if (pingInterval) clearInterval(pingInterval)

            if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                console.log(`🚫 +${number} logout définitif`)
                removeSession(number)
                activeSockets.delete(number)
            } else {
                reconnectCount++
                const delay = Math.min(3000 * reconnectCount, 30000)
                console.log(`🔄 Reconnexion +${number} dans ${delay/1000}s...`)
                setTimeout(async () => {
                    if (activeSockets.get(number) === sock) {
                        activeSockets.delete(number)
                        try { await startSocket(number, true) } catch (e) {
                            console.error(`❌ Reconnexion +${number}:`, e.message)
                        }
                    }
                }, delay)
            }
        }
    })

    return sock
}

// ─── Restauration des sessions au démarrage ───────────────────────────────────
async function restoreSessions() {
    if (!fs.existsSync(SESSIONS_FILE)) return
    let list = []
    try { list = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8')) } catch { return }
    if (!list.length) return

    console.log(`🔄 Restauration de ${list.length} session(s)...`)
    for (const number of list) {
        const sessionDir = `./sessions/pair_${number}`
        if (!fs.existsSync(sessionDir)) { removeSession(number); continue }
        try {
            await startSocket(number, true)
            await new Promise(r => setTimeout(r, 1500))
        } catch (e) {
            console.error(`❌ Restauration +${number}:`, e.message)
        }
    }
}

// ─── Keep-alive serveur (évite sleep sur Render free) ────────────────────────
setInterval(() => {
    console.log(`💓 keep-alive — ${getConnectedCount()} bot(s) actif(s)`)
}, 4 * 60 * 1000)

// ─── Routes API ───────────────────────────────────────────────────────────────
app.post('/pair', async (req, res) => {
    const { number } = req.body
    if (!number || number.replace(/[^0-9]/g, '').length < 7)
        return res.json({ error: 'Numéro invalide' })

    const clean = number.replace(/[^0-9]/g, '')

    // Permet plusieurs connexions sans déconnecter l'existant
    // (nouveau socket indépendant)
    pendingCodes.set(clean, { status: 'pending', code: null, error: null })
    startSocket(clean, false).catch(e => {
        pendingCodes.set(clean, { status: 'error', code: null, error: e.message })
    })

    res.json({ ok: true, number: clean })
})

app.get('/code/:number', (req, res) => {
    const clean = req.params.number.replace(/[^0-9]/g, '')
    const entry = pendingCodes.get(clean)
    if (!entry) return res.json({ status: 'not_found' })
    res.json(entry)
})

app.get('/stats', (req, res) => {
    res.json({ connected: getConnectedCount() })
})

app.get('/ping', (req, res) => res.send('pong'))

// ─── Page web ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AKANE MD — Pairing</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { min-height:100vh; background:#0a0a0a; font-family:'Segoe UI',sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; }
.card { background:#111; border:1px solid #1e1e1e; border-radius:24px; padding:44px 36px; width:100%; max-width:460px; box-shadow:0 0 60px rgba(233,30,140,0.06); }
.logo { text-align:center; margin-bottom:28px; }
.logo h1 { font-size:28px; background:linear-gradient(135deg,#e91e8c,#ff6b35); -webkit-background-clip:text; -webkit-text-fill-color:transparent; font-weight:900; letter-spacing:3px; }
.logo p { color:#444; font-size:12px; margin-top:6px; }
.badge { display:inline-block; background:#1a1a1a; border:1px solid #2a2a2a; border-radius:20px; padding:4px 12px; font-size:11px; color:#555; margin-top:8px; }
.stats { text-align:center; margin-bottom:20px; color:#555; font-size:12px; }
.stats span { color:#25d366; font-weight:700; }
.links { display:flex; justify-content:center; gap:10px; margin-bottom:24px; flex-wrap:wrap; }
.links a { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:20px; font-size:11px; font-weight:600; text-decoration:none; transition:opacity 0.2s; }
.links a:hover { opacity:0.8; }
.link-gh { background:#1a1a1a; border:1px solid #333; color:#ccc; }
.link-yt { background:#1a0a0a; border:1px solid #c00; color:#ff4444; }
.link-wa { background:#0a1a0a; border:1px solid #25d366; color:#25d366; }
.label { color:#666; font-size:11px; margin-bottom:8px; letter-spacing:1.5px; text-transform:uppercase; }
input { width:100%; background:#161616; border:1px solid #242424; border-radius:14px; padding:15px 18px; color:#fff; font-size:16px; outline:none; transition:border 0.2s,box-shadow 0.2s; }
input:focus { border-color:#e91e8c; box-shadow:0 0 0 3px rgba(233,30,140,0.08); }
input::placeholder { color:#333; }
button#pairBtn { width:100%; margin-top:14px; padding:16px; background:linear-gradient(135deg,#e91e8c,#ff6b35); border:none; border-radius:14px; color:#fff; font-size:15px; font-weight:700; cursor:pointer; letter-spacing:1px; transition:opacity 0.2s,transform 0.1s; }
button#pairBtn:hover { opacity:0.88; transform:translateY(-1px); }
button#pairBtn:disabled { opacity:0.35; cursor:not-allowed; transform:none; }
.status { margin-top:20px; padding:20px; border-radius:16px; text-align:center; display:none; }
.status.loading { display:block; background:#161616; color:#666; font-size:14px; }
.status.success { display:block; background:#0a1a0a; border:1px solid #1a2e1a; }
.status.connected { display:block; background:#0a1a14; border:1px solid #1a3e2e; }
.status.error { display:block; background:#1a0a0a; border:1px solid #2e1a1a; color:#ff6b6b; font-size:14px; }
.code-label { color:#555; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px; }
.code-display { font-size:40px; font-weight:900; letter-spacing:8px; color:#25d366; font-family:'Courier New',monospace; text-shadow:0 0 20px rgba(37,211,102,0.3); }
.copy-btn { margin-top:14px; padding:10px 24px; background:#0d1f0d; border:1px solid #25d366; color:#25d366; border-radius:10px; cursor:pointer; font-size:13px; font-weight:600; display:inline-block; }
.expire { color:#ff9800; font-size:12px; margin-top:10px; }
.steps { margin-top:16px; text-align:left; color:#555; font-size:12px; line-height:2; background:#0e0e0e; border-radius:10px; padding:12px 14px; }
.steps b { color:#777; }
.spinner { display:inline-block; width:18px; height:18px; border:2px solid #222; border-top-color:#e91e8c; border-radius:50%; animation:spin 0.7s linear infinite; vertical-align:middle; margin-right:10px; }
@keyframes spin { to { transform:rotate(360deg); } }
footer { margin-top:28px; color:#2a2a2a; font-size:11px; letter-spacing:1px; text-align:center; }
</style>
</head>
<body>
<div class="card">
  <div class="logo">
    <h1>🌹 AKANE MD</h1>
    <p>Connectez votre WhatsApp au bot</p>
    <span class="badge">MULTI USER • AI POWERED • SECURE</span>
  </div>

  <div class="stats">🟢 <span id="connCount">...</span> bot(s) actif(s) en ce moment</div>

  <div class="links">
    <a class="link-gh" href="https://github.com/akanefx2003/AKANE_MD" target="_blank">⭐ GitHub</a>
    <a class="link-wa" href="https://whatsapp.com/channel/0029VbCrJRnGufIyytPXy606" target="_blank">📢 Chaîne</a>
    <a class="link-yt" href="https://youtube.com/@akanefx-j3k9o?si=umMPewjZUzcOhilE" target="_blank">▶️ Tutoriel</a>
  </div>

  <div class="label">Numéro WhatsApp</div>
  <input id="num" type="tel" placeholder="221705928204  (sans + ni espaces)" />
  <button id="pairBtn" onclick="requestCode()">⚡ Obtenir le code de connexion</button>
  <div id="status" class="status"></div>
</div>
<footer>© AKANE MD — akanefx2003 • 7j/7 24h/24</footer>

<script>
// Mise à jour du compteur
async function updateStats() {
  try {
    const r = await fetch('/stats')
    const d = await r.json()
    document.getElementById('connCount').textContent = d.connected
  } catch(e) {}
}
updateStats()
setInterval(updateStats, 10000)

var polling = null

async function requestCode() {
  var number = document.getElementById('num').value.replace(/[^0-9]/g, '')
  if (number.length < 7) return showError('Entre un numéro valide (ex: 221705928204)')
  document.getElementById('pairBtn').disabled = true
  showLoading('Connexion à WhatsApp...')
  try {
    var res = await fetch('/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: number })
    })
    var data = await res.json()
    if (data.error) { showError(data.error); document.getElementById('pairBtn').disabled = false; return; }
    showLoading('Génération du code en cours...')
    if (polling) clearInterval(polling)
    polling = setInterval(function() { checkCode(number) }, 1500)
  } catch(e) {
    showError('Erreur de connexion au serveur')
    document.getElementById('pairBtn').disabled = false
  }
}

async function checkCode(number) {
  try {
    var res = await fetch('/code/' + number)
    var data = await res.json()
    if (data.status === 'ready') {
      clearInterval(polling)
      showCode(data.code, number)
      polling = setInterval(function() { checkConnected(number) }, 2000)
    } else if (data.status === 'connected') {
      clearInterval(polling)
      showConnected(number)
      document.getElementById('pairBtn').disabled = false
      updateStats()
    } else if (data.status === 'error') {
      clearInterval(polling)
      showError(data.error || 'Erreur inconnue')
      document.getElementById('pairBtn').disabled = false
    }
  } catch(e) {}
}

async function checkConnected(number) {
  try {
    var res = await fetch('/code/' + number)
    var data = await res.json()
    if (data.status === 'connected') {
      clearInterval(polling)
      showConnected(number)
      document.getElementById('pairBtn').disabled = false
      updateStats()
    }
  } catch(e) {}
}

function showLoading(msg) {
  var s = document.getElementById('status')
  s.className = 'status loading'
  s.innerHTML = '<span class="spinner"></span>' + msg
}

function showCode(code, number) {
  var s = document.getElementById('status')
  s.className = 'status success'
  s.innerHTML =
    '<div class="code-label">Ton code de connexion WhatsApp</div>' +
    '<div class="code-display">' + code + '</div>' +
    '<button class="copy-btn" onclick="copyCode(\'' + code + '\')">📋 Copier le code</button>' +
    '<div class="expire">⚠️ Code expire dans 60 secondes ! Entre-le vite.</div>' +
    '<div class="steps">' +
    '<b>1️⃣</b> Ouvre WhatsApp sur ton téléphone<br>' +
    '<b>2️⃣</b> Paramètres → Appareils liés<br>' +
    '<b>3️⃣</b> Lier un appareil → Lier avec un numéro<br>' +
    '<b>4️⃣</b> Entre le code ci-dessus</div>'
}

function showConnected(number) {
  var s = document.getElementById('status')
  s.className = 'status connected'
  s.innerHTML =
    '<div style="font-size:20px;font-weight:900;color:#25d366">✅ Bot connecté !</div>' +
    '<div style="margin-top:10px;color:#888;font-size:13px">+' + number + ' est maintenant actif 7j/7 24h/24.<br>Tu peux fermer cette page et utiliser le bot.</div>' +
    '<div style="margin-top:12px"><a href="https://whatsapp.com/channel/0029VbCrJRnGufIyytPXy606" target="_blank" style="color:#25d366;font-size:12px;text-decoration:none">📢 Rejoins la chaîne AKANE MD</a></div>'
}

function showError(msg) {
  var s = document.getElementById('status')
  s.className = 'status error'
  s.innerHTML = '❌ ' + msg
}

function copyCode(code) {
  navigator.clipboard.writeText(code).then(function() {
    var btn = document.querySelector('.copy-btn')
    btn.textContent = '✅ Copié !'
    setTimeout(function() { btn.textContent = '📋 Copier le code' }, 2000)
  })
}
</script>
</body>
</html>`)
})

// ─── Démarrage ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000
app.listen(PORT, async () => {
    console.log(`🌹 AKANE MD Pair Server → http://localhost:${PORT}`)
    await restoreSessions()
    console.log('✅ Sessions restaurées')
})
