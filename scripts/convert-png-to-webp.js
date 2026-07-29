const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const pngDir = path.resolve(__dirname, "..", "public", "images" ,"png");
const outDir = path.resolve(__dirname, "..", "public", "images");

const extraSrc = path.resolve(__dirname, "..", "public", "images", "landing-bg-pattern.png");

if (!fs.existsSync(pngDir)) {
  console.error(`Source directory not found: ${pngDir}`);
  process.exit(1);
}

const pngFiles = fs
  .readdirSync(pngDir)
  .filter((f) => f.toLowerCase().endsWith(".png"))
  .sort(); // Replace with your file name
if (pngFiles.length === 0) {
  console.log("No PNG files found in", pngDir);
  process.exit(0);
}

console.log(`Found ${pngFiles.length} PNG file(s) in ${pngDir}.\n`);

const results = [];
let totalBefore = 0;
let totalAfter = 0;

async function convertOne(inputPath, outputName) {
  const stat = fs.statSync(inputPath);
  const sizeBefore = stat.size;
  totalBefore += sizeBefore;

  const outputPath = path.join(outDir, outputName);

  try {
    await sharp(inputPath)
      .webp({ quality: 95, effort: 6, alphaQuality: 100 })
      .toFile(outputPath);

    const sizeAfter = fs.statSync(outputPath).size;
    totalAfter += sizeAfter;
    const pct = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);

    results.push({
      file: outputName,
      before: sizeBefore,
      after: sizeAfter,
      pct,
    });

    console.log(
      `  ${outputName.padEnd(40)} ${(sizeBefore / 1024).toFixed(1).padStart(8)} KB \u2192 ${(sizeAfter / 1024).toFixed(1).padStart(8)} KB  (${pct}% reduction)`
    );
  } catch (err) {
    console.error(`  Error converting ${path.basename(inputPath)}: ${err.message}`);
  }
}

async function convert() {
  for (const file of pngFiles) {
    const inputPath = path.join(pngDir, file);
    const baseName = path.parse(file).name.trim();
    const outputName = baseName + ".webp";
    await convertOne(inputPath, outputName);
  }

  // Also convert landing-bg-pattern.png if it exists (used in landing-page components)
  if (fs.existsSync(extraSrc)) {
    console.log(`\nPlus extra file not in png/ folder:`);
    await convertOne(extraSrc, "landing-bg-pattern.webp");
  }

  console.log("\n" + "\u2500".repeat(56));
  console.log(
    `  Total before: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `  Total after:  ${(totalAfter / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(
    `  Overall reduction: ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%`
  );
  console.log(`  Files converted: ${results.length}`);
}

convert().catch((err) => {
  console.error("Conversion failed:", err);
  process.exit(1);
});
