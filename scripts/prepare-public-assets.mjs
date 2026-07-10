import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = join(root, "public");
const legacyRoot = join(publicRoot, "legacy-platform");
const siteAssetsRoot = join(publicRoot, "site-assets");

for (const target of [legacyRoot, siteAssetsRoot]) {
  const resolvedTarget = resolve(target);
  if (!resolvedTarget.startsWith(`${root}\\`)) {
    throw new Error(`Refusing to prepare assets outside workspace: ${target}`);
  }
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
}

function copy(source, target) {
  const output = join(legacyRoot, target);
  mkdirSync(dirname(output), { recursive: true });
  cpSync(join(root, source), output, { recursive: true });
}

function transformText(source, target, replacements) {
  let contents = readFileSync(join(root, source), "utf8");
  for (const [from, to] of replacements) contents = contents.replaceAll(from, to);
  const output = join(legacyRoot, target);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, contents, "utf8");
}

const sharedAssetReplacements = [["/assets/", "/legacy-platform/assets/"]];

transformText("index.html", "index.html", [
  ...sharedAssetReplacements,
  ['<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <meta name="robots" content="noindex, nofollow, noarchive">'],
  ['href="styles.css', 'href="/legacy-platform/styles.css'],
  ['src="authProvider.js', 'src="/legacy-platform/authProvider.js'],
  ['src="supabaseApi.js', 'src="/legacy-platform/supabaseApi.js'],
  ['src="app.js', 'src="/legacy-platform/app.js'],
]);
transformText("login.html", "login.html", [
  ...sharedAssetReplacements,
  ['<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <meta name="robots" content="noindex, nofollow, noarchive">'],
  ['href="auth.css', 'href="/legacy-platform/auth.css'],
  ['src="authProvider.js', 'src="/legacy-platform/authProvider.js'],
  ['src="auth.js', 'src="/legacy-platform/auth.js'],
  ["/login.html?", "/login?"],
]);
transformText("app.js", "app.js", [
  ['"/platform"', '"/plattform"'],
  ["`/login.html?", "`/login?"],
  ['fetch("utbildning.md', 'fetch("/legacy-platform/utbildning.md'],
]);
transformText("auth.js", "auth.js", [
  ['"/platform"', '"/plattform"'],
  ["`/login.html?", "`/login?"],
]);
transformText("styles.css", "styles.css", sharedAssetReplacements);
transformText("auth.css", "auth.css", sharedAssetReplacements);

for (const file of [
  "authProvider.js",
  "clerkAuth.js",
  "supabaseApi.js",
  "utbildning.md",
  "vu1quiz.json",
  "vu2quiz.json",
]) {
  copy(file, file);
}
copy("assets", "assets");

const siteCopies = [
  ["assets/logo/vaktskolan-icon.svg", "logo/vaktskolan-icon.svg"],
  ["assets/logo/vaktskolan-wordmark.svg", "logo/vaktskolan-wordmark.svg"],
  ["assets/logo/vaktskolan-wordmark-white.svg", "logo/vaktskolan-wordmark-white.svg"],
  ["assets/logo/vaktskolan-favicon-transparent.png", "logo/favicon.png"],
  ["assets/logo/vaktskolan-icon-512.png", "logo/icon-512.png"],
];

for (const [source, target] of siteCopies) {
  const output = join(siteAssetsRoot, target);
  mkdirSync(dirname(output), { recursive: true });
  cpSync(join(root, source), output);
}

const heroTargets = [
  { source: "landing/assets/guard-figure.png", name: "guard-desktop", width: 620 },
  { source: "landing/assets/vaktare.png", name: "guard-mobile", width: 420 },
];

mkdirSync(join(siteAssetsRoot, "hero"), { recursive: true });
for (const asset of heroTargets) {
  const pipeline = sharp(join(root, asset.source)).resize({ width: asset.width, withoutEnlargement: true });
  await pipeline.clone().avif({ quality: 58, effort: 6 }).toFile(join(siteAssetsRoot, "hero", `${asset.name}.avif`));
  await pipeline.clone().webp({ quality: 76, effort: 6 }).toFile(join(siteAssetsRoot, "hero", `${asset.name}.webp`));
}

console.log("Prepared optimized public and legacy platform assets.");
