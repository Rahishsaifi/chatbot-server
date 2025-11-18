import { attendanceData } from '../data/dummy-data.js';
// import { cosmosService } from './cosmos.service.js'; // Uncomment when Cosmos DB is configured
// import { teamsService } from './teams.service.js'; // Uncomment when Teams webhook is configured
// import { sapService } from './sap.service.js'; // Uncomment when SAP SF is configured
import { logger } from '../utils/logger.js';

/**
 * Attendance Service
 * Handles attendance-related business logic including regularization
 */
class AttendanceService {
  /**
   * Get attendance status for user
   * @param {string} userId - User ID (optional, defaults to demo user)
   * @returns {Promise<Object>} Attendance status data
   */
  async getAttendanceStatus(userId = 'user123') {
    try {
      logger.info('Fetching attendance status', { userId });

      // TODO: Uncomment when SAP SF is configured
      // return await sapService.getAttendanceStatus(userId);

      // Using dummy data for now
      return attendanceData;

    } catch (error) {
      logger.error('Error in getAttendanceStatus:', error);
      throw error;
    }
  }

  /**
   * Regularize attendance
   * @param {Object} regularizationData - { date, reason, userId }
   * @returns {Promise<Object>} Result object with message and status
   */
  async regularizeAttendance(regularizationData) {
    try {
      const { date, reason, userId } = regularizationData;

      logger.info('Processing attendance regularization', {
        date,
        userId,
        reason: reason.substring(0, 50)
      });

      // Validate input
      if (!date || !reason) {
        throw new Error('Date and reason are required for attendance regularization');
      }

      // Create regularization record
      const regularizationRecord = {
        id: `reg_${Date.now()}`,
        userId,
        date,
        reason,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        managerId: 'manager123' // In production, get from user profile
      };

      // TODO: Uncomment when Cosmos DB is configured
      // await cosmosService.saveRegularization(regularizationRecord);

      // TODO: Uncomment when Teams webhook is configured
      // await teamsService.sendRegularizationNotification(regularizationRecord);

      // For now, just log the record
      logger.info('Attendance regularization record created', regularizationRecord);

      return {
        success: true,
        message: `✅ Your attendance regularization request has been submitted successfully!\n\n` +
                 `📅 Date: ${date}\n` +
                 `📝 Reason: ${reason}\n` +
                 `⏳ Status: Under review with L1 Manager, Anamika\n\n` +
                 `You will receive a notification on Teams once your manager reviews the request.`,
        recordId: regularizationRecord.id
      };

    } catch (error) {
      logger.error('Error in regularizeAttendance:', error);
      throw error;
    }
  }

  /**
   * Get attendance context for AI agent
   * @returns {Promise<string>} Context string
   */
  async getAttendanceContext() {
    const attendanceStatus = await this.getAttendanceStatus();
    
    let context = 'Attendance Information:\n';
    context += `Total Days: ${attendanceStatus.totalDays}\n`;
    context += `Present Days: ${attendanceStatus.presentDays}\n`;
    context += `Absent Days: ${attendanceStatus.absentDays}\n`;
    context += `Attendance Percentage: ${attendanceStatus.attendancePercentage}%\n`;

    if (attendanceStatus.irregularities && attendanceStatus.irregularities.length > 0) {
      context += `\nIrregularities:\n`;
      attendanceStatus.irregularities.forEach(irregularity => {
        context += `- ${irregularity.date}: ${irregularity.reason}\n`;
      });
    }

    return context;
  }
}

export const attendanceService = new AttendanceService();

