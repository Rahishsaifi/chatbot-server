import { leaveService } from '../services/leave.service.js';
import { azureAIService } from '../services/azure-ai.service.js';
import { azureConfig } from '../config/azure.config.js';
import { dataFormatter } from '../utils/dataFormatter.js';
import { conversationState } from '../utils/conversationState.js';
import { responseBuilder } from '../utils/responseBuilder.js';
import { uiDataParser } from '../utils/uiDataParser.js';
import { logger } from '../utils/logger.js';

/**
 * Leave Agent
 * Specialized agent for handling leave-related queries
 */
class LeaveAgent {
  /**
   * Handle leave-related query
   * @param {string} query - User query
   * @param {Array} chatHistory - Chat history
   * @returns {Promise<string>} Response text
   */
  async handleQuery(query, chatHistory) {
    try {
      logger.info('Leave agent processing query', { query: query.substring(0, 50) });

      // Get leave data (from API or dummy data)
      const leaveData = await leaveService.getPendingLeaves();
      
      // Format data in human-readable format
      const formattedData = dataFormatter.formatLeaveData(leaveData);
      
      const lowerQuery = query.toLowerCase();
      
      // Determine if we should show data directly or use conversational AI
      const shouldShowData = lowerQuery.includes('balance') || 
                           lowerQuery.includes('pending') || 
                           lowerQuery.includes('leave') ||
                           lowerQuery.includes('show') ||
                           lowerQuery.includes('list') ||
                           lowerQuery.includes('what') ||
                           lowerQuery.includes('how many');

      // If Azure AI is configured, use it with formatted data
      if (azureConfig.isValid()) {
        try {
          // Create system message with formatted leave data
          const systemMessage = {
            role: 'system',
            parts: [{ 
              text: `You are an HR assistant helping with leave-related queries. Here is the current leave information in a formatted way:\n\n${formattedData}\n\nWhen the user asks about their leaves, balance, or pending applications, use this data to provide accurate, helpful responses. Be conversational and friendly. If they ask to see data, you can reference this formatted information.` 
            }]
          };

          // Build enhanced chat history with system context
          const enhancedHistory = [
            systemMessage,
            ...chatHistory
          ];

          console.log('📋 [LEAVE AGENT] Using Azure AI for leave query');
          const aiResponse = await azureAIService.generateResponse(enhancedHistory);
          
          // If user explicitly asks for data, append formatted data to AI response
          if (shouldShowData) {
            return `${aiResponse}\n\n---\n\n${formattedData}`;
          }
          
          return aiResponse;
        } catch (error) {
          logger.warn('Azure AI failed, using direct response', error);
          // Fall through to direct response
        }
      }

      // Direct response when Azure AI is not configured or failed
      // Check for leave application
      if (lowerQuery.includes('apply') || lowerQuery.includes('application') || 
          (lowerQuery.includes('leave') && (lowerQuery.includes('apply') || lowerQuery.includes('want')))) {
        const result = await this.handleLeaveApplication(query, chatHistory, 'user123');
        
        // If result has UI components, return it directly (multi-step flow)
        if (result.ui && result.ui.hasComponents) {
          return result;
        }
        
        // If completed, return success message
        if (result.completed) {
          return result;
        }
        
        return result;
      }

      // Return formatted data
      return formattedData + 
             '\n\n💡 **Tip:** You can ask me about:\n' +
             '- "What are my pending leaves?"\n' +
             '- "Show my leave balance"\n' +
             '- "How to apply for leave?"';

    } catch (error) {
      logger.error('Error in leave agent:', error);
      throw error;
    }
  }

  /**
   * Format leave data into user-friendly response (deprecated - use dataFormatter instead)
   * @param {Object} leaveData - Leave data from service
   * @returns {string} Formatted response
   * @deprecated Use dataFormatter.formatLeaveData() instead
   */
  formatLeaveResponse(leaveData) {
    return dataFormatter.formatLeaveData(leaveData);
  }

  /**
   * Handle leave application with multi-step flow
   * @param {string} query - User query
   * @param {Array} chatHistory - Chat history
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Response object with text and UI components
   */
  async handleLeaveApplication(query, chatHistory, userId = 'user123') {
    try {
      const lowerQuery = query.toLowerCase();
      
      // Get or initialize conversation state
      let state = conversationState.getState(userId);
      
      // Check if user wants to start leave application
      if (lowerQuery.includes('apply') || lowerQuery.includes('application') || 
          (lowerQuery.includes('leave') && lowerQuery.includes('want'))) {
        // Initialize state
        state = { flow: 'leaveApplication', step: 'leaveType' };
        conversationState.setState(userId, state);
        
        // Return form with leave type dropdown
        return responseBuilder.buildLeaveApplicationForm();
      }

      // If we're in leave application flow, process the input
      if (state && state.flow === 'leaveApplication') {
        // Parse data from query (may come from UI components)
        const parsedData = uiDataParser.parseQuery(query);
        
        // Merge parsed data with existing state
        state = uiDataParser.mergeWithState(state, parsedData);
        conversationState.updateState(userId, state);

        // Step 1: Ask for leave type if not provided
        if (!state.leaveType) {
          return responseBuilder.buildLeaveApplicationForm(state);
        }

        // Step 2: Ask for from date if not provided
        if (!state.fromDate) {
          return responseBuilder.buildLeaveApplicationForm(state);
        }

        // Step 3: Ask for to date if not provided
        if (!state.toDate) {
          return responseBuilder.buildLeaveApplicationForm(state);
        }

        // Step 4: Ask for reason (optional)
        if (!state.reason) {
          return responseBuilder.buildLeaveApplicationForm(state);
        }

        // All data collected - process leave application
        // TODO: Call leave service to submit application
        logger.info('Leave application submitted', state);

        // Clear state
        conversationState.clearState(userId);

        // Return success response
        const leaveTypeLabels = {
          'casual_leave': 'Casual Leave (CL)',
          'sick_leave': 'Sick Leave (SL)',
          'privilege_leave': 'Privilege Leave (PL)',
          'compensatory_off': 'Compensatory Off',
          'maternity_leave': 'Maternity Leave',
          'paternity_leave': 'Paternity Leave',
          'emergency_leave': 'Emergency Leave'
        };

        return {
          text: `✅ **Leave Application Submitted Successfully!**\n\n` +
                `📋 **Application Details:**\n` +
                `• Leave Type: ${leaveTypeLabels[state.leaveType] || state.leaveType}\n` +
                `• From Date: ${state.fromDate}\n` +
                `• To Date: ${state.toDate}\n` +
                `${state.reason ? `• Reason: ${state.reason}\n` : ''}` +
                `• Status: Pending Approval\n\n` +
                `📧 You will receive a notification once your manager reviews the request.`,
          ui: { hasComponents: false },
          completed: true
        };
      }

      // Not in flow, start it
      return responseBuilder.buildLeaveApplicationForm();

    } catch (error) {
      logger.error('Error in handleLeaveApplication:', error);
      conversationState.clearState(userId);
      return {
        text: `Sorry, I encountered an error while processing your leave application. Please try again or contact HR support.`,
        ui: { hasComponents: false }
      };
    }
  }
}

export const leaveAgent = new LeaveAgent();


