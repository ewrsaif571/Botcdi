const fs = require("fs");
const path = require("path");
const axios = require("axios");
const tinyurl = require("tinyurl");
 
module.exports = {
  config: {
    name: "animegen",
    aliases: [],
    version: "1.0",
    author: "Kshitiz",
    countDown: 20,
    role: 1, // Ensuring only admins can use this command
    shortDescription: "Generate an anime-style image.",
    longDescription: "Generate an anime-style image using AI.",
    category: "ai",
    guide: {
      en: "{p}animegen [prompt] | [model]"
    }
  },
  onStart: async function ({ message, event, args, api, usersData, threadsData }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
 
    try {
      let imageUrl = null;
      let prompt = '';
 
      if (event.type === "message_reply") {
        const attachment = event.messageReply.attachments[0];
        if (!attachment || !["photo", "sticker"].includes(attachment.type)) {
          return message.reply("❌ | Please reply to an image.");
        }
        imageUrl = attachment.url;
      } else if (args.length > 0 && args[0].startsWith("http")) {
        imageUrl = args[0];
      } else if (args.length > 0) {
        prompt = args.join(" ").trim();
      } else {
        return message.reply("❌ | Please reply to an image or provide a valid prompt.");
      }
 
      // If an image is provided, generate a prompt for it
      if (imageUrl) {
        const shortUrl = await tinyurl.shorten(imageUrl);
        const promptResponse = await axios.get(`https://www.api.vyturex.com/describe?url=${encodeURIComponent(shortUrl)}`);
        prompt = promptResponse.data;
      }
 
      // Notify the user that the image is being generated
      message.reply("🔄 | Generating your anime-style image... Please wait.");
 
      const promptApiUrl = `https://text2image-wine.vercel.app/kshitiz?prompt=${encodeURIComponent(prompt)}&model=1`;
      const response = await axios.get(promptApiUrl);
      const { task_id } = response.data;
 
      const progressApiUrl = `https://progress-black.vercel.app/progress?imageid=${task_id}`;
 
      let imgDownloadLink = null;
 
      while (!imgDownloadLink) {
        const progressResponse = await axios.get(progressApiUrl);
        const { status, imgs } = progressResponse.data.data;
 
        if (status === 2 && imgs && imgs.length > 0) {
          imgDownloadLink = imgs[0];
        }
 
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
 
      // Ensure cache folder exists
      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
 
      const imagePath = path.join(cacheFolderPath, `${task_id}.png`);
      const writer = fs.createWriteStream(imagePath);
      const imageResponse = await axios({
        url: imgDownloadLink,
        method: 'GET',
        responseType: 'stream'
      });
 
      imageResponse.data.pipe(writer);
 
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
 
      const stream = fs.createReadStream(imagePath);
      await message.reply({
        body: "🎨 | Here is your generated anime-style image!",
        attachment: stream
      });
 
    } catch (error) {
      console.error("Error:", error.message);
      message.reply("❌ | An error occurred. Please try again later.");
    }
  }
};
