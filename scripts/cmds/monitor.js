const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "monitor",
    aliases: ["run"],
    version: "1.5",
    author: "EREN // Re-coded",
    role: 0,
    shortDescription: { 
      en: "Check bot's uptime & ping with style!" 
    },
    longDescription: { 
      en: "Shows how long the bot has been running & its response time in a cute format!" 
    },
    category: "owner",
    guide: { 
      en: "Use {p}monitor to check bot stats in a stylish way!" 
    },
    onChat: true
  },

  onStart: async function ({ api, event }) {
    return this.monitor(api, event);
  },

  onChat: async function ({ event, api }) {
    const content = event.body?.toLowerCase().trim();
    if (["hedaaa"].includes(content)) {
      return this.monitor(api, event);
    }
  },

  monitor: async function (api, event) {
    try {
      const start = Date.now();
      const temp = await api.sendMessage(" 𝖥𝖾𝗍𝖼𝗁𝗂𝗇𝗀 𝖻𝗈𝗍 𝗌𝗍𝖺𝗍𝗎𝗌...", event.threadID);
      setTimeout(() => api.unsendMessage(temp.messageID), 1500);

      const end = Date.now();
      const ping = end - start;

      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      let uptimeFormatted = `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s`;
      if (days === 0) uptimeFormatted = `⏳ ${hours}h ${minutes}m ${seconds}s`;
      if (hours === 0) uptimeFormatted = `⏳ ${minutes}m ${seconds}s`;
      if (minutes === 0) uptimeFormatted = `⏳ ${seconds}s`;

      const imageURL = "https://i.imgur.com/vigkAkN.gif";
      const fallbackImage = path.join(__dirname, "fallback.jpg"); // Optional local backup

      const getImageStream = async () => {
        try {
          const res = await axios.get(imageURL, {
            responseType: "stream",
            headers: { "User-Agent": "Mozilla/5.0" }
          });
          return res.data;
        } catch (err) {
          if (err.response?.status === 429) {
            console.warn("429 detected, using fallback image.");
          } else {
            console.warn("Image fetch error:", err.message);
          }
          if (fs.existsSync(fallbackImage)) {
            return fs.createReadStream(fallbackImage);
          } else {
            return null; // no image
          }
        }
      };

      const finalMessage = `
╭────────────◊
├𝗧𝐰𝐢𝐧𝐤𝐥𝐞 𝐒𝐭𝐚𝐭𝐮𝐬 🎀
├───────────────◊
├‣  𝐔𝐩𝐭𝐢𝐦𝐞: ${uptimeFormatted}
├‣  𝐏𝐢𝐧𝐠: ${ping}ᴍs
├‣  𝐎𝐰𝐧𝐞𝐫: Sᴀɪғ 
├‣  𝐁𝐨𝐭 𝐢𝐬 𝐚𝐥𝐢𝐯𝐞 𝐧𝐨𝐰¡!
╰─────────────◊
`;

      const attachment = await getImageStream();

      const message = await api.sendMessage({
        body: finalMessage,
        attachment: attachment || undefined
      }, event.threadID, event.messageID);

      // React to the user's original message
      if (message?.messageID) {
        api.setMessageReaction("⏳", event.messageID, event.threadID, true);
        api.setMessageReaction("✅", event.messageID, event.threadID, true);
      }

    } catch (error) {
      console.error("Monitor error:", error);

      // React with ⏳ and ❎ to user's message in case of error
      api.setMessageReaction("⏳", event.messageID, event.threadID, true);
      api.setMessageReaction("❎", event.messageID, event.threadID, true);

      return api.sendMessage(`❌ 𝗘𝗿𝗿𝗼𝗿: ${error.response?.status === 429 ? '𝖳𝗈𝗈 𝗆𝖺𝗇𝗒 𝗋𝖾𝗊𝗎𝖾𝗌𝗍𝗌! 𝖳𝗋𝗒 𝖺𝗀𝖺𝗂𝗇 𝗌𝗁𝗈𝗋𝗧𝗅𝗒.' : error.message}`, event.threadID, event.messageID);
    }
  }
};