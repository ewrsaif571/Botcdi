const axios = require("axios");
const fs = require("fs");
const { shortenURL } = global.utils;

const baseApiUrl = "https://www.noobs-api.rf.gd/dipto";

module.exports = {
  config: {
    name: "autodl",
    version: "1.0.1",
    author: "404",
    countDown: 0,
    role: 0,
    description: {
      en: "Auto download video from Tiktok, Facebook, Instagram, YouTube, and more",
    },
    category: "media",
    guide: {
      en: "[video_link]",
    },
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    let dipto = event.body ? event.body.trim() : "";

    try {
      if (
        dipto.startsWith("https://vt.tiktok.com") ||
        dipto.startsWith("https://www.tiktok.com/") ||
        dipto.startsWith("https://www.facebook.com") ||
        dipto.startsWith("https://www.instagram.com/") ||
        dipto.startsWith("https://youtu.be/") ||
        dipto.startsWith("https://youtube.com/") ||
        dipto.startsWith("https://x.com/") ||
        dipto.startsWith("https://twitter.com/") ||
        dipto.startsWith("https://vm.tiktok.com") ||
        dipto.startsWith("https://fb.watch")
      ) {
        api.setMessageReaction("🐤", event.messageID, (err) => {}, true);
if(!fs.existsSync(__dirname+"/cache")) fs.mkdirSync(__dirname+"/cache")
        const path = __dirname + "/cache/diptoo.mp4";
        
        const response = await axios.get(`${baseApiUrl}/alldl?url=${encodeURIComponent(dipto)}`);
        if (!response.data || !response.data.result) throw new Error("Failed to fetch video URL");

        const videoUrl = response.data.result;
        const vid = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;

        fs.writeFileSync(path, Buffer.from(vid, "binary"));
        const url = await shortenURL(videoUrl);

        api.sendMessage(
          {
            body: `${response.data.cp || "Downloaded Video"}\n🐤 | Link: ${url || "Unavailable"}`,
            attachment: fs.createReadStream(path),
          },
          event.threadID,
          () => fs.unlinkSync(path),
          event.messageID
        );
      }
    } catch (e) {
      api.setMessageReaction("❎", event.messageID, (err) => {}, true);
      api.sendMessage(`Error: ${e.message}`, event.threadID, event.messageID);
    }
  },
};
