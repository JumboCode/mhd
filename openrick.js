const { exec } = require("child_process");
const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

// macOS
exec(`open "${url}"`);
