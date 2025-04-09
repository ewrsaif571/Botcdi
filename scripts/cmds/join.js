module.exports = {
  config: {
    name: "join",
    aliases: ['addme', 'joinme'],
    version: "1.0",
    author: "𝐀𝐒𝐈𝐅 𝐱𝟔𝟗",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Add user to support group",
    },
    longDescription: {
      en: "This command adds the user to the group wher bot exist",
    },
    category: "Owner",
    guide: {
      en: "To use this command, simply type !join <threadID>.",
    },
  },

  onStart: async function ({ api, args, message, event }) {
    const fuck = args.join(' ');
    const permission = global.GoatBot.config.GOD;
    if (!permission.includes(event.senderID)) {
      api.sendMessage(fuck, event.threadID, event.messageID);
      return;
    }
    const supportGroupId = args[0];
    if (!supportGroupId) {
      api.sendMessage("Please provide the support group ID.", event.threadID);
      return;
    }
    const threadID = event.threadID;
    const userID = event.senderID;
    const threadInfo = await api.getThreadInfo(supportGroupId);
    const participantIDs = threadInfo.participantIDs;
    if (participantIDs.includes(userID)) {
      api.sendMessage(
        "You are already in this group. If you didn't find it, please check your message requests or spam box.",
        threadID
      );
    } else {
      api.addUserToGroup(userID, supportGroupId, (err) => {
        if (err) {
          console.error("Failed to add user to support group:", err);
          api.sendMessage("I can't add you because your id is not allowed message request or your account is private. please add me then try again...", threadID);
        } else {
          api.sendMessage(
            "You have been added to this group. If you didn't find the box in your inbox, please check your message requests or spam box.",
            threadID
          );
        }
      });
    }
  },
};
