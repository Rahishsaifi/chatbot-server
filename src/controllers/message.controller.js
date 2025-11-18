import { messageService } from '../services/message.service.js';
import { logger } from '../utils/logger.js';

/**
 * Message Controller
 * Handles HTTP requests for chatbot messages
 */
class MessageController {
  /**
   * Handle incoming message request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async handleMessage(req, res, next) {
    try {
      const { contents } = req.body;
      
      logger.info('Received message request', {
        messageCount: contents.length
      });

      // Process message through service layer
      const response = await messageService.processMessage(contents);

      // Return response in format expected by frontend
      // Include UI components if present
      const responseData = {
        candidates: [{
          content: {
            parts: [{
              text: response.text
            }]
          }
        }]
      };

      // Add UI components if present
      if (response.ui && response.ui.hasComponents) {
        responseData.ui = response.ui;
      }

      // Add completion status if present
      if (response.completed !== undefined) {
        responseData.completed = response.completed;
      }

      res.status(200).json(responseData);

    } catch (error) {
      logger.error('Error in handleMessage:', error);
      next(error);
    }
  }
}

export const messageController = new MessageController();

