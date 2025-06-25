const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "tt",
    aliases: ["tiktok"],
    version: "1.1",
    author: "SAIF",
    countDown: 5,
    role: 0,
    description: {
      en: "Send TikTok video with no spinner"
    },
    usage: "{pn} [search]",
    category: "media"
  },

  onStart: async function({ api, event, args, message }) {
    const query = args.join(" ");
    const baseUrl = "https://api.tikapi.io"; // Example of a better API provider (replace with your own if needed)
    
    // NOTE: This is a placeholder. TikAPI needs API key. For truly free, we use Tikwm or TikTok Unofficial.
    // So we use tikwm again but NO spinner here

    const url = query
      ? `https://tikwm.com/api/feed/search?keywords=${encodeURIComponent(query)}&count=1`
      : `https://tikwm.com/api/feed/list?count=1`;

    // Send only one loading message (no spinner)
    const loading = await message.reply(`📥 Fetching TikTok video...`);

    try {
      const res = await axios.get(url);
      const data = res.data?.data?.videos?.[0];
      if (!data) throw new Error("No video found");

      const videoUrl = data.play || data.origin_cover;
      const filePath = path.join(__dirname, "cache", `tt-${Date.now()}.mp4`);

      const videoStream = await axios.get(videoUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      videoStream.data.pipe(writer);

      writer.on("finish", () => {
        message.reply({
          body: query
            ? `Here your TikTok video for "${query}"`
            : `Here your random TikTok video`,
          attachment: fs.createReadStream(filePath)
        }, () => {
          fs.unlinkSync(filePath);
          api.unsendMessage(loading.messageID);
        });
      });

      writer.on("error", err => {
        console.error(err);
        api.editMessage("❌ Error writing video file.", loading.messageID);
      });

    } catch (error) {
      console.error(error);
      api.editMessage("❌ Failed to fetch TikTok video. Please try again later.", loading.messageID);
    }
  }
};