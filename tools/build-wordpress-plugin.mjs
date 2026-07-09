import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceHtml = readFileSync(join(root, "index.html"), "utf8");
const pluginDir = join(root, "wordpress", "mutesound-landing");
const fontImport = '@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@1.3.9/dist/web/static/pretendard.min.css");';
const favicon = "<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='4' fill='%23131b2e'/%3E%3Crect x='5' y='8' width='14' height='11' fill='none' stroke='%23bec6e0' stroke-width='2'/%3E%3Crect x='13' y='14' width='14' height='11' fill='none' stroke='%23bec6e0' stroke-width='2'/%3E%3Ccircle cx='20' cy='19.5' r='3.5' fill='none' stroke='%23bec6e0' stroke-width='1.5'/%3E%3C/svg%3E\">";

function extract(pattern, label) {
  const match = sourceHtml.match(pattern);
  if (!match) throw new Error(`Could not extract ${label} from index.html`);
  return match[1].trim();
}

function scopeCss(css) {
  return css
    .replace("* { box-sizing: border-box; }", "#mutesound-landing, #mutesound-landing * { box-sizing: border-box; }")
    .replace("body { margin: 0; }\n", "")
    .replace("::selection", "#mutesound-landing ::selection")
    .replace("a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible", "#mutesound-landing a:focus-visible, #mutesound-landing button:focus-visible, #mutesound-landing input:focus-visible, #mutesound-landing select:focus-visible, #mutesound-landing textarea:focus-visible")
    .replace("input:focus, select:focus, textarea:focus", "#mutesound-landing input:focus, #mutesound-landing select:focus, #mutesound-landing textarea:focus")
    .replace(/^  a \{/m, "  #mutesound-landing a {")
    .replace(/^  button \{/m, "  #mutesound-landing button {")
    .replace("html, body { -webkit-tap-highlight-color: transparent; }", "#mutesound-landing { -webkit-tap-highlight-color: transparent; }")
    .replace(/^  img \{/m, "  #mutesound-landing img {")
    .replace(/\[data-r=/g, "#mutesound-landing [data-r=")
    .replace(/\.svc-card/g, "#mutesound-landing .svc-card")
    .replace(/\.case-viewport/g, "#mutesound-landing .case-viewport")
    .replace(/\.nav-toggle/g, "#mutesound-landing .nav-toggle")
    .replace(/\.mobile-menu/g, "#mutesound-landing .mobile-menu")
    .replace(/\.nav-cta-top/g, "#mutesound-landing .nav-cta-top")
    .replace("*, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: 0.001ms !important; }", "#mutesound-landing *, #mutesound-landing *::before, #mutesound-landing *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: 0.001ms !important; }");
}

const style = scopeCss(extract(/<style>([\s\S]*?)<\/style>/, "style"));
const script = extract(/<script>([\s\S]*?)<\/script>\s*<\/body>/, "script");
let body = extract(/<body>([\s\S]*?)<script>/, "body");

body = body.replace(
  '<div style="background:#f7f9fb;',
  '<div id="mutesound-landing" style="background:#f7f9fb;'
);

rmSync(join(pluginDir, "assets"), { recursive: true, force: true });
rmSync(join(pluginDir, "uploads"), { recursive: true, force: true });
rmSync(join(pluginDir, "templates"), { recursive: true, force: true });

mkdirSync(join(pluginDir, "assets"), { recursive: true });
mkdirSync(join(pluginDir, "templates"), { recursive: true });

cpSync(join(root, "assets"), join(pluginDir, "assets"), { recursive: true });
cpSync(join(root, "uploads"), join(pluginDir, "uploads"), { recursive: true });

writeFileSync(join(pluginDir, "assets", "mutesound.css"), `${fontImport}\n${style}\n`, "utf8");
writeFileSync(join(pluginDir, "assets", "mutesound.js"), `${script}\n`, "utf8");
writeFileSync(join(pluginDir, "templates", "landing.html"), `${body}\n`, "utf8");

const previewBody = body
  .replaceAll('src="assets/', 'src="mutesound-landing/assets/')
  .replaceAll('src="uploads/', 'src="mutesound-landing/uploads/')
  .replaceAll('href="assets/', 'href="mutesound-landing/assets/');
const previewHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MUTESOUND WordPress Shortcode Preview</title>
${favicon}
<link rel="stylesheet" href="mutesound-landing/assets/mutesound.css">
</head>
<body>
${previewBody}
<script>window.MUTESOUND_ASSET_BASE = "mutesound-landing/";</script>
<script src="mutesound-landing/assets/mutesound.js" defer></script>
</body>
</html>
`;
writeFileSync(join(root, "wordpress", "shortcode-preview.html"), previewHtml, "utf8");

console.log(`Built WordPress plugin files in ${pluginDir}`);
