// Pune conținutul paginii direct în dist/index.html (după „vite build”).
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const radacina = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fisierHtml = resolve(radacina, "dist/index.html");
const { deseneaza } = await import(pathToFileURL(resolve(radacina, "dist-server/pregenerare-server.js")).href);

const html = readFileSync(fisierHtml, "utf8");
if (!html.includes("<!--continut-->")) {
  throw new Error("Lipsește semnul <!--continut--> din index.html");
}
writeFileSync(fisierHtml, html.replace("<!--continut-->", deseneaza()));
rmSync(resolve(radacina, "dist-server"), { recursive: true, force: true });
console.log("✓ Pagina a fost pregenerată în dist/index.html");
