# 📊 Google Workspace MCP Server

**Version**: 1.0.0
**Status**: ✅ Production Ready
**Security**: 🔒 Enterprise Grade

MCP (Model Context Protocol) server for Google Workspace integration with **Sheets**, **Docs**, and **Drive**. Built for [Prolex AI](https://github.com/ProlexAi/Prolex) with security-first architecture.

---

## 🎯 Features

### Google Sheets (4 tools)
- ✅ `read_sheet` - Read data from spreadsheets
- ✅ `write_sheet` - Write/overwrite data
- ✅ `append_sheet` - Append rows
- ✅ `create_spreadsheet` - Create new spreadsheets

### Google Docs (4 tools)
- ✅ `read_doc` - Read document content
- ✅ `create_doc` - Create new documents
- ✅ `insert_text_doc` - Insert text at any position
- ✅ `update_doc` - Batch update documents

### Google Drive (4 tools)
- ✅ `list_drive_files` - List files and folders
- ✅ `upload_drive_file` - Upload files
- ✅ `download_drive_file` - Download files
- ✅ `create_drive_folder` - Create folders

### Security Features 🔒
- ✅ **Environment validation** with Zod (fail-fast on startup)
- ✅ **Service Account support** (recommended for production)
- ✅ **OAuth2 support** (for development)
- ✅ **Input validation** for all tools (prevent injection attacks)
- ✅ **File size limits** (prevent DoS)
- ✅ **Audit logging** (SystemJournal with sensitive data redaction)
- ✅ **Rate limiting** support
- ✅ **Structured error handling**

---

## 📦 Installation

### 1. Install Dependencies

```bash
cd mcp/google-workspace-server
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure your Google credentials (see [Authentication](#-authentication) section).

### 3. Build TypeScript

```bash
npm run build
```

### 4. Test the Server

```bash
npm run dev
```

---

## 🔐 Authentication

### Option A: Service Account (RECOMMENDED for Production)

**Why Service Account?**
- ✅ More secure for server-to-server communication
- ✅ No token refresh needed
- ✅ Can be granted specific permissions via Google Admin Console

**Setup Steps:**

1. **Create Service Account** in [Google Cloud Console](https://console.cloud.google.com/):
   - Go to **IAM & Admin** → **Service Accounts**
   - Click **Create Service Account**
   - Name: `prolex-google-workspace`
   - Grant roles: `Editor` or specific API roles

2. **Generate Key**:
   - Click on the service account
   - Go to **Keys** tab
   - Click **Add Key** → **Create New Key** → **JSON**
   - Save the JSON file securely (NEVER commit to git!)

3. **Enable APIs**:
   - Go to **APIs & Services** → **Library**
   - Enable: **Google Sheets API**, **Google Docs API**, **Google Drive API**

4. **Configure `.env`**:

```bash
# Service Account (preferred)
GOOGLE_SERVICE_ACCOUNT_EMAIL=prolex-google-workspace@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account-key.json

# OR provide JSON directly (for Docker/env vars):
# GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"..."}'
```

5. **Share resources with Service Account**:
   - For any Sheet/Doc/Drive resource you want to access, share it with the service account email
   - Example: `prolex-google-workspace@your-project.iam.gserviceaccount.com`

---

### Option B: OAuth2 (for Development)

**Setup Steps:**

1. **Create OAuth2 Client** in [Google Cloud Console](https://console.cloud.google.com/):
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Desktop app** or **Web application**
   - Download credentials JSON

2. **Configure `.env`**:

```bash
# OAuth2
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

3. **Generate OAuth Token** (manual step required):
   - Run the authentication flow to get access/refresh tokens
   - Store tokens securely (NOT in git)

**⚠️ Warning**: OAuth2 requires manual token management and is less secure for production.

---

## 🚀 Usage

### Start the Server

**Development mode** (auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

### Use with Claude Desktop

Add to your Claude Desktop MCP configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "node",
      "args": ["/path/to/Prolex/mcp/google-workspace-server/dist/index.js"],
      "env": {
        "GOOGLE_SERVICE_ACCOUNT_KEY_PATH": "/path/to/service-account-key.json",
        "GOOGLE_SERVICE_ACCOUNT_EMAIL": "your-service-account@project.iam.gserviceaccount.com"
      }
    }
  }
}
```

---

## 📝 Examples

### Example 1: Read from Google Sheets

```javascript
// Tool: read_sheet
{
  "spreadsheetId": "1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk",
  "range": "SystemJournal!A1:Z100"
}

// Response:
{
  "spreadsheetId": "1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk",
  "range": "SystemJournal!A1:Z100",
  "values": [
    ["Timestamp", "Agent", "Action", "Result"],
    ["2025-11-22T10:00:00Z", "prolex", "task_create", "success"],
    ...
  ],
  "rowCount": 100,
  "columnCount": 4
}
```

### Example 2: Write to Google Sheets

```javascript
// Tool: write_sheet
{
  "spreadsheetId": "1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk",
  "range": "Sheet1!A1",
  "values": [
    ["Name", "Email", "Status"],
    ["Alice", "alice@example.com", "Active"],
    ["Bob", "bob@example.com", "Inactive"]
  ]
}

// Response:
{
  "spreadsheetId": "1xEEtkiRFLYvOc0lmK2V6xJyw5jUeye80rqcqjQ2vTpk",
  "range": "Sheet1!A1",
  "updatedCells": 6
}
```

### Example 3: Create a New Google Doc

```javascript
// Tool: create_doc
{
  "title": "Prolex Weekly Report"
}

