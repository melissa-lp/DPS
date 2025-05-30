// generateSrcList.js
const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "src");
const OUT_FILE = path.join(__dirname, "src_files.txt");

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach((name) => {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(walk(full));
    } else {
      results.push(full);
    }
  });
  return results;
}

function generate() {
  const files = walk(SRC_DIR);
  let out = "";

  files.forEach((filePath) => {
    const rel = path.relative(__dirname, filePath).replace(/\\/g, "/");
    const content = fs.readFileSync(filePath, "utf8");
    out += `// ${rel}\n${content}\n\n`;
  });

  fs.writeFileSync(OUT_FILE, out, "utf8");
  console.log(`✅ ${files.length} archivos volcaron en ${OUT_FILE}`);
}

generate();
