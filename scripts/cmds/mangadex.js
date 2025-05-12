const axios = require('axios');

module.exports = {
  config: {
    name: "mangadex",
    aliases: ["mangadex"],
    version: "1.0",
    author: "jfhigtfdv",
    countDown: 5,
    role: 0,
    longDescription: {
      vi: '',
      en: "Read Manga"
    },
    category: "anime",
    guide: {
      vi: '',
      en: "{pn} <content>"
    }
  },

  onStart: async function ({ api, commandName, event }) {
    return api.sendMessage("Search Manga\n--------------------------\n(Reply to this message)", event.threadID, (error, message) => {
      global.GoatBot.onReply.set(message.messageID, {
        commandName: commandName,
        author: event.senderID,
        messageID: message.messageID,
        type: "search",
        pagetype: false,
        page: 1,
        searchStatus: true
      });
    }, event.messageID);
  },

  onReply: async function ({ Reply, api, event, args }) {
    try {
      const { commandName, author, messageID, type } = Reply;
      if (event.senderID != author) {
        return;
      }
      if (type == "search") {
        let currentPage = Reply.page;
        if (Reply.pagetype == true) {
          if (args[0]?.toLowerCase() === "page" && args[1] > 0) {
            currentPage = args[1];
          } else if (args[0]?.toLowerCase() === "select" && args[1] > 0) {
            const index = args[1] - 1;
            const selectedData = Reply.currentPageData[index];
            if (selectedData) {
              api.setMessageReaction('⏳', event.messageID, () => {}, true);
              const response = await axios.get('https://manga-kshitiz.vercel.app/manga/mangadex/info/' + selectedData.ID);
              const mangaInfo = response.data;
              const description = "Title: " + mangaInfo.title + "\n\nDescription: " + mangaInfo.description.en + "\n\nGenres: " + mangaInfo.genres.join(", ") + "\nThemes: " + mangaInfo.themes.join(", ") + "\nStatus: " + mangaInfo.status + "\nRelease Date: " + mangaInfo.releaseDate + "\nChapters: " + mangaInfo.chapters.length + "\n\n(Reply to this message the chapter you want to read. Ex: Read/Chapter 2/Done)";
              const imageStream = await global.utils.getStreamFromURL(mangaInfo.image);
              return api.sendMessage({ body: description, attachment: imageStream }, event.threadID, (error, message) => {
                api.setMessageReaction('', event.messageID, () => {}, true);
                global.GoatBot.onReply.set(message.messageID, {
                  commandName: commandName,
                  author: author,
                  messageID: message.messageID,
                  type: "read",
                  mangaInfo: mangaInfo,
                  option: false
                });
              }, event.messageID);
            } else {
              return api.sendMessage("Invalid item number⚠️", event.threadID, event.messageID);
            }
          } else {
            return args[0]?.toLowerCase() == "done" ? api.unsendMessage(messageID) && api.setMessageReaction('✅', event.messageID, () => {}, true) : api.sendMessage("Invalid input!⚠️\nEx: Page 2/Select 2/Done", event.threadID, event.messageID);
          }
        }

        let searchData = [];
        let resultData = searchData;
        if (Reply.searchStatus == true) {
          const search = event.body;
          const cleanSearch = search.replace(/[\/\\:]/g, '');
          api.setMessageReaction('⏳', event.messageID, () => {}, true);
          const searchResult = await axios.get('https://manga-kshitiz.vercel.app/manga/mangadex/' + cleanSearch);
          const results = searchResult.data.results;
          if (!results.length) {
            return api.sendMessage("No results found!", event.threadID, () => {
              api.setMessageReaction('⚠️', event.messageID, () => {}, true);
            }, event.messageID);
          }
          results.forEach(item => {
            searchData.push({
              ID: item.id,
              description: "Title: " + item.title + "\nDescription: " + item.description + "\nStatus: " + item.status + "\nRelease Date: " + item.releaseDate + "\nContent Rating: " + item.contentRating + "\nLast Volume: " + item.lastVolume + "\nLast Chapter: " + item.lastChapter + "\n\n"
            });
          });
        } else {
          searchData = Reply.resultString;
          resultData = Reply.resultString;
        }
        const totalPages = Math.ceil(resultData.length / 5);
        let resultPage = '';
        let selectedData;
        if (currentPage < 1 || currentPage > totalPages) {
          return api.sendMessage("Page " + currentPage + " does not exist.\nTotal pages: " + totalPages, event.threadID, event.messageID);
        } else {
          selectedData = await paginate(resultData, currentPage, 5);
          selectedData.forEach((data, index) => {
            resultPage += index + 1 + ". " + data.description + "\n";
          });
        }
        await api.unsendMessage(messageID);
        return api.sendMessage("Results:\n--------------------------\n" + resultPage + "Current page " + currentPage + " of " + totalPages + " page/s.\n(Reply to this message. Ex: Page 2/Select 2/Done)", event.threadID, (error, message) => {
          global.GoatBot.onReply.set(message.messageID, {
            commandName: commandName,
            author: author,
            messageID: message.messageID,
            resultString: searchData,
            type: 'search',
            pagetype: true,
            page: currentPage,
            searchStatus: false,
            currentPageData: selectedData
          });
          api.setMessageReaction('', event.messageID, () => {}, true);
        }, event.messageID);
      } else {
        if (type == 'read') {
          let selectedChapter;
          if (Reply.option == false) {
            if (args[0]?.toLowerCase() == "chapter" && args[1] > 0 && Reply.mangaInfo.chapters.length > args[1] - 1) {
              selectedChapter = args[1] - 1;
            } else if (args[0]?.toLowerCase() == 'done') {
              return api.unsendMessage(messageID) && api.setMessageReaction('✅', event.messageID, () => {}, true);
            } else if (args[0]?.toLowerCase() == "read" && Reply.mangaInfo.chapters.length > 0) {
              selectedChapter = 0;
            } else {
              return api.sendMessage("Invalid chapter!⚠️\nEx: Chapter 2/Read/Done", event.threadID, event.messageID);
            }
          } else {
            if (args[0]?.toLowerCase() == "next" && Reply.mangaInfo.chapters.length > Reply.position + 1) {
              selectedChapter = Reply.position + 1;
            } else if (args[0]?.toLowerCase() == "prev" && Reply.position > 0) {
              selectedChapter = Reply.position - 1;
            } else if (args[0]?.toLowerCase() === "chapter" && args[1] > 0 && Reply.mangaInfo.chapters.length > args[1] - 1) {
              selectedChapter = args[1] - 1;
            } else {
              return args[0]?.toLowerCase() == 'done' ? api.unsendMessage(messageID) && api.setMessageReaction('✅', event.messageID, () => {}, true) : api.sendMessage("No chapter available. Ex: Chapter 2/Next/Prev/Done", event.threadID, event.messageID);
            }
          }
          const chapters = Reply.mangaInfo.chapters;
          const reversedChapters = [...chapters].reverse();
          const chapterData = reversedChapters[selectedChapter];
          api.setMessageReaction('⏳', event.messageID, async () => {
            try {
              const response = await axios.get("https://manga-kshitiz.vercel.app/manga/mangadex/read/" + chapterData.id);
              const images = response.data.map(item => item.img);
              const imageStreams = await Promise.all(images.map(url => global.utils.getStreamFromURL(url)));
              let chapterInfo = "Title: " + chapterData.title + "\nChapter: " + chapterData.chapterNumber;
              for (let i = 0; i < imageStreams.length; i += 30) {
                const batchImages = imageStreams.slice(i, i + 30);
                const messageBody = {
                  body: chapterInfo,
                  attachment: batchImages
                };
                const sentMessage = await api.sendMessage(messageBody, event.threadID);
                global.GoatBot.onReply.set(sentMessage.messageID, {
                  commandName: commandName,
                  author: author,
                  messageID: sentMessage.messageID,
                  type: "read",
                  position: selectedChapter,
                  mangaInfo: Reply.mangaInfo,
                  option: true
                });
                chapterInfo = '';
              }
              await api.setMessageReaction('', event.messageID, () => {}, true);
            } catch (error) {
              return api.sendMessage("Something went wrong", event.threadID, event.messageID) && api.setMessageReaction('⚠️', event.messageID, () => {}, true);
            }
          }, true);
        }
      }
    } catch (error) {
      return api.sendMessage("Error: " + error, event.threadID, event.messageID) && api.setMessageReaction('⚠️', event.messageID, () => {}, true);
    }
  }
};

async function paginate(data, currentPage, perPage) {
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  return data.slice(startIndex, endIndex);
        }
