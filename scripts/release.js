const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const version = process.argv[2];
if (!version) {
  console.error("Usage: node scripts/release.js <version>");
  process.exit(1);
}

const semver = version.replace(/^v/, "");
const tag = `v${semver}`;

// Bump tauri.conf.json
const tauriConfPath = path.join(__dirname, "../src-tauri/tauri.conf.json");
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, "utf8"));
tauriConf.version = semver;
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n");
console.log(`Updated tauri.conf.json to ${semver}`);

// Bump Cargo.toml
const cargoPath = path.join(__dirname, "../src-tauri/Cargo.toml");
const cargo = fs.readFileSync(cargoPath, "utf8");
fs.writeFileSync(cargoPath, cargo.replace(/^version = ".*"/m, `version = "${semver}"`));
console.log(`Updated Cargo.toml to ${semver}`);

console.log(`\nCommitting version bump...`);
execSync(`git add src-tauri/tauri.conf.json src-tauri/Cargo.toml`, { stdio: "inherit" });
execSync(`git commit -m "chore: bump version to ${semver}"`, { stdio: "inherit" });

console.log(`\nTagging ${tag}...`);
execSync(`git tag -s ${tag} -m "Release ${tag}"`, { stdio: "inherit" });

console.log(`Pushing...`);
execSync(`git push origin main ${tag}`, { stdio: "inherit" });

console.log(`\nDone! GitHub Actions is now building the release.`);
console.log(`https://github.com/gitbannedme/freecode/actions`);
