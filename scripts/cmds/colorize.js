const { writeFileSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");
const axios = require("axios");
const tinyurl = require('tinyurl');
const fs = require('fs');

module.exports = {
  config: {
    name: "colorize",
    aliases: [],
    version: "1.0",
    author: "Kshitiz",
    countDown: 20,
    role: 0,
    shortDescription: "Colorize an image",
    longDescription: "Colorize a b&w image",
    category: "image",
    guide: {
      en: "{p}colorize (reply to image)"
    }
  },

  onStart: async function ({ message, event, api }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    const { type, messageReply } = event;
    const { attachments, threadID, messageID } = messageReply || {};

    if (type === "message_reply" && attachments) {
      const [attachment] = attachments;
      const { url, type: attachmentType } = attachment || {};

      if (!attachment || attachmentType !== "photo") {
        return message.reply("Reply to an image.");
      }

      try {
        const tinyUrl = await tinyurl.shorten(url);
        const apiUrl = `https://colo-rize.vercel.app/kshitiz?url=${encodeURIComponent(tinyUrl)}`;
        const imageResponse = await axios.get(apiUrl, { responseType: "arraybuffer" });

        const cacheDir = join(__dirname, "cache");
        if (!existsSync(cacheDir)) {
          mkdirSync(cacheDir, { recursive: true });
        }

        const imagePath = join(cacheDir, "colorized_image.png");
        writeFileSync(imagePath, imageResponse.data);

        message.reply({ attachment: fs.createReadStream(imagePath) }, threadID);
      } catch (error) {
        console.error(error);
        message.reply("❌");
      }
    } else {
      message.reply("Please reply to an image.");
    }
  }
};
