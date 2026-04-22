import { mkdir, readdir } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

const sourceDir = join(projectRoot, "assets", "images");
const outputDir = join(projectRoot, "assets", "images-optimized");
const supportedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
  ".tif",
  ".tiff",
]);

async function listFilesRecursively(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        return listFilesRecursively(fullPath);
      }
      return fullPath;
    }),
  );

  return files.flat();
}

function runSips(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("sips", args, { stdio: "ignore" });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`sips failed with exit code ${code}`));
    });
  });
}

async function optimizeOne(inputFile) {
  const ext = extname(inputFile).toLowerCase();
  if (!supportedExtensions.has(ext)) return null;

  const relativePath = relative(sourceDir, inputFile);
  const baseWithoutExt = relativePath.slice(0, -ext.length);
  const sourceExtLabel = ext.replace(".", "");
  const outputFile = join(outputDir, `${baseWithoutExt}.${sourceExtLabel}.jpg`);

  await mkdir(dirname(outputFile), { recursive: true });

  // Resize to a web-friendly max dimension and export compressed JPEG.
  await runSips([
    "-s",
    "format",
    "jpeg",
    "-s",
    "formatOptions",
    "70",
    "-Z",
    "1400",
    inputFile,
    "--out",
    outputFile,
  ]);

  return outputFile;
}

async function main() {
  const allFiles = await listFilesRecursively(sourceDir);
  const optimized = [];

  for (const file of allFiles) {
    try {
      const output = await optimizeOne(file);
      if (output) optimized.push(output);
    } catch (error) {
      console.warn(`Could not optimize ${file}`);
      console.warn(error instanceof Error ? error.message : String(error));
    }
  }

  console.log(`Optimized ${optimized.length} image(s) into assets/images-optimized.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
