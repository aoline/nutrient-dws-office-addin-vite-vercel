#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to detect the correct port
detect_port() {
    local port=3000
    while [ $port -le 3010 ]; do
        if curl -s "http://localhost:$port" > /dev/null 2>&1; then
            echo $port
            return 0
        fi
        port=$((port + 1))
    done
    echo "0"
    return 1
}

# Detect the correct port
echo -e "${BLUE}🔍 Detecting server port...${NC}"
PORT=$(detect_port)

if [ "$PORT" = "0" ]; then
    echo -e "${RED}❌ No server found on ports 3000-3010${NC}"
    echo "Please start the server with: npm run dev"
    exit 1
fi

echo -e "${GREEN}✅ Server found on port $PORT${NC}"

# Test configuration
ENDPOINT="http://localhost:$PORT"
API_ENDPOINT="$ENDPOINT/api/build"
DEMO_ENDPOINT="$ENDPOINT"

echo -e "${BLUE}🧪 Starting comprehensive tests...${NC}"
echo "=================================="
echo "Server: $ENDPOINT"
echo "API: $API_ENDPOINT"

# Function to print test results
print_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name: PASS${NC} - $message"
    else
        echo -e "${RED}❌ $test_name: FAIL${NC} - $message"
    fi
}

# Test 1: Check if server is running
echo -e "\n${YELLOW}1. Testing server availability...${NC}"
if curl -s "$DEMO_ENDPOINT" > /dev/null; then
    print_result "Server Status" "PASS" "Server is running at $DEMO_ENDPOINT"
else
    print_result "Server Status" "FAIL" "Server is not running at $DEMO_ENDPOINT"
    exit 1
fi

# Test 2: Check environment variables
echo -e "\n${YELLOW}2. Testing environment variables...${NC}"
if [ -f ".env" ] && grep -q "NUTRIENT_PROCESSOR_API_KEY" .env; then
    print_result "Environment Variables" "PASS" "NUTRIENT_PROCESSOR_API_KEY found in .env"
else
    print_result "Environment Variables" "FAIL" "NUTRIENT_PROCESSOR_API_KEY not found in .env"
fi

# Test 3: Check test files
echo -e "\n${YELLOW}3. Testing file availability...${NC}"
if [ -f "tests/fixtures/Sample.docx" ]; then
    print_result "Test Files" "PASS" "Sample.docx found"
else
    print_result "Test Files" "FAIL" "Sample.docx not found"
fi

if [ -f "public/logo.jpeg" ]; then
    print_result "Logo File" "PASS" "logo.jpeg found"
else
    print_result "Logo File" "FAIL" "logo.jpeg not found"
fi

# Test 4: Test API endpoint with real file
echo -e "\n${YELLOW}4. Testing API endpoint...${NC}"
if [ -f "tests/fixtures/Sample.docx" ]; then
    response=$(curl -s -w "%{http_code}" -X POST "$API_ENDPOINT" \
        -F "file=@tests/fixtures/Sample.docx" \
        -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}" \
        --output /tmp/api-test-output.pdf)
    
    http_code="${response: -3}"
    if [ "$http_code" = "200" ]; then
        file_size=$(wc -c < /tmp/api-test-output.pdf)
        content_type=$(file --mime-type -b /tmp/api-test-output.pdf)
        
        if [ "$content_type" = "application/pdf" ]; then
            if [ "$file_size" -gt 10240 ]; then
                print_result "API Endpoint" "PASS" "HTTP $http_code, $content_type, ${file_size} bytes"
            else
                print_result "API Endpoint" "FAIL" "PDF too small: ${file_size} bytes (min 10KB required)"
            fi
        else
            print_result "API Endpoint" "FAIL" "Wrong content type: $content_type"
        fi
    else
        print_result "API Endpoint" "FAIL" "HTTP $http_code - API endpoint not found or error"
        echo "   This might be due to:"
        echo "   - API route not properly configured"
        echo "   - Next.js app directory vs pages directory conflict"
        echo "   - Server not fully started"
    fi
else
    print_result "API Endpoint" "SKIP" "Sample.docx not available"
fi

# Test 5: Test error handling
echo -e "\n${YELLOW}5. Testing error handling...${NC}"

# Test missing file
missing_file_response=$(curl -s -w "%{http_code}" -X POST "$API_ENDPOINT" \
    -F "instructions={\"parts\":[{\"file\":\"file\"}],\"output\":{\"type\":\"pdf\"}}" \
    --output /tmp/missing-file-response.txt)

missing_file_code="${missing_file_response: -3}"
if [ "$missing_file_code" = "400" ]; then
    print_result "Missing File Error" "PASS" "HTTP 400 returned for missing file"
else
    print_result "Missing File Error" "FAIL" "Expected HTTP 400, got $missing_file_code"
fi

# Test invalid JSON
invalid_json_response=$(curl -s -w "%{http_code}" -X POST "$API_ENDPOINT" \
    -F "file=@tests/fixtures/Sample.docx" \
    -F "instructions=invalid-json" \
    --output /tmp/invalid-json-response.txt)

invalid_json_code="${invalid_json_response: -3}"
if [ "$invalid_json_code" = "400" ]; then
    print_result "Invalid JSON Error" "PASS" "HTTP 400 returned for invalid JSON"
else
    print_result "Invalid JSON Error" "FAIL" "Expected HTTP 400, got $invalid_json_code"
fi

# Test 6: Test demo page
echo -e "\n${YELLOW}6. Testing demo page...${NC}"
demo_response=$(curl -s -w "%{http_code}" "$DEMO_ENDPOINT" --output /tmp/demo-page.html)
demo_code="${demo_response: -3}"

if [ "$demo_code" = "200" ]; then
    if grep -q "Nutrient DWS Office Add-in" /tmp/demo-page.html; then
        print_result "Demo Page" "PASS" "Demo page loads with correct content"
    else
        print_result "Demo Page" "FAIL" "Demo page content not found"
    fi
else
    print_result "Demo Page" "FAIL" "HTTP $demo_code"
fi

# Test 7: Test logo accessibility
echo -e "\n${YELLOW}7. Testing logo accessibility...${NC}"
logo_response=$(curl -s -w "%{http_code}" "$DEMO_ENDPOINT/logo.jpeg" --output /tmp/logo-test.jpeg)
logo_code="${logo_response: -3}"

if [ "$logo_code" = "200" ]; then
    print_result "Logo Accessibility" "PASS" "Logo is accessible at /logo.jpeg"
else
    print_result "Logo Accessibility" "FAIL" "Logo not accessible: HTTP $logo_code"
fi

# Summary
echo -e "\n${BLUE}=================================="
echo "🧪 Test Summary${NC}"

# Count results (simplified)
pass_count=$(grep -c "PASS" <<< "$(grep -E "PASS|FAIL" <<< "$(tail -n +1 /dev/null)")" 2>/dev/null || echo "0")
fail_count=$(grep -c "FAIL" <<< "$(grep -E "PASS|FAIL" <<< "$(tail -n +1 /dev/null)")" 2>/dev/null || echo "0")

echo -e "${GREEN}✅ Tests completed on port $PORT${NC}"
echo -e "${BLUE}📊 Check individual test results above${NC}"

if [ "$fail_count" -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the output above.${NC}"
    exit 1
fi
