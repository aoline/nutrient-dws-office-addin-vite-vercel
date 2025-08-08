# Nutrient DWS Office Add-in Vite Vercel

A Vercel-based serverless API for DOCX→PDF conversion using the Nutrient Processor API.

## Features

- **Serverless API**: `/api/build` endpoint for DOCX→PDF conversion
- **Demo Mode**: Web interface for testing without external accounts
- **Automatic Validation**: Ensures PDF output is > 10 KB
- **Error Handling**: Comprehensive error responses and logging

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

4. **Test the API**:
   ```bash
   # Using curl
   curl -X POST http://localhost:3000/api/build \
     -F "file=@tests/fixtures/sample.docx" \
     -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}" \
     --output output.pdf
   
   # Or use the demo page
   open http://localhost:3000
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
curl -X POST https://your-domain.vercel.app/api/build \
  -F "file=@document.docx" \
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
├── tests/
│   ├── fixtures/         # Test files
│   └── smoke.sh          # Smoke test
├── docs/                 # Documentation
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies
```

### Testing

Run the smoke test:
```bash
npm run smoke
```

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

- `NUTRIENT_API_KEY`: Your Nutrient Processor API key (required)

## License

MIT License - see [LICENSE](LICENSE) for details.
