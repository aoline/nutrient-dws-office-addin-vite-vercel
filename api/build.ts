import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    
    // Extract file and instructions from the form data
    const file = formData.get('file') as File;
    const instructions = formData.get('instructions') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Missing file in request' },
        { status: 400 }
      );
    }
    
    if (!instructions) {
      return NextResponse.json(
        { error: 'Missing instructions in request' },
        { status: 400 }
      );
    }
    
    // Validate instructions is valid JSON
    let parsedInstructions;
    try {
      parsedInstructions = JSON.parse(instructions);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in instructions' },
        { status: 400 }
      );
    }
    
    // Validate that instructions has the expected structure
    if (!parsedInstructions.parts || !parsedInstructions.output) {
      return NextResponse.json(
        { error: 'Invalid instructions format: missing parts or output' },
        { status: 400 }
      );
    }
    
    // Create new FormData for the Nutrient API
    const nutrientFormData = new FormData();
    nutrientFormData.append('file', file);
    nutrientFormData.append('instructions', instructions);
    
    // Get API key from environment variable
    const apiKey = process.env.NUTRIENT_API_KEY;
    if (!apiKey) {
      console.error('NUTRIENT_API_KEY not configured');
      return NextResponse.json(
        { error: 'Service not configured' },
        { status: 500 }
      );
    }
    
    // Forward the request to the Nutrient Processor API
    const nutrientResponse = await fetch('https://api.nutrient.io/build', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: nutrientFormData,
    });
    
    if (!nutrientResponse.ok) {
      const errorText = await nutrientResponse.text();
      console.error('Nutrient API error:', nutrientResponse.status, errorText);
      return NextResponse.json(
        { error: `Nutrient API error: ${nutrientResponse.status}` },
        { status: nutrientResponse.status }
      );
    }
    
    // Get the PDF response
    const pdfBuffer = await nutrientResponse.arrayBuffer();
    
    // Validate PDF size (must be > 10 KB as per requirements)
    if (pdfBuffer.byteLength < 10240) {
      return NextResponse.json(
        { error: `PDF too small: ${pdfBuffer.byteLength} bytes (minimum 10 KB required)` },
        { status: 400 }
      );
    }
    
    // Return the PDF with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });
    
  } catch (error) {
    console.error('Error in /api/build:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
