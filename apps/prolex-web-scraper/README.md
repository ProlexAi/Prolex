# Prolex Web Scraper

> Enterprise-grade web scraping service for Prolex AI agent - Extract, clean, and convert web content with Playwright and Cheerio

## 🚀 Features

- **Complete Page Extraction**: Fetch raw HTML, cleaned text, and markdown from any URL
- **Readable Content**: Extract main article content using intelligent DOM analysis
- **Smart Crawling**: BFS-based website crawler with depth and page limits
- **Playwright-Powered**: Handle dynamic JavaScript-heavy sites with real browser automation
- **Local Snapshots**: Automatically save JSON snapshots organized by domain
- **REST API**: Full-featured HTTP API for integration with Prolex workflows
- **CLI Tool**: Command-line interface for manual scraping operations
- **Robots.txt Respect**: Optional robots.txt compliance checking
- **TypeScript**: Fully typed codebase for safety and maintainability

## 📦 Installation

```bash
# Navigate to the scraper directory
cd apps/prolex-web-scraper

# Install dependencies (Playwright will auto-install Chromium)
npm install

# Copy environment configuration
cp .env.example .env

# Build TypeScript
npm run build
```

## 🔧 Configuration

Edit `.env` file:

```bash
# Server Configuration
PORT=3500
NODE_ENV=development

# Scraper Settings
SCRAPER_TIMEOUT_MS=15000
SCRAPER_USER_AGENT=ProlexScraper/1.0
SCRAPER_MAX_PAGES=20
SCRAPER_MAX_DEPTH=1

# Playwright Settings
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_BROWSER=chromium

# Storage Settings
SNAPSHOTS_DIR=./snapshots

# Security Settings
RESPECT_ROBOTS_TXT=true
MIN_DELAY_MS=500
```

## 🌐 API Usage

### Start the Server

```bash
npm start
# Server runs on http://localhost:3500
```

### Endpoints

#### 1. GET `/fetch?url=<url>`

Fetch complete page data including HTML, text, markdown, and links.

**Example:**

```bash
curl "http://localhost:3500/fetch?url=https://example.com"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "titre": "Example Domain",
    "htmlBrut": "<!DOCTYPE html>...",
    "textNettoye": "Example Domain This domain is for...",
    "markdown": "# Example Domain\n\nThis domain is for...",
    "liensInternes": [
      "https://example.com/about",
      "https://example.com/contact"
    ],
    "dateCrawl": "2025-11-23T10:00:00.000Z",
    "metadata": {
      "description": "Example domain for documentation",
      "keywords": "example, documentation"
    }
  },
  "timestamp": "2025-11-23T10:00:00.000Z"
}
```

#### 2. GET `/readable?url=<url>`

Extract only the main article/readable content.

**Example:**

```bash
curl "http://localhost:3500/readable?url=https://blog.example.com/article"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://blog.example.com/article",
    "titre": "How to Build Great Software",
    "markdown": "# How to Build Great Software\n\n...",
    "dateCrawl": "2025-11-23T10:00:00.000Z",
    "metadata": {
      "author": "John Doe",
      "ogTitle": "How to Build Great Software"
    }
  },
  "timestamp": "2025-11-23T10:00:00.000Z"
}
```

#### 3. POST `/crawl`

Crawl a website starting from a seed URL.

**Request Body:**

```json
{
  "seedUrl": "https://docs.example.com",
  "maxDepth": 2,
  "maxPages": 50,
  "sameDomainOnly": true
}
```

**Example:**

```bash
curl -X POST http://localhost:3500/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "seedUrl": "https://docs.n8n.io",
    "maxDepth": 2,
    "maxPages": 30
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "seedUrl": "https://docs.n8n.io",
    "totalPages": 30,
    "successPages": 28,
    "failedPages": 2,
    "maxDepth": 2,
    "results": [
      {
        "url": "https://docs.n8n.io",
        "titre": "n8n Documentation",
        "markdown": "# n8n Documentation\n\n...",
        "textNettoye": "n8n Documentation...",
        "depth": 0,
        "success": true
      }
      // ... more results
    ],
    "duration": 45320
  },
  "timestamp": "2025-11-23T10:00:00.000Z"
}
```

