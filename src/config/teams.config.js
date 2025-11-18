/**
 * Microsoft Teams Configuration
 * This module handles Teams webhook configuration for notifications
 */

export const teamsConfig = {
  webhookUrl: process.env.TEAMS_WEBHOOK_URL,
  
  /**
   * Validates Teams configuration
   * @returns {boolean} True if configuration is valid
   */
  isValid() {
    return !!this.webhookUrl;
  },
  
  /**
   * Gets Teams webhook URL
   * @returns {string} Webhook URL
   */
  getWebhookUrl() {
    if (!this.isValid()) {
      throw new Error('Teams webhook URL is not configured. Please check your environment variables.');
    }
    
    return this.webhookUrl;
  }
};

