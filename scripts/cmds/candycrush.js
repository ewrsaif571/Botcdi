const fs = require('fs').promises;
const path = require('path');

const ccDataFilePath = path.join(__dirname, 'cc.json');

module.exports = {
    config: {
        name: "candycrush",
        aliases: ["cc"],
        version: "1.0",
        author: "Kshitiz",
        shortDescription: {
            en: "Play the Candy Crush game!"
        },
        longDescription: {
            en: "condo crush game😂"
        },
        category: "game",
        guide: {
            en: "{p}cc / Reply with the positions of candies to swap them and make matches."
        }
    },

    onStart: async function ({ event, message, api, args, usersData }) {
        if (args[0] === "top") {
            const topPlayers = await getTopPlayers(api);
            const leaderboard = topPlayers.map((player, index) => `${index + 1}. ${player.username}: ${player.coins} coins`).join("\n");
            return message.reply(`Top 5 pro players:\n${leaderboard}`);
        }

        const candies = ["🍫", "🍬", "🍪", "🍩", "🍉", "🍭", "🍒", "🍓"];
        const board = generateBoard(candies);

        global.game = {
            board: board,
            currentMessageID: null,
            initiator: event.senderID,
            lastMatchMade: false,
            userCoins: await getUserCoins(event.senderID),
            lastActivityTime: Date.now()
        };

        const gameBoard = displayBoardWithCoordinates(board);
        const sentMessage = await message.reply(gameBoard);
        global.game.currentMessageID = sentMessage.messageID;
        startInactivityTimer(api);
    },

    onChat: async function ({ event, message, api, usersData }) {
        if (!global.game || global.game.initiator !== event.senderID) return;

        global.game.lastActivityTime = Date.now();

        const input = event.body.trim().toUpperCase().split(" ");
        if (input[0] === "TOP") {
            const topPlayers = await getTopPlayers(api);
            const leaderboard = topPlayers.map((player, index) => `${index + 1}. ${player.username}: ${player.coins} coins`).join("\n");
            return message.reply(`Top 5 pro players:\n${leaderboard}`);
        }

        if (input.length !== 2 || !isValidInput(input[0]) || !isValidInput(input[1])) {
            return;
        }

        const [row1, col1] = getPosition(input[0]);
        const [row2, col2] = getPosition(input[1]);

        if (!isValidSwap(row1, col1, row2, col2)) {
            return;
        }

        swapCandies(row1, col1, row2, col2);

        const matches = findMatches();
        if (matches.length > 0) {
            global.game.lastMatchMade = true;
            removeMatches(matches);
            fillEmptySpaces();
            const userID = event.senderID;
            global.game.userCoins += matches.length * 100;
            await addCoins(userID, matches.length * 100);
        } else {
            if (global.game.lastMatchMade) {
                global.game.lastMatchMade = false;
                return;
            }
            swapCandies(row1, col1, row2, col2);
            return;
        }

        fillEmptySpaces();
        const gameBoard = displayBoardWithCoordinates(global.game.board);
        const sentMessage = await message.reply(gameBoard);
        if (global.game.currentMessageID) {
            api.unsendMessage(global.game.currentMessageID);
        }
        global.game.currentMessageID = sentMessage.messageID;
        startInactivityTimer(api);
    }
};

function generateBoard(candies) {
    const board = [];
    const rows = 5;
    const cols = 5;
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            const randomIndex = Math.floor(Math.random() * candies.length);
            row.push(candies[randomIndex]);
        }
        board.push(row);
    }
    return board;
}

function displayBoardWithCoordinates(board) {
    const rowLabels = ['a', 'b', 'c', 'd', 'e'];
    let display = "";
    for (let i = 0; i < board.length; i++) {
        if (i !== 0) {
            display += ' '.repeat(rowLabels[i].length + 1) + '─'.repeat(board[i].length * 3 + 1) + '\n';
        }
        display += `${rowLabels[i]}1.`;
        for (let j = 0; j < board[i].length; j++) {
            display += `│${board[i][j]} `;
        }
        display += '\n';
    }
    return display;
}

function isValidInput(input) {
    return input.length === 2 && input[0] >= "A" && input[0] <= "E" && input[1] >= "1" && input[1] <= "5";
}

function getPosition(input) {
    const row = input.charCodeAt(0) - 65;
    const col = parseInt(input[1]) - 1;
    return [row, col];
}

