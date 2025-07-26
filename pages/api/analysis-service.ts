import type { NextApiRequest, NextApiResponse } from 'next';
import { AnalysisServiceRequest } from '@/lib/analytics/types';
import { AnalysisResult } from '@/types/analysis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResult | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const requestData: AnalysisServiceRequest = req.body;
  const baseUrl = process.env.NEXT_PUBLIC_SHAP_MICROSERVICE_URL;
  const apiKey = process.env.NEXT_PUBLIC_SHAP_MICROSERVICE_API_KEY;

  if (!baseUrl) {
    console.error('SHAP microservice URL not configured');
    return res.status(500).json({ error: 'Analysis service is not configured.' });
  }

  try {
    // 1. Submit the analysis job to the microservice
    const submitResponse = await fetch(`${baseUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'X-API-Key': apiKey }),
      },
      body: JSON.stringify(requestData),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error(`Failed to submit analysis: ${submitResponse.statusText}`, errorText);
      throw new Error(`Failed to submit analysis: ${submitResponse.statusText}`);
    }

    const submitResult = await submitResponse.json();
    const jobId = submitResult.job_id;

    if (!jobId) {
      throw new Error('No job ID returned from analysis service');
    }

    // 2. Poll for the results
    const maxPollingTime = 300000; // 5 minutes
    const pollingInterval = 5000; // 5 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxPollingTime) {
      const statusResponse = await fetch(`${baseUrl}/job_status/${jobId}`, {
        headers: {
          ...(apiKey && { 'X-API-Key': apiKey }),
        },
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to check job status: ${statusResponse.statusText}`);
      }

      const statusResult = await statusResponse.json();

      if (statusResult.status === 'completed' || statusResult.status === 'finished') {
        if (statusResult.result && !statusResult.result.success) {
          throw new Error(`Analysis failed: ${statusResult.result.error || 'Unknown error'}`);
        }
        
        const result: any = {
          summary: statusResult.result?.summary || 'Analysis completed successfully.',
          feature_importance: statusResult.result?.feature_importance || [],
          results: statusResult.result?.results || [],
          visualizationData: statusResult.result?.visualizationData || [],
          popupConfig: statusResult.result?.popupConfig || null
        };
        
        return res.status(200).json(result);
      } else if (statusResult.status === 'failed') {
        throw new Error(`Analysis job failed: ${statusResult.error || statusResult.result?.error || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollingInterval));
    }

    throw new Error('Analysis timed out after 5 minutes.');

  } catch (error) {
    console.error('Error in analysis-service API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(500).json({ error: `Failed to get analysis from AI service: ${errorMessage}` });
  }
} 