module.exports = {
    config: {
        name: "sendmoney",
        version: "1.1",
        author: "Hassan",
        aliases: ["-m"],
        shortDescription: {
            en: "Send money to another user 💸",
        },
        longDescription: {
            en: "Command to transfer money 💰 to another user by UID, mention, or by replying to their message.",
        },
        category: "economy",
    },
    onStart: async function ({ args, message, event, usersData }) {
        const { senderID, mentions, messageReply } = event;
        const senderData = await usersData.get(senderID);

        if (!senderData) {
            return message.reply("Error: Sender data not found. ❌");
        }

        // Validate amount
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply("Please enter a valid positive amount to send. 💵");
        } else if (amount > senderData.money) {
            return message.reply("Not enough money in your balance. 💳");
        }

        // Determine recipient UID
        let recipientUID;

        // Case 1: Check for a mention
        if (Object.keys(mentions).length > 0) {
            recipientUID = Object.keys(mentions)[0];
        }
        
        // Case 2: Check for a reply to a message
        else if (messageReply && messageReply.senderID) {
            recipientUID = messageReply.senderID;
        }

        // Case 3: Fallback to direct UID input
        else if (args[1]) {
            recipientUID = args[1];
        }

        if (!recipientUID) {
            return message.reply("Error: Please provide a recipient UID, mention them, or reply to their message. 📨");
        }

        const recipientData = await usersData.get(recipientUID);
        if (!recipientData) {
            return message.reply("Recipient not found. 🕵️‍♂️");
        }

        // Perform the transaction
        await usersData.set(senderID, {
            money: senderData.money - amount,
            data: senderData.data,
        });

        await usersData.set(recipientUID, {
            money: (recipientData.money || 0) + amount,
            data: recipientData.data,
        });

        // Notify both users
        await message.reply(`✅ Successfully sent $${amount} 💸 to ${recipientData.name || `UID: ${recipientUID}`}.`);
    },
};
