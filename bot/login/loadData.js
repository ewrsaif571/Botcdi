const chalk = require('chalk');
const path = require('path');
const { log, createOraDots, getText } = global.utils;

module.exports = async function (api, createLine) {
	// ———————————————————— LOAD DATA ———————————————————— //
	console.log(chalk.hex("#f5ab00")(createLine("DATABASE")));

	const controller = await require(path.join(__dirname, '..', '..', 'database/controller/index.js'))(api);
	const {
		threadModel, userModel, dashBoardModel,
		globalModel, threadsData, usersData,
		dashBoardData, globalData, sequelize
	} = controller;

	// Fixing .toString() on possible undefined threadID
	const validThreads = global.db.allThreadData.filter(
		t => t.threadID && t.threadID.toString().length > 15
	);
	log.info('DATABASE', getText('loadData', 'loadThreadDataSuccess', validThreads.length));
	log.info('DATABASE', getText('loadData', 'loadUserDataSuccess', global.db.allUserData.length));

	// ———————————————————— AUTO SYNC ———————————————————— //
	if (api && global.GoatBot.config.database.autoSyncWhenStart === true) {
		console.log(chalk.hex("#f5ab00")(createLine("AUTO SYNC")));
		const spin = createOraDots(getText('loadData', 'refreshingThreadData'));

		try {
			api.setOptions({ logLevel: 'silent' });
			spin._start();

			const threadDataWillSet = [];
			const allThreadData = [...global.db.allThreadData];
			const allThreadInfo = await api.getThreadList(9999999, null, 'INBOX');

			for (const threadInfo of allThreadInfo) {
				if (threadInfo.isGroup && !allThreadData.some(thread => thread.threadID === threadInfo.threadID)) {
					const newThread = await threadsData.create(threadInfo.threadID, threadInfo);
					threadDataWillSet.push(newThread);
				} else {
					const refreshed = await threadsData.refreshInfo(threadInfo.threadID, threadInfo);
					const index = allThreadData.findIndex(thread => thread.threadID === threadInfo.threadID);
					if (index !== -1) allThreadData.splice(index, 1);
					threadDataWillSet.push(refreshed);
				}
				global.db.receivedTheFirstMessage[threadInfo.threadID] = true;
			}

			const allThreadDataDontHaveBot = allThreadData.filter(
				thread => !allThreadInfo.some(info => thread.threadID === info.threadID)
			);

			const botID = api.getCurrentUserID();
			for (const thread of allThreadDataDontHaveBot) {
				const findMe = thread.members?.find(m => m.userID == botID);
				if (findMe) {
					findMe.inGroup = false;
					await threadsData.set(thread.threadID, { members: thread.members });
				}
			}

			global.db.allThreadData = [
				...threadDataWillSet,
				...allThreadDataDontHaveBot
			];

			spin._stop();
			log.info('DATABASE', getText('loadData', 'refreshThreadDataSuccess', global.db.allThreadData.length));
		} catch (err) {
			spin._stop();
			log.error('DATABASE', getText('loadData', 'refreshThreadDataError'), err);
		} finally {
			api.setOptions({ logLevel: global.GoatBot.config.optionsFca.logLevel });
		}
	}

	// ———————————————————— RETURN MODELS ———————————————————— //
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
