import { attendanceService } from '../services/attendance.service.js';
import { azureAIService } from '../services/azure-ai.service.js';
import { azureConfig } from '../config/azure.config.js';
import { dataFormatter } from '../utils/dataFormatter.js';
import { conversationState } from '../utils/conversationState.js';
import { responseBuilder } from '../utils/responseBuilder.js';
import { uiDataParser } from '../utils/uiDataParser.js';
import { logger } from '../utils/logger.js';

/**
 * Attendance Agent
 * Specialized agent for handling attendance-related queries including regularization
 */
class AttendanceAgent {
  /**
   * Handle attendance-related query
   * @param {string} query - User query
   * @param {Array} chatHistory - Chat history
   * @returns {Promise<string>} Response text
   */
  async handleQuery(query, chatHistory) {
    try {
      // Console log agent ID first
      console.log('📅 [ATTENDANCE AGENT] Processing attendance query');
      if (azureConfig.isValid()) {
        const config = azureConfig.getConfig();
        console.log('📋 Agent ID (Model Name):', config.modelName);
        console.log('🔗 Endpoint:', config.endpoint);
      } else {
        console.log('⚠️ Azure AI not configured - using direct response');
      }
      
      logger.info('Attendance agent processing query', { query: query.substring(0, 50) });

      const lowerQuery = query.toLowerCase();

      // Get attendance data (from API or dummy data)
      const attendanceData = await attendanceService.getAttendanceStatus();
      
      // Format data in human-readable format
      const formattedData = dataFormatter.formatAttendanceData(attendanceData);

      // Check for regularization query - handle this separately as it's an action
      if (lowerQuery.includes('regularize') || lowerQuery.includes('regularization')) {
        const result = await this.handleRegularization(query, chatHistory, 'user123');
        
        // If result has UI components, return it directly (multi-step flow)
        if (result.ui && result.ui.hasComponents) {
          return result;
        }
        
        // If completed, optionally enhance with Azure AI
        if (result.completed && azureConfig.isValid()) {
          try {
            const systemMessage = {
              role: 'system',
              parts: [{ 
                text: `You are an HR assistant. The user just completed an attendance regularization request. Provide a friendly confirmation.` 
              }]
            };

            const enhancedHistory = [
              systemMessage,
              ...chatHistory.slice(0, -1),
              {
                role: 'user',
                parts: [{ text: query }]
              }
            ];

            console.log('📅 [ATTENDANCE AGENT] Using Azure AI for attendance query');
            const aiResponse = await azureAIService.generateResponse(enhancedHistory);
            return {
              text: `${aiResponse}\n\n---\n\n${result.text}`,
              ui: { hasComponents: false },
              completed: true
            };
          } catch (error) {
            logger.warn('Azure AI failed for regularization, using direct response', error);
          }
        }
        
        return result;
      }

      // Determine if we should show data directly
      const shouldShowData = lowerQuery.includes('status') || 
                           lowerQuery.includes('record') || 
                           lowerQuery.includes('check') ||
                           lowerQuery.includes('show') ||
                           lowerQuery.includes('attendance') ||
                           lowerQuery.includes('what') ||
                           lowerQuery.includes('how');

      // If Azure AI is configured, use it with formatted data
      if (azureConfig.isValid()) {
        try {
          // Create system message with formatted attendance data
          const systemMessage = {
            role: 'system',
            parts: [{ 
              text: `You are an HR assistant helping with attendance-related queries. Here is the user's attendance information:\n\n${formattedData}\n\nWhen the user asks about their attendance, provide a friendly, conversational response that naturally incorporates this information. Present the data in a clear, easy-to-read format within your response. Be helpful and professional. Do NOT just repeat the raw data - explain it in a conversational way and format it nicely.` 
            }]
          };

          // Build enhanced chat history with system context
          const enhancedHistory = [
            systemMessage,
            ...chatHistory
          ];

          console.log('📅 [ATTENDANCE AGENT] Using Azure AI for attendance query');
          const aiResponse = await azureAIService.generateResponse(enhancedHistory);
          
          // Azure AI should already incorporate the data in its response
          // Only return the AI response, which should naturally include the attendance information
          return aiResponse;
        } catch (error) {
          logger.warn('Azure AI failed, using direct response', error);
          // Fall through to direct response
        }
      }

      // Direct response when Azure AI is not configured or failed
      return formattedData +
             '\n\n💡 **Tip:** You can ask me:\n' +
             '- "Check my attendance status"\n' +
             '- "Regularize attendance for [date], reason: [reason]"\n' +
             '- "Show attendance records"';

    } catch (error) {
      logger.error('Error in attendance agent:', error);
      throw error;
    }
  }

  /**
   * Handle attendance regularization with multi-step flow
   * @param {string} query - User query
   * @param {Array} chatHistory - Chat history
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Response object with text and UI components
   */
  async handleRegularization(query, chatHistory, userId = 'user123') {
    try {
      const lowerQuery = query.toLowerCase();
      
      // Get or initialize conversation state
      let state = conversationState.getState(userId);
      
      // Check if user wants to start regularization
      if (lowerQuery.includes('regularize') || lowerQuery.includes('regularization')) {
        // Initialize state
        state = { flow: 'regularization', step: 'date' };
        conversationState.setState(userId, state);
        
        // Return form with date picker
        return responseBuilder.buildRegularizationForm();
      }

      // If we're in regularization flow, process the input
      if (state && state.flow === 'regularization') {
        // Parse data from query (may come from UI components)
        const parsedData = uiDataParser.parseQuery(query);
        
        // Merge parsed data with existing state
        state = uiDataParser.mergeWithState(state, parsedData);
        conversationState.updateState(userId, state);

        // Step 1: Ask for date if not provided
        if (!state.date) {
          return responseBuilder.buildRegularizationForm(state);
        }

        // Step 2: Ask for reason if not provided
        if (!state.reason) {
          return responseBuilder.buildRegularizationForm(state);
        }

        // Step 3: If reason is "other", ask for custom reason
        if (state.reason === 'other' && !state.customReason) {
          return responseBuilder.buildRegularizationForm(state);
        }

        // All data collected - process regularization
        const finalReason = state.reason === 'other' 
          ? state.customReason 
          : state.reason;

        const result = await attendanceService.regularizeAttendance({
          date: state.date,
          reason: finalReason,
          userId
        });

        // Clear state
        conversationState.clearState(userId);

        const formattedResult = dataFormatter.formatRegularizationResult(result);
        
        // Return success response
        return {
          text: formattedResult,
          ui: { hasComponents: false },
          completed: true
        };
      }

      // Not in flow, start it
      return responseBuilder.buildRegularizationForm();

    } catch (error) {
      logger.error('Error in handleRegularization:', error);
      conversationState.clearState(userId);
      return {
        text: `Sorry, I encountered an error while processing your attendance regularization request. Please try again or contact HR support.`,
        ui: { hasComponents: false }
      };
    }
  }

  /**
   * Format attendance status response (deprecated - use dataFormatter instead)
   * @param {Object} attendanceData - Attendance data
   * @returns {string} Formatted response
   * @deprecated Use dataFormatter.formatAttendanceData() instead
   */
  formatAttendanceStatus(attendanceData) {
    return dataFormatter.formatAttendanceData(attendanceData);
  }
}

export const attendanceAgent = new AttendanceAgent();


