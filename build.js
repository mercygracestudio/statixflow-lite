/**
 * Produces production-ready HTML files with:
 * - All root HTML files copied to dist (comments retained)
 * - Named CSS output (style.css + style.min.css) at assets/css/
 * - Named JS output (main.js + main.min.js) at assets/js/ (IIFE, not module)
 * - Images at assets/imgs/
 * - Relative paths for file:// and server compatibility
 */

import { build as viteBuild } from "vite";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const TEMP_ENTRY = path.join(__dirname, "_build-entry.js");

// ─── Collect all HTML files from project root ───
const allFiles = await fs.readdir(__dirname);
const htmlFiles = allFiles.filter(
  (f) => f.endsWith(".html") && !f.startsWith("_"),
);

console.log(`\n📋 Found ${htmlFiles.length} HTML files to process:`);
htmlFiles.forEach((f) => console.log(`   • ${f}`));

// ─── Step 1: Clean dist ───
console.log("\n🗑️  Cleaning dist/...");
await fs.rm(DIST, { recursive: true, force: true });
await fs.mkdir(DIST, { recursive: true });

// ─── Step 2: Create temp build entry ───
// This imports both the CSS and JS so Vite bundles them together.
// The @tailwindcss/vite plugin still scans all project files for classes.
await fs.writeFile(
  TEMP_ENTRY,
  [
    "import './assets/css/style.css';",
    "import './assets/js/main.js';",
    "",
  ].join("\n"),
);

// ─── Shared Vite build config ───
function createBuildConfig(minify) {
  const suffix = minify ? ".min" : "";
  return {
    configFile: path.join(__dirname, "vite.config.ts"),
    logLevel: "info",
    build: {
      outDir: DIST,
      emptyOutDir: false,
      copyPublicDir: false, // We copy images manually to assets/imgs/
      cssCodeSplit: false, // Extract all CSS into a single file
      rollupOptions: {
        input: TEMP_ENTRY,
        output: {
          format: "iife",
          entryFileNames: `assets/js/main${suffix}.js`,
          assetFileNames: (assetInfo) => {
            // Route CSS to assets/css/
            if (assetInfo.name && assetInfo.name.endsWith(".css")) {
              return `assets/css/style${suffix}.css`;
            }
            // Other assets (shouldn't really occur with this setup)
            return "assets/[name][extname]";
          },
          inlineDynamicImports: true,
        },
      },
      minify: minify ? "esbuild" : false,
      cssMinify: !!minify,
    },
  };
}

// ─── Step 3: Build minified assets ───
console.log("\n🔨 Building minified assets...");
try {
  await viteBuild(createBuildConfig(true));
  console.log("   ✅ Minified build complete");
} catch (err) {
  console.error("   ❌ Minified build failed:", err.message);
  await cleanup();
  process.exit(1);
}

// ─── Step 4: Build unminified assets ───
console.log("\n🔨 Building unminified assets...");
try {
  await viteBuild(createBuildConfig(false));
  console.log("   ✅ Unminified build complete");
} catch (err) {
  console.error("   ❌ Unminified build failed:", err.message);
  await cleanup();
  process.exit(1);
}

// ─── Step 5: Clean up temp entry ───
await cleanup();

// ─── Step 5b: Post-process CSS files to fix image paths ───
// Tailwind compiles bg-[url(/imgs/...)] into CSS with absolute paths.
// We need relative paths from assets/css/ to assets/imgs/
console.log("\n🔧 Post-processing CSS files...");
const cssDir = path.join(DIST, "assets", "css");
const cssFiles = ["style.css", "style.min.css"];
for (const cssFile of cssFiles) {
  const cssPath = path.join(cssDir, cssFile);
  if (existsSync(cssPath)) {
    let css = await fs.readFile(cssPath, "utf-8");
    // Fix: url("/imgs/...") or url(/imgs/...) → url("../imgs/...")
    css = css.replace(/url\(["']?\/?imgs\//g, 'url("../imgs/');
    // Fix: url("assets/imgs/...") → url("../imgs/...")  (already rewritten by Tailwind)
    css = css.replace(/url\(["']?assets\/imgs\//g, 'url("../imgs/');
    // Ensure closing quotes are consistent
    css = css.replace(
      /url\("\.\.\/imgs\/([^"]*?)["']?\)/g,
      'url("../imgs/$1")',
    );
    await fs.writeFile(cssPath, css, "utf-8");
    console.log(`   ✅ ${cssFile}`);
  }
}

// ─── Step 6: Copy & process HTML files ───
console.log("\n📄 Processing HTML files...");

for (const file of htmlFiles) {
  let html = await fs.readFile(path.join(__dirname, file), "utf-8");

  // 1. Replace CSS link (handles both /assets/... and assets/...)
  html = html.replace(
    /<link[^>]*href=["'](?:\/)?assets\/css\/style\.css["'][^>]*>/gi,
    '<link href="assets/css/style.min.css" rel="stylesheet" />',
  );

  // 2. Remove the old type="module" script tag
  //    Handles: <script type="module" src="[/]assets/js/main.js"></script>
  html = html.replace(
    /\s*<script\s[^>]*src=["'](?:\/)?assets\/js\/main\.js["'][^>]*><\/script>/gi,
    "",
  );

  // 3. Add non-module script at the bottom of <body>
  html = html.replace(
    /<\/body>/i,
    '    <script src="assets/js/main.min.js"></script>\n  </body>',
  );

  // 4. Fix image src/href paths: /imgs/... or imgs/... → assets/imgs/...
  //    Handles: src="/imgs/...", src="imgs/...", href="/imgs/...", href="imgs/..."
  html = html.replace(/((?:src|href)=["'])\/?imgs\//g, "$1assets/imgs/");

  // Note: Do NOT rewrite url() inside Tailwind class names (e.g., bg-[url(/imgs/...)]).
  // These are CSS selectors — changing them breaks the match with the generated CSS.
  // The actual background-image url() is fixed in the CSS post-processing step (5b).

  await fs.writeFile(path.join(DIST, file), html, "utf-8");
  console.log(`   ✅ ${file}`);
}

// ─── Step 7: Copy images from public/imgs/ to dist/assets/imgs/ ───
console.log("\n🖼️  Copying images...");
const imgsSrc = path.join(__dirname, "public", "imgs");
const imgsDest = path.join(DIST, "assets", "imgs");

if (existsSync(imgsSrc)) {
  await copyDir(imgsSrc, imgsDest);
  console.log("   ✅ Images copied to dist/assets/imgs/");
} else {
  console.warn("   ⚠️  No public/imgs/ directory found — skipping image copy");
}

// ─── Done ───
console.log("\n✨ Build complete!");
console.log(`📁 Output directory: ${DIST}`);
console.log("\n   Files:");

const distFiles = await fs.readdir(DIST);
for (const f of distFiles) {
  const stat = await fs.stat(path.join(DIST, f));
  if (stat.isDirectory()) {
    console.log(`   📂 ${f}/`);
  } else {
    console.log(`   📄 ${f}`);
  }
}

// ─── Helpers ───

async function cleanup() {
  try {
    await fs.unlink(TEMP_ENTRY);
  } catch {
    // File may already be deleted — ignore
  }
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".DS_Store") continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
