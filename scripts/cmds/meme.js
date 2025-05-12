const axios = require("axios");

module.exports = {
  config: {
    name: "meme",
    aliases: ["randommeme"],
    version: "0.1",
    role: 0,
    author: "Noob_DEVS",
    description: "Get a random meme",
    category: "fun",
    countDown: 5,
  },

  onStart: async function ({ message, event, api }) {
    try {
      const response = await axios.get("https://www.noobz-api.rf.gd/api/meme");

      const memeUrl = response.data.url;
      const memeDescription =
        response.data.description || "🐔 Here's a random meme!";
      if (!memeUrl) return message.reply("❌ Failed to fetch meme.");

      const attachment = await global.utils.getStreamFromURL(memeUrl);
      await message.reply({ body: memeDescription, attachment });
    } catch (error) {
      console.error("❌ Meme API Request Failed:", error);
      message.reply(
        "❌ Error: " + (error.response?.data?.message || error.message)
      );
    }
  },
};
