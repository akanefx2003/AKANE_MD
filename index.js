import express from 'express'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } from '@crysnovax/baileys'
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())

const pendingCodes = new Map()
const clients = new Map()

// ✅ Formater le numéro WhatsApp
function formatWhatsAppNumber(number) {
    let clean = number.replace(/[^0-9]/g, '')
    
    if (clean.startsWith('221')) return clean
    if (clean.startsWith('0') && clean.length === 10) return '221' + clean.slice(1)
    if (clean.length === 9) return '221' + clean
    if (clean.length === 10 && !clean.startsWith('0')) return '221' + clean
    
    return clean
}

// ✅ Charger les commandes depuis /akane/commands/
async function loadCommands() {
    const commands = {}
    const commandsDir = path.join(__dirname, 'akane', 'commands')
    
    if (!fs.existsSync(commandsDir)) {
        console.warn(`⚠️ Dossier commands non trouvé: ${commandsDir}`)
        return commands
    }
    
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'))
    
    for (const file of files) {
        try {
            const cmd = await import(`file://${path.join(commandsDir, file)}`)
            const name = file.replace('.js', '')
            commands[name] = cmd.default
            console.log(`✅ Commande chargée: ${name}`)
        } catch (e) {
            console.error(`❌ Erreur import ${file}:`, e.message)
        }
    }
    
    return commands
}

// ✅ Importer AKANEX
async function loadAKANEX() {
    try {
        const akanex = await import(`file://${path.join(__dirname, 'AKANEX', 'akanex.js')}`)
        console.log('✅ AKANEX chargé')
        return akanex.default
    } catch (e) {
        console.error('❌ Erreur chargement AKANEX:', e.message)
        return null
    }
}

// ✅ Gérer les messages entrants
async function handleIncomingMessage(client, message, commands, AKANEX) {
    try {
        const text = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || ''
        
        if (!text || text.length === 0) return
        
        const prefix = '-'
        if (!text.startsWith(prefix)) return
        
        const args = text.slice(prefix.length).trim().split(/\s+/)
        const command = args[0]?.toLowerCase()
        
        if (!command) return
        
        // ✅ Exécuter la commande
        if (commands[command]) {
            try {
                await commands[command](client, message, args.slice(1))
            } catch (e) {
                console.error(`❌ Erreur commande ${command}:`, e.message)
                try {
                    await client.sendMessage(message.key.remoteJid, {
                        text: `❌ Erreur: ${e.message}`
                    })
                } catch (err) {
                    console.error('Erreur envoi message erreur:', err)
                }
            }
        } else {
            console.log(`⚠️ Commande inconnue: ${command}`)
        }
    } catch (e) {
        console.error('❌ Erreur traitement message:', e.message)
    }
}

// ✅ Lancer le bot
async function startBot(formatted) {
    if (clients.has(formatted)) {
        console.log(`⚠️ Bot déjà actif pour ${formatted}`)
        return clients.get(formatted)
    }
    
    const sessionDir = `./sessions/pair_${formatted}`
    
    if (!fs.existsSync(sessionDir)) {
        throw new Error('Session non trouvée - Complète le pairing d\'abord')
    }

    console.log(`🚀 Démarrage du bot pour ${formatted}...`)
    
    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
    const commands = await loadCommands()
    const AKANEX = await loadAKANEX()

    const client = makeWASocket({
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

    client.ev.on('creds.update', saveCreds)

    // ✅ Traiter les messages
    client.ev.on('messages.upsert', async (m) => {
        const messages = m.messages || []
        for (const message of messages) {
            if (message.key.fromMe) continue
            await handleIncomingMessage(client, message, commands, AKANEX)
        }
    })

    // ✅ Gérer la connexion
    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        
        if (connection === 'open') {
            console.log(`✅ Bot CONNECTÉ: ${formatted}`)
            clients.set(formatted, client)
        }
        
        if (connection === 'close') {
            console.log(`❌ Bot DÉCONNECTÉ: ${formatted}`)
            clients.delete(formatted)
        }
    })

    return client
}

// ─── Génération du code de pairing ───────────────────────────────────────

