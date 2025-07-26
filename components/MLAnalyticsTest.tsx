import React, { useState } from 'react';

export default function MLAnalyticsTest() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');

  // API Base URL for our proxy
  const API_BASE = '/api/ml-analytics';

  async function testPing() {
    setLoading(true);
    setStatus('Testing ping...');
    setError('');
    setDetails(null);
    
    try {
      const response = await fetch(`${API_BASE}?endpoint=ping`);
      
      if (response.ok) {
        const data = await response.json();
        setStatus('Ping successful!');
        setDetails(data);
      } else {
        setStatus('Ping failed');
        setError(`HTTP Error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setStatus('Ping failed');
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  async function testHealth() {
    setLoading(true);
    setStatus('Testing health endpoint...');
    setError('');
    setDetails(null);
    
    try {
      const response = await fetch(`${API_BASE}?endpoint=health`);
      
      if (response.ok) {
        const data = await response.json();
        setStatus('Health check successful!');
        setDetails(data);
      } else {
        setStatus('Health check failed');
        setError(`HTTP Error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setStatus('Health check failed');
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  async function testMetadata() {
    setLoading(true);
    setStatus('Testing metadata endpoint...');
    setError('');
    setDetails(null);
    
    try {
      const response = await fetch(`${API_BASE}?endpoint=metadata`);
      
      if (response.ok) {
        const data = await response.json();
        setStatus('Metadata check successful!');
        setDetails(data);
      } else {
        setStatus('Metadata check failed');
        setError(`HTTP Error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setStatus('Metadata check failed');
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">ML Analytics Connection Test</h2>
      
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={testPing} 
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test Ping
        </button>
        
        <button 
          onClick={testHealth} 
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Test Health
        </button>
        
        <button 
          onClick={testMetadata} 
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Test Metadata
        </button>
      </div>
      
      {status && (
        <div className="mb-2">
          <span className="font-medium">Status:</span> {status}
          {loading && <span className="ml-2">Loading...</span>}
        </div>
      )}
      
      {error && (
        <div className="mb-2 text-red-600">
          {error}
        </div>
      )}
      
      {details && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Response Details:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-80">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 