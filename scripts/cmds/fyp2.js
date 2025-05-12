const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { shortenURL } = global.utils;

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  return response.data;
}

async function fetchTikTokVideos(query) {
  try {
    const response = await axios.get(`https://lyric-search-neon.vercel.app/kshitiz?keyword=${query}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

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

module.exports = {
  config: {
    name: "fyp2",
    aliases: [],
    author: "Vex_Kshitiz",
    version: "1.0",
    shortDescription: {
      en: "",
    },
    longDescription: {
      en: "tiktok alternative",
    },
    category: "media",
    guide: {
      en: "{p}{n} [keyword]",
    },
  },
  onStart: async function ({ api, event, args }) {
    

    api.setMessageReaction("🤖", event.messageID, (err) => {}, true);
    const query = args.join(' ');

    const videos = await fetchTikTokVideos(query);

    if (!videos || videos.length === 0) {
      api.sendMessage({ body: `${query} not found.` }, event.threadID, event.messageID);
      return;
    }

    const selectedVideo = videos[Math.floor(Math.random() * videos.length)];
    const videoUrl = selectedVideo.videoUrl;

    if (!videoUrl) {
      api.sendMessage({ body: 'Error: Video not found.' }, event.threadID, event.messageID);
      return;
    }

    try {
      const shortUrl = await shortenURL(videoUrl);
      const videoStream = await getStreamFromURL(videoUrl);
      await api.sendMessage({
        body: ``,
        attachment: videoStream,
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage({ body: 'An error occurred while processing the video.\nPlease try again later.' }, event.threadID, event.messageID);
    }
  },
};