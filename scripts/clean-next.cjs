const fs = require("fs");
const path = require("path");

const nextDir = path.join(process.cwd(), ".next");

if (!fs.existsSync(nextDir)) {
  console.log(".next cache does not exist.");
  process.exit(0);
}

let lastError;
for (let attempt = 1; attempt <= 5; attempt += 1) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 250 });
    console.log("Removed .next cache.");
    process.exit(0);
  } catch (error) {
    lastError = error;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, attempt * 250);
  }
}

throw lastError;