async function generateCode(number) {
    const formatted = formatWhatsAppNumber(number)
    const sessionDir = `./sessions/pair_${formatted}`
    
    if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true })
    }
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
                const code = await sock.requestPairingCode(formatted)
                const fmt = code.match(/.{1,4}/g)?.join('-') || code
                
                pendingCodes.set(formatted, { 
                    status: 'ready', 
                    code: fmt, 
                    error: null,
                    number: formatted
                })
                
                console.log(`✅ Code généré pour +${formatted}: ${fmt}`)
            } catch (e) {
                pendingCodes.set(formatted, { 
                    status: 'error', 
                    code: null, 
                    error: e.message,
                    number: formatted
                })
                console.error(`❌ Erreur +${formatted}:`, e.message)
                try { sock.ws.close() } catch {}
            }
        }
        
        if (connection === 'open') {
            console.log(`🟢 Code validé pour +${formatted}`)
            pendingCodes.set(formatted, { 
                status: 'connected', 
                code: null, 
                error: null,
                number: formatted
            })
            
            // ✅ LANCER LE BOT AUTOMATIQUEMENT
            try {
                await startBot(formatted)
            } catch (e) {
                console.error(`❌ Erreur démarrage bot ${formatted}:`, e.message)
                pendingCodes.set(formatted, { 
                    status: 'error', 
                    code: null, 
                    error: e.message,
                    number: formatted
                })
            }
            
            try { sock.ws.close() } catch {}
        }
    })
}

// ─── Routes API ───────────────────────────────────────────────────────────

app.post('/pair', async (req, res) => {
    const { number } = req.body
    
    if (!number) {
        return res.status(400).json({ error: 'Numéro requis' })
    }

    const formatted = formatWhatsAppNumber(number)
    const clean = formatted.replace(/[^0-9]/g, '')
    
    if (clean.length < 10) {
        return res.status(400).json({ error: 'Numéro invalide (minimum 10 chiffres)' })
    }

    pendingCodes.set(formatted, { 
        status: 'pending', 
        code: null, 
        error: null,
        number: formatted
    })

    generateCode(formatted).catch(e => {
        pendingCodes.set(formatted, { 
            status: 'error', 
            code: null, 
            error: e.message,
            number: formatted
        })
    })

    res.json({ ok: true, number: formatted })
})

app.get('/code/:number', (req, res) => {
    const formatted = formatWhatsAppNumber(req.params.number)
    const entry = pendingCodes.get(formatted)
    
    if (!entry) {
        return res.json({ status: 'not_found' })
    }
    
    res.json(entry)
})

app.get('/status/:number', (req, res) => {
    const formatted = formatWhatsAppNumber(req.params.number)
    const entry = pendingCodes.get(formatted)
    
    if (!entry) {
        return res.json({ status: 'not_found' })
    }
    
    res.json(entry)
})

