import { holidayService } from '../services/holiday.service.js';
import { azureAIService } from '../services/azure-ai.service.js';
import { azureConfig } from '../config/azure.config.js';
import { dataFormatter } from '../utils/dataFormatter.js';
import { logger } from '../utils/logger.js';

/**
 * Holiday Agent
 * Specialized agent for handling holiday-related queries
 */
class HolidayAgent {
  /**
   * Handle holiday-related query
   * @param {string} query - User query
   * @param {Array} chatHistory - Chat history
   * @returns {Promise<string>} Response text
   */
  async handleQuery(query, chatHistory) {
    try {
      logger.info('Holiday agent processing query', { query: query.substring(0, 50) });

      const lowerQuery = query.toLowerCase();
      
      // Get holiday data (from API or dummy data)
      let holidays = [];
      let formattedData = '';
      let title = 'Holidays';

      // Determine what data to fetch based on query
      if (lowerQuery.includes('upcoming') || lowerQuery.includes('next')) {
        holidays = await holidayService.getUpcomingHolidays();
        formattedData = dataFormatter.formatUpcomingHolidays(holidays);
        title = 'Upcoming Holidays';
      } else if (lowerQuery.includes('all') || lowerQuery.includes('list') || lowerQuery.includes('calendar')) {
        holidays = await holidayService.getAllHolidays();
        formattedData = dataFormatter.formatHolidayData(holidays, 'All Company Holidays');
        title = 'All Holidays';
      } else {
        // Check for specific month
        const monthMatch = query.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i);
        if (monthMatch) {
          const month = monthMatch[1].toLowerCase();
          holidays = await holidayService.getHolidaysByMonth(month);
          formattedData = dataFormatter.formatHolidayData(holidays, `Holidays in ${month.charAt(0).toUpperCase() + month.slice(1)}`);
          title = `${month.charAt(0).toUpperCase() + month.slice(1)} Holidays`;
        } else {
          // Default: upcoming holidays
          holidays = await holidayService.getUpcomingHolidays(10);
          formattedData = dataFormatter.formatUpcomingHolidays(holidays);
          title = 'Upcoming Holidays';
        }
      }

      // Get all holidays for context
      const allHolidays = await holidayService.getAllHolidays();
      const allHolidaysFormatted = dataFormatter.formatHolidayData(allHolidays, 'All Holidays');

      // Determine if we should show data directly
      const shouldShowData = lowerQuery.includes('show') || 
                           lowerQuery.includes('list') || 
                           lowerQuery.includes('what') ||
                           lowerQuery.includes('when') ||
                           lowerQuery.includes('holiday') ||
                           lowerQuery.includes('calendar');

      // If Azure AI is configured, use it with formatted data
      if (azureConfig.isValid()) {
        try {
          // Create system message with formatted holiday data
          const systemMessage = {
            role: 'system',
            parts: [{ 
              text: `You are an HR assistant helping with holiday-related queries. Here is the holiday information in a formatted way:\n\n${allHolidaysFormatted}\n\nWhen the user asks about holidays, upcoming holidays, or specific months, use this data to provide accurate, helpful responses. Be conversational and friendly. If they ask to see data, you can reference this formatted information.` 
            }]
          };

          // Build enhanced chat history with system context
          const enhancedHistory = [
            systemMessage,
            ...chatHistory
          ];

          console.log('📅 [HOLIDAY AGENT] Using Azure AI for holiday query');
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
      return formattedData +
             '\n\n💡 **Tip:** You can ask me:\n' +
             '- "Show me all holidays"\n' +
             '- "What holidays are in December?"\n' +
             '- "Upcoming holidays"';

    } catch (error) {
      logger.error('Error in holiday agent:', error);
      throw error;
    }
  }

  /**
   * Format upcoming holidays response (deprecated - use dataFormatter instead)
   * @param {Array} holidays - Holiday data
   * @returns {string} Formatted response
   * @deprecated Use dataFormatter.formatUpcomingHolidays() instead
   */
  formatUpcomingHolidays(holidays) {
    return dataFormatter.formatUpcomingHolidays(holidays);
  }

  /**
   * Format all holidays response (deprecated - use dataFormatter instead)
   * @param {Array} holidays - Holiday data
   * @returns {string} Formatted response
   * @deprecated Use dataFormatter.formatHolidayData() instead
   */
  formatAllHolidays(holidays) {
    return dataFormatter.formatHolidayData(holidays, 'All Company Holidays');
  }

  /**
   * Format holidays by month response (deprecated - use dataFormatter instead)
   * @param {Array} holidays - Holiday data
   * @param {string} month - Month name
   * @returns {string} Formatted response
   * @deprecated Use dataFormatter.formatHolidayData() instead
   */
  formatHolidaysByMonth(holidays, month) {
    return dataFormatter.formatHolidayData(holidays, `Holidays in ${month.charAt(0).toUpperCase() + month.slice(1)}`);
  }
}

export const holidayAgent = new HolidayAgent();

