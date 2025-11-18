import axios from 'axios';
import { azureConfig } from '../config/azure.config.js';
import { logger } from '../utils/logger.js';

/**
 * Azure AI Service
 * Handles communication with Azure AI Foundry
 */
class AzureAIService {
  /**
   * Generate response using Azure AI Foundry
   * @param {Array} chatHistory - Chat history in format [{role, parts: [{text}]}]
   * @returns {Promise<string>} Generated response text
   */
  async generateResponse(chatHistory) {
    try {
      if (!azureConfig.isValid()) {
        console.warn('⚠️ [AZURE AI] Azure AI is not configured. Skipping Azure AI call.');
        throw new Error('Azure AI Foundry is not configured. Please set environment variables.');
      }

      const config = azureConfig.getConfig();
      
      // Console log for agent ID (model name)
      console.log('🤖 [AZURE AI] Calling Azure AI Agent');
      console.log('📋 Agent ID (Model Name):', config.modelName);
      console.log('🔗 Endpoint:', config.endpoint);
      console.log('💬 Message Count:', chatHistory.length);
      
      logger.info('Calling Azure AI Foundry', { 
        agentId: config.modelName,
        endpoint: config.endpoint,
        messageCount: chatHistory.length,
        hasSystemMessage: chatHistory.some(msg => msg.role === 'system')
      });
      
      // Format chat history for Azure AI API
      const messages = chatHistory.map(msg => {
        let role = msg.role;
        // Map roles to Azure AI format
        if (role === 'model') {
          role = 'assistant';
        } else if (role === 'system') {
          role = 'system';
        } else if (role === 'user') {
          role = 'user';
        }
        
        return {
          role: role,
          content: msg.parts[0].text
        };
      }).filter(msg => msg.content); // Filter out empty messages

      // Azure AI Foundry API call
      // Supports OpenAI-compatible endpoint format
      // Endpoint format: https://{resource-name}.openai.azure.com/openai/deployments/{deployment-name}/chat/completions?api-version={api-version}
      // Or custom endpoint format if provided by user
      let endpoint;
      if (config.endpoint.includes('/chat/completions') || config.endpoint.includes('/deployments')) {
        // User provided full endpoint path
        endpoint = config.endpoint;
      } else {
        // Construct endpoint from base URL and model name
        endpoint = `${config.endpoint}/openai/deployments/${config.modelName}/chat/completions?api-version=2024-02-15-preview`;
      }
      
      const response = await axios.post(
        endpoint,
        {
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': config.apiKey
          },
          timeout: 30000
        }
      );

      const responseText = response.data.choices[0].message.content;
      
      // Console log for successful response
      console.log('✅ [AZURE AI] Response received from Agent:', config.modelName);
      console.log('📊 Tokens used:', response.data.usage?.total_tokens || 'N/A');
      
      logger.info('Azure AI response generated', {
        agentId: config.modelName,
        tokens: response.data.usage?.total_tokens
      });

      return responseText;

    } catch (error) {
      // Console log for errors
      console.error('❌ [AZURE AI] Error calling Azure AI Agent');
      if (azureConfig.isValid()) {
        const config = azureConfig.getConfig();
        console.error('📋 Agent ID (Model Name):', config.modelName);
        console.error('🔗 Endpoint:', config.endpoint);
      }
      console.error('❌ Error details:', error.message);
      
      logger.error('Azure AI service error:', error);
      
      if (error.response) {
        throw new Error(`Azure AI API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
      }
      
      throw new Error(`Azure AI service error: ${error.message}`);
    }
  }
}

export const azureAIService = new AzureAIService();

