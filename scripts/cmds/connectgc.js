let connectedThreadID;
const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

module.exports = {
    config: {
        name: "connectgc",
        author: "kshitiz",
        version: "1.0",
        shortDescription: {
            vi: "",
            en: "connect the group chat into one"
        },
        category: "admin",
        guide: {
            vi: "   {pn} <message> gcUid",
            en: "   {pn} <message> gcUid"
        }
    },

    onStart: async function ({ args, message, event, api, commandName }) {
        const msg = args.slice(0, -1).join(" "); 
        const gcUid = args[args.length - 1]; 
        if (!msg || !gcUid)
            return message.reply("Please provide message and gcUid.");

        connectedThreadID = gcUid;

        const formMessage = {
            body: msg,
            attachment: await getStreamsFromAttachment(event.attachments.filter(item => mediaTypes.includes(item.type)))
        };
        try {
            const messageSend = await api.sendMessage(formMessage, gcUid);

           
            global.GoatBot.onReply.set(messageSend.messageID, {
                originalThreadID: event.threadID,
                originalSenderID: event.senderID,
                commandName
            });

           
            if (!global.GoatBot.onReply.has(event.messageID)) {
                global.GoatBot.onReply.set(event.messageID, {
                    originalThreadID: event.threadID,
                    originalSenderID: message.senderID,
                    commandName
                });
            }

            return message.reply("Message sent successfully to the specified group.");
        } catch (error) {
            console.error("Error sending message:", error);
            return message.reply("Failed to send message.");
        }
    },

    onReply: async function ({ event, api, Reply }) {
        const { originalThreadID, originalSenderID, commandName } = Reply;
        const senderName = await api.getUserInfo(event.senderID);
        const formMessage = {
            body: `${senderName[event.senderID].name}: ${event.body}`
        };
        try {
           
            if (event.attachments.length > 0) {
             
                const attachmentStreams = await getStreamsFromAttachment(event.attachments.filter(item => mediaTypes.includes(item.type)));
                formMessage.attachment = attachmentStreams;
            }

            if (originalThreadID === event.threadID) {
             
                const messageSend = await api.sendMessage(formMessage, connectedThreadID);

               
                global.GoatBot.onReply.set(messageSend.messageID, {
                    originalThreadID,
                    originalSenderID,
                    commandName
                });
            } else {
             
                const messageSend = await api.sendMessage(formMessage, originalThreadID);

              
                global.GoatBot.onReply.set(messageSend.messageID, {
                    originalThreadID,
                    originalSenderID,
                    commandName
                });
            }
        } catch (error) {
            console.error("Error sending reply:", error);
        }
    }
};
