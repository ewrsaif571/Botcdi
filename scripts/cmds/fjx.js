const fs = require("fs");
const path = require("path");
const axios = require("axios");

const aspectRatioMap = {
  '1:1': { width: 1024, height: 1024 },
  '9:7': { width: 1152, height: 896 },
  '7:9': { width: 896, height: 1152 },
  '19:13': { width: 1216, height: 832 },
  '13:19': { width: 832, height: 1216 },
  '7:4': { width: 1344, height: 768 },
  '4:7': { width: 768, height: 1344 },
  '12:5': { width: 1500, height: 625 },
  '5:12': { width: 640, height: 1530 },
  '16:9': { width: 1344, height: 756 },
  '9:16': { width: 756, height: 1344 },
  '2:3': { width: 768, height: 1152 },
  '3:2': { width: 1152, height: 768 }
};

module.exports = {
  config: {
    name: "fjx",
    author: "Vincenzo",
    version: "1.3",
    cooldowns: 5,
    role: 0,
    shortDescription: "Generate a single AI image",
    longDescription: "Generates one image based on a prompt and aspect ratio. Also supports different engines.",
    category: "ai",
    guide: "{p}fjx <prompt> [--ar <ratio>] [--nijiv5 | --xl | --flux | --alya]"
  },

  onStart: async function ({ message, args, api, event }) {
    const waitingMessage = await message.reply("⏳ | Processing your request...");

    try {
      let prompt = "";
      let ratio = "1:1";
      let engine = "fj"; // default

      for (let i = 0; i < args.length; i++) {
        if (args[i] === "--ar" && args[i + 1]) {
          ratio = args[i + 1];
          i++;
        } else if (args[i] === "--nijiv5") {
          engine = "nijiv5";
        } else if (args[i] === "--xl") {
          engine = "xl";
        } else if (args[i] === "--flux") {
          engine = "flux";
        } else if (args[i] === "--alya") {
          engine = "alya";
        } else {
          prompt += args[i] + " ";
        }
      }

      prompt = prompt.trim();
      const params = { prompt };

      if (ratio && aspectRatioMap[ratio]) params.ratio = ratio;

      const cacheFolderPath = path.join(__dirname, "/tmp");
      if (!fs.existsSync(cacheFolderPath)) fs.mkdirSync(cacheFolderPath);

      const endpoint = `https://vincenzo-api.onrender.com/${engine}/gen`;
      const response = await axios.get(endpoint, { params });

      const imageURL = response.data.imageUrl;
      const imagePath = path.join(cacheFolderPath, `fjx_image_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(imagePath);

      const imageResponse = await axios({
        url: imageURL,
        method: "GET",
        responseType: "stream"
      });

      imageResponse.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await message.reply({
        attachment: fs.createReadStream(imagePath)
      });

      api.unsendMessage(waitingMessage.messageID);
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      api.unsendMessage(waitingMessage.messageID);
      message.reply("❌ | Failed to generate image.");
    }
  }
};