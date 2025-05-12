module.exports = {
  config: {
    name: "album2",
    version: "1.0",
    author: "SAIF",
    countDown: 10,
    role: 0,
    shortDescription: "useless album",
    longDescription: "Play media based on the specified category",
    category: "media",
    guide: "{pn} <category>"
  },

  onStart: async function ({ message, args }) {
    const categories = {
      anime: [
        "https://i.imgur.com/lyRI0nD.mp4",
        "https://i.imgur.com/7ZByQ5K.mp4",
        "https://i.imgur.com/jpoKusB.mp4",
        "https://i.imgur.com/zD0v0CV.mp4",
        "https://i.imgur.com/SNeKJ1E.mp4",
        "https://i.imgur.com/VVeISk9.mp4",
      ],
      love: [
        "https://i.imgur.com/vhhuvjw.mp4",
        "https://i.imgur.com/OXsViIM.mp4"
      ],
      couple: [
        "https://example.com/couple1.mp4",
        "https://example.com/couple2.mp4"
      ],
      funny: [
        "https://example.com/funny1.mp4",
        "https://example.com/funny2.mp4"
      ],
      "free fire": [
        "https://example.com/freefire1.mp4",
        "https://example.com/freefire2.mp4"
      ],
      flirting: [
        "https://example.com/flirting1.mp4",
        "https://example.com/flirting2.mp4"
      ],
      girl: [
        "https://i.imgur.com/95ruyWS.mp4",
        "https://i.imgur.com/sYDn95i.mp4"
      ],
      sad: [
        "https://example.com/sad1.mp4",
        "https://example.com/sad2.mp4"
      ],
      lyrics: [
        "https://example.com/lyrics1.mp4",
        "https://example.com/lyrics2.mp4"
      ],
      cartoon: [
        "https://example.com/cartoon1.mp4",
        "https://example.com/cartoon2.mp4"
      ],
      football: [
        "https://example.com/football1.mp4",
        "https://example.com/football2.mp4"
      ],
      horny: [
        "https://example.com/horny1.mp4",
        "https://example.com/horny2.mp4"
      ],
      car: [
        "https://i.imgur.com/0mAedKY.mp4",
        "https://i.imgur.com/exHwxax.mp4",
        "https://i.imgur.com/fjFHcnY.mp4",
        "https://i.imgur.com/KiubkIW.mp4",
      ]
      // Add more categories and links as needed
    };

    const category = args[0]; 

    
    if (!category || !categories[category]) {
      const availableCategories = Object.keys(categories)
        .map((cat) => `🐤 ${cat.toUpperCase()} Video`)
        .join("\n");

      return message.reply({
        body: `🎀 𝗣𝗹𝗲𝗮𝘀𝗲 𝗰𝗵𝗼𝗼𝘀𝗲 𝗮 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆:\n\n${availableCategories}\n\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: !album anime`,
        attachment: null
      });
    }
    
    const mediaLinks = categories[category];
    const randomMedia = mediaLinks[Math.floor(Math.random() * mediaLinks.length)];

    message.send({
      body: `🎥 𝗣𝗹𝗮𝘆𝗶𝗻𝗴 ${category.toUpperCase()} 𝗩𝗜𝗗𝗘𝗢!\n\n`,
      attachment: await global.utils.getStreamFromURL(randomMedia)
    });
  }
};
