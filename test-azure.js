/**
 * Test script to verify Azure AI Foundry connection
 * Run with: node test-azure.js
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const azureConfig = {
  endpoint: process.env.AZURE_AI_ENDPOINT,
  modelName: process.env.AZURE_AI_MODEL_NAME,
  apiKey: process.env.AZURE_AI_API_KEY,
};

console.log('\n🔍 Testing Azure AI Foundry Connection...\n');
console.log('=' .repeat(60));

// Check configuration
console.log('\n📋 Configuration Check:');
console.log('Endpoint:', azureConfig.endpoint ? '✅ Set' : '❌ Missing');
console.log('Model Name:', azureConfig.modelName ? `✅ ${azureConfig.modelName}` : '❌ Missing');
console.log('API Key:', azureConfig.apiKey ? '✅ Set (hidden)' : '❌ Missing');

if (!azureConfig.endpoint || !azureConfig.modelName || !azureConfig.apiKey) {
  console.error('\n❌ Azure AI configuration is incomplete!');
  console.error('Please check your .env file and ensure all variables are set:');
  console.error('  - AZURE_AI_ENDPOINT');
  console.error('  - AZURE_AI_MODEL_NAME');
  console.error('  - AZURE_AI_API_KEY');
  process.exit(1);
}

// Construct endpoint - Azure AI Foundry uses different endpoint format
let endpoint;
if (azureConfig.endpoint.includes('/chat/completions')) {
  // Full endpoint provided
  endpoint = azureConfig.endpoint;
} else if (azureConfig.endpoint.includes('/api/projects/')) {
  // Azure AI Foundry format: already has /api/projects/
  endpoint = `${azureConfig.endpoint}/openai/deployments/${azureConfig.modelName}/chat/completions?api-version=2024-02-15-preview`;
} else if (azureConfig.endpoint.includes('/openai/deployments/')) {
  // Already has deployment path
  endpoint = `${azureConfig.endpoint}/chat/completions?api-version=2024-02-15-preview`;
} else {
  // Try Azure AI Foundry format
  endpoint = `${azureConfig.endpoint}/api/projects/default/openai/deployments/${azureConfig.modelName}/chat/completions?api-version=2024-02-15-preview`;
}

console.log('\n🔗 Constructed Endpoint:');
console.log(endpoint);
console.log('\n💡 Trying different endpoint formats if this fails...\n');

// Test API call
console.log('\n🚀 Testing API Call...\n');

const testMessage = {
  messages: [
    {
      role: 'user',
      content: 'Hello! This is a test message. Please respond with "Azure AI is working correctly!"'
    }
  ],
  temperature: 0.7,
  max_tokens: 100
};

try {
  console.log('Sending request to Azure AI...');
  console.log('Using authentication: api-key header');
  const startTime = Date.now();
  
  const response = await axios.post(
    endpoint,
    testMessage,
    {
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureConfig.apiKey
      },
      timeout: 30000
    }
  );

  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log('\n✅ SUCCESS! Azure AI is working correctly!\n');
  console.log('=' .repeat(60));
  console.log('\n📊 Response Details:');
  console.log('Status:', response.status);
  console.log('Response Time:', `${duration}ms`);
  console.log('\n💬 Agent Response:');
  console.log(response.data.choices[0].message.content);
  
  if (response.data.usage) {
    console.log('\n📈 Token Usage:');
    console.log('  Prompt Tokens:', response.data.usage.prompt_tokens);
    console.log('  Completion Tokens:', response.data.usage.completion_tokens);
    console.log('  Total Tokens:', response.data.usage.total_tokens);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n✅ Azure AI Foundry connection is working!');
  console.log(`📋 Agent ID (Model Name): ${azureConfig.modelName}`);
  console.log(`🔗 Endpoint: ${azureConfig.endpoint}\n`);

} catch (error) {
  console.error('\n❌ First attempt failed. Trying alternative endpoint formats...\n');
  
  // Try alternative endpoint formats
  const alternativeEndpoints = [
    // Format 1: Direct with /api/projects/default
    `${azureConfig.endpoint}/api/projects/default/openai/deployments/${azureConfig.modelName}/chat/completions?api-version=2024-02-15-preview`,
    // Format 2: Without /api/projects
    `${azureConfig.endpoint}/openai/deployments/${azureConfig.modelName}/chat/completions?api-version=2024-02-15-preview`,
    // Format 3: Extract project ID from endpoint if present
    azureConfig.endpoint.includes('/api/projects/') 
      ? `${azureConfig.endpoint.split('/api/projects/')[0]}/api/projects/${azureConfig.endpoint.split('/api/projects/')[1].split('/')[0]}/openai/deployments/${azureConfig.modelName}/chat/completions?api-version=2024-02-15-preview`
      : null
  ].filter(Boolean);

  // Also try different authentication methods
  const authMethods = [
    { name: 'api-key header', headers: { 'Content-Type': 'application/json', 'api-key': azureConfig.apiKey } },
    { name: 'Authorization Bearer', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${azureConfig.apiKey}` } }
  ];

  let success = false;
  for (let i = 0; i < alternativeEndpoints.length; i++) {
    for (let j = 0; j < authMethods.length; j++) {
      try {
        console.log(`\n🔄 Trying format ${i + 1} with ${authMethods[j].name}:`);
        console.log(alternativeEndpoints[i]);
        
        const response = await axios.post(
          alternativeEndpoints[i],
          testMessage,
          {
            headers: authMethods[j].headers,
            timeout: 30000
          }
        );

        console.log('\n✅ SUCCESS with alternative endpoint format!\n');
        console.log('=' .repeat(60));
        console.log('\n💬 Agent Response:');
        console.log(response.data.choices[0].message.content);
        console.log('\n✅ Working Endpoint:', alternativeEndpoints[i]);
        console.log(`✅ Working Auth Method: ${authMethods[j].name}`);
        console.log(`📋 Agent ID (Model Name): ${azureConfig.modelName}\n`);
        success = true;
        break;
      } catch (altError) {
        if (altError.response) {
          console.log(`❌ Failed: ${altError.response.status} - ${altError.response.data?.error?.message || 'Unknown error'}`);
        } else {
          console.log(`❌ Failed: ${altError.message}`);
        }
      }
    }
    if (success) break;
  }

  if (!success) {
    console.error('\n❌ All endpoint formats failed!\n');
    console.log('=' .repeat(60));
    
    if (error.response) {
      console.error('Original Error Status:', error.response.status);
      console.error('Original Error Message:', error.response.data?.error?.message || error.response.data);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.error('\n❌ Please check:');
    console.error('  1. Your endpoint URL format - Azure AI Foundry uses:');
    console.error('     https://<resource>.services.ai.azure.com/api/projects/<project-id>/openai/deployments/<deployment>/chat/completions');
    console.error('  2. Your API key is valid and has proper permissions');
    console.error('  3. Your model/deployment name matches exactly');
    console.error('  4. Your network connection is working');
    console.error('  5. The Azure AI service is accessible\n');
    
    process.exit(1);
  }
}

