const { execSync } = require("child_process");
const axios = require("axios");
const os = require("os");

module.exports = {
  config: {
    name: "info",
    aliases: ["dev"],
    version: "6.1",
    author: "UPoL 🐔",
    role: 0,
    shortDescription: { en: "Show dev & system info" },
    longDescription: { en: "Displays developer and bot system details in animated form" },
    category: "info",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    try {
      // Delay helper
      const delay = ms => new Promise(res => setTimeout(res, ms));

      // Get external IP safely
      const getIP = async () => {
        try {
          const res = await axios.get("https://ipinfo.io/json");
          return res.data.ip || "Unknown";
        } catch (e) {
          console.error("Failed to fetch IP:", e.message);
          return "Unknown";
        }
      };

      // Get number of installed npm packages
      let pkgs = "Unknown";
      try {
        const npmListOutput = execSync("npm list --depth=0").toString();
        pkgs = (npmListOutput.match(/──/g) || []).length;
      } catch (e) {
        console.error("Failed to get npm packages:", e.message);
      }

      // Prepare system info object
      const sys = {
        ip: await getIP(),
        prefix: global.GoatBot?.config?.prefix || "!",
        botName: global.GoatBot?.config?.botName || "Your Baby",
        node: process.version,
        pkgs,
        dev: "NiRoB Islam",
        nick: "Saif",
        site: "naii",
        contact: {
          fb: "https://www.facebook.com/naruto.uzomaki09",
          github: "https://github.com/ewrsaif571",
          telegram: "@nirob_islam01",
          mail: "md.nirob.11229@gmail.com"
        },
        os: {
          type: os.type(),
          platform: os.platform(),
          arch: os.arch(),
          uptime: Math.floor(os.uptime() / 60) + " mins",
          totalMem: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB",
          freeMem: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + " GB",
          hostname: os.hostname(),
          cpuModel: os.cpus()?.[0]?.model || "Unknown",
          cpuCount: os.cpus()?.length || "Unknown"
        }
      };

      const fullMessage = [
        `${sys.botName} | System Overview`,
        ``,
        ``,
        `× Developer: ${sys.dev}`,
        `× Bot Name: ${sys.botName}`,
        `× Dev Nickname: ${sys.nick}`,
        `× Prefix: ${sys.prefix}`,
        `× Node.js Version: ${sys.node}`,
        `× IP Address: ${sys.ip}`,
        `× Total Packages: ${sys.pkgs}`,
        `× Website: ${sys.site}`,
        ``,
        ``,
        `× System Info:`,
        `• Hostname: ${sys.os.hostname}`,
        `• OS Type: ${sys.os.type}`,
        `• Platform: ${sys.os.platform}`,
        `• Architecture: ${sys.os.arch}`,
        `• Uptime: ${sys.os.uptime}`,
        `• CPU: ${sys.os.cpuModel}`,
        `• CPU Cores: ${sys.os.cpuCount}`,
        `• Total Memory: ${sys.os.totalMem}`,
        `• Free Memory: ${sys.os.freeMem}`,
        ``,
        ``,
        `× Contact Info:`,
        `• Facebook: ${sys.contact.fb}`,
        `• GitHub: ${sys.contact.github}`,
        `• Telegram: ${sys.contact.telegram}`,
        `• Email: ${sys.contact.mail}`,
        ``,
        ``,
        `× Note:`,
        `Keep developing your coding skills and make something attractive.`
      ];

      const chunkSize = Math.ceil(fullMessage.length / 5);

      // Send initial message
      const sent = await api.sendMessage("☠️ Gathering forbidden data...", event.threadID);
      if (!sent || !sent.messageID) {
        console.error("Failed to send initial message or missing messageID.");
        return;
      }

      // Animate message by editing in chunks
      for (let i = 1; i <= 5; i++) {
        const chunk = fullMessage.slice(0, i * chunkSize).join("\n");
        await delay(800);
        try {
          await api.editMessage(chunk, sent.messageID);
        } catch (editErr) {
          console.error("Failed to edit message:", editErr.message);
          // Fallback: send new message instead of editing
          await api.sendMessage(chunk, event.threadID);
        }
      }
    } catch (error) {
      console.error("Error in info command:", error);
      await api.sendMessage("Something went wrong while fetching info.", event.threadID);
    }
  }
};