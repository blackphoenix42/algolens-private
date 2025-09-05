# Scripts Documentation

This directory contains utility scripts for the AlgoLens project. All scripts are Node.js ESM modules designed to work cross-platform.

## Available Scripts

### 📝 ADR Management

- **`adr-new.mjs`** - Creates new Architecture Decision Records
  ```bash
  npm run adr "Your decision title"
  # Creates docs/ADR/XXXX-your-decision-title.md
  ```

### 🔍 Analysis & Quality

- **`check-licenses.mjs`** - Validates third-party package licenses

  ```bash
  npm run licenses
  # Outputs to analysis/licenses.json and analysis/licenses.md
  ```

- **`generate-sitemap.mjs`** - Generates SEO sitemap

  ```bash
  npm run sitemap
  # Creates public/sitemap.xml
  ```

- **`perf-benchmark.mjs`** - Performance benchmarking with Playwright
  ```bash
  npm run perf
  # Measures FCP, LCP, TTFB, etc.
  ```

### 🏗️ Build & Post-processing

- **`postbuild.mjs`** - Post-build processing and validation
  ```bash
  npm run postbuild
  # Stamps version, validates manifest, checks bundle size
  ```

### 🛠️ Development Utilities

- **`dev-utils.mjs`** - Development helper commands
  ```bash
  npm run clean          # Clean build artifacts and caches
  npm run reset          # Full reset (clean + reinstall)
  npm run dev:utils info # Show project info
  npm run dev:utils deps # Show dependencies
  ```

#### Clean Command Details

The `clean` command removes the following items:

- `dist/` - Build output directory
- `node_modules/.cache/` - Package manager cache
- `.vite/` - Vite cache directory
- `coverage/` - Test coverage reports
- `test-results/` - Playwright test results
- `playwright-report/` - Playwright HTML reports
- `analysis/` - Bundle analysis output
- `reports/` - Various report outputs
- `storybook-static/` - Storybook build output
- `tsconfig.tsbuildinfo` - TypeScript incremental build cache
- `tsconfig.*.tsbuildinfo` - Additional TypeScript build caches
- `.npm-cache/` - NPM cache directory
- `.turbo/` - Turborepo cache (if used)
- `.next/` - Next.js cache (if used)
- `.nuxt/` - Nuxt cache (if used)

## Environment Variables

### License Checker (`check-licenses.mjs`)

- `LICENSE_ALLOW` - Comma-separated list of allowed licenses (default: MIT,ISC,BSD-2-Clause,etc.)
- `LICENSE_DENY` - Comma-separated list of denied licenses (default: AGPL-3.0,GPL-3.0,etc.)
- `LICENSE_FAIL_ON_UNKNOWN` - Fail on unknown licenses (default: true)
- `LICENSE_FAIL_ON_DENIED` - Fail on denied licenses (default: true)

### Post-build (`postbuild.mjs`)

- `POSTBUILD_JS_BUDGET_KB` - JavaScript bundle size budget in KB (default: 300)

### Sitemap Generator (`generate-sitemap.mjs`)

- Routes can be customized via CLI args or `routes.json` file

## Integration with Package.json

All scripts are integrated into the main `package.json` scripts section:

```json
{
  "scripts": {
    "adr": "node scripts/adr-new.mjs",
    "clean": "node scripts/dev-utils.mjs clean",
    "dev:utils": "node scripts/dev-utils.mjs",
    "licenses": "node scripts/check-licenses.mjs",
    "perf": "node scripts/perf-benchmark.mjs --url http://127.0.0.1:4173 --tries 3",
    "postbuild": "node scripts/postbuild.mjs",
    "reset": "node scripts/dev-utils.mjs reset",
    "sitemap": "node scripts/generate-sitemap.mjs --base https://algolens.app --out public/sitemap.xml"
  }
}
```

## Makefile Integration

Scripts are also available through the project Makefile for CI/CD:

```makefile
make licenses    # Run license checker
make sitemap     # Generate sitemap
make perf        # Performance benchmark
make postbuild   # Post-build processing
```

## CI/CD Usage

These scripts are designed to integrate with GitHub Actions workflows:

- **License checking** - Part of compliance checks
- **Performance monitoring** - Can be used for regression detection
- **Build validation** - Post-build checks ensure quality
- **Sitemap generation** - SEO automation

## Windows Compatibility

All scripts are written in Node.js ESM and are fully compatible with Windows:

- No bash dependencies
- Uses Node.js built-in modules
- Cross-platform file paths using `path` module
- Windows Command Prompt and PowerShell compatible
