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
    const getIP = async () => {
      try {
        const res = await axios.get("https://ipinfo.io/json");
        return res.data.ip || "Unknown";
      } catch {
        return "Unknown";
      }
    };

    const delay = t => new Promise(r => setTimeout(r, t));

    let pkgs;
    try {
      pkgs = (execSync("npm list --depth=0").toString().match(/──/g) || []).length;
    } catch {
      pkgs = "Unknown";
    }

    const sys = {
      ip: await getIP(),
      prefix: global.GoatBot?.config?.prefix || "!",
      botName: global.GoatBot?.config?.botName || "Your Baby",
      node: process.version,
      pkgs,
      dev: "NiRob Islam",
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
      `Keep develope your coding skill and make something attractive things.`
    ];

    const chunkSize = Math.ceil(fullMessage.length / 5);
    const sent = await api.sendMessage("☠️ Gathering forbidden data...", event.threadID);

    for (let i = 1; i <= 5; i++) {
      const chunk = fullMessage.slice(0, i * chunkSize).join("\n");
      await delay(800);
      await api.editMessage(chunk, sent.messageID);
    }
  }
};