// ─── Page web de pairing ──────────────────────────────────────────────────

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AKANE MD — Pairing</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    min-height: 100vh;
    background: #0a0a0a;
    font-family: 'Segoe UI', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .card {
    background: #111;
    border: 1px solid #1e1e1e;
    border-radius: 24px;
    padding: 44px 36px;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 0 60px rgba(233,30,140,0.06);
  }
  .logo { text-align:center; margin-bottom:36px; }
  .logo h1 {
    font-size: 30px;
    background: linear-gradient(135deg, #e91e8c, #ff6b35);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 900;
    letter-spacing: 3px;
  }
  .logo p { color:#444; font-size:13px; margin-top:8px; }
  .badge {
    display: inline-block;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 11px;
    color: #555;
    margin-top: 10px;
    letter-spacing: 1px;
  }
  .label { color:#666; font-size:11px; margin-bottom:8px; letter-spacing:1.5px; text-transform:uppercase; }
  input {
    width: 100%;
    background: #161616;
    border: 1px solid #242424;
    border-radius: 14px;
    padding: 15px 18px;
    color: #fff;
    font-size: 16px;
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
  }
  input:focus { border-color: #e91e8c; box-shadow: 0 0 0 3px rgba(233,30,140,0.08); }
  input::placeholder { color:#333; }
  button#pairBtn {
    width: 100%;
    margin-top: 14px;
    padding: 16px;
    background: linear-gradient(135deg, #e91e8c, #ff6b35);
    border: none;
    border-radius: 14px;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 1px;
    transition: opacity 0.2s, transform 0.1s;
  }
  button#pairBtn:hover { opacity:0.88; transform:translateY(-1px); }
  button#pairBtn:active { transform:translateY(0); }
  button#pairBtn:disabled { opacity:0.35; cursor:not-allowed; transform:none; }
  .status { margin-top:24px; padding:20px; border-radius:16px; text-align:center; display:none; }
  .status.loading { display:block; background:#161616; color:#666; font-size:14px; }
  .status.success { display:block; background:#0a1a0a; border:1px solid #1a2e1a; }
  .status.connected { display:block; background:#0a1a0a; border:1px solid #1a2e1a; }
  .status.error { display:block; background:#1a0a0a; border:1px solid #2e1a1a; color:#ff6b6b; font-size:14px; }
  .code-label { color:#555; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:10px; }
  .code-display {
    font-size: 40px;
    font-weight: 900;
    letter-spacing: 8px;
    color: #25d366;
    font-family: 'Courier New', monospace;
    text-shadow: 0 0 20px rgba(37,211,102,0.3);
  }
  .copy-btn {
    margin-top: 14px;
    padding: 10px 24px;
    background: #0d1f0d;
    border: 1px solid #25d366;
    color: #25d366;
    border-radius: 10px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    display: inline-block;
    transition: background 0.2s;
  }
  .copy-btn:hover { background: #142814; }
  .expire { color:#ff9800; font-size:12px; margin-top:10px; }
  .steps {
    margin-top: 16px;
    text-align: left;
    color: #555;
    font-size: 12px;
    line-height: 2;
    background: #0e0e0e;
    border-radius: 10px;
    padding: 12px 14px;
  }
  .steps b { color: #777; }
  .spinner {
    display: inline-block;
    width: 18px; height: 18px;
    border: 2px solid #222;
    border-top-color: #e91e8c;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle;
    margin-right: 10px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
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
  <input id="num" type="tel" placeholder="705928204 ou 221705928204" />
  <button id="pairBtn" onclick="requestCode()">⚡ Obtenir le code de connexion</button>

  <div id="status" class="status"></div>
</div>

<footer>© AKANE MD — akanefx2003</footer>

<script>
let polling = null

async function requestCode() {
  const number = document.getElementById('num').value.trim()
  if (!number) return showError('Entre un numéro valide')

  document.getElementById('pairBtn').disabled = true
  showLoading('Connexion à WhatsApp...')

  try {
    const res = await fetch('/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number })
    })
    const data = await res.json()
    if (data.error) { 
      showError(data.error)
      document.getElementById('pairBtn').disabled = false
      return
    }

    showLoading('Génération du code en cours...')
    if (polling) clearInterval(polling)
    polling = setInterval(() => checkCode(data.number), 1000)

  } catch(e) {
    showError('Erreur de connexion au serveur')
    document.getElementById('pairBtn').disabled = false
  }
}

async function checkCode(number) {
  try {
    const res = await fetch('/code/' + number)
    const data = await res.json()
    if (data.status === 'ready') {
      clearInterval(polling)
      showCode(data.code)
      document.getElementById('pairBtn').disabled = false
    } else if (data.status === 'connected') {
      clearInterval(polling)
      showConnected()
      document.getElementById('pairBtn').disabled = false
    } else if (data.status === 'error') {
      clearInterval(polling)
      showError(data.error || 'Erreur inconnue')
      document.getElementById('pairBtn').disabled = false
    }
  } catch(e) {}
}

function showLoading(msg) {
  const s = document.getElementById('status')
  s.className = 'status loading'
  s.innerHTML = '<span class="spinner"></span>' + msg
}

function showCode(code) {
  const s = document.getElementById('status')
  s.className = 'status success'
  s.innerHTML = \`
    <div class="code-label">Ton code de connexion WhatsApp</div>
    <div class="code-display">\${code}</div>
    <button class="copy-btn" onclick="copyCode('\${code}')">📋 Copier le code</button>
    <div class="expire">⚠️ Code expire dans 60 secondes !</div>
    <div class="steps">
      <b>1️⃣</b> Ouvre WhatsApp sur ton téléphone<br>
      <b>2️⃣</b> Paramètres → Appareils liés<br>
      <b>3️⃣</b> Lier un appareil → Lier avec un numéro<br>
      <b>4️⃣</b> Entre le code ci-dessus
    </div>
  \`
}

function showConnected() {
  const s = document.getElementById('status')
  s.className = 'status connected'
  s.innerHTML = \`
    <div style="font-size: 24px; margin-bottom: 10px;">✅</div>
    <div class="code-label">Bot connecté et actif !</div>
    <div style="color: #25d366; margin-top: 10px; font-size: 14px;">
      Tu peux maintenant utiliser le bot<br>
      Envoie: <b>-help</b> pour les commandes
    </div>
  \`
}

function showError(msg) {
  const s = document.getElementById('status')
  s.className = 'status error'
  s.innerHTML = '❌ ' + msg
}

function copyCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.querySelector('.copy-btn')
    btn.textContent = '✅ Copié !'
    setTimeout(() => btn.textContent = '📋 Copier le code', 2000)
  })
}
</script>
</body>
</html>`)
})

// ─── Démarrage du serveur ─────────────────────────────────────────────────

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║  🌹 AKANE MD — Server Démarré          ║
║  Port: ${PORT}                           
║  URL: http://localhost:${PORT}           
╚════════════════════════════════════════╝
    `)
})
