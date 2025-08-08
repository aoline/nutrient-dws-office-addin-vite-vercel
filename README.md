# Nutrient DWS Office Add-in Vite Vercel

A Vercel-based serverless API for DOCX→PDF conversion using the Nutrient Processor API.

## Features

- **Serverless API**: `/api/build` endpoint for DOCX→PDF conversion
- **Demo Mode**: Web interface for testing without external accounts
- **Automatic Validation**: Ensures PDF output is > 10 KB
- **Error Handling**: Comprehensive error responses and logging
- **Smart Port Detection**: Automatically detects the correct port for testing

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # Add your Nutrient API key to Vercel
   vercel env add NUTRIENT_API_KEY
   ```

3. **Run locally**:
   ```bash
   npm run dev
   ```
   
   **Note**: The server may start on a different port (3000, 3001, 3002, etc.) if the default port is in use. The test scripts will automatically detect the correct port.

4. **Test the API**:
   ```bash
   # Run comprehensive tests (automatically detects port)
   npm run test:all
   
   # Or test individually
   npm run smoke    # API endpoint test
   npm run test     # Comprehensive tests
   ```

## API Endpoints

### POST /api/build

Converts a DOCX file to PDF using the Nutrient Processor API.

**Request**:
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: DOCX file (binary)
  - `instructions`: JSON string with conversion options

**Response**:
- Status: `200 OK`
- Content-Type: `application/pdf`
- Body: Binary PDF data (> 10 KB)

**Example**:
```bash
# Test with curl (port will be auto-detected by test scripts)
npm run test

# Manual testing (check port first)
curl -X POST http://localhost:$(lsof -ti:3000,3001,3002,3003 | head -1)/api/build \
  -F "file=@tests/fixtures/Sample.docx" \
  -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}" \
  --output output.pdf
```

## Development

### Project Structure

```
├── api/
│   └── build.ts          # Main API endpoint
├── pages/
│   └── index.tsx         # Demo page
├── public/
│   └── logo.jpeg         # Project logo
├── scripts/
│   └── test.sh           # Automated testing script
├── tests/
│   ├── fixtures/         # Test files (Sample.docx, Sample.pdf)
│   └── smoke.sh          # Smoke test
├── docs/                 # Documentation
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies
```

### Testing

#### Automated Testing
```bash
# Run all tests (automatically detects port)
npm run test:all

# Run comprehensive tests
npm run test

# Run smoke test only
npm run smoke
```

#### Manual Testing
```bash
# 1. Start the server
npm run dev

# 2. Check which port the server is running on
# Look for output like: "Local: http://localhost:3003"

# 3. Test the API endpoint
curl -X POST http://localhost:3003/api/build \
  -F "file=@tests/fixtures/Sample.docx" \
  -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}" \
  --output test-output.pdf

# 4. Verify the result
file test-output.pdf
ls -la test-output.pdf  # Should be > 10 KB
```

#### Testing Checklist
- [ ] Server starts without errors
- [ ] API endpoint responds (check port detection)
- [ ] PDF output > 10 KB
- [ ] Demo page loads with logo
- [ ] Error handling works
- [ ] All automated tests pass

### Deployment

Deploy to Vercel:
```bash
vercel --prod
```

## Guardrails

This project follows strict guardrails defined in `docs/GUARDRAILS.md`:

- ✅ Uses `multipart/form-data` with `file` and `instructions` fields
- ✅ Never sets `Content-Type: multipart/form-data` manually
- ✅ Validates PDF size > 10 KB
- ✅ Handles errors gracefully
- ✅ Uses environment variables for secrets

## Golden Contracts

The API implements the exact contract defined in `docs/GOLDEN_CONTRACTS.md`:

- ✅ POST `/api/build` with multipart form data
- ✅ Returns HTTP 200 with `application/pdf` content type
- ✅ Ensures output size > 10 KB

## Demo Mode

The demo page (`/`) allows testing without external accounts:

1. Creates a test DOCX file
2. POSTs to `/api/build` with minimal instructions
3. Downloads the generated PDF
4. Validates size requirements

## Environment Variables

- `NUTRIENT_PROCESSOR_API_KEY`: Your Nutrient Processor API key (required)

## Troubleshooting

### Port Issues
If you encounter port conflicts:
```bash
# Check which ports are in use
lsof -ti:3000,3001,3002,3003

# Kill processes if needed
kill -9 $(lsof -ti:3000,3001,3002,3003)

# Start server again
npm run dev
```

### API Endpoint Not Found
If you get 404 errors:
1. Check if the server is running on the correct port
2. Verify the API route is properly configured
3. Check for Next.js app directory vs pages directory conflicts

### Testing Issues
```bash
# Run tests with verbose output
npm run test

# Check server status
curl -s http://localhost:$(lsof -ti:3000,3001,3002,3003 | head -1) | head -5
```

## License

MIT License - see [LICENSE](LICENSE) for details.
