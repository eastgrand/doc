import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
        return {
          allowedContentTypes: ['application/json'],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB limit
          tokenPayload: clientPayload // Pass through the client payload
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    );
  }
} 