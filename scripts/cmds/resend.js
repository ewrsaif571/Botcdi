module.exports = {
        config: {
                name: "resend",
                version: "5.0",
                author: "Sadman Anik",
                countDown: 1,
                role: 2,
                shortDescription: {
                        en: "Enable/Disable Anti unsend mode"
                },
                longDescription: {
                        en: "Anti unsend mode. Works only with text (No audio, image, or video)"
                },
                category: "box chat",
                guide: {
                        en: "{pn} on or off\nex: {pn} on"
                },
                envConfig: {
                        deltaNext: 5
                }
        },

        onStart: async function ({ api, message, event, threadsData, args }) {
                let resend = await threadsData.get(event.threadID, "settings.reSend");

                if (resend === undefined) {
                        await threadsData.set(event.threadID, true, "settings.reSend");
                }

                if (!["on", "off"].includes(args[0])) 
                        return message.reply("Use 'on' or 'off'");

                await threadsData.set(event.threadID, args[0] === "on", "settings.reSend");

                if (args[0] === "on") {
                        if (!global.reSend) global.reSend = {};
                        if (!global.reSend[event.threadID]) {
                                global.reSend[event.threadID] = [];
                        }
                } else {
                        delete global.reSend[event.threadID];
                }

                return message.reply(`Anti-unsend ${args[0] === "on" ? "enabled" : "disabled"}`);
        },

        onChat: async function ({ api, threadsData, usersData, event }) {
                if (event.type === "message_unsend") {
                        let resend = await threadsData.get(event.threadID, "settings.reSend");
                        if (!resend) return;

                        if (!global.reSend || !global.reSend[event.threadID]) return;

                        let deletedMessage = global.reSend[event.threadID].find(msg => msg.messageID === event.messageID);
                        if (!deletedMessage) return;

                        // Skip video and media attachments
                        if (deletedMessage.attachments && deletedMessage.attachments.length > 0) {
                                let isVideo = deletedMessage.attachments.some(att => att.type === "video");
                                if (isVideo) return; // Skip if the attachment is a video
                        }

                        let senderID = deletedMessage.senderID;
                        let senderName = await usersData.getName(senderID) || "Unknown User";

                        let mentions = [{ id: senderID, tag: senderName }];
                        
                        let resendContent = deletedMessage.body || "No message content";

                        // Return the message as text without additional design
                        return api.sendMessage(
                                { 
                                        body: `${senderName}: ${resendContent}`,
                                        mentions 
                                }, 
                                event.threadID
                        );
                } else {
                        let resend = await threadsData.get(event.threadID, "settings.reSend");
                        if (!resend) return;

                        if (!global.reSend) global.reSend = {};
                        if (!global.reSend[event.threadID]) {
                                global.reSend[event.threadID] = [];
                        }

                        global.reSend[event.threadID].push(event);

                        if (global.reSend[event.threadID].length > 50) {
                                global.reSend[event.threadID].shift();
                        }
                }
        }
};
