const fs = require("node:fs");
const path = require("node:path");

// Chrome extension assets cannot live in a directory starting with "_".
fs.renameSync("out/_next", "out/assets");
for (const file of fs.readdirSync("out")) {
    if (file.endsWith(".html")) {
        const filename = path.join("out", file);
        fs.writeFileSync(filename, fs.readFileSync(filename, "utf8").replaceAll("/_next", "/assets"));
    }
}
