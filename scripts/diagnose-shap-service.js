#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

const API_ENDPOINT = 'https://nesto-mortgage-analytics.onrender.com';
const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_SHAP_API_KEY || 'default_key';
const TIMEOUT_MS = 10000; // 10 seconds

async function checkServiceEndpoint() {
  console.log('Checking SHAP service root endpoint...');
  try {
    const response = await axios.get(API_ENDPOINT, { timeout: TIMEOUT_MS });
    console.log('Root endpoint response:', response.data);
    return true;
  } catch (error) {
    console.error('Error connecting to service root endpoint:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. The service may be overloaded or unresponsive.');
    } else {
      console.error(error.message);
    }
    return false;
  }
}

async function checkServiceHealth() {
  console.log('\nChecking service health...');
  try {
    const response = await axios.get(`${API_ENDPOINT}/health`, {
      headers: { 'X-API-KEY': API_KEY },
      timeout: TIMEOUT_MS
    });
    console.log('Health check response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error checking service health:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. The service may be overloaded or unresponsive.');
    } else {
      console.error(error.message);
    }
    return false;
  }
}

async function checkMetadata() {
  console.log('\nChecking service metadata...');
  try {
    const response = await axios.get(`${API_ENDPOINT}/metadata`, {
      headers: { 'X-API-KEY': API_KEY },
      timeout: TIMEOUT_MS
    });
    console.log('Metadata response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Extract column names for reference
    if (response.data && response.data.dataset_info && response.data.dataset_info.columns) {
      console.log('\nAvailable columns:');
      console.log(response.data.dataset_info.columns.join(', '));
    }
    
    return true;
  } catch (error) {
    console.error('Error checking metadata:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. The service may be overloaded or unresponsive.');
    } else {
      console.error(error.message);
    }
    return false;
  }
}

async function submitSimpleJob() {
  console.log('\nSubmitting a simple test job...');
  try {
    // Create a simple query that should work based on the logs we've seen
    const testParams = {
      query: "simple test query",
      analysis_type: "correlation",
      target_variable: "property_value", // Based on the error logs, this column should exist
      comparison_variable: "mortgage_rate" // We're guessing this column exists too
    };
    
    console.log('Test parameters:', testParams);
    
    const response = await axios.post(`${API_ENDPOINT}/analyze`, testParams, {
      headers: { 
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY 
      },
      timeout: TIMEOUT_MS
    });
    
    console.log('Job submission response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.job_id) {
      console.log(`\nJob ID: ${response.data.job_id}`);
      console.log('Checking job status immediately...');
      await checkJobStatus(response.data.job_id);
      
      // Wait a bit and check again
      console.log('\nWaiting 5 seconds before checking again...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      await checkJobStatus(response.data.job_id);
    }
    
    return true;
  } catch (error) {
    console.error('Error submitting test job:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. The service may be overloaded or unresponsive.');
    } else {
      console.error(error.message);
    }
    return false;
  }
}

async function checkJobStatus(jobId) {
  try {
    console.log(`Checking status for job ${jobId}...`);
    const response = await axios.get(`${API_ENDPOINT}/job_status/${jobId}`, {
      headers: { 'X-API-KEY': API_KEY },
      timeout: TIMEOUT_MS
    });
    
    console.log('Job status response:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error checking job status:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. The service may be overloaded or unresponsive.');
    } else {
      console.error(error.message);
    }
    return null;
  }
}

async function main() {
  console.log('======================================');
  console.log('SHAP Service Diagnostic Tool');
  console.log('======================================');
  console.log(`API Endpoint: ${API_ENDPOINT}`);
  console.log(`API Key: ${API_KEY.substring(0, 3)}...${API_KEY.substring(API_KEY.length - 3)}`);
  console.log('======================================\n');
  
  // Check service connectivity
  await checkServiceEndpoint();
  
  // Check health
  const healthOk = await checkServiceHealth();
  
  // Check metadata (contains column information)
  if (healthOk) {
    await checkMetadata();
  }
  
  // Submit a simple job to test the full flow
  if (healthOk) {
    await submitSimpleJob();
  }
  
  console.log('\n======================================');
  console.log('Diagnostic complete');
  console.log('======================================');
}

main().catch(error => {
  console.error('Unhandled error during diagnostics:', error);
  process.exit(1);
}); 