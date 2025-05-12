const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/KingsOfToxiciter/alldl/refs/heads/main/toxicitieslordhasan.json`);
  return base.data.hasan;
};

module.exports = {
  config: {
    name: "autolink",
    version: "1.0",
    author: "hatan 🙈",
    description: "Direct auto downloader",
    category: "media",
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    const url = event.body?.trim();
    const supported = [
      "tiktok.com", "facebook.com", "instagram.com", "youtu.be", "youtube.com",
      "x.com", "twitter.com", "pin.it", "vm.tiktok.com", "fb.watch"
    ];

    if (!supported.some(domain => url?.includes(domain))) return;

    try {
      const res = await axios.get(`${await baseApiUrl()}/alldl?url=${encodeURIComponent(url)}`, { responseType: "stream" });
      const data = res.data;

      await api.sendMessage({
        body: "✨ | Here is your Download video..!!",
        attachment: data
      }, event.threadID, event.messageID);
    } catch (e) {
      console.error(e);
      api.sendMessage("❌ | Download failed.", event.threadID, event.messageID);
    }
  },
};