import { leaveAgent } from './leave.agent.js';
import { holidayAgent } from './holiday.agent.js';
import { attendanceAgent } from './attendance.agent.js';
import { azureAIService } from '../services/azure-ai.service.js';
import { azureConfig } from '../config/azure.config.js';
import { logger } from '../utils/logger.js';

/**
 * Agent Orchestrator
 * Routes queries to appropriate specialized agents based on intent
 */
class AgentOrchestrator {
  /**
   * Process user query and route to appropriate agent
   * @param {string} query - User query
   * @param {Array} chatHistory - Full chat history
   * @returns {Promise<string>} Agent response
   */
  async processQuery(query, chatHistory) {
    try {
      // Detect intent using Azure AI
      const intent = await this.detectIntent(query);

      logger.info('Intent detected', { intent, query: query.substring(0, 50) });

      // Route to appropriate agent
      switch (intent) {
        case 'leave':
        case 'leaves':
        case 'pending_leaves':
          return await leaveAgent.handleQuery(query, chatHistory);

        case 'holiday':
        case 'holidays':
          return await holidayAgent.handleQuery(query, chatHistory);

        case 'attendance':
        case 'regularize':
        case 'regularization':
          return await attendanceAgent.handleQuery(query, chatHistory);

        default:
          // Use general Azure AI for conversational responses if configured
          if (azureConfig.isValid()) {
            try {
              // Add system context for general conversations
              const systemMessage = {
                role: 'system',
                parts: [{ 
                  text: `You are a helpful HR assistant chatbot. You help employees with:\n- Leave management (balance, applications, policies)\n- Holiday information (calendar, upcoming holidays)\n- Attendance tracking and regularization\n\nBe friendly, conversational, and helpful. If the user asks about something outside these topics, politely guide them back to HR-related queries.` 
                }]
              };

              const enhancedHistory = [
                systemMessage,
                ...chatHistory
              ];

              return await azureAIService.generateResponse(enhancedHistory);
            } catch (error) {
              logger.error('Azure AI failed for general conversation:', error);
              // Fall through to fallback
            }
          }
          
          // Fallback response when Azure AI is not configured
          return "I'm here to help you with:\n\n" +
                 "📋 **Leaves** - Check your leave balance, pending leaves, and apply for leaves\n" +
                 "📅 **Holidays** - View company holidays, upcoming holidays, and holiday calendar\n" +
                 "⏰ **Attendance** - Check attendance status and regularize attendance\n\n" +
                 "Please ask me about leaves, holidays, or attendance. For example:\n" +
                 "- 'What are my pending leaves?'\n" +
                 "- 'Show me upcoming holidays'\n" +
                 "- 'Regularize attendance for 2024-01-15'";
      }

    } catch (error) {
      logger.error('Error in processQuery:', error);
      // Fallback response
      if (azureConfig.isValid()) {
        try {
          return await azureAIService.generateResponse(chatHistory);
        } catch (aiError) {
          logger.error('Azure AI fallback also failed:', aiError);
        }
      }
      return "I apologize, but I encountered an error processing your request. Please try rephrasing your question or contact support if the issue persists.";
    }
  }

  /**
   * Detect user intent from query
   * @param {string} query - User query
   * @returns {Promise<string>} Detected intent
   */
  async detectIntent(query) {
    const lowerQuery = query.toLowerCase();

    // Intent detection keywords
    if (lowerQuery.includes('leave') || lowerQuery.includes('pending leave') || 
        lowerQuery.includes('leave balance') || lowerQuery.includes('casual leave') ||
        lowerQuery.includes('sick leave') || lowerQuery.includes('privilege leave')) {
      return 'leave';
    }
    if (lowerQuery.includes('holiday') || lowerQuery.includes('holidays') ||
        lowerQuery.includes('public holiday') || lowerQuery.includes('company holiday')) {
      return 'holiday';
    }
    if (lowerQuery.includes('attendance') || 
        lowerQuery.includes('regularize') || 
        lowerQuery.includes('regularization') ||
        lowerQuery.includes('mark attendance') || lowerQuery.includes('attendance status')) {
      return 'attendance';
    }

    // If Azure AI is configured, use it for intent detection
    if (azureConfig.isValid()) {
      try {
        const intentPrompt = `Analyze this query and respond with only one word: "leave", "holiday", or "attendance". Query: ${query}`;
        const response = await azureAIService.generateResponse([{
          role: 'user',
          parts: [{ text: intentPrompt }]
        }]);
        
        const detectedIntent = response.toLowerCase().trim();
        if (['leave', 'holiday', 'attendance'].includes(detectedIntent)) {
          return detectedIntent;
        }
      } catch (error) {
        logger.warn('Intent detection failed, using keyword matching', error);
      }
    }

    return 'general';
  }
}

export const agentOrchestrator = new AgentOrchestrator();

