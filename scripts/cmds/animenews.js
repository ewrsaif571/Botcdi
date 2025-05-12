const malScraper = require("mal-scraper");

module.exports = {
  'config': {
    'name': "aninews",
    'aliases': ['animenews'],
    'version': '1.0',
    'author': "kshitiz",
    'countDown': 5, // Use a number instead of hex
    'role': 0x0,
    'shortDescription': {
      'en': "Get the latest news of anime from MyAnimeList"
    },
    'longDescription': {
      'en': "Fetches the latest news of anime from MyAnimeList"
    },
    'category': "anime",
    'guide': {
      'en': "{p}malnews"
    }
  },
  'onStart': async function({
    api: _0x12a312,
    event: _0x2e06fd
  }) {
    try {
      const news = await malScraper.getNewsNoDetails(5); // Get top 5 news
      const message = `TOP 5 LATEST MAL NEWS\n\n` +
        `\u300E 1 \u300F ${news[0].title}\n\n` +
        `\u300E 2 \u300F ${news[1].title}\n\n` +
        `\u300E 3 \u300F ${news[2].title}\n\n` +
        `\u300E 4 \u300F ${news[3].title}\n\n` +
        `\u300E 5 \u300F ${news[4].title}`;

      _0x12a312.sendMessage(message, _0x2e06fd.threadID, _0x2e06fd.messageID);
    } catch (error) {
      console.error(error);
      _0x12a312.sendMessage("Sorry, something went wrong while fetching the news.", _0x2e06fd.threadID);
    }
  }
};
