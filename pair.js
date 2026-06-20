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

// ✅ EXACTEMENT COMME PAIR.JS
function formatWhatsAppNumber(number) {
    let clean = number.replace(/[^0-9]/g, '')
    
    if (clean.startsWith('221')) return clean
    if (clean.startsWith('0') && clean.length === 10) return '221' + clean.slice(1)
    if (clean.length === 9) return '221' + clean
    if (clean.length === 10 && !clean.startsWith('0')) return '221' + clean
    
    return clean
}

// ✅ EXACTEMENT COMME PAIR.JS - startBotSocket modifié
async function generateCode(number, notifyFunc) {
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
        retryRequestDelayMs: 1000,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        options: {
            maxMsgRetryCount: 5,
        },
    })

    return new Promise((resolve, reject) => {
        sock.ev.on('creds.update', saveCreds)

        let codeSent = false
        let timeoutHandle = null

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update

            // ── Envoyer le code de pairing (EXACTEMENT COMME PAIR.JS) ──
            if (!codeSent && connection === 'connecting') {

                codeSent = true
                await new Promise(r => setTimeout(r, 3000))

                try {
                    const code = await sock.requestPairingCode(formatted)
                    const fmt  = code.match(/.{1,4}/g)?.join('-') || code

                    console.log(`✅ Code généré: +${formatted} = ${fmt}`)

                    if (notifyFunc) {
                        notifyFunc(fmt)
                    }

                    // Fermer la socket après le code
                    try { sock.ws.close() } catch {}

                    resolve(fmt)

                } catch (err) {
                    console.error(`❌ Erreur génération code: ${err.message}`)
                    try { sock.ws.close() } catch {}
                    reject(err)
                }
            }

            // Timeout de sécurité
            if (!codeSent && connection === 'connecting' && !timeoutHandle) {
                timeoutHandle = setTimeout(() => {
                    if (!codeSent) {
                        try { sock.ws.close() } catch {}
                        reject(new Error('Timeout - Réessaie'))
                    }
                }, 40000)
            }

            if (connection === 'open') {
                if (timeoutHandle) clearTimeout(timeoutHandle)
                try { sock.ws.close() } catch {}
            }
        })
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

    try {
        const code = await generateCode(formatted)
        res.json({ ok: true, number: formatted, code: code })
    } catch (e) {
        console.error(`❌ Erreur pairing: ${e.message}`)
        res.status(400).json({ error: e.message })
    }
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
  <input id="num" type="tel" placeholder="221704752421" />
  <button id="pairBtn" onclick="requestCode()">⚡ Obtenir le code de connexion</button>

  <div id="status" class="status"></div>
</div>

<footer>© AKANE MD — akanefx2003</footer>

<script>
async function requestCode() {
  const number = document.getElementById('num').value.trim()
  if (!number) return showError('Entre un numéro valide')

  document.getElementById('pairBtn').disabled = true
  showLoading('Génération du code... (attends 10-15 secondes)')

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

    showCode(data.code)
    document.getElementById('pairBtn').disabled = false

  } catch(e) {
    showError('Erreur serveur: ' + e.message)
    document.getElementById('pairBtn').disabled = false
  }
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
║  🌹 AKANE MD — Pairing Server          ║
║  Port: ${PORT}                           
║  Exact Pair.js Mode ✅                 
╚════════════════════════════════════════╝
    `)
})
