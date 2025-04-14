const axios = require('axios');
const fs = require("fs-extra");
const path = require('path');

module.exports = {
    config: {
        name: "flux",
        version: "1.0",
        author: "Team Calyx",
        category: "𝗔𝗜",
        countDown: 5,
        shortDescription: "Generate an image",
        longDescription: "Generates an image based on the provided prompt.",
        guide: { en: "{pn} <prompt>", ar: "{pn} <المطالبة>" },
    },

    onStart: async function ({ message, args }) {
        if (!args.length) return message.reply("Please provide a prompt. Usage: -fluxultra <prompt> --ar 2:3");

        const ratioIndex = args.findIndex(arg => arg === "--ar" || arg === "--ratio");
        const ratio = (ratioIndex !== -1 && args[ratioIndex + 1]) ? args[ratioIndex + 1] : "1:1";
        const prompt = args.filter((arg, i) => i !== ratioIndex && i !== ratioIndex + 1).join(" ");


        try {
            const apiUrl = await getApiUrl();
            if (!apiUrl) return message.reply("❌ Failed to fetch API URL.");

            const response = await axios.get(`${apiUrl}/fluxf?prompt=${encodeURIComponent(prompt)}&ratio=${ratio}`, { responseType: 'arraybuffer' });

            const imagePath = path.join(__dirname, 'cache', `generated_${Date.now()}.jpg`);
            fs.writeFileSync(imagePath, response.data);

            message.reply({ attachment: fs.createReadStream(imagePath) }, () => fs.unlinkSync(imagePath));

        } catch (error) {
            console.error("Error fetching the image:", error);
            message.reply("❌ Failed to generate image. Please try again later.");
        }
    }
};

async function getApiUrl() {
    try {
        const { data } = await axios.get("https://raw.githubusercontent.com/Savage-Army/extras/refs/heads/main/api.json");
        return data.api;
    } catch (error) {
        console.error("Error fetching API URL:", error);
        return null;
    }
      }