#### 4. GET `/health`

Health check endpoint.

```bash
curl http://localhost:3500/health
```

#### 5. POST `/shutdown`

Gracefully close the browser instance.

```bash
curl -X POST http://localhost:3500/shutdown
```

## 🖥️ CLI Usage

### Commands

```bash
# Fetch complete page data
npm run cli fetch https://example.com

# Fetch readable content only
npm run cli readable https://blog.example.com/article

# Crawl website
npm run cli crawl https://docs.example.com --depth 2 --max 50

# Crawl and save to file
npm run cli crawl https://n8n.io/docs --output n8n-docs.json
```

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--depth <n>` | Maximum crawl depth | 1 |
| `--max <n>` | Maximum pages to crawl | 20 |
| `--output <path>` | Output file path | stdout |
| `--format <json\|markdown>` | Output format | json |

### Examples

```bash
# Crawl n8n documentation (depth 2, max 100 pages)
npm run cli crawl https://docs.n8n.io --depth 2 --max 100 --output n8n-docs.json

# Extract readable article
npm run cli readable https://medium.com/@user/article-slug

# Quick fetch for testing
npm run cli fetch https://example.com
```

## 📁 Snapshots

All crawled/fetched pages are automatically saved as JSON snapshots:

```
snapshots/
├── example.com/
│   ├── 1700000000000_index.json
│   └── 1700000001000_about.json
├── docs.n8n.io/
│   ├── 1700000002000_index.json
│   ├── 1700000003000_workflows.json
│   └── 1700000004000_integrations.json
```

**Snapshot Format:**

```json
{
  "url": "https://example.com",
  "titre": "Example Domain",
  "textNettoye": "Clean text content...",
  "markdown": "# Markdown content...",
  "htmlBrut": "<!DOCTYPE html>...",
  "liensInternes": ["https://example.com/about"],
  "dateCrawl": "2025-11-23T10:00:00.000Z",
  "metadata": {
    "description": "...",
    "keywords": "..."
  }
}
```

## 🔗 Integration with Prolex Vector Service

To send scraped content to your vector service for embedding:

### Option 1: Manual Integration

```typescript
import { fetchReadable } from './scraper';
import fetch from 'node-fetch';

const content = await fetchReadable('https://docs.example.com');

await fetch('http://localhost:3600/ingest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: content.url,
    title: content.titre,
    content: content.markdown,
    metadata: content.metadata
  })
});
```

### Option 2: Enable Auto-Send (Future Feature)

In `.env`:

```bash
VECTOR_SERVICE_URL=http://localhost:3600/ingest
VECTOR_SERVICE_ENABLED=true
```

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Prolex Web Scraper                         │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌──────▼──────┐    ┌─────▼─────┐
   │   CLI   │      │  REST API   │    │  Library  │
   └────┬────┘      └──────┬──────┘    └─────┬─────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                   ┌───────▼────────┐
                   │  Core Scraper  │
                   │   (scraper.ts) │
                   └───────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌──────▼──────┐    ┌─────▼─────┐
   │Playwright│      │   Cheerio   │    │ Turndown  │
   │(Browser)│      │ (HTML Parse)│    │ (Markdown)│
   └─────────┘      └─────────────┘    └───────────┘
                           │
                   ┌───────▼────────┐
                   │    Storage     │
                   │  (snapshots/)  │
                   └────────────────┘
```

## 🛠️ Development

### Project Structure

