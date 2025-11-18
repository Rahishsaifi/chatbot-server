import { agentOrchestrator } from '../agents/orchestrator.js';
import { logger } from '../utils/logger.js';

/**
 * Message Service
 * Business logic layer for processing chatbot messages
 */
class MessageService {
  /**
   * Process incoming message and route to appropriate agent
   * @param {Array} contents - Chat history contents
   * @returns {Promise<Object>} Response object with text
   */
  async processMessage(contents) {
    try {
      // Extract the latest user message
      const latestMessage = contents[contents.length - 1];
      const userQuery = latestMessage.parts[0].text;

      logger.info('Processing message', {
        query: userQuery.substring(0, 100) // Log first 100 chars
      });

      // Route to agent orchestrator
      const response = await agentOrchestrator.processQuery(userQuery, contents);

      // Handle both string responses and structured responses with UI components
      if (typeof response === 'string') {
        return {
          text: response,
          ui: { hasComponents: false }
        };
      }

      // Structured response (with UI components)
      return {
        text: response.text || response,
        ui: response.ui || { hasComponents: false },
        completed: response.completed || false
      };

    } catch (error) {
      logger.error('Error in processMessage:', error);
      throw error;
    }
  }
}

export const messageService = new MessageService();

