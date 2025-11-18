import { leaveData } from '../data/dummy-data.js';
// import { sapService } from './sap.service.js'; // Uncomment when SAP SF is configured
import { logger } from '../utils/logger.js';

/**
 * Leave Service
 * Handles leave-related business logic
 */
class LeaveService {
  /**
   * Get pending leaves for user
   * @param {string} userId - User ID (optional, defaults to demo user)
   * @returns {Promise<Object>} Leave data including balance and pending leaves
   */
  async getPendingLeaves(userId = 'user123') {
    try {
      logger.info('Fetching pending leaves', { userId });

      // TODO: Uncomment when SAP SF is configured
      // return await sapService.getPendingLeaves(userId);

      // Using dummy data for now
      return leaveData;

    } catch (error) {
      logger.error('Error in getPendingLeaves:', error);
      throw error;
    }
  }

  /**
   * Get leave context for AI agent
   * @returns {Promise<string>} Context string
   */
  async getLeaveContext() {
    const leaveData = await this.getPendingLeaves();
    
    let context = 'Leave Information:\n';
    context += `Leave Balance:\n`;
    leaveData.leaveBalance.forEach(leave => {
      context += `- ${leave.type}: ${leave.available} available, ${leave.used} used, ${leave.total} total\n`;
    });

    if (leaveData.pendingLeaves && leaveData.pendingLeaves.length > 0) {
      context += `\nPending Leaves:\n`;
      leaveData.pendingLeaves.forEach(leave => {
        context += `- ${leave.fromDate} to ${leave.toDate}: ${leave.type} (${leave.status})\n`;
      });
    }

    return context;
  }
}

export const leaveService = new LeaveService();

