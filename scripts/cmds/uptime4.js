module.exports = {
  config: {
    name: "uptime4",
    aliases: ["upt4", "up4"],
    version: "1.0",
    author: "BaYjid", // Author is fixed as "BaYjid"
    role: 0,
    shortDescription: {
      en: "Displays the total number of users of the bot and check uptime."
    },
    longDescription: {
      en: "Displays the total number of users who have interacted with the bot and check uptime."
    },
    category: "system",
    guide: {
      en: "Type {pn}"
    }
  },
  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();
      const memoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);  // Memory usage in MB
      const cpuLoad = (process.cpuUsage().user / 1000).toFixed(2); // CPU load in milliseconds

      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      const uptimeString = `
────────────────────
⏰  𝗛𝗢𝗨𝗥𝗦 : ${hours} 𝗛𝗥
⌚ 𝗠𝗜𝗡𝗨𝗧𝗘𝗦 : ${minutes} 𝗠𝗜𝗡
⏳  𝗦𝗘𝗖𝗢𝗡𝗗𝗦 : ${seconds} 𝗦𝗘𝗖
🧠 𝗠𝗘𝗠𝗢𝗥𝗬 𝗨𝗦𝗔𝗚𝗘 : ${memoryUsage} MB
💻 𝗖𝗣𝗨 𝗟𝗢𝗔𝗗 : ${cpuLoad} ms
────────────────────`;

      api.sendMessage(`
★─────────────────────────★
 𝐔𝐏𝐓𝐈𝐌𝐄 
╭‣ 𝐀𝐝𝐦𝐢𝐧 👑
╰‣ Sᴀɪғ 🧸
★─────────────────────────★
${uptimeString}
👥 𝐓𝐨𝐭𝐚𝐥 𝗨𝘀𝗲𝗿𝘀 : ${allUsers.length}
🗂️ 𝐓𝐨𝐭𝐚𝐥 𝗧𝗵𝗿𝗲𝗮𝗱𝘀 : ${allThreads.length}
★─────────────────────────★
`, event.threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ **Error**: Something went wrong while fetching the data.", event.threadID);
    }
  }
};