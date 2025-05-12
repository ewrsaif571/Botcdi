module.exports = {
  config: {
    name: "uptime3",
    aliases: ["up3", "upt3"],
    version: "1.7",
    author: "Anas x 114",
    role: 0,
    shortDescription: {
      en: "Get stylish bot stats and uptime!"
    },
    longDescription: {
      en: "Displays bot uptime, user, thread stats, and total messages processed in a modern and visually engaging style."
    },
    category: "system",
    guide: {
      en: "Use {p}uptime to display the bot's stats in style."
    }
  },
  onStart: async function ({ api, event, usersData, threadsData, messageCount }) {
    try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();

      // Calculate formatted uptime
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const uptimeString = `${days > 0 ? days + ' day' + (days > 1 ? 's' : '') + ', ' : ''}${hours > 0 ? hours + ' hour' + (hours > 1 ? 's' : '') + ', ' : ''}${minutes > 0 ? minutes + ' minute' + (minutes > 1 ? 's' : '') + ', ' : ''}${seconds} second${seconds !== 1 ? 's' : ''}`;

      // Active threads (threads with activity)
      const activeThreads = allThreads.filter(thread => thread.messageCount > 0).length;

      // Total messages processed
      const totalMessages = messageCount || 0;

      // NEON FUTURISTIC STYLE MESSAGE
      const message = `
✦ ━━━━━━━ ✧ ━━━━━━━ ✦
   𝗧𝗪𝗜𝗡𝗞𝗟𝗘 𝗦𝗧𝗔𝗧𝗦 >🎀

𝗨𝗣𝗧𝗜𝗠𝗘 » ${uptimeString}
𝗨𝗦𝗘𝗥𝗦 » ${allUsers.length.toLocaleString()}
𝗧𝗛𝗥𝗘𝗔𝗗𝗦 » ${allThreads.length.toLocaleString()}
𝗔𝗖𝗧𝗜𝗩𝗘 » ${activeThreads.toLocaleString()}
𝗠𝗘𝗦𝗦𝗔𝗚𝗘𝗦 » ${totalMessages.toLocaleString()}
      `;

      api.sendMessage(message.trim(), event.threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ 𝗘𝗥𝗥𝗢𝗥: Bot stats couldn't be fetched!", event.threadID);
    }
  }
};