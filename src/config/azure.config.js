/**
 * Azure AI Foundry Configuration
 * This module handles Azure AI Foundry connection and configuration
 */

export const azureConfig = {
  endpoint: process.env.AZURE_AI_ENDPOINT,
  modelName: process.env.AZURE_AI_MODEL_NAME,
  apiKey: process.env.AZURE_AI_API_KEY,
  
  /**
   * Validates Azure configuration
   * @returns {boolean} True if configuration is valid
   */
  isValid() {
    return !!(this.endpoint && this.modelName && this.apiKey);
  },
  
  /**
   * Gets Azure configuration object
   * @returns {Object} Configuration object
   */
  getConfig() {
    if (!this.isValid()) {
      throw new Error('Azure AI Foundry configuration is incomplete. Please check your environment variables.');
    }
    
    return {
      endpoint: this.endpoint,
      modelName: this.modelName,
      apiKey: this.apiKey
    };
  }
};

