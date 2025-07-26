import type { NextApiRequest, NextApiResponse } from 'next';

// Proxies analysis requests to the external SHAP micro-service, allowing the
// front-end to call a same-origin URL (/api/analyze-proxy) and avoid CORS or
// mixed-content errors.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const baseUrl = process.env.NEXT_PUBLIC_SHAP_MICROSERVICE_URL ||
                  'https://shap-demographic-analytics-v3.onrender.com';
  const apiKey = process.env.NEXT_PUBLIC_SHAP_MICROSERVICE_API_KEY;

  try {
    const upstreamResponse = await fetch(`${baseUrl.replace(/\/$/, '')}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
      },
      body: JSON.stringify(req.body),
    });

    const text = await upstreamResponse.text();
    res.status(upstreamResponse.status)
       .setHeader('Content-Type', 'application/json')
       .send(text);
  } catch (err: any) {
    console.error('Analyze proxy error:', err);
    res.status(500).json({ error: 'proxy_error', message: err?.message || 'Unknown error' });
  }
} 