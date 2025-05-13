const { spawn } = require("child_process");
const log = require("./logger/log.js");
const express = require("express"); // Express.js ইমপোর্ট করা হয়েছে

const app = express(); // Express অ্যাপ তৈরি করা হয়েছে

function startProject() {
        const child = spawn("node", ["Goat.js"], {
                cwd: __dirname,
                stdio: "inherit",
                shell: true
        });

        child.on("close", (code) => {
                if (code == 2) {
                        log.info("Restarting Project...");
                        startProject();
                }
        });
}

startProject();

app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`);
});
