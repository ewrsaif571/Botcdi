const axios = require("axios");

module.exports = {
  config: {
    name: "hentai",
    version: "1.1",
    role: 2,
    author: "Nyx",
    description: "Search or fetch hentai content",
    category: "media",
    usages: "[query]",
    cooldown: 5
  },

  onStart: async ({ message, args }) => {
    const query = args.join(" ");
    const apiUrl = query
      ? `https://www.noobz-api.rf.gd/api/hentai-search?query=${encodeURIComponent(query)}`
      : "https://www.noobz-api.rf.gd/api/hentai-feed";

    try {
      const res = await axios.get(apiUrl);
      const results = res.data.data;

      if (!results || results.length === 0) {
        return message.reply("No results found.");
      }

      const selected = query
        ? results.slice(0, 6)
        : results.sort(() => 0.5 - Math.random()).slice(0, 4);

      const images = await Promise.all(
        selected.map((item) => global.utils.getStreamFromUrl(item.imageUrl))
      );

      let body = "";
      selected.forEach((item, i) => {
        body += `${i + 1}. ${item.title}\nViews: ${item.views || "N/A"}\n\n`;
      });

      const reply = await message.reply({
        body: `Search Results:\n\n${body}\nReply with a number to download.`,
        attachment: images
      });

      global.GoatBot.onReply.set(reply.messageID, {
        commandName: "hentai",
        messageID: reply.messageID,
        result: selected
      });
    } catch (err) {
      console.error(err);
      message.reply("Error occurred while fetching data.");
    }
  },

  onReply: async ({ Reply, message, event }) => {
    const { result, messageID } = Reply;
    const choice = parseInt(event.body);

    if (isNaN(choice) || choice < 1 || choice > result.length) {
      return message.reply("Please select a valid number.");
    }

    const selected = result[choice - 1];
    await message.unsend(messageID);
    const loading = await message.reply("Downloading link extracting...");

    try {
      const downloadRes = await axios.get(
        `https://www.noobz-api.rf.gd/api/hentai-download?url=${encodeURIComponent(selected.link)}`
      );

      await message.reply(
downloadRes.data
      );
    } catch (err) {
      message.reply("Failed to download the video.");
    }
  }
};