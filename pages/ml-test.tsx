import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Load the test component dynamically to avoid SSR issues with fetch
const MLAnalyticsTest = dynamic(
  () => import('../components/MLAnalyticsTest'),
  { ssr: false }
);

const MLTestPage: NextPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>ML Analytics Connection Test</title>
      </Head>
      
      <h1 className="text-2xl font-bold mb-6">ML Analytics Connection Test</h1>
      <p className="mb-6 text-gray-600">
        This page tests the connection to the SHAP/XGBoost Analytics API.
        The service is hosted at <code className="bg-gray-200 px-1 rounded">nesto-mortgage-analytics.onrender.com</code>.
      </p>
      
      <MLAnalyticsTest />
      
      <div className="mt-8 border-t pt-6 text-sm text-gray-500">
        <h2 className="font-medium text-lg mb-2">Debug Information</h2>
        <p>
          If you&apos;re experiencing connection issues, remember that the Render.com free tier puts services to sleep 
          after 15 minutes of inactivity. The first request may take 30-60 seconds to wake the service.
        </p>
        <ul className="list-disc list-inside my-2">
          <li>Try testing the &quot;/ping&quot; endpoint first</li>
          <li>Wait a few minutes after successful ping before trying authenticated endpoints</li>
          <li>The service should be fully operational after warming up</li>
        </ul>
      </div>
    </div>
  );
};

export default MLTestPage; 