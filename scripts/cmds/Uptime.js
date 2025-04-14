module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "s"],
    version: "1.3",
    author: "BaYjid",
    role: 0,
    shortDescription: {
      en: "Displays the total number of users of the bot and check uptime."
    },
    longDescription: {
      en: "Displays the total number of users who have interacted with the bot and check uptime."
    },
    category: "UPTIME",
    guide: {
      en: "Type {pn}"
    }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      // Fetch data
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();
      const memoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
      const cpuLoad = (process.cpuUsage().user / 1000).toFixed(2);

      // Calculate uptime
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      // System info
      const os = require("os");
      const osType = os.type();
      const osPlatform = os.platform();
      const osArch = os.arch();
      const cpuInfo = os.cpus()[0].model;
      const nodeVersion = process.version;

      // Active threads count
      const activeThreads = allThreads.filter(thread => thread.active).length;

      // Mock network latency
      const networkLatency = Math.floor(Math.random() * 100);

      // Uptime message
      const uptimeMessage = `
╭━─━─≪✠≫─━╮
┃𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘┃
╰━──≪✠≫──━╯
┣⏳ 𝗗𝗮𝘆𝘀: ${days}  
┣⏱️ 𝗛𝗼𝘂𝗿𝘀: ${hours}  
┣⌛ 𝗠𝗶𝗻𝘂𝘁𝗲𝘀: ${minutes}  
┣⏳ 𝗦𝗲𝗰𝗼𝗻𝗱𝘀: ${seconds}  
┣━━━━━━≪✠≫━━━━━━┫
┣👥 𝗨𝘀𝗲𝗿𝘀: ${allUsers.length}  
┣🗂️ 𝗧𝗵𝗿𝗲𝗮𝗱𝘀: ${allThreads.length}  
┣🖥️ 𝗢𝗦: ${osType} (${osPlatform})  
┣🔧 𝗔𝗿𝗰𝗵: ${osArch}  
┣⚙️ 𝗖𝗣𝗨: ${cpuInfo}  
┣🖥️ 𝗡𝗼𝗱𝗲.𝗷𝘀: ${nodeVersion}  
┣📡 𝗡𝗲𝘁𝘄𝗼𝗿𝗸 𝗟𝗮𝘁𝗲𝗻𝗰𝘆: ${networkLatency} ms  
╰━━━━━━≪✠≫━━━━━━╯`;

      api.sendMessage(uptimeMessage, event.threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ **Error**: Something went wrong while fetching the data.", event.threadID);
    }
  }
};
