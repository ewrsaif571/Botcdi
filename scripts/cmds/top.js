module.exports = {
  config: {
    name: "top",
    version: "1.6",
    author: "KAMU x gpt🤡",
    role: 0,
    shortDescription: {
      en: "Top 8 Rich Users"
    },
    longDescription: {
      en: ""
    },
    category: "group",
    guide: {
      en: "{pn}"
    }
  },
  onStart: async function ({ api, args, message, event, usersData }) {
    const allUsers = await usersData.getAll();
    
    // Sort users by money and take top 8
    const topUsers = allUsers.sort((a, b) => b.money - a.money).slice(0, 8);

    // Format numbers with abbreviations
    function formatNumber(num) {
      if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
      if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
      if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
      if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
      return num.toFixed(2);
    }

    // Create the leaderboard with added spacing
    const topUsersList = topUsers.map((user, index) => {
      const rank = index + 1;
      const medal = rank === 1 ? "👑" : rank === 2 ? "💎" : rank === 3 ? "💍" : ` ${rank}.`;
      const name = user.name.length > 12 ? user.name.substring(0, 9) + "..." : user.name;
      const money = formatNumber(user.money || 0);
      
      return `\n${medal} ${name.padEnd(12)} » 💰 ${money.padStart(8)}\n────────────────────`;
    });

    // Modern message design with spaced list
    const messageText = `
╭── ⋅ ⋅ ── ✩ ── ⋅ ⋅ ──╮
         TOP 8 RICHEST
╰── ⋅ ⋅ ── ✩ ── ⋅ ⋅ ──╯
${topUsersList.join("")}

╭── ⋅ ⋅ ── ✩ ── ⋅ ⋅ ──╮
  💸 𝗪𝗲𝗮𝗹𝘁𝗵 𝗟𝗲𝗮𝗱𝗲𝗿𝗯𝗼𝗮𝗿𝗱 💸
╰── ⋅ ⋅ ── ✩ ── ⋅ ⋅ ──╯`;

    message.reply(messageText);
  }
};
