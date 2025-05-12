const axios = require('axios');
module.exports.config = {
  name: "pinterest",
  aliases: "pin",
  category: "image",
  author: "Nyx",
};

module.exports.onStart = async function ({ api, event, args }) {
  const query = args[0];
  const limit = parseInt(args[1]) || 30;

  if (!query) {
    return api.sendMessage("⚠️ Please provide a search query! Example: pinterest cat 30", event.threadID);
  }

  if (limit > 40) {
    return api.sendMessage("⚠️ Limit exceeded! Maximum limit is 40.", event.threadID);
  }

  try {
    const response = await axios.get(`https://www.noobz-api.rf.gd/api/pinterest?search=${query}`);
    const { data } = response.data;

    if (!data || data.length === 0) {
      return api.sendMessage("❌ No results found for your query.", event.threadID);
    }

    const selectedImages = data.slice(0, limit);
    const attachments = await Promise.all(
      selectedImages.map(async (imageUrl) => {
        try {
          return await global.utils.getStreamFromUrl(imageUrl);
        } catch (err) {
          console.error(`Ops baka failed to stream image: ${imageUrl}`, err);
          return null;
        }
      })
    );
    const validAttachments = attachments.filter((stream) => stream !== null);

    if (validAttachments.length === 0) {
      return api.sendMessage("❌ No valid images to send.", event.threadID);
    }
   
    return api.sendMessage(
      { attachment: validAttachments },
      event.threadID,
      () => {
        api.sendMessage(`✅ Successfully sent ${validAttachments.length} images for query "${query}".`, event.threadID);
      }
    );
  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ Failed to fetch data. Please try again later.", event.threadID);
  }
};
