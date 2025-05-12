module.exports = {
  config: {
    name: "listbox",
    aliases: ["l"],
    version: "2.0",
    author: "kshitiz // Eren",
    cooldowns: 5,
    role: 2,
    shortDescription: {
      en: "List all group chats the bot is in."
    },
    longDescription: {
      en: "Use this command to list all group chats the bot is currently in."
    },
    category: "owner",
    guide: {
      en: "{p}{n}"
    }
  },

  onStart: async function ({ api, event }) {
    return run(api, event);
  },

  onChat: async function ({ event, api }) {
    const text = (event.body || "").toLowerCase();
    if (text === "listbox" || text === "l") {
      return run(api, event);
    }
  }
};

// Common function used for both onStart and onChat
async function run(api, event) {
  try {
    const threadList = await api.getThreadList(100, null, ["INBOX"]);
    const groupChats = threadList.filter(thread => thread.isGroup);

    if (groupChats.length === 0) {
      return api.sendMessage("❌ No group chats found!", event.threadID, event.messageID);
    }

    const formattedGroups = groupChats.map((group, i) =>
      `│ ${i + 1}. ${group.name || "Unnamed Group"}\n│ 🆔 TID: ${group.threadID}`
    ).join("\n");

    const msg = `
╭───⌈ 💌 𝗧𝗪𝗜𝗡𝗞𝗟𝗘 𝙂𝙍𝙊𝙐𝙋 𝙇𝙄𝙎𝙏 ⌋───╮

${formattedGroups}

╰─────────────ꔪ
    `.trim();

    return api.sendMessage(msg, event.threadID, event.messageID);
  } catch (err) {
    console.error("❌ Error listing groups:", err);
    return api.sendMessage("⚠️ An error occurred while fetching the group list.", event.threadID, event.messageID);
  }
}