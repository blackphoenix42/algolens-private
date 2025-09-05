#!/usr/bin/env node
// Node 18+ ESM. Creates Architecture Decision Records (ADRs) in docs/ADR/
import { promises as fs } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "..");
const ADR_DIR = join(ROOT_DIR, "docs", "ADR");
const TEMPLATE_FILE = join(ADR_DIR, "0000-template.md");

const args = process.argv.slice(2);
const title = args[0];

if (!title) {
    console.error("Usage: node scripts/adr-new.mjs \"Title of the decision\"");
    process.exit(1);
}

const TEMPLATE_CONTENT = `# ADR {NUMBER}: {TITLE}

- **Date:** {YYYY-MM-DD}
- **Status:** Proposed
- **Owners:** @owner
- **Tags:** [area]

## Context

## Decision

## Consequences

## Alternatives considered

## References
`;

async function ensureDirectory(dir) {
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') throw error;
    }
}

async function fileExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

async function getNextAdrNumber() {
    try {
        const files = await fs.readdir(ADR_DIR);
        const adrFiles = files
            .filter(f => /^\d{4}-.*\.md$/.test(f))
            .map(f => parseInt(f.slice(0, 4), 10))
            .filter(n => !isNaN(n));

        return adrFiles.length > 0 ? Math.max(...adrFiles) + 1 : 1;
    } catch {
        return 1;
    }
}

function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function formatDate() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

async function main() {
    await ensureDirectory(ADR_DIR);

    // Create template if it doesn't exist
    if (!(await fileExists(TEMPLATE_FILE))) {
        await fs.writeFile(TEMPLATE_FILE, TEMPLATE_CONTENT, "utf8");
        console.log(`✓ Created template at ${TEMPLATE_FILE}`);
    }

    const nextNum = await getNextAdrNumber();
    const num = String(nextNum).padStart(4, '0');
    const slug = createSlug(title);
    const fileName = `${num}-${slug}.md`;
    const filePath = join(ADR_DIR, fileName);
    const dateStr = formatDate();

    // Generate ADR content from template
    const content = TEMPLATE_CONTENT
        .replace(/{NUMBER}/g, num)
        .replace(/{TITLE}/g, title)
        .replace(/{YYYY-MM-DD}/g, dateStr);

    await fs.writeFile(filePath, content, "utf8");

    // Update README.md if it exists
    const readmePath = join(ADR_DIR, "README.md");
    if (await fileExists(readmePath)) {
        try {
            const readme = await fs.readFile(readmePath, "utf8");
            const linkText = `- [ADR ${num}: ${title}](./${fileName})`;

            if (!readme.includes(linkText)) {
                const updatedReadme = readme.trim() + "\n" + linkText + "\n";
                await fs.writeFile(readmePath, updatedReadme, "utf8");
                console.log(`✓ Updated ${readmePath}`);
            }
        } catch (error) {
            console.warn(`Warning: Could not update README.md: ${error.message}`);
        }
    }

    console.log(`✓ Created ADR ${num}: ${title}`);
    console.log(`   File: docs/ADR/${fileName}`);
    console.log(`   Edit the file to add context, decision, and consequences.`);
}

main().catch(error => {
    console.error("Error creating ADR:", error.message);
    process.exit(1);
});
