// route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, studyArea, reportTemplate } = body;

    if (!token) {
      return NextResponse.json({
        error: 'Missing API key',
        details: 'API key is required'
      }, { status: 400 });
    }

    // Format the request data
    const formData = new URLSearchParams();
    formData.append('f', 'json');
    formData.append('token', token);
    formData.append('report', reportTemplate);
    formData.append('format', 'html');
    formData.append('studyAreas', JSON.stringify([studyArea]));
    formData.append('langCode', 'en-us');

    // Make request to ArcGIS
    const response = await axios.post(
      'https://geoenrichment.arcgis.com/arcgis/rest/services/World/GeoenrichmentServer/Infographics/CreateReport',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    if (response.data.error) {
      console.error('ArcGIS API error:', response.data.error);
      return NextResponse.json({
        error: 'ArcGIS API error',
        details: response.data.error.message || JSON.stringify(response.data.error)
      }, { status: 400 });
    }

    // Return the report HTML
    const reportHtml = response.data.results?.[0]?.value?.reportHtml;
    if (!reportHtml) {
      return NextResponse.json({
        error: 'Invalid response',
        details: 'No report HTML in response'
      }, { status: 400 });
    }

    return NextResponse.json({ reportHtml });

  } catch (error) {
    console.error('Report generation error:', error);
    
    let errorMessage = 'Unknown error';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = error.response.data?.error?.message || error.message;
          statusCode = error.response.status;
        }
      }
    }

    return NextResponse.json({
      error: 'Report generation failed',
      details: errorMessage
    }, { status: statusCode });
  }
}