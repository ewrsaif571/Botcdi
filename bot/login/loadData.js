const chalk = require('chalk');
const path = require('path');

module.exports = async function (api, createLine) {
  const { log, createOraDots, getText } = global.utils;

  console.log(chalk.hex("#f5ab00")(createLine("DATABASE")));

  const controller = await require(path.join(__dirname, '..', '..', 'database/controller/index.js'))(api);
  const {
    threadModel,
    userModel,
    dashBoardModel,
    globalModel,
    threadsData,
    usersData,
    dashBoardData,
    globalData,
    sequelize
  } = controller;

  log.info('DATABASE', getText('loadData', 'loadThreadDataSuccess', global.db.allThreadData.filter(t => t.threadID?.toString().length > 15).length));
  log.info('DATABASE', getText('loadData', 'loadUserDataSuccess', global.db.allUserData.length));

  if (api && global.GoatBot?.config?.database?.autoSyncWhenStart === true) {
    console.log(chalk.hex("#f5ab00")(createLine("AUTO SYNC")));

    let spin;
    try {
      spin = createOraDots?.(getText('loadData', 'refreshingThreadData'));
    } catch {
      spin = {
        _start: () => console.log('Refreshing thread data...'),
        _stop: () => console.log('Refresh complete.')
      };
    }

    try {
      api.setOptions({ logLevel: 'silent' });
      spin._start();

      const threadDataWillSet = [];
      const allThreadData = [...global.db.allThreadData];
      const allThreadInfo = await api.getThreadList(9999999, null, 'INBOX');

      for (const threadInfo of allThreadInfo) {
        if (threadInfo.isGroup && !allThreadData.some(t => t.threadID === threadInfo.threadID)) {
          const created = await threadsData.create(threadInfo.threadID, threadInfo);
          threadDataWillSet.push(created);
        } else {
          const refreshed = await threadsData.refreshInfo(threadInfo.threadID, threadInfo);
          const index = allThreadData.findIndex(t => t.threadID === threadInfo.threadID);
          if (index !== -1) allThreadData.splice(index, 1);
          threadDataWillSet.push(refreshed);
        }
        global.db.receivedTheFirstMessage[threadInfo.threadID] = true;
      }

      const botID = api.getCurrentUserID();
      const threadWithoutBot = allThreadData.filter(t => !allThreadInfo.some(t1 => t1.threadID === t.threadID));

      for (const thread of threadWithoutBot) {
        const findMe = thread.members?.find(m => m.userID == botID);
        if (findMe) {
          findMe.inGroup = false;
          await threadsData.set(thread.threadID, { members: thread.members });
        }
      }

      global.db.allThreadData = [...threadDataWillSet, ...threadWithoutBot];

      spin._stop();
      log.info('DATABASE', getText('loadData', 'refreshThreadDataSuccess', global.db.allThreadData.length));
    } catch (err) {
      spin._stop?.();
      log.error('DATABASE', getText('loadData', 'refreshThreadDataError'), err.message || err);
    } finally {
      api.setOptions({
        logLevel: global.GoatBot?.config?.optionsFca?.logLevel || 'info'
      });
    }
  }

  return {
    threadModel: threadModel || null,
    userModel: userModel || null,
    dashBoardModel: dashBoardModel || null,
    globalModel: globalModel || null,
    threadsData,
    usersData,
    dashBoardData,
    globalData,
    sequelize
  };
};
