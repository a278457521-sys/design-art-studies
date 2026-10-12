import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const output = new URL("./dist/", import.meta.url);
await mkdir(output, { recursive: true });
await build({
  entryPoints: [fileURLToPath(new URL("./src/main.jsx", import.meta.url))],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["chrome110", "edge110", "safari16"],
  outfile: fileURLToPath(new URL("./dist/app.js", import.meta.url)),
});
const html = await readFile(new URL("./src/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("./src/style.css", import.meta.url), "utf8");
const navigationCss = await readFile(new URL("./src/navigation.css", import.meta.url), "utf8");
const js = await readFile(new URL("./dist/app.js", import.meta.url), "utf8");
const standalone = html
  .replace('<link rel="stylesheet" href="./style.css" />', () => `<style>${css}\n${navigationCss}</style>`)
  .replace('<script src="./app.js"></script>', () => `<script>${js.replaceAll("</script", "<\\/script")}</script>`);
await writeFile(new URL("./dist/index.html", import.meta.url), standalone, "utf8");
await writeFile(new URL("./dist/设计艺术学研究方法-交互导图.html", import.meta.url), standalone, "utf8");
console.log(`Built offline site: ${fileURLToPath(new URL("./dist/设计艺术学研究方法-交互导图.html", import.meta.url))}`);
