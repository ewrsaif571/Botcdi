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
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // Get IP address
    const getIP = async () => {
      try {
        const res = await axios.get("https://ipinfo.io/json");
        return res.data.ip || "Unknown";
      } catch {
        return "Unknown";
      }
    };

    // Get total installed packages
    let pkgs = "Unknown";
    try {
      const output = execSync("npm list --depth=0").toString();
      pkgs = (output.match(/──/g) || []).length;
    } catch {}

    const sys = {
      ip: await getIP(),
      prefix: global.GoatBot?.config?.prefix || "!",
      botName: global.GoatBot?.config?.botName || "Your Baby",
      node: process.version,
      pkgs,
      dev: "SA IF",
      nick: "pikaabu",
      site: "naii",
      contact: {
        fb: "https://www.facebook.com/saif.boch404",
        github: "https://github.com/ewrsaif571",
        telegram: "@nirob_islam01",
        mail: "md.nirob.11229@gmail.com"
      },
      os: {
        type: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        uptime: Math.floor(os.uptime() / 60) + " mins",
        totalMem: (os.totalmem() / 1024 ** 3).toFixed(2) + " GB",
        freeMem: (os.freemem() / 1024 ** 3).toFixed(2) + " GB",
        hostname: os.hostname(),
        cpuModel: os.cpus()?.[0]?.model || "Unknown",
        cpuCount: os.cpus()?.length || "Unknown"
      }
    };

    const lines = [
      `🤖 ${sys.botName} | System Info`,
      ``,
      ` Developer: ${sys.dev}`,
      ` Dev Nickname: ${sys.nick}`,
      ` Bot Name: ${sys.botName}`,
      ` Prefix: ${sys.prefix}`,
      ` Node.js Version: ${sys.node}`,
      ` IP Address: ${sys.ip}`,
      ` Total Packages: ${sys.pkgs}`,
      ` Website: ${sys.site}`,
      ``,
      `🖥️ System Details:`,
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
      `📬 Contact:`,
      `• Facebook: ${sys.contact.fb}`,
      `• GitHub: ${sys.contact.github}`,
      `• Telegram: ${sys.contact.telegram}`,
      `• Email: ${sys.contact.mail}`,
      ``,
      `📢 Note:`,
      `Keep coding, stay creative & break the limits 🚀`
    ];

    try {
      const sent = await api.sendMessage("🌀 Fetching bot and system data...", event.threadID);
      if (!sent?.messageID) return;

      const chunkCount = 4;
      const chunkSize = Math.ceil(lines.length / chunkCount);

      for (let i = 1; i <= chunkCount; i++) {
        const msg = lines.slice(0, i * chunkSize).join("\n");
        await delay(700);
        try {
          await api.editMessage(msg, sent.messageID);
        } catch {
          await api.sendMessage(msg, event.threadID);
          break;
        }
      }
    } catch (err) {
      console.error("Error in info command:", err);
      await api.sendMessage("❌ Something went wrong while showing system info.", event.threadID);
    }
  }
};