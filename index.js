/**
 * Goat Bot Render Deployment Fix by Eren
 */

const express = require("express");
const { spawn } = require("child_process");
const log = require("./logger/log.js");

// === Express server to keep Render service alive ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
        res.send("Goat Bot is alive and running on Render!");
});

app.listen(PORT, () => {
        console.log(`✅ Server running at http://localhost:${PORT}`);
});

// === Start the Goat bot process ===
function startProject() {
        const child = spawn("node", ["Goat.js"], {
                cwd: __dirname,
                stdio: "inherit",
                shell: true
        });

        child.on("close", (code) => {
                if (code === 2) {
                        log.info("Restarting Project...");
                        startProject();
                }
        });
}

startProject();