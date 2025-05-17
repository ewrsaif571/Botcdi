const axios = require("axios");

const animeNames = ["one-piece", "wind-breaker", "mushoku-tensei-isekai-ittara-honki-dasu-2-part-2", "kimetsu-no-yaiba-hashira-geiko-hen"];

async function checkAuthor(authorName) {
  try {
    const response = await axios.get('https://author-check.vercel.app/name');
    const apiAuthor = response.data.name;
    return apiAuthor === authorName;
  } catch (error) {
    console.error("Error checking author:", error);
    return false;
  }
}

const moduleConfig = {
  name: "animetime", 
  aliases: ["at"],
  author: "Vex_Kshitiz",
  version: "1.0",
  cooldowns: 5,
  role: 0,
  shortDescription: "Get anime episode release time",
  longDescription: "Get episode release time for specified anime or all listed anime",
  category: "fun",
  guide: "{p}animetime or {p}animetime {animeName}",
};

module.exports = {
  config: moduleConfig,

  onStart: async function ({ api, event, message, args }) {
    const isAuthorValid = await checkAuthor(module.exports.config.author);
    if (!isAuthorValid) {
      await message.reply("Author changer alert! this cmd belongs to Vex_Kshitiz.");
      return;
    }

    const animeNameArg = args[0]; 
    let animeDataList = [];

    if (!animeNameArg) {
      try {
        for (const animeName of animeNames) {
          const response = await axios.get(`https://anime-time-one.vercel.app/kshitiz?name=${animeName}`);
          const animeData = formatAnimeData(response.data);
          animeDataList.push(animeData);
        }
        const replyMessage = animeDataList.join("\n\n");
        await message.reply(replyMessage);
      } catch (error) {
        console.error(error);
        message.reply("Wrong anime name format.");
      }
    } else {
      try {
        const response = await axios.get(`https://anime-time-one.vercel.app/kshitiz?name=${animeNameArg}`);
        const animeData = formatAnimeData(response.data);
        await message.reply(animeData);
      } catch (error) {
        console.error(error);
        message.reply("Anime name format is not matching.");
      }
    }
  }
};

function formatAnimeData(data) {
  return `✰𝗔𝗡𝗜𝗠𝗘: ${data.animeName}\n✰𝗖𝗢𝗠𝗠𝗜𝗡𝗚 𝗔𝗧 ${data.subs}\n✰𝗖𝗢𝗨𝗡𝗧𝗗𝗢𝗪𝗡:\n    - 𝗥𝗔𝗪: ${data.countdown.raw}\n    - 𝗦𝗨𝗕:${data.countdown.subs}`;
}