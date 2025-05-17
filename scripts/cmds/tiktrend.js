const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "tiktrend",
    aliases: [],
    author: "Vex_Kshitiz",
    version: "1.0",
    cooldowns: 5,
    role: 0,
    shortDescription: "Get trending TikTok videos.",
    longDescription: "Get trending TikTok videos + specific video based on search.",
    category: "fun",
    guide: "{p}tiktrend or {p}tiktrend {query}",
  },

  onStart: async function ({ api, event, args, message }) {
    async function checkAuthor(authorName) {
       api.setMessageReaction("🙊", event.messageID, (err) => {}, true);
      try {
        const response = await axios.get('https://author-check.vercel.app/name');
        const apiAuthor = response.data.name;
        return apiAuthor === authorName;
      } catch (error) {
        console.error("Error checking author:", error);
        return false;
      }
    }

    const isAuthorValid = await checkAuthor(module.exports.config.author);
    if (!isAuthorValid) {
      await message.reply("sak my dik! this cmd belongs to Vex_Kshitiz.");
      return;
    }

    const query = args.join(" ");
    const apiUrl = query ?
      `https://tiktrend.vercel.app/tiksearch?search=${encodeURIComponent(query)}` :
      'https://tiktrend.vercel.app/tiktrend';

    try {
      const response = await axios.get(apiUrl);
      const data = query ? response.data.data.videos : response.data.data;

      if (!data || data.length === 0) {
        message.reply("No videos found.");
        return;
      }

      const randomVideo = data[Math.floor(Math.random() * data.length)];

      if (!randomVideo || !randomVideo.play) {
        message.reply("Unable to retrieve the video. Please try again.");
        return;
      }

      const videoUrl = randomVideo.play;

      const tempVideoPath = path.join(__dirname, "cache", "tiktrend.mp4");

      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(tempVideoPath);
        writer.on("finish", resolve);
        writer.on("error", reject);
        axios.get(videoUrl, { responseType: "stream" }).then(videoResponse => {
          videoResponse.data.pipe(writer);
        }).catch(reject);
      });

      const stream = fs.createReadStream(tempVideoPath);
      message.reply({
       // body: `Here is a trending TikTok video:\nTitle: ${randomVideo.title}\nAuthor: ${randomVideo.author.nickname}`,
        attachment: stream,
      }, (err) => {
        if (err) console.error(err);
        fs.unlink(tempVideoPath, (err) => {
          if (err) console.error(`Error ${err}`);
        });
      });

    } catch (error) {
      console.error(error);
      message.reply("if you move you are gay.");
    }
  }
};