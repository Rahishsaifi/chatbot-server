/**
 * Cosmos DB Configuration
 * This module handles Cosmos DB connection configuration
 */

export const cosmosConfig = {
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY,
  databaseName: process.env.COSMOS_DB_DATABASE_NAME || 'hr_chatbot_db',
  containerName: process.env.COSMOS_DB_CONTAINER_NAME || 'attendance_regularizations',
  
  /**
   * Validates Cosmos DB configuration
   * @returns {boolean} True if configuration is valid
   */
  isValid() {
    return !!(this.endpoint && this.key);
  },
  
  /**
   * Gets Cosmos DB configuration object
   * @returns {Object} Configuration object
   */
  getConfig() {
    if (!this.isValid()) {
      throw new Error('Cosmos DB configuration is incomplete. Please check your environment variables.');
    }
    
    return {
      endpoint: this.endpoint,
      key: this.key,
      databaseName: this.databaseName,
      containerName: this.containerName
    };
  }
};

