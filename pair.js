import express from 'express'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } from '@crysnovax/baileys'
import pino from 'pino'
import fs from 'fs'
import path from 'path'

// Importation de la logique principale de votre bot AKANE MD
// (Ajustez les chemins si vos fichiers principaux s'appellent différemment)
import { handleIncomingMessage } from './akane/akanes.js' 

const app = express()
app.use(express.json())

const pendingCodes = new Map()

// ─── Lancement de la Session Principale du Bot ───────────────────────────────
async function startMainBot() {
    const mainSessionDir = './sessions/main_session'
    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(mainSessionDir)

    const mainSock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true, // Affiche le QR dans les logs au cas où
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
    })

    mainSock.ev.on('creds.update', saveCreds)

    mainSock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'open') {
            console.log('🌹 [AKANE MD] Le bot principal est connecté et opérationnel !')
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401
            console.log(`⚠️ Connexion fermée. Reconnexion : ${shouldReconnect}`)
            if (shouldReconnect) startMainBot()
        }
    })

    // Gestion des messages reçus par votre bot
    mainSock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            if (handleIncomingMessage) {
                await handleIncomingMessage(mainSock, chatUpdate)
            }
        } catch (err) {
            console.error('Erreur lors du traitement du message:', err)
        }
    })
}

// Lancement automatique du bot au démarrage
startMainBot().catch(err => console.error("Erreur lancement bot:", err))


// ─── Génération temporaire de Code de Pairing (Site Web) ────────────────────
async function generateCode(number) {
    const sessionDir = `./sessions/pair_${number}`
    if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true })
    fs.mkdirSync(sessionDir, { recursive: true })

    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir)

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        keepAliveIntervalMs: 5000,
        connectTimeoutMs: 60000,
        syncFullHistory: false,
        markOnlineOnConnect: false,
    })

    sock.ev.on('creds.update', saveCreds)

    let codeSent = false
    sock.ev.on('connection.update', async (update) => {
        const { connection } = update
        if (!codeSent && connection === 'connecting') {
            codeSent = true
            await new Promise(r => setTimeout(r, 3000))
            try {
                const code = await sock.requestPairingCode(number)
                const fmt = code.match(/.{1,4}/g)?.join('-') || code
                pendingCodes.set(number, { status: 'ready', code: fmt, error: null })
                console.log(`✅ Code généré pour +${number}: ${fmt}`)
            } catch (e) {
                pendingCodes.set(number, { status: 'error', code: null, error: e.message })
                console.error(`❌ Erreur +${number}:`, e.message)
                try { sock.ws.close() } catch {}
            }
        }
    })
}

// ─── Routes API & Anti-veille ────────────────────────────────────────────────
app.post('/pair', async (req, res) => {
    const { number } = req.body
    if (!number || number.replace(/[^0-9]/g, '').length < 7)
        return res.json({ error: 'Numéro invalide' })

    const clean = number.replace(/[^0-9]/g, '')
    pendingCodes.set(clean, { status: 'pending', code: null, error: null })

    generateCode(clean).catch(e => {
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

// Endpoint Ping pour éviter la mise en veille Render
app.get('/ping', (req, res) => {
    res.json({ status: 'alive', timestamp: Date.now() })
})

// ─── Interface Web (HTML) ────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AKANE MD — Pairing</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { min-height: 100vh; background: #0a0a0a; font-family: 'Segoe UI', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
  .card { background: #111; border: 1px solid #1e1e1e; border-radius: 24px; padding: 44px 36px; width: 100%; max-width: 440px; box-shadow: 0 0 60px rgba(233,30,140,0.06); }
  .logo { text-align:center; margin-bottom:36px; }
  .logo h1 { font-size: 30px; background: linear-gradient(135deg, #e91e8c, #ff6b35); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; letter-spacing: 3px; }
  .logo p { color:#444; font-size:13px; margin-top:8px; }
  .badge { display: inline-block; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 20px; padding: 4px 12px; font-size: 11px; color: #555; margin-top: 10px; letter-spacing: 1px; }
  .label { color:#666; font-size:11px; margin-bottom:8px; letter-spacing:1.5px; text-transform:uppercase; }
  input { width: 100%; background: #161616; border: 1px solid #242424; border-radius: 14px; padding: 15px 18px; color: #fff; font-size: 16px; outline: none; }
  input:focus { border-color: #e91e8c; box-shadow: 0 0 0 3px rgba(233,30,140,0.08); }
  button#pairBtn { width: 100%; margin-top: 14px; padding: 16px; background: linear-gradient(135deg, #e91e8c, #ff6b35); border: none; border-radius: 14px; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; letter-spacing: 1px; }
  .status { margin-top:24px; padding:20px; border-radius:16px; text-align:center; display:none; }
  .status.loading { display:block; background:#161616; color:#666; font-size:14px; }
  .status.success { display:block; background:#0a1a0a; border:1px solid #1a2e1a; }
  .status.error { display:block; background:#1a0a0a; border:1px solid #2e1a1a; color:#ff6b6b; font-size:14px; }
  .code-label { color:#555; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px; }
  .code-display { font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #25d366; font-family: 'Courier New', monospace; }
  .copy-btn { margin-top: 14px; padding: 10px 24px; background: #0d1f0d; border: 1px solid #25d366; color: #25d366; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; }
  .expire { color:#ff9800; font-size:12px; margin-top:10px; }
  .steps { margin-top: 16px; text-align: left; color: #555; font-size: 12px; line-height: 2; background: #0e0e0e; border-radius: 10px; padding: 12px 14px; }
  footer { margin-top: 32px; color: #2a2a2a; font-size: 11px; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="card">
  <div class="logo">
    <h1>🌹 AKANE MD</h1>
    <p>Connectez votre WhatsApp au bot</p>
    <span class="badge">MULTI USER • AI POWERED • SECURE</span>
  </div>
  <div class="label">Numéro WhatsApp</div>
  <input id="num" type="tel" placeholder="221705928204  (sans + ni espaces)" />
  <button id="pairBtn" onclick="requestCode()">⚡ Obtenir le code de connexion</button>
  <div id="status" class="status"></div>
</div>
<footer>© AKANE MD — akanefx2003</footer>
<script>
let polling = null
async function requestCode() {
  const number = document.getElementById('num').value.replace(/[^0-9]/g, '')
  if (number.length < 7) return showError('Entre un numéro valide')
  document.getElementById('pairBtn').disabled = true
  showLoading('Génération en cours...')
  try {
    await fetch('/pair', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number }) })
    if (polling) clearInterval(polling)
    polling = setInterval(() => checkCode(number), 2000)
  } catch(e) { showError('Erreur serveur'); document.getElementById('pairBtn').disabled = false; }
}
async function checkCode(number) {
  try {
    const res = await fetch('/code/' + number)
    const data = await res.json()
    if (data.status === 'ready') { clearInterval(polling); showCode(data.code); document.getElementById('pairBtn').disabled = false; }
  } catch(e) {}
}
function showLoading(msg) { const s = document.getElementById('status'); s.className = 'status loading'; s.innerHTML = msg; }
function showCode(code) { const s = document.getElementById('status'); s.className = 'status success'; s.innerHTML = '<div class="code-display">'+code+'</div>'; }
function showError(msg) { const s = document.getElementById('status'); s.className = 'status error'; s.innerHTML = '❌ ' + msg; }
</script>
</body>
</html>`)
})

// ─── Démarrage du Serveur Web ────────────────────────────────────────────────
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`🌹 AKANE MD Pair Server & Bot actif → http://localhost:${PORT}`)
})