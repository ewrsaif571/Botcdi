const axios = require('axios');
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "anim",
    aliases: ["animefy"],
    version: "2.2",
    author: "Team Calyx",
    countDown: 10,
    role: 0,
    shortDescription: "Anime transformation",
    longDescription: "Convert photos to anime style artwork",
    category: "image",
    guide: {
      en: "{pn} [reply to image]"
    }
  },

  onStart: async function ({ api, message, event }) {
    try {
      if (!event.messageReply?.attachments?.[0]?.url) {
        return message.reply("❌ Please reply to an image!");
      }

      const imgUrl = event.messageReply.attachments[0].url;
      const processingMsg = await message.reply("🔄 Creating anime art...");

      const response = await axios.get(`http://45.134.39.193:6298/animirror?url=${encodeURIComponent(imgUrl)}`);
      
      if (!response.data?.image_url) {
        throw new Error("Invalid API response format");
      }

      const imageStream = await getStreamFromURL(response.data.image_url);

      await message.reply({
        body: "🎨 Your anime transformation is ready!",
        attachment: imageStream
      });

      await api.unsendMessage(processingMsg.messageID);

    } catch (error) {
      console.error('Error:', error);
      message.reply("❌ Failed to create anime art. Please try another image.");
    }
  }
};