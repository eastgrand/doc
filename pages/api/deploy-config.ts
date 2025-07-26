import { NextApiRequest, NextApiResponse } from 'next';
import { projectConfigManager } from '../../services/project-config-manager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({ error: 'Missing config object in request body' });
    }

    // Use the projectConfigManager to run the full Node.js deployment process
    // The `false` argument ensures it runs in production mode, not simulation.
    const deploymentResult = await projectConfigManager.deployConfiguration(config, false);

    if (deploymentResult.success) {
      return res.status(200).json(deploymentResult);
    } else {
      console.error('Server-side deployment failed:', deploymentResult.errors);
      return res.status(500).json({
        ...deploymentResult,
        error: 'Server-side deployment process failed.'
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Fatal Deployment API error:', errorMessage);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: errorMessage
    });
  }
} 