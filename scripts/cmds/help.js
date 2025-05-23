const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "𝗔𝗱𝗺𝗶𝗻: Sᴀɪғ >🎀";

module.exports = {
  config: {
    name: "help",
    version: "1.18",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage"
    },
    longDescription: {
      en: "View command usage"
    },
    category: "info",
    guide: {
      en: "{pn} [empty | <page number> | <command name>]"
        + "\n {pn} <command name> [-u | usage | -g | guide]: only show command usage"
        + "\n {pn} <command name> [-i | info]: only show command info"
        + "\n {pn} <command name> [-r | role]: only show command role"
        + "\n {pn} <command name> [-a | alias]: only show command alias"
    },
    priority: 1
  },

  langs: {
    en: {
      help: "╭───────────⦿"
        + "\n%1"
        + "\n✪──────⦿"
        + "\n✪ Page [ %2/%3 ]"
        + "\n│ 𝐂𝐮𝐫𝐫𝐞𝐧𝐭𝐥𝐲, 𝐓𝐡𝐞 𝐁𝐨𝐭 𝐇𝐚𝐬 %4 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐓𝐡𝐚𝐭 𝐂𝐚𝐧 𝐁𝐞 𝐔𝐬𝐞𝐝"
        + "\n│ 𝐓𝐲𝐩𝐞 %5𝐡𝐞𝐥𝐩 <𝐩𝐚𝐠𝐞> 𝐓𝐨 𝐕𝐢𝐞𝐰 𝐓𝐡𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐋𝐢𝐬𝐭"
        + "\n│ 𝐓𝐲𝐩𝐞 %5𝐡𝐞𝐥𝐩 𝐓𝐨 𝐕𝐢𝐞𝐰 𝐓𝐡𝐞 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 𝐎𝐟 𝐇𝐨𝐰 𝐓𝐨 𝐔𝐬𝐞 𝐓𝐡𝐚𝐭 𝐂𝐨𝐦𝐦𝐚𝐧𝐝"
        + "\n✪──────⦿"
        + "\n✪ %6"
        + "\n╰─────────────⦿",
      help2: "%1╭──────────⦿"
        + "\n│ 𝗕𝗮𝗯𝘆 𝘁𝗼𝘁𝗮𝗹 𝗰𝗺𝗱𝘀:「%2」"
        + "\n╰─────────────⦿\n╭─────────────⦿\n│%4\n╰────────────⦿",
      commandNotFound: "Command \"%1\" does not exist",
      getInfoCommand: "⦿────── NAME ──────⦿"
        + "\n✪ %1"
        + "\n✪▫INFO▫"
        + "\n✪ Description: %2"
        + "\n✪ Other names: %3"
        + "\n✪ Other names in your group: %4"
        + "\n✪ Version: %5"
        + "\n✪ Role: %6"
        + "\n✪ Time per command: %7s"
        + "\n✪ Author: %8"
        + "\n✪▫USAGE▫"
        + "\n» %9"
        + "\n⦿─────────────────⦿",
      onlyInfo: "╭────⦿INFO ──────⦿"
        + "\n✪ Command name: %1"
        + "\n✪ Description: %2"
        + "\n✪ Other names: %3"
        + "\n✪ Other names in your group: %4"
        + "\n✪ Version: %5"
        + "\n✪ Role: %6"
        + "\n ✪Time per command: %7s"
        + "\n✪ Author: %8"
        + "\n╰─────────────⦿",
      onlyUsage: "╭───⦿ USAGE ─────⦿"
        + "\n✪%1"
        + "\n╰─────────────⦿",
      onlyAlias: "╭───⦿ ALIAS ─────⦿"
        + "\n✪ Other names: %1"
        + "\n✪ Other names in your group: %2"
        + "\n╰─────────────⦿",
      onlyRole: "╭────⦿ ROLE ───⦿"
        + "\n✪%1"
        + "\n╰─────────────⦿",
      doNotHave: "Do not have",
      roleText0: "0 (All users)",
      roleText1: "1 (Group administrators)",
      roleText2: "2 (Admin bot)",
      roleText0setRole: "0 (set role, all users)",
      roleText1setRole: "1 (set role, group administrators)",
      pageNotFound: "Page %1 does not exist"
    }
  },

  onStart: async function ({ message, args, event, threadsData, getLang, role }) {
    const langCode = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
    let customLang = {};
    const pathCustomLang = path.normalize(`${process.cwd()}/languages/cmds/${langCode}.js`);
    if (fs.existsSync(pathCustomLang)) customLang = require(pathCustomLang);

    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);
    let sortHelp = threadData.settings.sortHelp || "category";
    if (!["category", "name"].includes(sortHelp)) sortHelp = "name";
    const commandName = (args[0] || "").toLowerCase();
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));

    if (!command && !args[0] || !isNaN(args[0])) {
      const arrayInfo = [];
      let msg = "";
      if (sortHelp == "name") {
        const page = parseInt(args[0]) || 1;
        const numberOfOnePage = 30;
        for (const [name, value] of commands) {
          if (value.config.role > 1 && role < value.config.role) continue;
          let describe = name;
          let shortDescription;
          const shortDescriptionCustomLang = customLang[name]?.shortDescription;
          if (shortDescriptionCustomLang != undefined)
            shortDescription = checkLangObject(shortDescriptionCustomLang, langCode);
          else if (value.config.shortDescription)
            shortDescription = checkLangObject(value.config.shortDescription, langCode);
          if (shortDescription)
            describe += `: ${cropContent(shortDescription.charAt(0).toUpperCase() + shortDescription.slice(1))}`;
          arrayInfo.push({ data: describe, priority: value.priority || 0 });
        }

        arrayInfo.sort((a, b) => a.data.localeCompare(b.data));
        arrayInfo.sort((a, b) => b.priority - a.priority);

        const { allPage, totalPage } = global.utils.splitPage(arrayInfo, numberOfOnePage);
        if (page < 1 || page > totalPage)
