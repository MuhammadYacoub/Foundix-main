// Renders film.html frame-by-frame with a local Chrome and pipes the frames into ffmpeg.
// Usage: node render.mjs                 -> foundix-film.mp4 (1920x1080, 30fps)
//        node render.mjs --vertical      -> foundix-film-vertical.mp4 from vertical.html (1080x1920)
//        node render.mjs --stills 1,5.5   -> stills/still-<t>.png for quick review (add --vertical for the 9:16 cut)
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
// Playwright is only in the monorepo's pnpm store; override with PLAYWRIGHT_PATH if it moves.
const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.PLAYWRIGHT_PATH ?? path.resolve(here, "../../node_modules/.pnpm/playwright@1.64.1/node_modules/playwright"),
);

const FPS = 30;
const args = process.argv.slice(2);
const vertical = args.includes("--vertical");
const [W, H] = vertical ? [1080, 1920] : [1920, 1080];
const stillsArg = args.includes("--stills") ? args[args.indexOf("--stills") + 1] : null;

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(here, vertical ? "vertical.html" : "film.html")).href + "?capture=1", { waitUntil: "load" });
await page.evaluate(() => window.reelReady);
const duration = await page.evaluate(() => window.REEL_DURATION);
const shot = (t) =>
  page.evaluate((t) => window.seek(t), t).then(() =>
    page.screenshot({ type: "png", clip: { x: 0, y: 0, width: W, height: H } }),
  );

if (stillsArg) {
  const dir = path.join(here, "stills");
  mkdirSync(dir, { recursive: true });
  for (const t of stillsArg.split(",").map(Number)) {
    await page.evaluate((t) => window.seek(t), t);
    await page.screenshot({ path: path.join(dir, `still-${t}.png`) });
  }
  await browser.close();
  process.exit(0);
}

const out = path.join(here, vertical ? "foundix-film-vertical.mp4" : "foundix-film.mp4");
const music = path.join(here, "music.wav");
const ff = spawn(
  "ffmpeg",
  ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
   // score from music.mjs (re-run it after changing the timeline)
   ...(existsSync(music) ? ["-i", music, "-c:a", "aac", "-b:a", "192k", "-shortest"] : []),
   "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out],
  { stdio: ["pipe", "ignore", "inherit"] },
);
const total = Math.round(duration * FPS);
for (let i = 0; i < total; i++) {
  const buf = await shot(i / FPS);
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (i % 60 === 0) console.log(`frame ${i}/${total}`);
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await browser.close();
console.log("wrote", out);
