import { holidayData } from '../data/dummy-data.js';
// import { sapService } from './sap.service.js'; // Uncomment when SAP SF is configured
import { logger } from '../utils/logger.js';

/**
 * Holiday Service
 * Handles holiday-related business logic
 */
class HolidayService {
  /**
   * Get all holidays
   * @returns {Promise<Array>} Array of holiday objects
   */
  async getAllHolidays() {
    try {
      logger.info('Fetching all holidays');

      // TODO: Uncomment when SAP SF is configured
      // return await sapService.getAllHolidays();

      // Using dummy data for now
      return holidayData;

    } catch (error) {
      logger.error('Error in getAllHolidays:', error);
      throw error;
    }
  }

  /**
   * Get upcoming holidays
   * @param {number} limit - Number of holidays to return (default: 5)
   * @returns {Promise<Array>} Array of upcoming holiday objects
   */
  async getUpcomingHolidays(limit = 5) {
    try {
      const allHolidays = await this.getAllHolidays();
      const today = new Date();
      
      const upcoming = allHolidays
        .filter(holiday => {
          const holidayDate = new Date(holiday.date);
          return holidayDate >= today;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, limit);

      return upcoming;

    } catch (error) {
      logger.error('Error in getUpcomingHolidays:', error);
      throw error;
    }
  }

  /**
   * Get holidays by month
   * @param {string} month - Month name (e.g., 'january', 'december')
   * @returns {Promise<Array>} Array of holiday objects for the month
   */
  async getHolidaysByMonth(month) {
    try {
      const allHolidays = await this.getAllHolidays();
      const monthIndex = new Date(`${month} 1, 2024`).getMonth();
      
      const monthHolidays = allHolidays.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate.getMonth() === monthIndex;
      });

      return monthHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));

    } catch (error) {
      logger.error('Error in getHolidaysByMonth:', error);
      throw error;
    }
  }

  /**
   * Get holiday context for AI agent
   * @returns {Promise<string>} Context string
   */
  async getHolidayContext() {
    const holidays = await this.getUpcomingHolidays(10);
    
    let context = 'Upcoming Holidays:\n';
    holidays.forEach(holiday => {
      context += `- ${holiday.date}: ${holiday.name} (${holiday.type || 'Company Holiday'})\n`;
    });

    return context;
  }
}

export const holidayService = new HolidayService();

