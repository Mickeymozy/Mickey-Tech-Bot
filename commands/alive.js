const settings = require("../settings");
const axios = require("axios");

async function aliveCommand(sock, chatId, message) {
    try {
        const message1 = `*Mickey-Tech-Bot is Active!*\n\n` +
            `*Version:* ${settings.version}\n` +
            `*Status:* Online\n` +
            `*Mode:* Public\n\n` +
            `*🌟 Features:*\n` +
            `• Group Management\n` +
            `• Antilink Protection\n` +
            `• Fun Commands\n` +
            `• And more!\n\n` +
            `Type *.menu* for full command list`;

        // 🌠 List of image URLs
        const imageUrls = [
            "https://files.catbox.moe/226ufq.png",
            "https://files.catbox.moe/51fqh8.png",
            "https://files.catbox.moe/1ev1fj.png"
        ];

        // 🎲 Pick a random image
        const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];

        // 📥 Fetch image buffer
        const response = await axios.get(randomImageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');

        // 📤 Send image with caption
        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: message1,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363422552152940@newsletter',
                    newsletterName: 'Mickey-Md-Bot',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { text: 'Bot is alive and running!' }, { quoted: message });
    }
}

module.exports = aliveCommand;
