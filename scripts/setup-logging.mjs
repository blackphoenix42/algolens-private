#!/usr/bin/env node
/**
 * Setup script for AlgoLens debug logging
 * Helps developers configure logging for different scenarios
 */

import { readFileSync, writeFileSync } from 'fs';

const PRESET_CONFIGS = {
    production: {
        VITE_LOG_LEVEL: 'WARN',
        VITE_LOG_CATEGORIES: 'general,performance',
        VITE_ENABLE_PERFORMANCE_MONITORING: 'false',
        VITE_ENABLE_FPS_MONITORING: 'false',
        VITE_ENABLE_MEMORY_MONITORING: 'false',
    },
    development: {
        VITE_LOG_LEVEL: 'DEBUG',
        VITE_LOG_CATEGORIES: 'general,algorithm,runner,canvas,animation,performance,user,router',
        VITE_ENABLE_PERFORMANCE_MONITORING: 'true',
        VITE_ENABLE_FPS_MONITORING: 'true',
        VITE_ENABLE_MEMORY_MONITORING: 'true',
    },
    debugging: {
        VITE_LOG_LEVEL: 'TRACE',
        VITE_LOG_CATEGORIES: 'general,algorithm,runner,canvas,animation,performance,user,router,api,worker,state',
        VITE_ENABLE_PERFORMANCE_MONITORING: 'true',
        VITE_ENABLE_FPS_MONITORING: 'true',
        VITE_ENABLE_MEMORY_MONITORING: 'true',
    },
    performance: {
        VITE_LOG_LEVEL: 'INFO',
        VITE_LOG_CATEGORIES: 'performance,animation,runner',
        VITE_ENABLE_PERFORMANCE_MONITORING: 'true',
        VITE_ENABLE_FPS_MONITORING: 'true',
        VITE_ENABLE_MEMORY_MONITORING: 'true',
    },
    algorithm: {
        VITE_LOG_LEVEL: 'DEBUG',
        VITE_LOG_CATEGORIES: 'algorithm,runner,animation',
        VITE_ENABLE_PERFORMANCE_MONITORING: 'false',
        VITE_ENABLE_FPS_MONITORING: 'false',
        VITE_ENABLE_MEMORY_MONITORING: 'false',
    },
};

function parseArgs(argv) {
    const args = { _: [] };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            args[key] = value || true;
        } else {
            args._.push(arg);
        }
    }
    return args;
}

function updateEnvFile(filePath, config) {
    let content = '';

    try {
        content = readFileSync(filePath, 'utf8');
    } catch {
        console.log(`Creating new file: ${filePath}`);
    }

    // Update or add each config value
    for (const [key, value] of Object.entries(config)) {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        const line = `${key}=${value}`;

        if (regex.test(content)) {
            content = content.replace(regex, line);
        } else {
            // Add to the end, under debug logging section
            if (!content.includes('# Debug Logging Configuration')) {
                content += '\n# Debug Logging Configuration\n';
            }
            content += `${line}\n`;
        }
    }

    writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath}`);
}

function showHelp() {
    console.log(`
🔍 AlgoLens Logging Setup

Usage:
  node scripts/setup-logging.mjs <preset> [options]

Presets:
  production  - Minimal logging for production
  development - Standard development logging
  debugging   - Verbose logging for debugging
  performance - Focus on performance metrics
  algorithm   - Focus on algorithm execution

Options:
  --env=<file>    Environment file to update (default: .env.development)
  --help          Show this help

Examples:
  node scripts/setup-logging.mjs development
  node scripts/setup-logging.mjs performance --env=.env.local
  node scripts/setup-logging.mjs debugging

Current presets:
`);

    for (const [name, config] of Object.entries(PRESET_CONFIGS)) {
        console.log(`  ${name}:`);
        for (const [key, value] of Object.entries(config)) {
            console.log(`    ${key}=${value}`);
        }
        console.log('');
    }
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const preset = args._[0];

    if (args.help || !preset) {
        showHelp();
        return;
    }

    if (!PRESET_CONFIGS[preset]) {
        console.error(`❌ Unknown preset: ${preset}`);
        console.error(`Available presets: ${Object.keys(PRESET_CONFIGS).join(', ')}`);
        process.exit(1);
    }

    const envFile = args.env || '.env.development';
    const config = PRESET_CONFIGS[preset];

    console.log(`📝 Applying "${preset}" logging preset to ${envFile}`);
    updateEnvFile(envFile, config);

    console.log(`
✨ Logging configuration applied!

To see debug logs:
1. Restart your development server
2. Open the browser console
3. Use Ctrl+Shift+D to open the debug panel

Current settings:
${Object.entries(config)
            .map(([key, value]) => `  ${key}=${value}`)
            .join('\n')}
`);
}

main();
