# 🚀 Quick Testing Reference

## Start Testing

```bash
# 1. Start the server
npm run dev

# 2. Run all tests
npm run test:all

# 3. Or test individually
npm run smoke    # API endpoint test
npm run test     # Comprehensive tests
```

## Manual Testing Checklist

### ✅ Environment
- [ ] Server running: `http://localhost:3000`
- [ ] `.env` file exists with API keys
- [ ] No TypeScript errors: `npx tsc --noEmit`

### ✅ API Endpoint (`/api/build`)
```bash
# Test with real DOCX
curl -X POST http://localhost:3000/api/build \
  -F "file=@tests/fixtures/Sample.docx" \
  -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}" \
  --output test-output.pdf

# Check result
file test-output.pdf
ls -la test-output.pdf  # Should be > 10 KB
```

### ✅ Demo Page (`/`)
1. Open: http://localhost:3000
2. Verify logo displays
3. Click "Run Demo"
4. Check PDF downloads automatically
5. Verify success message appears

### ✅ Error Handling
```bash
# Test missing file
curl -X POST http://localhost:3000/api/build \
  -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}"

# Test invalid JSON
curl -X POST http://localhost:3000/api/build \
  -F "file=@tests/fixtures/Sample.docx" \
  -F "instructions=invalid-json"
```

## 🎯 Expected Results

### API Success
- HTTP 200 status
- Content-Type: application/pdf
- File size > 10 KB
- PDF opens correctly

### Error Cases
- Missing file: HTTP 400
- Invalid JSON: HTTP 400
- Missing instructions: HTTP 400

### Demo Page
- Logo displays in header
- Modern UI design
- "Run Demo" button works
- Success/error messages show
- PDF downloads automatically

## 🐛 Common Issues

### Server not starting
```bash
# Check if port 3000 is in use
lsof -ti:3000
# Kill if needed
kill -9 $(lsof -ti:3000)
```

### API key issues
```bash
# Check .env file
cat .env | grep NUTRIENT
```

### File not found
```bash
# Check test files
ls -la tests/fixtures/
```

## 📊 Performance Targets

- Response time: < 15 seconds
- PDF size: > 10 KB
- Success rate: 100% for valid requests
- Error handling: Graceful for invalid requests

## 🔄 Rollback Testing

```bash
# Test main branch
git checkout main
npm run dev
npm run test

# Return to feature branch
git checkout feature/api-build-proxy
```

---

**Need help?** Check `TESTING.md` for detailed testing guide.