```
apps/prolex-web-scraper/
├── src/
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── routes/
│   │   └── index.ts          # Express API routes
│   ├── cli.ts                # CLI implementation
│   ├── scraper.ts            # Core scraping logic
│   ├── server.ts             # Express server
│   ├── storage.ts            # Snapshot storage
│   └── utils.ts              # Utility functions
├── snapshots/                # Saved page snapshots
├── .env.example              # Environment template
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

### Scripts

```bash
npm run build         # Compile TypeScript
npm start             # Start production server
npm run dev           # Start dev server with hot reload
npm run dev:watch     # Start dev server with file watching
npm run cli           # Run CLI tool
npm test              # Run tests (future)
npm run lint          # Lint TypeScript code
npm run format        # Format code with Prettier
```

### Building from Source

```bash
# Clone repository
git clone https://github.com/ProlexAi/Prolex.git
cd Prolex/apps/prolex-web-scraper

# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

## 🔒 Security & Best Practices

### Robots.txt Compliance

By default, the scraper respects `robots.txt`:

- Fetches `/robots.txt` before scraping
- Checks if URL is allowed for configured user agent
- Returns warning if access is disallowed

Disable in `.env`:

```bash
RESPECT_ROBOTS_TXT=false
```

### Rate Limiting

- Minimum delay between requests: `MIN_DELAY_MS` (default: 500ms)
- Configurable timeout: `SCRAPER_TIMEOUT_MS` (default: 15000ms)
- Maximum pages per crawl: `SCRAPER_MAX_PAGES` (default: 20)
- Maximum crawl depth: `SCRAPER_MAX_DEPTH` (default: 1)

### Resource Limits

API endpoint limits:

- `maxPages`: Maximum 100 pages per crawl
- `maxDepth`: Maximum depth of 3

### User Agent

Configure a descriptive user agent:

```bash
SCRAPER_USER_AGENT="ProlexScraper/1.0 (+https://automatt.ai)"
```

## 📚 Use Cases

### 1. Documentation Ingestion

Crawl and vectorize technical documentation:

```bash
npm run cli crawl https://docs.n8n.io --depth 2 --max 100 --output n8n-docs.json
```

### 2. Competitive Intelligence

Monitor competitor websites for changes:

```bash
npm run cli fetch https://competitor.com/pricing
```

### 3. Content Archival

Archive blog posts and articles:

```bash
npm run cli readable https://blog.example.com/article
```

### 4. Knowledge Base Building

Build RAG knowledge bases for Prolex:

```bash
# Crawl → Save snapshots → Send to vector service
npm run cli crawl https://docs.example.com --depth 2
```

## 🚧 Future Enhancements

- [ ] Auto-send to vector service (webhook integration)
- [ ] PDF export of crawled content
- [ ] Screenshot capture with Playwright
- [ ] Incremental crawling (detect changes since last crawl)
- [ ] Sitemap.xml parsing for efficient crawling
- [ ] Scheduled crawling (cron jobs)
- [ ] Parallel crawling for faster processing
- [ ] Database storage option (PostgreSQL/MongoDB)
- [ ] Web UI for crawl management
- [ ] Custom extraction rules (CSS selectors)

## 📝 Example: Crawl n8n Documentation

```bash
# Step 1: Start the server
npm start

# Step 2: Crawl n8n docs (in another terminal)
curl -X POST http://localhost:3500/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "seedUrl": "https://docs.n8n.io",
    "maxDepth": 2,
    "maxPages": 50
  }' | jq .

# Step 3: Check snapshots
ls -la snapshots/docs.n8n.io/

# Step 4: (Optional) Send to vector service
# Process each snapshot and POST to vector service endpoint
```

## 🤝 Contributing

This is an internal Prolex service. For issues or improvements:

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit PR with clear description

## 📄 License

MIT License - Part of the Prolex ecosystem by Automatt.ai

## 🔗 Related Services

- **Prolex**: AI orchestrator brain
- **Kimmy**: Entry filter and classifier
- **Opex**: Execution arm with n8n workflows
- **Vector Service**: (Future) Content embedding and search

---

**Maintainer**: Matthieu @ Automatt.ai
**Version**: 1.0.0
**Last Updated**: 2025-11-23
