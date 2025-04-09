module.exports = {
  config: {
    name: "uid2",
    version: "1.0.0",
    permission: 0,
    credits: "XNIL",
    prefix: 'awto',
    description: "Inbox",
    category: "without prefix",
    cooldowns: 5
  },

  onStart: async function({ api, event, usersData }) {
    let uid;

    // Determine the user ID based on the type of event
    if (event.type === "message_reply") {
      uid = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    } else {
      uid = event.senderID;
    }

    try {
      // Get the name of the user
      let name = await usersData.getName(uid);
      const msg = `[ ▶️]➡️ 𝐍𝐚𝐦𝐞: ${name}\n[ ▶️]➡️ 𝐈𝐃: ${uid}`;

      // Call the shareContact function
      await api.shareContact(msg, uid, event.threadID);

      let avt;
      if (event.messageReply) {
        avt = await usersData.getAvatarUrl(event.messageReply.senderID);
      } else if (event.attachments && event.attachments[0] && event.attachments[0].target && event.attachments[0].target.id) {
        avt = await usersData.getAvatarUrl(event.attachments[0].target.id);
      } else {
        avt = await usersData.getAvatarUrl(uid);
      }

      // Check if avatar URL is retrieved
      if (!avt) {
        throw new Error("Avatar URL not found.");
      }

      // Fetch the avatar image as a stream
      const attachment = await global.utils.getStreamFromURL(avt);
      if (!attachment) {
        throw new Error("Failed to fetch the avatar image.");
      }

      // Send the avatar image
      await api.sendMessage({ body: "", attachment: attachment }, event.threadID);

      // Send a confirmation message
      api.sendMessage("Contact shared successfully.", event.threadID, event.messageID);
    } catch (error) {
      // Send an error message
      api.sendMessage("Error sharing contact: " + error.message, event.threadID, event.messageID);
    }
  }
};
