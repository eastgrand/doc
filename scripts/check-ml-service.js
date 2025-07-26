#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

const API_ENDPOINT = 'https://shap-demographic-analytics-v3.onrender.com';
const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_SHAP_API_KEY || 'default_key';

async function checkServiceHealth() {
  try {
    console.log(`Checking health of ML service at ${API_ENDPOINT}...`);
    const response = await axios.get(`${API_ENDPOINT}/health`, {
      headers: {
        'X-API-KEY': API_KEY
      }
    });
    
    console.log('Service health check result:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error checking service health:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

async function getServiceMetadata() {
  try {
    console.log(`\nGetting metadata from ML service...`);
    const response = await axios.get(`${API_ENDPOINT}/metadata`, {
      headers: {
        'X-API-KEY': API_KEY
      }
    });
    
    console.log('Service metadata:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error getting service metadata:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

async function submitTestQuery() {
  try {
    console.log(`\nSubmitting test query to ML service...`);
    const testQuery = {
      query: "test analysis query",
      analysis_type: "correlation",
      target_variable: "income"
    };
    
    const response = await axios.post(`${API_ENDPOINT}/analyze`, testQuery, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      }
    });
    
    console.log('Test query response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // If we got a job_id, check its status
    if (response.data.job_id) {
      console.log(`\nChecking status of job ${response.data.job_id}...`);
      await checkJobStatus(response.data.job_id);
    }
    
    return true;
  } catch (error) {
    console.error('Error submitting test query:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

async function checkJobStatus(jobId, maxTries = 3) {
  let tries = 0;
  
  while (tries < maxTries) {
    try {
      const response = await axios.get(`${API_ENDPOINT}/job_status/${jobId}`, {
        headers: {
          'X-API-KEY': API_KEY
        }
      });
      
      console.log(`Job status (try ${tries + 1}/${maxTries}):`);
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.data.status === 'completed') {
        return true;
      }
      
      // Wait a bit before checking again
      console.log('Waiting 2 seconds before checking again...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      tries++;
    } catch (error) {
      console.error('Error checking job status:');
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(error.response.data);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }
  
  console.log(`Reached maximum number of tries (${maxTries}). Job may still be processing.`);
  return false;
}

async function main() {
  console.log('ML Service Connection Test');
  console.log('========================');
  
  const healthOk = await checkServiceHealth();
  if (!healthOk) {
    console.error('\nFailed to connect to ML service. Please check your API key and endpoint URL.');
    process.exit(1);
  }
  
  await getServiceMetadata();
  await submitTestQuery();
  
  console.log('\nML service connection test completed.');
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 