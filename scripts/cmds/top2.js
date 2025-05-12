module.exports = {
  config: {
    name: "top2",
    version: "3.1",
    author: "Loid Butter // SAIF",
    role: 0,
    shortDescription: {
      en: "💰 Top 100 Richest Users"
    },
    longDescription: {
      en: "Displays the wealthiest users in a clean list"
    },
    category: "economy",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    try {
      const allUsers = await usersData.getAll();

      // Simplified money formatting (only shows M/B/T)
      const formatMoney = (money) => {
        if (money >= 1e12) return (money / 1e12).toFixed(2) + 'T';
        if (money >= 1e9) return (money / 1e9).toFixed(2) + 'B';
        if (money >= 1e6) return (money / 1e6).toFixed(2) + 'M';
        if (money >= 1e3) return (money / 1e3).toFixed(1) + 'k';
        return money;
      };

      const topUsers = allUsers.sort((a, b) => b.money - a.money).slice(0, 100);

      // Clean list with minimal emojis
      const topUsersList = topUsers.map((user, index) => {
        const rank = index + 1;
        const name = user.name.length > 12 ? user.name.substring(0, 10) + ".." : user.name;
        const money = formatMoney(user.money);
        
        // Only show emoji for top 3
        if (rank === 1) return `🥇 ${name} » $${money}`;
        if (rank === 2) return `🥈 ${name} » $${money}`;
        if (rank === 3) return `🥉 ${name} » $${money}`;
        return `▸ ${rank}. ${name} » $${money}`;
      });

      // Minimalist message design
      const messageText = 
        `✦ TOP 100 RICHEST ✦
        \n${topUsersList.join('\n')}
        \n\n✦ Total Users: ${allUsers.length}`;

      message.reply(messageText);
    } catch (error) {
      console.error(error);
      message.reply("Error fetching top users.");
    }
  }
};