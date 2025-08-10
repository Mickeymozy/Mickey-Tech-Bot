const yts = require('yt-search');
const axios = require('axios');

async function playCommand(sock, chatId, message) {
    try {
        // Extract the search query from the message
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const searchQuery = text?.split(' ').slice(1).join(' ').trim();

        if (!searchQuery) {
            return await sock.sendMessage(chatId, {
                text: "🎵 What song do you want to download?"
            });
        }

        // Search YouTube for the song
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "❌ No songs found. Try a different title."
            });
        }

        // Notify user that download is starting
        await sock.sendMessage(chatId, {
            text: "_⏳ Please wait, your download is in progress..._"
        });

        // Use the first video result
        const video = videos[0];
        const urlYt = video.url;

        // Fetch audio data from external API
        const response = await axios.get(`https://apis.davidcyriltech.my.id/song?url=${encodeURIComponent(urlYt)}`);
        const data = response.data;

        if (!data?.status || !data.result?.downloadUrl) {
            return await sock.sendMessage(chatId, {
                text: "⚠️ Failed to fetch audio. Please try again later."
            });
        }

        const audioUrl = data.result.downloadUrl;
        const title = data.result.title || "audio";

        // Send the audio file
        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, { quoted: message });

    } catch (error) {
        console.error('❌ Error in playCommand:', error.message);
        await sock.sendMessage(chatId, {
            text: "🚫 Download failed. Please try again later."
        });
    }
}

module.exports = playCommand;

/*
 * 🎧 Powered by Mickey
 * 💡 Credits to Mickey-Tech-Bot
 */

