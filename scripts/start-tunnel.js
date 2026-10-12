const { bin } = require('cloudflared');
const { spawn } = require('child_process');
const fs = require('fs');
const https = require('https');

const BOT_TOKEN = '8695660203:AAFdvl15xRn5XH9u9WhcP_Ibgq4Zl8g3eEA';
const CHAT_ID = '8927948134';

function sendTelegramNotification(url) {
  try {
    const text = `🌐 *Votre lien public SubHub est en ligne !*\n\nVoici votre lien d'accès haute sécurité (accessible partout en 4G/5G/Wi-Fi) :\n\n👉 *Boutique & Dashboard :*\n${url}/dashboard\n\n⚙️ *Administration :*\n${url}/admin\n\n_Cliquez directement dessus depuis votre smartphone !_`;
    const payload = JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' });
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      rejectUnauthorized: false
    }, (res) => {
      res.on('data', () => {});
    });
    req.on('error', () => {});
    req.write(payload);
    req.end();
  } catch (e) {
    console.error('Erreur notif telegram:', e);
  }
}

let currentChild = null;

function startTunnel() {
  console.log('🚀 Démarrage du Cloudflare Tunnel vers http://localhost:3005...');
  currentChild = spawn(bin, ['tunnel', '--url', 'http://localhost:3005'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let found = false;

  function handleData(data) {
    const text = data.toString();
    process.stdout.write(text);

    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && !found) {
      found = true;
      const url = match[0];
      console.log('\n=============================================');
      console.log('🎉 NOUVELLE URL PUBLIQUE ACTIVE :', url);
      console.log('=============================================\n');
      fs.writeFileSync('public-url.txt', url, 'utf8');
      sendTelegramNotification(url);
    }

    // Détection d'expiration ou tunnel introuvable
    if (text.includes('Tunnel not found') || text.includes('Unauthorized: Tunnel not found')) {
      if (found) {
        console.log('⚠️ Tunnel expiré par Cloudflare, renouvellement automatique immédiat...');
        found = false;
        try { currentChild.kill('SIGKILL'); } catch (e) {}
      }
    }
  }

  currentChild.stdout.on('data', handleData);
  currentChild.stderr.on('data', handleData);

  currentChild.on('close', (code) => {
    console.log(`Cloudflare tunnel s'est arrêté (code ${code}). Relance dans 3 secondes...`);
    setTimeout(startTunnel, 3000);
  });
}

startTunnel();
