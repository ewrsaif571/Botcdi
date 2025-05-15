const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
    config: {
        name: "admin",
        aliases: ["ad"],
        version: "1.0",
        author: "︎Hatan 🥰",
        countDown: 5,
        role: 0,
        shortDescription: "Add, remove or see the admin list for this bot",
        longDescription: "Add, remove or see the admin list for this bot",
        category: "admin",
        guide:  "   {pn} [list | -l]: Show admin list (everyone can use)\n" +
                "   {pn} [add | -a] <uid | @tag>: Add admin role for a user (admins only)\n" +
                "   {pn} [remove | -r] <uid | @tag>: Remove admin role from a user (admins only)\n" +
                "   {pn} [add | -a, remove | -r] (reply): Add/remove admin role for the user you replied to (admins only)"

    },

    langs: {
        en: {
            listAdmin: "𝗟𝗜𝗦𝗧 𝗢𝗙 𝗔𝗗𝗠𝗜𝗡 ♡︎"
                + "\n ___________________"
                + "\n 𝖠𝖽𝗆𝗂𝗇: ︎Nɪʀᴏʙ  >🎀 "
                + "\n _____________________________"
                + "\n 𝗢𝗣𝗘𝗥𝗔𝗧𝗢𝗥'𝗦"
                + "\n %1"
                + "\n _____________________________"
                + "\n 𝖮𝗐𝗇𝖾𝗋 𝖥𝖡:https://www.facebook.com/share/16WjRPrN7i/"
                + "\n ",
            noAdmin: "⚠️ | No admins found!",
            added: "✅ | Added admin role for %1 users:\n%2",
            alreadyAdmin: "\n⚠️ | %1 users already have admin role:\n%2",
            missingIdAdd: "⚠️ | Please provide an ID, tag a user, or reply to a message to add admin role",
            removed: "✅ | Removed admin role from %1 users:\n%2",
            notAdmin: "⚠️ | %1 users do not have admin role:\n%2",
            missingIdRemove: "⚠️ | Please provide an ID, tag a user, or reply to a message to remove admin role",
            notAllowed: "⛔ | You don't have permission to use this command!"
        }
    },

    onStart: async function ({ message, args, usersData, event, getLang }) {
        const senderID = event.senderID;

        switch (args[0]) {
            case "list":
            case "-l": {

                if (config.adminBot.length === 0) {
                    return message.reply(getLang("noAdmin"));
                }
                const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => `♡︎ ${name} ♡︎\n   ׂ╰┈➤(${uid})`)));
                return message.reply(getLang("listAdmin", getNames.join("\n")));
            }

            case "add":
            case "-a":
            case "remove":
            case "-r": {

                if (!config.adminBot.includes(senderID)) {
                    return message.reply(getLang("notAllowed"));
                }
            }

            if (args[0] === "add" || args[0] === "-a") {
                let uids = [];


                if (Object.keys(event.mentions).length > 0) {
                    uids = Object.keys(event.mentions);
                } else if (event.type === "message_reply") {
                    uids.push(event.messageReply.senderID);
                } else {
                    uids = args.filter(arg => !isNaN(arg));
                }

                if (uids.length === 0) {
                    return message.reply(getLang("missingIdAdd"));
                }

                const newAdmins = [];
                const alreadyAdmins = [];

                for (const uid of uids) {
                    if (config.adminBot.includes(uid)) {
                        alreadyAdmins.push(uid);
                    } else {
                        newAdmins.push(uid);
                    }
                }

                config.adminBot.push(...newAdmins);
                writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

                const newAdminNames = await Promise.all(newAdmins.map(uid => usersData.getName(uid)));
                const alreadyAdminNames = await Promise.all(alreadyAdmins.map(uid => usersData.getName(uid)));

                return message.reply(
                    (newAdmins.length > 0 ? 
                        getLang("added", newAdmins.length, newAdminNames.map(name => `• ${name}`).join("\n")) : "") +
                    (alreadyAdmins.length > 0 ? 
                        getLang("alreadyAdmin", alreadyAdmins.length, alreadyAdminNames.map(name => `• ${name}`).join("\n")) : "")
                );
            }

            if (args[0] === "remove" || args[0] === "-r") {
                let uids = [];


                if (Object.keys(event.mentions).length > 0) {
                    uids = Object.keys(event.mentions);
                } else if (event.type === "message_reply") {
                    uids.push(event.messageReply.senderID);
                } else {
                    uids = args.filter(arg => !isNaN(arg));
                }

                if (uids.length === 0) {
                    return message.reply(getLang("missingIdRemove"));
                }

                const removedAdmins = [];
                const notAdmins = [];

                for (const uid of uids) {
                    if (config.adminBot.includes(uid)) {
                        removedAdmins.push(uid);
                        config.adminBot.splice(config.adminBot.indexOf(uid), 1);
                    } else {
                        notAdmins.push(uid);
                    }
                }

                writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

                const removedAdminNames = await Promise.all(removedAdmins.map(uid => usersData.getName(uid)));
                const notAdminNames = await Promise.all(notAdmins.map(uid => usersData.getName(uid)));

                return message.reply(
                    (removedAdmins.length > 0 ? 
                        getLang("removed", removedAdmins.length, removedAdminNames.map(name => `• ${name}`).join("\n")) : "") +
                    (notAdmins.length > 0 ? 
                        getLang("notAdmin", notAdmins.length, notAdminNames.map(name => `• ${name}`).join("\n")) : "")
                );
            }

            default: {
                return message.reply("⚠️ | Invalid command! Use 'list', 'add' or 'remove'.");
            }
        }
    }
};
