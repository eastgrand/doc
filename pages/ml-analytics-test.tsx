import React, { useState } from 'react';
import MLAnalyticsTest from '../components/MLAnalyticsTest';
import { MLAnalyticsService } from '../services/ml-analytics-service';

export default function MLAnalyticsTestPage() {
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const checkServiceHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const mlService = new MLAnalyticsService();
      const health = await mlService.checkHealth();
      setDiagnosticInfo({
        type: 'health_check',
        health,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(`Health check error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const checkMetadata = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const mlService = new MLAnalyticsService();
      const metadata = await mlService.getMetadata();
      setDiagnosticInfo({
        type: 'metadata',
        metadata,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(`Metadata check error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test direct API call to the service with custom user agent and timeout
  const testDirectConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = 'https://nesto-mortgage-analytics.onrender.com/ping';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Nesto-Direct-Test/1.0'
          }
        });
        
        clearTimeout(timeoutId);
        
        const allHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          allHeaders[key] = value;
        });
        
        const responseText = await response.text();
        
        setDiagnosticInfo({
          type: 'direct_connection',
          url,
          status: response.status,
          statusText: response.statusText,
          headers: allHeaders,
          body: responseText,
          timestamp: new Date().toISOString()
        });
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setError('Request timed out after 15 seconds. The service may be in sleep mode or experiencing issues.');
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      setError(`Direct connection test error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <h1>ML Analytics Service Integration Test</h1>
      
      <div className="diagnostic-panel">
        <h2>Service Diagnostics</h2>
        <div className="button-group">
          <button onClick={checkServiceHealth} disabled={loading} className="btn">
            {loading ? 'Checking...' : 'Check Service Health'}
          </button>
          <button onClick={checkMetadata} disabled={loading} className="btn">
            {loading ? 'Checking...' : 'Check Metadata'}
          </button>
          <button onClick={testDirectConnection} disabled={loading} className="btn">
            {loading ? 'Testing...' : 'Test Direct Connection'}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}
        
        {diagnosticInfo && (
          <div className="diagnostic-results">
            <h3>Diagnostic Results ({diagnosticInfo.type})</h3>
            <p className="timestamp">
              As of {new Date(diagnosticInfo.timestamp).toLocaleTimeString()}
            </p>
            
            {diagnosticInfo.type === 'direct_connection' && (
              <div className="connection-details">
                <div><strong>URL:</strong> {diagnosticInfo.url}</div>
                <div><strong>Status:</strong> {diagnosticInfo.status} ({diagnosticInfo.statusText})</div>
                
                {diagnosticInfo.headers && (
                  <div>
                    <strong>Response Headers:</strong>
                    <pre>{JSON.stringify(diagnosticInfo.headers, null, 2)}</pre>
                  </div>
                )}
                
                {diagnosticInfo.body && (
                  <div>
                    <strong>Response Body:</strong>
                    <pre>{diagnosticInfo.body}</pre>
                  </div>
                )}
              </div>
            )}
            
            {(diagnosticInfo.type === 'health_check' || diagnosticInfo.type === 'metadata') && (
              <pre>
                {JSON.stringify(
                  diagnosticInfo.type === 'health_check' 
                    ? diagnosticInfo.health 
                    : diagnosticInfo.metadata, 
                  null, 
                  2
                )}
              </pre>
            )}
          </div>
        )}
      </div>
      
      <hr />
      
      <MLAnalyticsTest />
      
      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        h1, h2 {
          color: #333;
        }
        
        .diagnostic-panel {
          margin-bottom: 30px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .button-group {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        
        .btn {
          padding: 8px 16px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .btn:disabled {
          background-color: #ccc;
        }
        
        .error-message {
          color: red;
          padding: 10px;
          border: 1px solid red;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        
        .diagnostic-results {
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
        }
        
        .timestamp {
          color: #666;
          font-style: italic;
          margin-bottom: 10px;
        }
        
        .connection-details {
          margin-bottom: 15px;
        }
        
        pre {
          overflow-x: auto;
          font-size: 12px;
          background-color: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
        }
        
        hr {
          margin: 30px 0;
          border: 0;
          border-top: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
} 