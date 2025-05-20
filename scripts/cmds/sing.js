const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: 'sing',
    author: 'Nyx',
    usePrefix: false,
    category: 'media'
  },
  onStart: async ({ event,api,args, message }) => {
    try {
      const query = args.join(' ');
      if (!query) return message.reply('Please provide a search query!');
      const searchResponse = await axios.get(`https://mostakim.onrender.com/mostakim/ytSearch?search=${encodeURIComponent(query)}`);
      api.setMessageReaction("🐧", event.messageID, () => {}, true);
      const parseDuration = (timestamp) => {
        const parts = timestamp.split(':').map(part => parseInt(part));
        let seconds = 0;
        
        if (parts.length === 3) {
          seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          seconds = parts[0] * 60 + parts[1];
        }
        
        return seconds;
      };
      const filteredVideos = searchResponse.data
        .filter(video => {
          try {
            const totalSeconds = parseDuration(video.timestamp);
            return totalSeconds < 600;
          } catch {
            return false;
          }
        });

      if (filteredVideos.length === 0) {
       message.reply('No short videos found (under 10 minutes)!');
      }
      const selectedVideo = filteredVideos[0];
      const tempFilePath = path.join(__dirname, 'temp_audio.m4a');
      const apiResponse = await axios.get(`https://mostakim.onrender.com/m/sing?url=${selectedVideo.url}`);
      
      if (!apiResponse.data.url) {
        throw new Error('No audio URL found in response');
      }

      const writer = fs.createWriteStream(tempFilePath);
      const audioResponse = await axios({
        url: apiResponse.data.url,
        method: 'GET',
        responseType: 'stream'
      });

      audioResponse.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
api.setMessageReaction("😏", event.messageID, () => {}, true);
      await message.reply({
        body: `🎧 Now playing: ${selectedVideo.title}\nDuration: ${selectedVideo.timestamp}`,
        attachment: fs.createReadStream(tempFilePath)
      });
      fs.unlink(tempFilePath, (err) => {
        if (err) message.reply('Error deleting temp file:', err);
      });

    } catch (error) {
      message.reply(`Error: ${error.message}`);
    }
  }
};