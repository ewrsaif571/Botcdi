const axios = require('axios');
const config = {
  name: 'flux2',
  category: 'tool',
  aliases: "flux2",
  author: 'Romim|nyx',
  role: 2,
};
const fetchImg =  async (prompt, senderID) => {
  const apiUrl = `https://ljrm5l-3000.csb.app/api/flux?prompt=${encodeURIComponent(prompt)}&uid=61566554077088`;
  const response = await axios.get(apiUrl);
  return response.data;
};
const onStart = async ({ args, event, message }) => {
  const query = args.join(' ');

  if (!query) {
    message.reply('Please provide a prompt🐤');
  }

  try {
    const time1 = Date.now();
    const msg = await message.reply('Please wait...');

    const imageUrl = await fetchImg(query, event.senderID);

    const timeTaken = ((Date.now() - time1 ) / 1000).toFixed(2);

    await message.unsend(msg.messageID);
    message.reply({
      body: `Here's your image\nTaken: ${timeTaken} seconds`,
      attachment: await global.utils.getStreamFromURL(imageUrl),
    });
  } catch (error) {
    message.reply(`Error: ${error.message}`);
  }
};
module.exports = {
  config,
  onStart
                          }
