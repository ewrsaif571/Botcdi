const si = require('systeminformation');
const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "system",
    aliases: [],
    version: "1.0",
    author: "SAIF 🐔",
    countDown: 5,
    role: 0,
    shortDescription: "System",
    longDescription: "",
    category: "system",
    guide: "{pn}"
  },

  byte2mb: function (bytes) {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let l = 0, n = parseInt(bytes, 10) || 0;
    while (n >= 1024 && ++l) n = n / 1024;
    return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
  },

  onStart: async function ({ api, event }) {
    try {
      const timeStart = Date.now();
      
      // Get System Information
      const { cpu, cpuTemperature, currentLoad, memLayout, diskLayout, mem, osInfo } = si;
      
      const { manufacturer, brand, speed, physicalCores, cores } = await cpu();
      const { main: mainTemp } = await cpuTemperature();
      const { currentLoad: load } = await currentLoad();
      const diskInfo = await diskLayout();
      const memInfo = await memLayout();
      const { total: totalMem, available: availableMem } = await mem();
      const { platform: OSPlatform, build: OSBuild } = await osInfo();

      // Uptime Calculation
      let time = process.uptime();
      let hours = Math.floor(time / 3600).toString().padStart(2, '0');
      let minutes = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
      let seconds = Math.floor(time % 60).toString().padStart(2, '0');

      let response = `𝗦𝘆𝘀𝘁𝗲𝗺 𝗜𝗻𝗳𝗼:
🖥 𝗖𝗣𝗨: ${manufacturer} ${brand} - ${speed}GHz
🧩 𝗖𝗼𝗿𝗲𝘀: ${physicalCores} | Threads: ${cores}
🔥 𝗖𝗣𝗨 𝗧𝗲𝗺𝗽: ${mainTemp}°C
⚡ 𝗖𝗣𝗨 𝗟𝗼𝗮𝗱: ${load.toFixed(1)}%

💾 𝗠𝗲𝗺𝗼𝗿𝘆:
🔹 Type: ${memInfo[0].type}
🔹 Total: ${this.byte2mb(totalMem)}
🔹 Available: ${this.byte2mb(availableMem)}

📀 𝗗𝗶𝘀𝗸:
🔸 Name: ${diskInfo[0].name}
🔸 Type: ${diskInfo[0].type}
🔸 Size: ${this.byte2mb(diskInfo[0].size)}
${diskInfo[0].temperature ? `🌡 Temp: ${diskInfo[0].temperature}°C` : ''}

🖥 𝗢𝗦:
📌 Platform: ${OSPlatform}
📌 Build: ${OSBuild}
🕒 Uptime: ${hours}:${minutes}:${seconds}
⏳ Ping: ${(Date.now() - timeStart)}ms`;

      // Image Links
      const imageLinks = [
        "https://i.imgur.com/u1WkhXi.jpg",
        "https://i.imgur.com/zuUMUDp.jpg",
        "https://i.imgur.com/skHrcq9.jpg",
        "https://i.imgur.com/TE9tH8w.jpg",
        "https://i.imgur.com/on9p0FK.jpg",
        "https://i.imgur.com/mriBW5m.jpg",
        "https://i.imgur.com/ju7CyHo.jpg",
        "https://i.imgur.com/KJunp2s.jpg",
        "https://i.imgur.com/6knPOgd.jpg",
        "https://i.imgur.com/Nxcbwxk.jpg",
        "https://i.imgur.com/FgtghTN.jpg"
      ];

      const randomImage = imageLinks[Math.floor(Math.random() * imageLinks.length)];
      const imagePath = __dirname + "/cache/system_info.jpg";

      // Download Image and Send Message
      request(encodeURI(randomImage)).pipe(fs.createWriteStream(imagePath)).on("close", () => {
        api.sendMessage({ body: response, attachment: fs.createReadStream(imagePath) }, event.threadID, () => {
          fs.unlinkSync(imagePath);
        }, event.messageID);
      });

    } catch (e) {
      console.error(e);
      api.sendMessage("❌ সিস্টেম তথ্য আনতে সমস্যা হয়েছে!", event.threadID);
    }
  }
};
