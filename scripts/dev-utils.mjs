#!/usr/bin/env node
// Node 18+ ESM. Development utilities for AlgoLens project
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const command = args._[0];

const commands = {
  clean: cleanProject,
  reset: resetProject,
  info: showProjectInfo,
  deps: showDependencies,
  help: showHelp,
};

async function cleanProject() {
  console.log("🧹 Cleaning project...");

  const itemsToClean = [
    "dist",
    "node_modules/.cache",
    ".vite",
    "coverage",
    "test-results",
    "playwright-report",
    "analysis",
    "reports",
    "storybook-static",
    "tsconfig.tsbuildinfo",
    "tsconfig.*.tsbuildinfo",
    ".npm-cache",
    ".turbo",
    ".next",
    ".nuxt",
  ];

  for (const item of itemsToClean) {
    try {
      // Handle TypeScript build info files pattern
      if (item === "tsconfig.*.tsbuildinfo") {
        try {
          const files = await fs.readdir(".");
          const tsBuildFiles = files.filter(
            (f) => f.startsWith("tsconfig.") && f.endsWith(".tsbuildinfo")
          );
          for (const file of tsBuildFiles) {
            await fs.rm(file, { force: true });
            console.log(`   ✓ Removed ${file}`);
          }
        } catch {
          // Directory read failed, skip
        }
      } else {
        await fs.rm(item, { recursive: true, force: true });
        console.log(`   ✓ Removed ${item}`);
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.log(`   ⚠ Could not remove ${item}: ${error.message}`);
      }
    }
  }

  console.log("✅ Project cleaned!");
}

async function resetProject() {
  console.log("🔄 Resetting project...");

  await cleanProject();

  try {
    await fs.rm("node_modules", { recursive: true, force: true });
    console.log("   ✓ Removed node_modules");

    await fs.rm("package-lock.json", { force: true });
    console.log("   ✓ Removed package-lock.json");

    console.log("   📦 Running fresh install...");
    execSync("npm install", { stdio: "inherit" });

    console.log("✅ Project reset complete!");
  } catch (error) {
    console.error("❌ Reset failed:", error.message);
    process.exit(1);
  }
}

async function showProjectInfo() {
  try {
    const pkg = JSON.parse(await fs.readFile("package.json", "utf8"));

    console.log("📋 AlgoLens Project Info");
    console.log("========================");
    console.log(`Name: ${pkg.name}`);
    console.log(`Version: ${pkg.version}`);
    console.log(`Node: ${process.version}`);
    console.log(`Platform: ${process.platform}-${process.arch}`);

    try {
      const commit = execSync("git rev-parse --short HEAD", {
        stdio: ["ignore", "pipe", "ignore"],
      })
        .toString()
        .trim();
      console.log(`Git: ${commit}`);
    } catch {
      console.log("Git: Not a git repository");
    }

    try {
      const branch = execSync("git branch --show-current", {
        stdio: ["ignore", "pipe", "ignore"],
      })
        .toString()
        .trim();
      console.log(`Branch: ${branch}`);
    } catch {
      // ignore
    }

    // Check if dist exists and show size
    try {
      const distStats = await fs.stat("dist");
      if (distStats.isDirectory()) {
        const distSize = await getDirSize("dist");
        console.log(`Build size: ~${formatBytes(distSize)}`);
      }
    } catch {
      console.log("Build: Not built yet");
    }
  } catch (error) {
    console.error("❌ Could not read project info:", error.message);
  }
}

async function showDependencies() {
  try {
    const pkg = JSON.parse(await fs.readFile("package.json", "utf8"));

    console.log("📦 Dependencies");
    console.log("===============");

    if (pkg.dependencies) {
      console.log("\n🏗️  Production:");
      Object.entries(pkg.dependencies).forEach(([name, version]) => {
        console.log(`   ${name}: ${version}`);
      });
    }

    if (pkg.devDependencies) {
      console.log("\n🔧 Development:");
      Object.entries(pkg.devDependencies).forEach(([name, version]) => {
        console.log(`   ${name}: ${version}`);
      });
    }

    // Show outdated packages
    console.log("\n🔍 Checking for outdated packages...");
    try {
      execSync("npm outdated", { stdio: "inherit" });
    } catch {
      console.log("   ✅ All packages are up to date!");
    }
  } catch (error) {
    console.error("❌ Could not show dependencies:", error.message);
  }
}

function showHelp() {
  console.log("🛠️  AlgoLens Development Utilities");
  console.log("==================================");
  console.log("");
  console.log("Commands:");
  console.log("  clean    Clean build artifacts, caches, and temporary files");
  console.log("  reset    Full project reset (clean + reinstall)");
  console.log("  info     Show project information");
  console.log("  deps     Show dependencies and check for updates");
  console.log("  help     Show this help message");
  console.log("");
  console.log("Usage:");
  console.log("  npm run clean         # Quick clean command");
  console.log("  npm run reset         # Full reset");
  console.log("  npm run dev:utils info");
  console.log("  node scripts/dev-utils.mjs deps");
}

async function getDirSize(dirPath) {
  let totalSize = 0;

  async function walk(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          await walk(entryPath);
        } else if (entry.isFile()) {
          const stats = await fs.stat(entryPath);
          totalSize += stats.size;
        }
      }
    } catch {
      // Ignore permission errors etc.
    }
  }

  await walk(dirPath);
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function parseArgs(argv) {
  const result = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      result[key] = value || true;
    } else {
      result._.push(arg);
    }
  }
  return result;
}

async function main() {
  if (!command || !commands[command]) {
    showHelp();
    if (command && !commands[command]) {
      console.error(`\n❌ Unknown command: ${command}`);
      process.exit(1);
    }
    return;
  }

  await commands[command]();
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
