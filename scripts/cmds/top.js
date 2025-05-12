module.exports = {
  config: {
    name: "top",
    version: "1.4",
    author: "SAIF x gpt🤡",
    role: 0,
    shortDescription: {
      en: "Top 15 Rich Users"
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
    
    // Sort users by money and take top 15
    const topUsers = allUsers.sort((a, b) => b.money - a.money).slice(0, 15);

    // Function to format numbers correctly
    function formatNumber(num) {
      if (num >= 1e15) return (num / 1e15).toFixed(2) + "Q"; // Quadrillion
      if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"; // Trillion
      if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"; // Billion
      if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"; // Million
      if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"; // Thousand
      return num.toString(); // যদি 1K-এর নিচে হয়, তাহলে নরমাল দেখাবে
    }

    // Create leaderboard list
    const topUsersList = topUsers.map((user, index) => {
      const moneyFormatted = formatNumber(user.money || 0); // যদি টাকা না থাকে তাহলে "0" দেখাবে
      const medals = ["🥇", "🥈", "🥉"];
      return `${medals[index] || `${index + 1}.`} ${user.name} - ${moneyFormatted}`;
    });

    // Shortened header and compact design
    const messageText = `👑 𝗧𝗢𝗣 𝗥𝗜𝗖𝗛𝗘𝗦𝗧 𝗨𝗦𝗘𝗥𝗦 👑\n━━━━━━━━━━━\n${topUsersList.join("\n")}`;

    message.reply(messageText);
  }
};
