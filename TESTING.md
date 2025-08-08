# Testing Guide

This guide covers how to test each part of the Nutrient DWS Office Add-in implementation.

## 🚀 Quick Start

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the demo page**: http://localhost:3000

## 📋 Test Checklist

### ✅ 1. Environment Setup
- [ ] `.env` file exists with `NUTRIENT_PROCESSOR_API_KEY`
- [ ] Development server starts without errors
- [ ] Demo page loads at http://localhost:3000

### ✅ 2. API Endpoint Testing
- [ ] `/api/build` accepts multipart form data
- [ ] Returns PDF with correct content-type
- [ ] PDF size > 10 KB
- [ ] Handles errors gracefully

### ✅ 3. Demo Page Testing
- [ ] Logo displays correctly
- [ ] "Run Demo" button works
- [ ] Shows success/error messages
- [ ] Downloads PDF automatically

### ✅ 4. File Handling
- [ ] Accepts real DOCX files
- [ ] Processes test fixtures
- [ ] Validates file requirements

## 🧪 Detailed Testing Steps

### 1. Environment Setup Test

```bash
# Check if environment variables are loaded
grep -i nutrient .env

# Expected output:
# NUTRIENT_PROCESSOR_API_KEY=pdf_live_...
# NUTRIENT_VIEWER_API_KEY=pdf_live_...
# NUTRIENT_API_BASE=https://api.nutrient.io
```

### 2. API Endpoint Testing

#### Test with curl (Command Line)
```bash
# Test with real DOCX file
curl -X POST http://localhost:3000/api/build \
  -F "file=@tests/fixtures/Sample.docx" \
  -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}" \
  --output /tmp/test-output.pdf \
  -v

# Check the response
file /tmp/test-output.pdf
ls -la /tmp/test-output.pdf

# Expected results:
# - HTTP 200 status
# - Content-Type: application/pdf
# - File size > 10 KB
```

#### Test with different files
```bash
# Test with placeholder file
curl -X POST http://localhost:3000/api/build \
  -F "file=@tests/fixtures/sample.docx" \
  -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}" \
  --output /tmp/placeholder-output.pdf

# Test error handling (missing file)
curl -X POST http://localhost:3000/api/build \
  -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}" \
  -v

# Expected: HTTP 400 with "Missing file in request"
```

### 3. Demo Page Testing

#### Manual Testing Steps
1. **Open browser**: http://localhost:3000
2. **Verify logo**: Should display in top-left corner
3. **Check page layout**: Modern design with proper spacing
4. **Test demo button**:
   - Click "Run Demo"
   - Watch for loading state ("🔄 Processing...")
   - Verify success message appears
   - Check that PDF downloads automatically
   - Verify file size > 10 KB

#### Browser Developer Tools Testing
```javascript
// Test the API directly from browser console
const testFile = new File(['Test content'], 'test.docx', { 
  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
});

const formData = new FormData();
formData.append('file', testFile);
formData.append('instructions', JSON.stringify({
  parts: [{ file: 'file' }],
  output: { type: 'pdf' }
}));

fetch('/api/build', {
  method: 'POST',
  body: formData
})
.then(response => {
  console.log('Status:', response.status);
  console.log('Content-Type:', response.headers.get('content-type'));
  return response.blob();
})
.then(blob => {
  console.log('File size:', blob.size, 'bytes');
  console.log('Is PDF:', blob.type === 'application/pdf');
});
```

### 4. Smoke Test

```bash
# Run the automated smoke test
npm run smoke

# Expected output:
# Using test file: tests/fixtures/Sample.docx
# OK application/pdf 52495
```

### 5. Error Handling Tests

#### Test missing API key
```bash
# Temporarily rename .env file
mv .env .env.backup

# Test API (should return mock PDF)
curl -X POST http://localhost:3000/api/build \
  -F "file=@tests/fixtures/Sample.docx" \
  -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}" \
  --output /tmp/mock-output.pdf

# Restore .env file
mv .env.backup .env
```

#### Test invalid JSON
```bash
curl -X POST http://localhost:3000/api/build \
  -F "file=@tests/fixtures/Sample.docx" \
  -F "instructions=invalid-json" \
  -v

# Expected: HTTP 400 with "Invalid JSON in instructions"
```

#### Test missing required fields
```bash
curl -X POST http://localhost:3000/api/build \
  -F "file=@tests/fixtures/Sample.docx" \
  -v

# Expected: HTTP 400 with "Missing instructions in request"
```

## 🔍 Component Testing

### API Component Tests

#### Test FormData parsing
```bash
# Test with minimal valid data
curl -X POST http://localhost:3000/api/build \
  -F "file=@tests/fixtures/Sample.docx" \
  -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}" \
  -H "Content-Type: multipart/form-data" \
  -v
```

#### Test PDF validation
```bash
# The API should reject PDFs < 10 KB
# This is handled automatically by the Nutrient API
# Our mock PDF ensures > 10 KB for testing
```

### UI Component Tests

#### Test logo loading
```bash
# Check if logo file exists
ls -la public/logo.jpeg

# Test logo URL in browser
curl -I http://localhost:3000/logo.jpeg
# Expected: HTTP 200
```

#### Test responsive design
1. Open browser dev tools
2. Toggle device toolbar
3. Test different screen sizes
4. Verify layout adapts properly

## 🐛 Debugging

### Common Issues

#### API returns empty response
```bash
# Check server logs
# Look for errors in terminal where npm run dev is running

# Check if API key is loaded
echo $NUTRIENT_PROCESSOR_API_KEY
```

#### Demo page doesn't load
```bash
# Check if Next.js server is running
ps aux | grep next

# Check for TypeScript errors
npx tsc --noEmit
```

#### File upload fails
```bash
# Check file permissions
ls -la tests/fixtures/

# Check file size
du -h tests/fixtures/Sample.docx
```

### Debug Commands

```bash
# Check all environment variables
cat .env

# Check API endpoint directly
curl -v http://localhost:3000/api/build

# Check if files exist
find tests/fixtures -type f -name "*.docx" -o -name "*.pdf"

# Check server status
curl -s http://localhost:3000 | head -10
```

## 📊 Performance Testing

### Load Testing
```bash
# Test with multiple concurrent requests
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/build \
    -F "file=@tests/fixtures/Sample.docx" \
    -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}" \
    --output /tmp/test-$i.pdf &
done
wait
```

### Response Time Testing
```bash
# Measure response time
time curl -X POST http://localhost:3000/api/build \
  -F "file=@tests/fixtures/Sample.docx" \
  -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}" \
  --output /tmp/timing-test.pdf
```

## 🎯 Acceptance Criteria

### Must Pass
- [ ] API returns HTTP 200 for valid requests
- [ ] PDF output > 10 KB
- [ ] Content-Type: application/pdf
- [ ] Demo page loads without errors
- [ ] Logo displays correctly
- [ ] Error handling works for invalid requests
- [ ] Smoke test passes

### Nice to Have
- [ ] Response time < 15 seconds
- [ ] UI is responsive on mobile
- [ ] Error messages are user-friendly
- [ ] Demo page provides helpful information

## 🚨 Rollback Testing

### Test rollback procedure
```bash
# Switch to main branch
git checkout main

# Verify main branch is stable
npm run dev

# Test that main branch works
curl -X POST http://localhost:3000/api/build \
  -F "file=@tests/fixtures/Sample.docx" \
  -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}" \
  --output /tmp/main-test.pdf

# Switch back to feature branch
git checkout feature/api-build-proxy
```

This testing guide ensures you can thoroughly test each component of the implementation before deploying to production.
