const { GoatWrapper } = require('fca-liane-utils');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
	config: {
		name: "owner",
		aliases: [],
		author: "Hasan",
		role: 0,
		shortDescription: " ",
		longDescription: "",
		category: "info",
		guide: "{pn}"
	},

	onStart: async function ({ api, event }) {
		try {
			const ownerInfo = {
				name: '𝐒𝐀𝐈𝐅 𝐈𝐒𝐋𝐀𝐌',
				class: '9',
				group: '𝐒𝐄𝐂𝐑𝐄𝐓',
				gender: '𝐌𝐀𝐋𝐄',
				Birthday: '01-5-2009',
				religion: '𝐈𝐒𝐋𝐀𝐌',
				hobby: '𝐧𝐭𝐠 𝐬𝐩𝐞𝐜𝐢𝐚𝐥🙂',
				Fb: 'https://m.me/ewrsaif570',
				Relationship: '𝐒𝐢𝐧𝐠𝐥𝐞 >3',
				Height: '5"4'
			};

			const bold = 'https://i.imgur.com/frZhBlN.mp4';
			const tmpFolderPath = path.join(__dirname, 'tmp');

			if (!fs.existsSync(tmpFolderPath)) {
				fs.mkdirSync(tmpFolderPath);
			}

			const videoResponse = await axios.get(bold, { responseType: 'arraybuffer', headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      } });
			const videoPath = path.join(tmpFolderPath, 'owner_video.mp4');

			fs.writeFileSync(videoPath, Buffer.from(videoResponse.data, 'binary'));

			const response = `
𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 🌚🍓 \n
 𝙉𝘼𝙈𝙀: ${ownerInfo.name}
 𝘾𝙇𝘼𝙎𝙎: ${ownerInfo.class}
 𝙂𝙍𝙊𝙐𝙋: ${ownerInfo.group}
 𝙂𝙀𝙉𝘿𝙀𝙍: ${ownerInfo.gender}
 𝘽𝙄𝙍𝙏𝙃𝘿𝘼𝙔: ${ownerInfo.Birthday}
 𝙍𝙀𝙇𝙄𝙂𝙄𝙊𝙉: ${ownerInfo.religion}
 𝙍𝙀𝙇𝘼𝙏𝙄𝙊𝙉𝙎𝙃𝙄𝙋: ${ownerInfo.Relationship}
 𝙃𝙊𝘽𝘽𝙔: ${ownerInfo.hobby}
 𝙃𝙀𝙄𝙂𝙃𝙏: ${ownerInfo.Height}
 𝙁𝘽: ${ownerInfo.Fb}
			`;

			await api.sendMessage({
				body: response,
				attachment: fs.createReadStream(videoPath)
			}, event.threadID, event.messageID);

			fs.unlinkSync(videoPath);

			api.setMessageReaction('😻', event.messageID, (err) => {}, true);
		} catch (error) {
			console.error('Error in ownerinfo command:', error);
			return api.sendMessage('An error occurred while processing the command.', event.threadID);
		}
	}
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });