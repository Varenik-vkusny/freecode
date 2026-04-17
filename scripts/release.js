const { execSync } = require("child_process");

const version = process.argv[2];
if (!version) {
  console.error("Usage: npm run release -- v1.0.0");
  process.exit(1);
}

const tag = version.startsWith("v") ? version : `v${version}`;

console.log(`\nTagging ${tag}...`);
execSync(`git tag -s ${tag} -m "Release ${tag}"`, { stdio: "inherit" });

console.log(`Pushing ${tag} to origin...`);
execSync(`git push origin ${tag}`, { stdio: "inherit" });

console.log(`\nDone! GitHub Actions is now building the release.`);
console.log(`https://github.com/gitbannedme/freecode/actions`);
