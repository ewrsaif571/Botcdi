const axios = require("axios");

module.exports = {
	config: {
		name: "waifu",
		version: "1.0",
		author: "tas3n",
		countDown: 6,
		role: 0,
		description:{ en : "Get waifu neko: waifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe"},
		category: "anime",
		guide: "{pn} {{<name>}}",
	},

	onStart: async function ({ message, args }) {
		const name = args.join(" ");
		if (!name) {
			try {
				let res = await axios.get(`https://api.waifu.pics/sfw/waifu`);
				message.reply({
					body: "Here's your waifu",
					attachment: await global.utils.getStreamFromURL(res.data.url),
				});
			} catch (e) {
				message.reply(` Not Found`);
			}
		} else {
			try {
				let res = await axios.get(`https://api.waifu.pics/sfw/${name}`);
				message.reply({
					body: `Here's your waifu`,
					attachment: await global.utils.getStreamFromURL(res.data.url)
				});
			} catch (e) {
				message.reply(
					` No waifu  \category: waifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe `
				);
			}
		}
	},
};
