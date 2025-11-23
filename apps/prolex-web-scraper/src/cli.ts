#!/usr/bin/env node
/**
 * CLI for Prolex Web Scraper
 * Usage:
 *   prolex-scraper fetch <url>
 *   prolex-scraper readable <url>
 *   prolex-scraper crawl <url> [--depth n] [--max m]
 */

import dotenv from 'dotenv';
import fs from 'fs/promises';
import { fetchPage, fetchReadable, crawlSite, closeBrowser } from './scraper';
import { isValidUrl } from './utils';

// Load environment variables
dotenv.config();

/**
 * Display CLI usage information
 */
function displayUsage(): void {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              Prolex Web Scraper CLI v1.0                       ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  prolex-scraper <command> [options]

COMMANDS:
  fetch <url>                  Fetch complete page data
  readable <url>               Fetch readable/article content only
  crawl <url> [options]        Crawl website from seed URL

OPTIONS FOR CRAWL:
  --depth <n>                  Maximum crawl depth (default: 1)
  --max <n>                    Maximum pages to crawl (default: 20)
  --output <path>              Output file path (default: stdout)
  --format <json|markdown>     Output format (default: json)

EXAMPLES:
  prolex-scraper fetch https://example.com
  prolex-scraper readable https://blog.example.com/article
  prolex-scraper crawl https://docs.example.com --depth 2 --max 50
  prolex-scraper crawl https://n8n.io/docs --output n8n-docs.json

ENVIRONMENT:
  See .env.example for available configuration options.
`);
}

/**
 * Parse command-line arguments
 */
interface CliArgs {
  command: string;
  url?: string;
  depth?: number;
  max?: number;
  output?: string;
  format?: 'json' | 'markdown';
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    displayUsage();
    process.exit(0);
  }

  const command = args[0];
  const url = args[1];

  const parsed: CliArgs = { command, url };

  // Parse options
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--depth':
        parsed.depth = parseInt(next, 10);
        i++;
        break;
      case '--max':
        parsed.max = parseInt(next, 10);
        i++;
        break;
      case '--output':
        parsed.output = next;
        i++;
        break;
      case '--format':
        parsed.format = next as 'json' | 'markdown';
        i++;
        break;
    }
  }

  return parsed;
}

/**
 * Save output to file or stdout
 */
async function saveOutput(data: unknown, outputPath?: string, format = 'json'): Promise<void> {
  const content =
    format === 'json' ? JSON.stringify(data, null, 2) : JSON.stringify(data);

  if (outputPath) {
    await fs.writeFile(outputPath, content, 'utf-8');
    console.log(`\n✓ Output saved to: ${outputPath}`);
  } else {
    console.log('\n' + content);
  }
}

/**
 * Execute fetch command
 */
async function executeFetch(url: string): Promise<void> {
  console.log(`Fetching: ${url}`);
  const pageData = await fetchPage(url);

  console.log(`\n✓ Fetch complete!`);
  console.log(`Title: ${pageData.titre}`);
  console.log(`Text length: ${pageData.textNettoye.length} chars`);
  console.log(`Markdown length: ${pageData.markdown.length} chars`);
  console.log(`Internal links: ${pageData.liensInternes.length}`);

  console.log('\n' + JSON.stringify(pageData, null, 2));
}

/**
 * Execute readable command
 */
async function executeReadable(url: string): Promise<void> {
  console.log(`Fetching readable content: ${url}`);
  const readableContent = await fetchReadable(url);

  console.log(`\n✓ Readable fetch complete!`);
  console.log(`Title: ${readableContent.titre}`);
  console.log(`Markdown length: ${readableContent.markdown.length} chars`);

  console.log('\n' + JSON.stringify(readableContent, null, 2));
}

/**
 * Execute crawl command
 */
async function executeCrawl(
  url: string,
  depth?: number,
  max?: number,
  outputPath?: string,
  format?: 'json' | 'markdown'
): Promise<void> {
  console.log(`Starting crawl: ${url}`);
  console.log(`Depth: ${depth || 1}, Max pages: ${max || 20}\n`);

  const crawlResponse = await crawlSite({
    seedUrl: url,
    maxDepth: depth,
    maxPages: max
  });

  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║          Crawl Results                 ║`);
  console.log(`╚════════════════════════════════════════╝`);
  console.log(`Seed URL: ${crawlResponse.seedUrl}`);
  console.log(`Total pages: ${crawlResponse.totalPages}`);
  console.log(`Success: ${crawlResponse.successPages}`);
  console.log(`Failed: ${crawlResponse.failedPages}`);
  console.log(`Duration: ${(crawlResponse.duration / 1000).toFixed(2)}s`);

  // Save output
  await saveOutput(crawlResponse, outputPath, format);
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  try {
    const args = parseArgs();

    // Validate command
    const validCommands = ['fetch', 'readable', 'crawl', 'help'];
    if (!validCommands.includes(args.command)) {
      console.error(`❌ Invalid command: ${args.command}`);
      displayUsage();
      process.exit(1);
    }

    // Handle help
    if (args.command === 'help') {
      displayUsage();
      process.exit(0);
    }

    // Validate URL
    if (!args.url) {
      console.error('❌ URL is required');
      displayUsage();
      process.exit(1);
    }

    if (!isValidUrl(args.url)) {
      console.error(`❌ Invalid URL: ${args.url}`);
      process.exit(1);
    }

    // Execute command
    switch (args.command) {
      case 'fetch':
        await executeFetch(args.url);
        break;

      case 'readable':
        await executeReadable(args.url);
        break;

      case 'crawl':
        await executeCrawl(args.url, args.depth, args.max, args.output, args.format);
        break;
    }

    // Cleanup
    await closeBrowser();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    await closeBrowser();
    process.exit(1);
  }
}

// Run CLI
if (require.main === module) {
  main();
}

export { main };