function isValidSwap(row1, col1, row2, col2) {
    return (
        (Math.abs(row1 - row2) === 1 && col1 === col2) ||
        (Math.abs(col1 - col2) === 1 && row1 === row2)
    );
}

function swapCandies(row1, col1, row2, col2) {
    const temp = global.game.board[row1][col1];
    global.game.board[row1][col1] = global.game.board[row2][col2];
    global.game.board[row2][col2] = temp;
}

function findMatches() {
    const matches = [];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (checkHorizontalMatch(i, j)) {
                matches.push({ row: i, col: j, direction: "horizontal" });
            }
            if (checkVerticalMatch(i, j)) {
                matches.push({ row: i, col: j, direction: "vertical" });
            }
        }
    }
    return matches;
}

function checkHorizontalMatch(row, col) {
    const candy = global.game.board[row][col];
    if (col > 2) return false;
    return global.game.board[row][col + 1] === candy &&
        global.game.board[row][col + 2] === candy;
}

function checkVerticalMatch(row, col) {
    const candy = global.game.board[row][col];
    if (row > 2) return false;
    return global.game.board[row + 1][col] === candy &&
        global.game.board[row + 2][col] === candy;
}

function removeMatches(matches) {
    for (const match of matches) {
        if (match.direction === "horizontal") {
            global.game.board[match.row][match.col] = " ";
            global.game.board[match.row][match.col + 1] = " ";
            global.game.board[match.row][match.col + 2] = " ";
        } else if (match.direction === "vertical") {
            global.game.board[match.row][match.col] = " ";
            global.game.board[match.row + 1][match.col] = " ";
            global.game.board[match.row + 2][match.col] = " ";
        }
    }
}

function fillEmptySpaces() {
    for (let col = 0; col < 5; col++) {
        for (let row = 4; row >= 0; row--) {
            if (global.game.board[row][col] === " ") {
                let rowIndex = row;
                while (rowIndex > 0 && global.game.board[rowIndex][col] === " ") {
                    rowIndex--;
                }
                global.game.board[row][col] = global.game.board[rowIndex][col];
                global.game.board[rowIndex][col] = getRandomCandy();
            }
        }
    }
}

function getRandomCandy() {
    const candies = ["🍫", "🍬", "🍪", "🍩", "🍉", "🍭", "🍒", "🍓"];
    const randomIndex = Math.floor(Math.random() * candies.length);
    return candies[randomIndex];
}

async function addCoins(userID, coins) {
    let ccData = await getCCData();
    if (!ccData[userID]) {
        ccData[userID] = { coins: 0 };
    }
    ccData[userID].coins += coins;
    await saveCCData(ccData);
}

async function getUserCoins(userID) {
    let ccData = await getCCData();
    if (!ccData[userID]) {
        ccData[userID] = { coins: 0 };
        await saveCCData(ccData);
    }
    return ccData[userID].coins;
}

async function getTopPlayers(api) {
    const ccData = await getCCData();
    const userIDs = Object.keys(ccData);

    const topPlayers = [];

    for (const userID of userIDs) {
        const userInfo = await getUserInfo(api, userID);
        if (userInfo && userInfo.name) {
            const coins = ccData[userID].coins || 0;
            topPlayers.push({ username: userInfo.name, coins });
        }
    }

    return topPlayers.sort((a, b) => b.coins - a.coins).slice(0, 5);
}

async function getUserInfo(api, userID) {
    return new Promise((resolve, reject) => {
        api.getUserInfo(userID, (err, userInfo) => {
            if (err) {
                console.error("Failed to retrieve user information:", err);
                reject(err);
            } else {
                resolve(userInfo[userID]);
            }
        });
    });
}

async function getCCData() {
    try {
        const data = await fs.readFile(ccDataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(ccDataFilePath, '{}');
            return {};
        } else {
            console.error("Error reading CC data:", error);
            return {};
        }
    }
}

async function saveCCData(ccData) {
    try {
        await fs.writeFile(ccDataFilePath, JSON.stringify(ccData, null, 2), 'utf8');
    } catch (error) {
        console.error("Error saving CC data:", error);
    }
}

function startInactivityTimer(api) {
    setTimeout(async () => {
        const elapsedTime = Date.now() - global.game.lastActivityTime;
        if (elapsedTime >= 20000 && global.game.currentMessageID) {
            await api.unsendMessage(global.game.currentMessageID);
            delete global.game;
        }
    }, 20000);
          }
