module.exports = {
    config: {
        name: "memorygame",
        aliases: ["mg"],
        version: "1.1",
        author: "Kshitiz",
        shortDescription: {
            en: "Play the memory game!"
        },
        longDescription: {
            en: "A memory game where you match pairs of emojis."
        },
        category: "game",
        guide: {
            en: "Reply with the positions of emojis to reveal them (e.g., A1 B2)."
        }
    },

    onStart: async function ({ event, message }) {
        const pairs = ["😉", "😊", "😀", "😃", "😎", "🥳", "😇", "😈"];
        const emojis = pairs.concat(pairs);
        shuffleArray(emojis);

        global.game = {
            board: [
                ["🟦", "🟦", "🟦", "🟦"],
                ["🟦", "🟦", "🟦", "🟦"],
                ["🟦", "🟦", "🟦", "🟦"],
                ["🟦", "🟦", "🟦", "🟦"]
            ],
            emojis: emojis,
            revealed: [
                ["🟦", "🟦", "🟦", "🟦"],
                ["🟦", "🟦", "🟦", "🟦"],
                ["🟦", "🟦", "🟦", "🟦"],
                ["🟦", "🟦", "🟦", "🟦"]
            ],
            matches: 0,
            selected: [],
            currentMessageID: null, 
            initiator: event.senderID 
        };

        const gameBoard = generateBoard();
        const sentMessage = await message.reply(gameBoard);
        global.game.currentMessageID = sentMessage.messageID; 
    },

    onChat: async function ({ event, message }) {
        if (!global.game || global.game.initiator !== event.senderID) return;

        const input = event.body.trim().toUpperCase().split(" ");
        if (input.length !== 2 || !isValidInput(input[0]) || !isValidInput(input[1])) {
            return;
        }

        const [row1, col1] = getPosition(input[0]);
        const [row2, col2] = getPosition(input[1]);

        if (global.game.revealed[row1][col1] !== "🟦" || global.game.revealed[row2][col2] !== "🟦") {
            return;
        }

        revealEmoji(row1, col1);
        revealEmoji(row2, col2);

        const [emoji1, emoji2] = [global.game.emojis[row1 * 4 + col1], global.game.emojis[row2 * 4 + col2]];

        if (emoji1 === emoji2) {
            global.game.matches++;
        } else {
            setTimeout(async () => {
                hideEmoji(row1, col1);
                hideEmoji(row2, col2);
                const gameBoard = generateBoard();
                const sentMessage = await message.reply(gameBoard);
                try {
                    message.unsend(global.game.currentMessageID);
                } catch (error) {
                    console.error("Error while unsending message:", error);
                }
            }, 5000);
        }

        const gameBoard = generateBoard();
        const sentMessage = await message.reply(gameBoard);
        global.game.currentMessageID = sentMessage.messageID; 

        if (global.game.matches === 8) {
            message.reply("Congratulations! You have matched all the emojis!");
            delete global.game;
        }
    }
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function isValidInput(input) {
    return input.length === 2 && input[0] >= "A" && input[0] <= "D" && input[1] >= "1" && input[1] <= "4";
}

function getPosition(input) {
    const row = input.charCodeAt(0) - 65;
    const col = parseInt(input[1]) - 1; 
    return [row, col];
}

function revealEmoji(row, col) {
    global.game.revealed[row][col] = global.game.emojis[row * 4 + col];
}

function hideEmoji(row, col) {
    global.game.revealed[row][col] = "🟦";
}

function generateBoard() {
    let board = "Memory Game:\n";
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            board += `${global.game.revealed[i][j]} `;
        }
        board += "\n";
    }
    return board.trim();
                 }
