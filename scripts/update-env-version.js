const fs = require("fs");
const path = require("path");

const version = process.argv[2];
const envExamplePath = path.join(__dirname, "..", ".env.example");

if (!version) {
  console.error("Usage: node scripts/update-env-version.js <version>");
  process.exit(1);
}

let content = "";
if (fs.existsSync(envExamplePath)) {
  content = fs.readFileSync(envExamplePath, "utf8");
}

const newLine = `APP_VERSION=${version}`;
const appVersionRegex = /^APP_VERSION=.*$/m;

if (appVersionRegex.test(content)) {
  content = content.replace(appVersionRegex, newLine);
  if (!content.endsWith("\n")) content += "\n";
} else {
  content = content.trimEnd() + (content ? "\n" : "") + newLine + "\n";
}

fs.writeFileSync(envExamplePath, content);
console.log(`Updated .env.example: APP_VERSION=${version}`);
