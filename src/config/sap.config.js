/**
 * SAP SuccessFactors Configuration
 * This module handles SAP SF connection configuration
 * Currently commented out - will be enabled when SAP SF credentials are provided
 */

export const sapConfig = {
  baseUrl: process.env.SAP_SF_BASE_URL,
  clientId: process.env.SAP_SF_CLIENT_ID,
  clientSecret: process.env.SAP_SF_CLIENT_SECRET,
  username: process.env.SAP_SF_USERNAME,
  password: process.env.SAP_SF_PASSWORD,
  
  /**
   * Validates SAP SF configuration
   * @returns {boolean} True if configuration is valid
   */
  isValid() {
    return !!(this.baseUrl && this.clientId && this.clientSecret && this.username && this.password);
  },
  
  /**
   * Gets SAP SF configuration object
   * @returns {Object} Configuration object
   */
  getConfig() {
    if (!this.isValid()) {
      throw new Error('SAP SuccessFactors configuration is incomplete. Please check your environment variables.');
    }
    
    return {
      baseUrl: this.baseUrl,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      username: this.username,
      password: this.password
    };
  }
};

