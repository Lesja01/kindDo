var version = process.versions.node.split(".").map(Number);
var major = version[0];

if (major < 20) {
  console.error("");
  console.error("Dream app requires Node.js 20 or newer.");
  console.error("Current Node.js version: " + process.versions.node);
  console.error("");
  console.error("Install/use a modern Node first, then install packages with pnpm:");
  console.error("  nvm install 22");
  console.error("  nvm use 22");
  console.error("  corepack enable");
  console.error("  pnpm install");
  console.error("");
  process.exit(1);
}
