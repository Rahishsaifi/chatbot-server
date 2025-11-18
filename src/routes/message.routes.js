import express from 'express';
import { messageController } from '../controllers/message.controller.js';
import { validateMessage } from '../middleware/validator.js';

const router = express.Router();

/**
 * POST /message
 * Main endpoint for chatbot messages
 * Accepts chat history and returns AI-generated response
 */
router.post('/', validateMessage, messageController.handleMessage);

export default router;

