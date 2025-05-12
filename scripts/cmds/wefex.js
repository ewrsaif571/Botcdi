const axios = require('axios');


const badWords = ["."]

module.exports = {
  config: {
    name: 'wfx',
    aliases: ["wefex"],
    version: '1.0',
    author: 'JARiF × Ohio03',
    countDown: 0,
    role: 0,
    longDescription: {
      vi: 'wfx an image based on a prompt using an AI model',
      en: 'wfx an image based on a prompt using an AI model'
    },
    category: 'tool',
   guide: {
        en: ' {pn} Your Prompt | Model: 1-3'
      }
  },

  onStart: async function ({ message, args }) {
    try {
      const info = args.join(' ');
      const [prompt, model] = info.split('|').map(item => item.trim());
      const text = args.join ("");
          if (!text) {
      return message.reply("❌ | Please Provide a Prompt");
    }


      if (containsBadWords(prompt)) {
        return message.reply('❌ | NSFW Prompt Detected');
      }

      const apiKey = 'emma_heesters_quiin'; //API KEY BY JARiF//


      const modelParam = model || '3';//Default Model Is 3//

      const apiUrl = `https://jarif-draw.gadhaame.repl.co/imagine?model=${modelParam}&prompt=${encodeURIComponent(prompt)}&apikey=${apiKey}`;//API BY JARiF//

      await message.reply('Please Wait...⏳');

      const form = {
        body: "Here's Your wfx image 😊",
      };

      form.attachment = [];
      form.attachment[0] = await global.utils.getStreamFromURL(apiUrl);

      message.reply(form);
    } catch (error) {
      console.error(error);
      await message.reply('Sorry, API Have Skill Issue');
    }
  }
};

function containsBadWords(prompt) {
  const promptLower = prompt.toLowerCase();
  return badWords.some(badWord => promptLower.includes(badWord));
}
