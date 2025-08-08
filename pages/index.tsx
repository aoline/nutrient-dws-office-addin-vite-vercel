import { useState } from 'react';

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
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Nutrient DWS Office Add-in Demo</h1>
      <p>This demo tests the /api/build endpoint for DOCX→PDF conversion.</p>
      
      <button 
        onClick={runDemo} 
        disabled={isLoading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1
        }}
      >
        {isLoading ? 'Processing...' : 'Run Demo'}
      </button>

      {result && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          borderRadius: '6px',
          backgroundColor: result.success ? '#f0f9ff' : '#fef2f2',
          border: `1px solid ${result.success ? '#0ea5e9' : '#f87171'}`
        }}>
          <strong>{result.success ? '✅ Success' : '❌ Error'}:</strong> {result.message}
          {result.success && result.size && (
            <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#666' }}>
              File size: {result.size.toLocaleString()} bytes
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <h3>How it works:</h3>
        <ol>
          <li>Creates a test DOCX file</li>
          <li>POSTs it to <code>/api/build</code> with instructions</li>
          <li>Receives PDF response (must be &gt; 10 KB)</li>
          <li>Automatically downloads the generated PDF</li>
        </ol>
      </div>
    </div>
  );
}
