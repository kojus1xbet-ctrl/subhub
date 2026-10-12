const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

const token = process.env.TELEGRAM_BOT_TOKEN || '8695660203:AAFdvl15xRn5XH9u9WhcP_Ibgq4Zl8g3eEA';
let offset = 0;
let isPolling = true;

console.log('🤖 SubHub Telegram Long-Poller démarré pour @mon_subhub_bot...');

async function poll() {
  while (isPolling) {
    try {
      const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=20`;
      const data = await new Promise((resolve, reject) => {
        const req = https.get(url, { agent, timeout: 30000 }, res => {
          let buf = '';
          res.on('data', c => buf += c);
          res.on('end', () => resolve(buf));
        });
        req.on('error', reject);
        req.on('timeout', () => { 
          req.destroy(); 
          resolve('{"ok":false}'); 
        });
      });

      const json = JSON.parse(data);
      if (json.ok && Array.isArray(json.result) && json.result.length > 0) {
        for (const update of json.result) {
          offset = update.update_id + 1;
          try {
            await fetch('http://localhost:3005/api/telegram/webhook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(update)
            });
          } catch (postErr) {
            console.error('Erreur transmission webhook local:', postErr.message);
          }
        }
      }
    } catch (err) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

poll();
