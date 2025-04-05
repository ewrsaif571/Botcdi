module.exports = { config: { name: "uptime2", aliases:["up", "upt"], version: "1.7", author: "Anas x 114", role: 0, shortDescription: { en: "Get stylish bot stats and uptime2!" }, longDescription: { en: "Displays bot uptime2, user, thread stats, and total messages processed in a modern and visually engaging style." }, category: "system", guide: { en: "Use {p}uptime to display the bot's stats in style." } }, onStart: async function ({ api, event, usersData, threadsData, messageCount }) { try { const allUsers = await usersData.getAll(); const allThreads = await threadsData.getAll(); const uptime2 = process.uptime();

// Calculate formatted uptime2
  const days = Math.floor(uptime2 / 86400);
  const hours = Math.floor((uptime2 % 86400) / 3600);
  const minutes = Math.floor((uptime2 % 3600) / 60);
  const seconds = Math.floor(uptime2 % 60);

  const uptimeString = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

  // Active threads (threads with activity)
  const activeThreads = allThreads.filter(thread => thread.messageCount > 0).length;

  // Total messages processed
  const totalMessages = messageCount || 0; // Replace with actual message count logic if needed

  // Stylish message design with GIF
  const message = `

┏━━━━━━━━━━━━━━━┓                         🐥     🪽  Spider 🪽 ┗━━━━━━━━━━━━━━━┛ 📆 Uptime: ${uptimeString} 🙋 Total Users: ${allUsers.length} 💬 Total Threads: ${allThreads.length} 🔥 Active Threads: ${activeThreads} 📨 Total Messages: ${totalMessages} ━━━━━━━━━━━━━━━━━━━ 💡|M_U_N_N_A_S__B_O_T|

 `;

api.sendMessage({
    body: message.trim(),
    attachment: await global.utils.getStreamFromURL("https://i.imgur.com/B05183a.gif")
  }, event.threadID);
} catch (error) {
  console.error(error);
  api.sendMessage("An error occurred while retrieving bot stats.", event.threadID);
}

} };
