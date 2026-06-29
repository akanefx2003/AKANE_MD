// webpair.js
import express from 'express'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason } from '@crysnovax/baileys'
import pino from 'pino'
import fs from 'fs'
import { canalInfo } from './akane/boutons.js';

import handleIncomingMessage from './akane/akanes.js'

const app = express()
app.use(express.json())

const CHANNEL_LINK = 'https://whatsapp.com/channel/0029VbCrJRnGufIyytPXy606'
const GITHUB_LINK  = 'https://github.com/akanefx2003/AKANE_MD'
const YOUTUBE_LINK = 'https://youtube.com/@akanefx-j3k9o?si=umMPewjZUzcOhilE'

const pendingCodes  = new Map()
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

// ✅ Un socket n'est "réellement connecté" que si sock.user existe
// (WhatsApp a confirmé l'auth) — sert à compter et à décider si on bloque
function isReallyConnected(sock) {
    return !!(sock && sock.user && sock.user.id)
}

// ✅ Compte UNIQUEMENT les bots réellement confirmés par WhatsApp
function getConnectedCount() {
    let count = 0
    for (const sock of activeSockets.values()) {
        if (isReallyConnected(sock)) count++
    }
    return count
}

async function startSocket(number, isRestore) {
    if (isRestore === undefined) isRestore = false

    const existing = activeSockets.get(number)
    if (existing) {
        // ✅ On ne bloque QUE si le bot est réellement confirmé connecté par WhatsApp.
        // Si c'est juste un socket en attente de code / pas encore "open", on le ferme
        // et on relance proprement — ça permet de re-générer un code autant de fois que voulu.
        if (isReallyConnected(existing) && !isRestore) {
            return { sock: existing, alreadyConnected: true }
        }
        try { existing.ws.close() } catch (e) {}
        activeSockets.delete(number)
        await new Promise(function(r) { setTimeout(r, 800) })
    }

    const sessionDir = './sessions/pair_' + number

    if (!isRestore) {
        // On efface l'ancienne session pour forcer une vraie nouvelle demande de pairing
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
    let confirmationSent = false

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

            // ✅ MESSAGE DE CONFIRMATION — envoyé uniquement quand WhatsApp confirme "open"
            // et qu'on a bien sock.user (donc vraiment authentifié, pas juste socket ouvert)
            if (!confirmationSent && isReallyConnected(sock)) {
                confirmationSent = true
                setTimeout(async function() {
                    try {
                        await sock.sendMessage(sock.user.id, {
                            text:
`╭─✧🌹━━━━━━━━━━━━━❂
┊
*┊🤖 AKANE MD*
┊
*┊✅ BOT CONNECTÉ AVEC SUCCÈS !*
┊
*┊📱 NUMERO : +${number}*
*┊🌐 CONNECTÉ VIA LE SITE WEB*
*┊⏰ ACTIF 24H/24 7J/7*
┊
*┊💡 TAPE .MENU POUR VOIR*
*┊TOUTES LES COMMANDES*
┊
╰─────────────────❂`,
                            nativeFlow: [
                                { text: '🍒 Voir la chaîne', url: CHANNEL_LINK },
                                { text: '💻 GitHub du projet', url: GITHUB_LINK },
                                { text: '🎥 Tutoriel YouTube',  url: YOUTUBE_LINK }
                            ]
                        })
                        console.log('✅ Message de confirmation envoyé à +' + number)
                    } catch (e) {
                        console.error('❌ Erreur envoi confirmation +' + number + ':', e.message)
                    }
                }, 2500)
            }

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
            confirmationSent = false
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

    return { sock, alreadyConnected: false }
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

// ✅ Autorise à relancer /pair sur le même numéro autant de fois que voulu,
// tant qu'il n'est pas RÉELLEMENT connecté (confirmé par WhatsApp)
app.post('/pair', async function(req, res) {
    const number = req.body.number
    if (!number || number.replace(/[^0-9]/g, '').length < 7) {
        return res.json({ error: 'Numero invalide' })
    }

    const clean = number.replace(/[^0-9]/g, '')

    pendingCodes.set(clean, { status: 'pending', code: null, error: null })

    startSocket(clean, false).then(function(result) {
        if (result.alreadyConnected) {
            pendingCodes.set(clean, { status: 'connected', code: null, error: null })
        }
    }).catch(function(e) {
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

// ✅ Stats basées uniquement sur les connexions réellement confirmées
app.get('/stats', function(req, res) {
    res.json({ connected: getConnectedCount() })
})

app.get('/ping', function(req, res) { res.send('pong') })

setInterval(function() {
    console.log('keep-alive ping')
}, 4 * 60 * 1000)

app.get('/', function(req, res) {
    res.send(buildHtmlPage())
})

function buildHtmlPage() {
    const styles = `
* { margin:0; padding:0; box-sizing:border-box; }
:root{
  --bg:#060907;
  --panel:#0b120c;
  --panel2:#081008;
  --border:#163322;
  --accent:#39ff7a;
  --accent-dim:#1f9c4b;
  --accent-glow:rgba(57,255,122,0.35);
  --text-dim:#5d8268;
  --amber:#ffb454;
  --red:#ff5454;
}
html,body{ min-height:100vh; width:100%; }
body{
  background:var(--bg);
  background-image:radial-gradient(circle at 50% -10%, var(--accent-glow), transparent 55%);
  color:var(--accent);
  font-family:'JetBrains Mono','Fira Code',Consolas,monospace;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  width:100%; padding:24px; position:relative; overflow-x:hidden;
  transition:background-image .4s ease, color .4s ease;
}
body::before{
  content:''; position:fixed; inset:0; z-index:50; pointer-events:none;
  background:repeating-linear-gradient(to bottom, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px);
  mix-blend-mode:overlay;
}
.noise{
  position:fixed; inset:0; z-index:40; pointer-events:none; opacity:.05;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
.terminal{
  width:100%; max-width:460px; background:var(--panel);
  border:1px solid var(--border); border-radius:10px;
  box-shadow:0 30px 80px -20px rgba(0,0,0,0.85), 0 0 50px -10px var(--accent-glow);
  position:relative; z-index:1; overflow:hidden;
  transition:box-shadow .4s ease;
}
.term-bar{ display:flex; align-items:center; gap:8px; padding:12px 14px; background:#081209; border-bottom:1px solid var(--border); }
.dot{ width:9px; height:9px; border-radius:50%; }
.dot.r{ background:#ff5f56; }
.dot.y{ background:#ffbd2e; }
.dot.g{ background:#27c93f; }
.term-body{ padding:30px 26px 26px; }
.title-row{ display:flex; align-items:baseline; gap:10px; margin-bottom:4px; }
.title{ font-size:25px; font-weight:800; letter-spacing:3px; text-shadow:0 0 14px var(--accent-glow); }
.cursor{ display:inline-block; width:9px; height:18px; background:var(--accent); animation:blink 1.1s steps(1) infinite; vertical-align:-3px; }
.subtitle{ color:var(--text-dim); font-size:12px; margin-bottom:16px; }
.tags{ display:flex; gap:6px; flex-wrap:wrap; margin-bottom:22px; }
.tag{ font-size:9.5px; letter-spacing:1.2px; text-transform:uppercase; color:var(--accent-dim); border:1px solid var(--border); padding:4px 9px; border-radius:4px; }
.readout{ display:flex; align-items:center; justify-content:space-between; border:1px solid var(--border); background:var(--panel2); border-radius:6px; padding:13px 16px; margin-bottom:22px; }
.readout-left{ display:flex; align-items:center; gap:10px; }
.pulse{ width:8px; height:8px; border-radius:50%; background:var(--accent); box-shadow:0 0 10px var(--accent); animation:pulse 1.6s ease-in-out infinite; }
.readout .num{ font-size:24px; font-weight:800; color:var(--accent); text-shadow:0 0 10px var(--accent-glow); }
.readout .lbl{ font-size:9.5px; color:var(--text-dim); letter-spacing:1.3px; text-transform:uppercase; text-align:right; line-height:1.5; }
.field-label{ font-size:10px; color:var(--text-dim); letter-spacing:1.4px; text-transform:uppercase; margin-bottom:8px; }
.input-row{ display:flex; align-items:center; background:var(--panel2); border:1px solid var(--border); border-radius:6px; padding:0 14px; margin-bottom:14px; transition:border-color .2s, box-shadow .2s; }
.input-row:focus-within{ border-color:var(--accent-dim); box-shadow:0 0 0 3px var(--accent-glow); }
.prompt-sym{ color:var(--accent-dim); margin-right:9px; font-weight:700; font-size:15px; }
input{ flex:1; background:transparent; border:none; outline:none; color:var(--accent); font-family:inherit; font-size:14.5px; padding:14px 0; letter-spacing:.5px; width:100%; min-width:0; }
input::placeholder{ color:#2b4a35; }
button#pairBtn{
  width:100%; padding:14px; background:transparent; border:1px solid var(--accent-dim);
  color:var(--accent); font-family:inherit; font-size:12.5px; letter-spacing:2.5px; text-transform:uppercase;
  border-radius:6px; cursor:pointer; position:relative; overflow:hidden; transition:color .25s;
}
button#pairBtn .fill{ position:absolute; inset:0; background:var(--accent); transform:translateX(-101%); transition:transform .25s ease; z-index:0; }
button#pairBtn span{ position:relative; z-index:1; }
button#pairBtn:hover:not(:disabled) .fill{ transform:translateX(0); }
button#pairBtn:hover:not(:disabled){ color:#04140a; }
button#pairBtn:disabled{ opacity:.4; cursor:not-allowed; }
.status{ margin-top:18px; border:1px solid var(--border); border-radius:6px; overflow:hidden; display:none; }
.status.show{ display:block; }
.status-head{ display:flex; align-items:center; gap:8px; padding:10px 14px; font-size:10.5px; letter-spacing:1.4px; text-transform:uppercase; border-bottom:1px solid var(--border); }
.status-body{ padding:18px 16px 16px; }
.status.loading .status-head{ color:var(--text-dim); background:var(--panel2); }
.status.success .status-head{ color:var(--accent); background:#08160d; }
.status.connected .status-head{ color:#27c93f; background:#08160d; }
.status.error .status-head{ color:var(--red); background:#1a0808; }
.loading-msg{ font-size:13px; color:var(--accent); margin-bottom:10px; }
.progress-track{ height:6px; background:#0d1b10; border-radius:3px; overflow:hidden; margin-bottom:8px; }
.progress-fill{ height:100%; width:0%; background:linear-gradient(90deg, var(--accent-dim), var(--accent)); box-shadow:0 0 8px var(--accent-glow); transition:width .25s ease; }
.progress-pct{ font-size:10.5px; color:var(--text-dim); text-align:right; }
.code-label{ color:var(--text-dim); font-size:10px; text-transform:uppercase; letter-spacing:1.4px; margin-bottom:10px; text-align:center; }
.code-display{ font-size:34px; font-weight:800; letter-spacing:5px; color:var(--accent); text-align:center; text-shadow:0 0 18px var(--accent-glow); margin-bottom:12px; }
.copy-btn{ display:block; margin:0 auto 14px; padding:9px 22px; background:transparent; border:1px solid var(--accent-dim); color:var(--accent); border-radius:6px; cursor:pointer; font-size:11.5px; letter-spacing:1px; text-transform:uppercase; font-family:inherit; transition:background .2s; }
.copy-btn:hover{ background:#0e2414; }
.expire{ color:var(--amber); font-size:11px; text-align:center; letter-spacing:.5px; }
.steps{ margin-top:14px; font-size:11.5px; color:var(--text-dim); line-height:2; border-top:1px dashed var(--border); padding-top:13px; }
.steps b{ color:var(--accent-dim); }
.connected-title{ font-size:16px; font-weight:700; color:var(--accent); }
.connected-sub{ margin-top:8px; color:var(--text-dim); font-size:12.5px; line-height:1.7; }
.error-body{ color:var(--red); font-size:13px; }
.links{ display:flex; gap:8px; margin-top:24px; }
.links a{ flex:1; display:flex; flex-direction:column; align-items:center; gap:7px; padding:12px 4px; background:var(--panel2); border:1px solid var(--border); border-radius:6px; color:var(--text-dim); text-decoration:none; font-size:9.5px; letter-spacing:.8px; text-transform:uppercase; transition:border-color .2s, color .2s, transform .15s; }
.links a:hover{ border-color:var(--accent-dim); color:var(--accent); transform:translateY(-2px); }
.links svg{ width:26px; height:26px; border-radius:7px; }
footer{ margin-top:16px; text-align:center; color:#27452f; font-size:9.5px; letter-spacing:1.6px; text-transform:uppercase; }
@keyframes blink{ 0%,49%{ opacity:1; } 50%,100%{ opacity:0; } }
@keyframes pulse{ 0%,100%{ transform:scale(1); opacity:1; } 50%{ transform:scale(1.5); opacity:.35; } }
@media (max-width:480px){
  .term-body{ padding:24px 18px 20px; }
  .title{ font-size:21px; }
  .code-display{ font-size:28px; letter-spacing:3px; }
}
`;

    const colorScript = `
(function() {
  var palette = [
    { a: "#39ff7a", d: "#1f9c4b", g: "rgba(57,255,122,0.35)" },
    { a: "#39e6ff", d: "#1f8fa3", g: "rgba(57,230,255,0.35)" },
    { a: "#ff3df0", d: "#a3209c", g: "rgba(255,61,240,0.35)" },
    { a: "#ffd23f", d: "#a38a1f", g: "rgba(255,210,63,0.35)" },
    { a: "#ff5454", d: "#a32323", g: "rgba(255,84,84,0.35)" },
    { a: "#7c5cff", d: "#4a2fa3", g: "rgba(124,92,255,0.35)" },
    { a: "#ff8a3d", d: "#a3551f", g: "rgba(255,138,61,0.35)" }
  ];
  var pick = palette[Math.floor(Math.random() * palette.length)];
  var root = document.documentElement.style;
  root.setProperty("--accent", pick.a);
  root.setProperty("--accent-dim", pick.d);
  root.setProperty("--accent-glow", pick.g);
})();
`;

    const script = `
var polling = null;
var progressTimer = null;
var progressValue = 0;

function updateCounter() {
  fetch("/stats").then(function(res) { return res.json(); }).then(function(data) {
    document.getElementById("liveCount").textContent = data.connected;
  }).catch(function(e) {});
}
updateCounter();
setInterval(updateCounter, 5000);

function startProgress() {
  clearProgressTimer();
  progressValue = 0;
  renderProgress(0);
  progressTimer = setInterval(function() {
    var remaining = 92 - progressValue;
    progressValue += Math.max(0.5, remaining * 0.09);
    if (progressValue > 92) progressValue = 92;
    renderProgress(progressValue);
  }, 140);
}

function completeProgress(cb) {
  clearProgressTimer();
  progressValue = 100;
  renderProgress(100);
  setTimeout(function() { if (cb) cb(); }, 280);
}

function clearProgressTimer() {
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
}

function renderProgress(val) {
  var fill = document.getElementById("progressFill");
  var pct = document.getElementById("progressPct");
  if (fill) fill.style.width = val.toFixed(0) + "%";
  if (pct) pct.textContent = val.toFixed(0) + "%";
}

function requestCode() {
  var number = document.getElementById("num").value.replace(/[^0-9]/g, "");
  if (number.length < 7) { showError("numero invalide"); return; }
  document.getElementById("pairBtn").disabled = true;
  showLoading("etablissement de la connexion...");
  if (polling) clearInterval(polling);
  fetch("/pair", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number: number }) })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.error) { clearProgressTimer(); showError(data.error); document.getElementById("pairBtn").disabled = false; return; }
      showLoading("generation du code en cours...");
      polling = setInterval(function() { checkCode(number); }, 1500);
    })
    .catch(function(e) { clearProgressTimer(); showError("connexion au serveur impossible"); document.getElementById("pairBtn").disabled = false; });
}

function checkCode(number) {
  fetch("/code/" + number).then(function(res) { return res.json(); }).then(function(data) {
    if (data.status === "ready") {
      clearInterval(polling);
      completeProgress(function() {
        showCode(data.code, number);
        polling = setInterval(function() { checkConnected(number); }, 2000);
      });
    } else if (data.status === "error") {
      clearInterval(polling);
      clearProgressTimer();
      showError(data.error || "erreur inconnue");
      document.getElementById("pairBtn").disabled = false;
    } else if (data.status === "connected") {
      clearInterval(polling);
      clearProgressTimer();
      showConnected(number);
    }
  }).catch(function(e) {});
}

function checkConnected(number) {
  fetch("/code/" + number).then(function(res) { return res.json(); }).then(function(data) {
    if (data.status === "connected") { clearInterval(polling); showConnected(number); updateCounter(); }
    else if (data.status === "error") { clearInterval(polling); showError(data.error || "erreur"); document.getElementById("pairBtn").disabled = false; }
  }).catch(function(e) {});
}

function showLoading(msg) {
  var s = document.getElementById("status");
  s.className = "status show loading";
  var html = "<div class=\\"status-head\\"><span>&gt;_</span><span>processus en cours</span></div>";
  html += "<div class=\\"status-body\\">";
  html += "<div class=\\"loading-msg\\">" + msg + "</div>";
  html += "<div class=\\"progress-track\\"><div class=\\"progress-fill\\" id=\\"progressFill\\"></div></div>";
  html += "<div class=\\"progress-pct\\" id=\\"progressPct\\">0%</div>";
  html += "</div>";
  s.innerHTML = html;
  startProgress();
}

function showCode(code, number) {
  var s = document.getElementById("status");
  s.className = "status show success";
  var html = "<div class=\\"status-head\\"><span>&gt;_</span><span>code genere</span></div>";
  html += "<div class=\\"status-body\\">";
  html += "<div class=\\"code-label\\">ton code de connexion whatsapp</div>";
  html += "<div class=\\"code-display\\">" + code + "</div>";
  html += "<button class=\\"copy-btn\\" onclick=\\"copyCode(this.dataset.code)\\" data-code=\\"" + code + "\\">copier le code</button>";
  html += "<div class=\\"expire\\">expire dans 60 secondes - entre-le vite</div>";
  html += "<div class=\\"steps\\"><b>01.</b> ouvre whatsapp sur ton telephone<br>";
  html += "<b>02.</b> parametres -&gt; appareils lies<br>";
  html += "<b>03.</b> lier un appareil -&gt; lier avec un numero<br>";
  html += "<b>04.</b> entre le code ci-dessus</div>";
  html += "</div>";
  s.innerHTML = html;
}

function showConnected(number) {
  var s = document.getElementById("status");
  s.className = "status show connected";
  var html = "<div class=\\"status-head\\"><span>&gt;_</span><span>connexion etablie</span></div>";
  html += "<div class=\\"status-body\\">";
  html += "<div class=\\"connected-title\\">bot connecte avec succes</div>";
  html += "<div class=\\"connected-sub\\">+" + number + " est maintenant actif 24h/24 7j/7.<br>verifie ton whatsapp, un message de confirmation a ete envoye.</div>";
  html += "</div>";
  s.innerHTML = html;
  document.getElementById("pairBtn").disabled = false;
}

function showError(msg) {
  var s = document.getElementById("status");
  s.className = "status show error";
  var html = "<div class=\\"status-head\\"><span>&gt;_</span><span>erreur</span></div>";
  html += "<div class=\\"status-body error-body\\">" + msg + "</div>";
  s.innerHTML = html;
}

function copyCode(code) {
  navigator.clipboard.writeText(code).then(function() {
    var btn = document.querySelector(".copy-btn");
    if (btn) {
      btn.textContent = "copie !";
      setTimeout(function() { btn.textContent = "copier le code"; }, 2000);
    }
  });
}
`;

    const body = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AKANE MD :: Pairing Terminal</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>${styles}</style>
<script>${colorScript}</script>
</head>
<body>
<div class="noise"></div>
<div class="terminal">
  <div class="term-bar">
    <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
  </div>
  <div class="term-body">
    <div class="title-row"><span class="title">AKANE_MD</span><span class="cursor"></span></div>
    <div class="subtitle">// connecte ton whatsapp au bot</div>
    <div class="tags"><span class="tag">multi-user</span><span class="tag">ai-powered</span><span class="tag">encrypted</span></div>

    <div class="readout">
      <div class="readout-left"><span class="pulse"></span><span class="num" id="liveCount">--</span></div>
      <div class="lbl">bots connectes<br>en direct</div>
    </div>

    <div class="field-label">numero whatsapp</div>
    <div class="input-row">
      <span class="prompt-sym">&gt;</span>
      <input id="num" type="tel" placeholder="221705928204" />
    </div>

    <button id="pairBtn" onclick="requestCode()"><span class="fill"></span><span>obtenir le code de connexion</span></button>

    <div id="status" class="status"></div>

    <div class="links">
      <a href="${CHANNEL_LINK}" target="_blank" aria-label="Chaine WhatsApp">
        <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#25D366"/><path fill="#fff" d="M16 7c-5 0-9 4-9 9 0 1.6.4 3.1 1.2 4.4L7 24l3.8-1.2c1.3.7 2.7 1.1 4.2 1.1 5 0 9-4 9-9s-4-9-9-9zm5.1 12.7c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.7-4.4-3.9-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .5.4.2.4.7 1.7.7 1.8.1.1.1.3 0 .4-.4.8-.8.8-.5 1.3.6 1 1.1 1.4 1.9 2 .1.1.3.1.4 0 .2-.2.7-.8.9-1.1.2-.2.3-.2.5-.1.2.1 1.5.7 1.7.8.2.1.4.2.4.3.1.2.1.6-.1 1.2z"/></svg>
        <span>chaine</span>
      </a>
      <a href="${GITHUB_LINK}" target="_blank" aria-label="Depot GitHub">
        <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#161b22"/><path fill="#fff" d="M16 8c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4v-1.5c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-3.9 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.1 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3-1.8 3.7-3.6 3.9.3.3.5.8.5 1.6v2.4c0 .2.1.5.5.4 3.2-1.1 5.5-4.1 5.5-7.6 0-4.4-3.6-8-8-8z"/></svg>
        <span>github</span>
      </a>
      <a href="${YOUTUBE_LINK}" target="_blank" aria-label="Chaine YouTube">
        <svg viewBox="0 0 32 32"><rect x="1" y="6" width="30" height="20" rx="6" fill="#FF0000"/><polygon points="13,11.5 22,16 13,20.5" fill="#fff"/></svg>
        <span>tutoriel</span>
      </a>
    </div>
  </div>
</div>
<footer>akane md :: akanefx2003</footer>
<script>${script}</script>
</body>
</html>`;

    return body;
}

const PORT = process.env.PORT || 3000
app.listen(PORT, async function() {
    console.log('AKANE MD Web Pair Server -> http://localhost:' + PORT)
    await restoreSessions()
})

export function isWebpairManaged(number) {
    return activeSockets.has(number)
}

export function getWebpairSocket(number) {
    return activeSockets.get(number)
}

export { startSocket as startWebpairSocket, getConnectedCount, isReallyConnected }