// Response:
{
  "documentId": "abc123def456",
  "title": "Prolex Weekly Report",
  "url": "https://docs.google.com/document/d/abc123def456/edit"
}
```

### Example 4: Upload File to Google Drive

```javascript
// Tool: upload_drive_file
{
  "name": "backup-2025-11-22.json",
  "content": "{\"data\": \"example\"}",
  "mimeType": "application/json",
  "parentFolderId": "folder-id-here"
}

// Response:
{
  "fileId": "file-id-123",
  "name": "backup-2025-11-22.json",
  "mimeType": "application/json",
  "size": "125",
  "webViewLink": "https://drive.google.com/file/d/file-id-123/view"
}
```

---

## 🔧 Configuration

### Environment Variables

See `.env.example` for complete list. Key variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Yes* | - | Service account email |
| `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` | Yes* | - | Path to service account key JSON |
| `GOOGLE_CLIENT_ID` | Yes** | - | OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Yes** | - | OAuth2 client secret |
| `LOG_LEVEL` | No | `info` | Logging level (trace, debug, info, warn, error) |
| `MAX_UPLOAD_SIZE_BYTES` | No | `10485760` | Max file upload size (10MB) |
| `CACHE_TTL` | No | `300` | Cache TTL in seconds |
| `RATE_LIMIT_MAX_REQUESTS` | No | `60` | Max requests per minute |

\* Required if using Service Account
** Required if using OAuth2

---

## 🛡️ Security Best Practices

### ✅ DO:

1. **Use Service Accounts** for production
2. **Rotate service account keys** every 90 days
3. **Set strict file size limits** in `.env`
4. **Enable request validation** (`ENABLE_REQUEST_VALIDATION=true`)
5. **Monitor SystemJournal logs** for suspicious activity
6. **Use `.gitignore`** - NEVER commit secrets
7. **Set proper Google Workspace permissions** (principle of least privilege)
8. **Review audit logs** regularly

### ❌ DON'T:

1. **NEVER commit** `.env` files or service account keys
2. **DON'T use OAuth2** in production without proper token management
3. **DON'T disable** input validation
4. **DON'T ignore** security warnings in logs
5. **DON'T grant** excessive permissions to service accounts

---

## 📊 Logging & Monitoring

### SystemJournal Logging

All operations are logged to:
- **Console** (with pretty formatting in development)
- **JSONL file** (`./logs/system-journal.jsonl`) for audit trail

Log entry example:

```json
{
  "timestamp": "2025-11-22T10:00:00.000Z",
  "level": "INFO",
  "event": "api_call",
  "tool": "sheets",
  "metadata": {
    "operation": "read",
    "spreadsheetId": "1xEE...",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Security Events

Security events are logged with `🔒 SECURITY:` prefix:

```json
{
  "level": "WARN",
  "event": "🔒 SECURITY: sheets_invalid_spreadsheet_id",
  "metadata": {
    "correlationId": "...",
    "error": "Invalid spreadsheet ID format"
  }
}
```

---

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Manual Testing

Test individual tools using Claude Desktop or via stdin/stdout:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm start
```

---

## 🐛 Troubleshooting

### Error: "Google Auth not initialized"

**Solution**: Ensure service account key exists and path is correct in `.env`.

### Error: "Insufficient scopes for [API]"

**Solution**: Update `GOOGLE_SCOPES` in `.env` to include required scopes:

```bash
GOOGLE_SCOPES=https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive
```

### Error: "Invalid spreadsheet ID format"

**Solution**: Use the ID from the Google Sheets URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

### Error: "File size exceeds maximum"

**Solution**: Increase `MAX_UPLOAD_SIZE_BYTES` in `.env` or reduce file size.

---

## 📚 API Reference

### Complete Tool List

| Tool | Input | Output |
|------|-------|--------|
| `read_sheet` | `spreadsheetId`, `range` | 2D array of values |
| `write_sheet` | `spreadsheetId`, `range`, `values` | Updated cell count |
| `append_sheet` | `spreadsheetId`, `range`, `values` | Updated range |
| `create_spreadsheet` | `title`, `sheetTitles?` | Spreadsheet ID & URL |
| `read_doc` | `documentId`, `plainTextOnly?` | Document content |
| `create_doc` | `title` | Document ID & URL |
| `insert_text_doc` | `documentId`, `text`, `index?` | Success status |
| `update_doc` | `documentId`, `requests` | Update replies |
| `list_drive_files` | `folderId?`, `query?`, `maxResults?` | File list |
| `upload_drive_file` | `name`, `content`, `mimeType`, `parentFolderId?` | File ID & URL |
| `download_drive_file` | `fileId` | Base64 content |
| `create_drive_folder` | `name`, `parentFolderId?` | Folder ID |

---

## 🤝 Contributing

This server is part of the [Prolex AI](https://github.com/ProlexAi/Prolex) project.

### Development Workflow

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes with security in mind
4. Test thoroughly (`npm test`)
5. Commit (`git commit -m 'feat(sheets): add batch read support'`)
6. Push (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details

---

## 🙏 Credits

- **Maintainer**: ProlexAi Team
- **Built with**: [Model Context Protocol SDK](https://modelcontextprotocol.io/)
- **Google APIs**: [googleapis](https://github.com/googleapis/google-api-nodejs-client)
- **Validation**: [Zod](https://zod.dev/)
- **Logging**: [Pino](https://getpino.io/)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ProlexAi/Prolex/issues)
- **Docs**: [Prolex Documentation](https://github.com/ProlexAi/Prolex/tree/main/docs)
- **Email**: matthieu@automatt.ai

---

**Made with ❤️ and 🔒 security for Prolex AI**
