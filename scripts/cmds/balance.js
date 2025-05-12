module.exports = {
	config: {
		name: "balance",
		aliases: ["bal"],
		version: "1.3",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "xem số tiền hiện có của bạn hoặc người được tag",
			en: "view your money or the money of the tagged person"
		},
		category: "economy",
		guide: {
			vi: "   {pn}: xem số tiền của bạn"
				+ "\n   {pn} <@tag>: xem số tiền của người được tag",
			en: "   {pn}: view your money"
				+ "\n   {pn} <@tag>: view the money of the tagged person"
		}
	},

	langs: {
		vi: {
			money: "Bạn đang có %1$",
			moneyOf: "%1 đang có %2$"
		},
		en: {
			money: "You have %1$",
			moneyOf: "%1 has %2$"
		}
	},

	// Function to format numbers into K, M, B, T, etc.
	formatMoney: function (num) {
		const units = ["", "K", "M", "B", "T", "Q", "Qt", "Sx", "Sp", "O", "N"];
		let unitIndex = 0;
		while (num >= 1000 && unitIndex < units.length - 1) {
			num /= 1000;
			unitIndex++;
		}
		return `${num.toFixed(2)}${units[unitIndex]}`;
	},

	onStart: async function ({ message, usersData, event, getLang }) {
		if (Object.keys(event.mentions).length > 0) {
			const uids = Object.keys(event.mentions);
			let msg = "";
			for (const uid of uids) {
				const userMoney = await usersData.get(uid, "money");
				const formattedMoney = this.formatMoney(userMoney);
				msg += getLang("moneyOf", event.mentions[uid].replace("@", ""), formattedMoney) + '\n';
			}
			return message.reply(msg);
		}

		const userData = await usersData.get(event.senderID);
		const formattedMoney = this.formatMoney(userData.money);
		message.reply(getLang("money", formattedMoney));
	}
};
