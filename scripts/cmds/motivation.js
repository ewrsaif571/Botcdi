const axios = require('axios');
const fs = require('fs-extra');
const os = require('os');
const { createReadStream, unlinkSync } = fs;
const { resolve } = require('path');

module.exports = {
  config: {
    name: 'motivation',
    aliases: ['inspire'],
    author: 'SAIF 🌚🍒',
    version: '2.1',
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: 'Get a random inspirational quote with audio',
    },
    longDescription: {
      en: 'Fetches random inspirational quotes from multiple APIs with text-to-speech',
    },
    category: 'media',
    guide: {
      en: '{p}motivation',
    },
  },
  onStart: async function ({ api, event }) {
    try {
      const quoteApis = [
        async () => {
          const response = await axios.get('https://api.quotable.io/random?tags=inspirational', { timeout: 3000 });
          return response.data.content;
        },
        async () => {
          const response = await axios.get('https://zenquotes.io/api/random', { timeout: 3000 });
          return response.data[0].q;
        },
        async () => {
          const response = await axios.get('https://type.fit/api/quotes', { timeout: 3000 });
          const quotes = response.data;
          const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
          return randomQuote.text;
        },
        async () => {
          const response = await axios.get('https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en', { timeout: 3000 });
          return response.data.quoteText;
        }
      ];

      let quote = '';
      let lastError = null;

      for (const apiCall of quoteApis) {
        try {
          quote = await apiCall();
          if (quote) break;
        } catch (error) {
          lastError = error;
          console.log(`API failed, trying next one...`, error.message);
        }
      }

      if (!quote) {
        throw lastError || new Error('All quote APIs failed');
      }

      // Remove author if present
      quote = quote.split('—')[0].split('~')[0].trim();

      const audioFilePath = resolve(os.tmpdir(), `motivation_${Date.now()}.mp3`);
      
      try {
        await global.utils.downloadFile(
          `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(quote)}&tl=en&client=tw-ob`,
          audioFilePath
        );
      } catch (ttsError) {
        console.error('Google TTS failed, trying alternative:', ttsError);
        await global.utils.downloadFile(
          `https://api.storyo.me/tts?text=${encodeURIComponent(quote)}&voice=en-US`,
          audioFilePath
        );
      }

      api.sendMessage(
        { 
          body: `💬 Motivational Quote:\n\n"${quote}"`,
          attachment: createReadStream(audioFilePath)
        },
        event.threadID,
        () => {
          try {
            unlinkSync(audioFilePath);
          } catch (cleanupError) {
            console.error('Error cleaning up audio file:', cleanupError);
          }
        }
      );

    } catch (error) {
      console.error('Final error:', error);
      api.sendMessage(
        `⚠️ Couldn't fetch a quote at the moment. Here's one manually:\n\n"Believe you can and you're halfway there." - Theodore Roosevelt`,
        event.threadID
      );
    }
  },
};