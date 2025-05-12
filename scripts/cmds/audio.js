const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ytSearch = require("yt-search");

const CACHE_FOLDER = path.join(__dirname, "cache");

async function downloadAudio(videoId, filePath) {
    const url = `https://audio-kshitiz-production.up.railway.app/download?id=${videoId}`;
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
    });

    return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

async function fetchAudioFromReply(api, event, message) {
    const attachment = event.messageReply.attachments[0];
    if (!attachment || (attachment.type !== "video" && attachment.type !== "audio")) {
        throw new Error("Please reply to a valid video or audio attachment.");
    }

    const shortUrl = attachment.url;
    const audioRecResponse = await axios.get(`https://audio-recon-ahcw.onrender.com/kshitiz?url=${encodeURIComponent(shortUrl)}`);
    return audioRecResponse.data.title;
}

async function fetchAudioFromQuery(query) {
    const searchResults = await ytSearch(query);
    if (searchResults && searchResults.videos && searchResults.videos.length > 0) {
        return searchResults.videos[0].videoId;
    } else {
        throw new Error("No results found for the given query.");
    }
}

async function handleAudioCommand(api, event, args, message) {
    api.setMessageReaction("🐤", event.messageID, () => {}, true);

    try {
        let videoId;
        if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
            const title = await fetchAudioFromReply(api, event, message);
            videoId = await fetchAudioFromQuery(title);
        } else if (args.length > 0) {
            const query = args.join(" ");
            videoId = await fetchAudioFromQuery(query);
        } else {
            message.reply("Please provide a query or reply to a valid video/audio attachment.");
            return;
        }

        const filePath = path.join(CACHE_FOLDER, `${videoId}.mp3`);
        await downloadAudio(videoId, filePath);

        const audioStream = fs.createReadStream(filePath);
        message.reply({ body: `🎵 Here is your audio:`, attachment: audioStream });
        api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
        console.error("Error:", error.message);
        message.reply("An error occurred while processing your request.");
    }
}

module.exports = {
    config: {
        name: "audio",
        version: "1.0",
        author: "Vex_Kshitiz",
        countDown: 10,
        role: 0,
        shortDescription: "Download and send audio from YouTube.",
        longDescription: "Download audio from YouTube based on a query or attachment.",
        category: "music",
        guide: "{p}audio [query] or reply to a video/audio attachment",
    },
    onStart: function ({ api, event, args, message }) {
        return handleAudioCommand(api, event, args, message);
    },
};
