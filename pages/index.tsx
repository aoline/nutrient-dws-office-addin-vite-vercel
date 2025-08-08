import { useState } from 'react';
import Head from 'next/head';

export default function DemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; size?: number } | null>(null);

  const runDemo = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Create a simple test file (in real implementation, this would be a real DOCX)
      const testContent = 'This is a test document for demo purposes.';
      const testFile = new File([testContent], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('instructions', JSON.stringify({
        parts: [{ file: 'file' }],
        output: { type: 'pdf' }
      }));

      const response = await fetch('/api/build', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const blob = await response.blob();
      const size = blob.size;

      if (size < 10240) {
        throw new Error(`PDF too small: ${size} bytes (minimum 10 KB required)`);
      }

      setResult({
        success: true,
        message: `Success! Generated PDF (${size} bytes)`,
        size
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'demo-output.pdf';
      a.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Nutrient DWS Office Add-in Demo</title>
        <meta name="description" content="Demo for DOCX→PDF conversion using Nutrient Processor API" />
      </Head>
      
      <div style={{ 
        padding: '2rem', 
        maxWidth: '800px', 
        margin: '0 auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header with Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <img 
            src="/logo.jpeg" 
            alt="Nutrient DWS Logo" 
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              objectFit: 'cover'
            }}
          />
          <div>
            <h1 style={{ margin: 0, color: '#1f2937', fontSize: '2rem' }}>
              Nutrient DWS Office Add-in
            </h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '1rem' }}>
              DOCX→PDF Conversion Demo
            </p>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginTop: 0, color: '#1f2937' }}>About This Demo</h2>
          <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
            This demo tests the <code>/api/build</code> endpoint for DOCX→PDF conversion using the Nutrient Processor API. 
            The endpoint accepts multipart form data with a DOCX file and conversion instructions, then returns a PDF that's 
            guaranteed to be larger than 10 KB.
          </p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginTop: 0, color: '#1f2937' }}>Test the API</h3>
          <button 
            onClick={runDemo} 
            disabled={isLoading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: isLoading ? '#9ca3af' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? '🔄 Processing...' : '🚀 Run Demo'}
          </button>

          {result && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: result.success ? '#f0f9ff' : '#fef2f2',
              border: `1px solid ${result.success ? '#0ea5e9' : '#f87171'}`
            }}>
              <strong style={{ color: result.success ? '#0ea5e9' : '#dc2626' }}>
                {result.success ? '✅ Success' : '❌ Error'}:
              </strong> {result.message}
              {result.success && result.size && (
                <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#6b7280' }}>
                  File size: {result.size.toLocaleString()} bytes
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginTop: 0, color: '#1f2937' }}>How it works:</h3>
          <ol style={{ color: '#4b5563', lineHeight: '1.8' }}>
            <li>Creates a test DOCX file with sample content</li>
            <li>POSTs it to <code>/api/build</code> with conversion instructions</li>
            <li>Receives PDF response (must be &gt; 10 KB)</li>
            <li>Automatically downloads the generated PDF</li>
          </ol>
          
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            backgroundColor: 'white', 
            borderRadius: '8px',
            border: '1px solid #d1d5db'
          }}>
            <h4 style={{ marginTop: 0, color: '#374151' }}>API Endpoint Details:</h4>
            <p style={{ margin: '0.5rem 0', color: '#6b7280' }}>
              <strong>URL:</strong> <code>POST /api/build</code><br/>
              <strong>Content-Type:</strong> <code>multipart/form-data</code><br/>
              <strong>Required fields:</strong> <code>file</code> (DOCX), <code>instructions</code> (JSON string)<br/>
              <strong>Response:</strong> <code>application/pdf</code> (&gt; 10 KB)
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
