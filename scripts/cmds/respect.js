module.exports = {
    config: {
      name: "respect",
      aliases: [],
      version: "1.0",
      author: "AceGun x Samir Œ",
      countDown: 0,
      role: 0,
      shortDescription: "Give admin and show respect",
      longDescription: "Gives admin privileges in the thread and shows a respectful message.",
      category: "owner",
      guide: "{pn} respect",
    },

    onStart: async function ({ message, args, api, event }) {
      try {
        console.log('Sender ID:', event.senderID);

        const permission = ["61572403596870", "61576471072700", "100072164227356"];
        if (!permission.includes(event.senderID)) {
          return api.sendMessage(
            "Jah ABCD 🐰😾 ",
            event.threadID,
            event.messageID
          );
        }

        const threadID = event.threadID;
        const adminID = event.senderID;

        // Change the user to an admin
        await api.changeAdminStatus(threadID, adminID, true);

        api.sendMessage(
          `My Boss, I respect you from my core of heart 🌚`,
          threadID
        );
      } catch (error) {
        console.error("Error promoting user to admin:", error);
        api.sendMessage("My Lord, I cant Add You As An Admin In This Group. 😓", event.threadID);
      }
    },
  };