// pages/admin/project-config.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { ProjectConfigManager } from '@/components/ProjectConfigManager/ProjectConfigManager';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

// Security check - only allow in development or specific conditions
const isDevelopment = process.env.NODE_ENV === 'development';
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname === '0.0.0.0');

const ProjectConfigAdminPage: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're in a development environment or localhost
    const checkAccess = () => {
      if (isDevelopment || isLocalhost) {
        setIsAuthorized(true);
      } else {
        console.warn('Project Config Manager: Access denied - not in development environment');
        setIsAuthorized(false);
      }
      setIsLoading(false);
    };

    checkAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">Access Restricted</div>
                <div className="text-sm">
                  The Project Configuration Manager is only available in development environments or on localhost.
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Current environment: {process.env.NODE_ENV}<br/>
                  Current hostname: {typeof window !== 'undefined' ? window.location.hostname : 'server'}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Project Configuration Manager - Admin</title>
        <meta name="description" content="Administrative interface for managing project configurations and layer settings" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Project Configuration Manager
                </h1>
                <p className="text-sm text-gray-500">
                  Administrative interface for layer and project management
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                Development Mode
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-[calc(100vh-80px)]">
          <ProjectConfigManager />
        </div>
      </div>
    </>
  );
};

export default ProjectConfigAdminPage; 