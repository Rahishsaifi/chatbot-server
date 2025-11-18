/**
 * Microsoft Teams Service
 * Handles Teams webhook notifications for attendance regularization
 * 
 * NOTE: This service is currently commented out and will be enabled
 * when Teams webhook URL is provided.
 * 
 * To enable:
 * 1. Set TEAMS_WEBHOOK_URL in .env
 * 2. Uncomment the code below
 */

// import axios from 'axios';
// import { teamsConfig } from '../config/teams.config.js';
// import { logger } from '../utils/logger.js';

/**
 * Teams Service
 * Handles Microsoft Teams webhook notifications
 */
class TeamsService {
  /**
   * Send attendance regularization notification to Teams
   * @param {Object} regularizationRecord - Regularization record
   * @returns {Promise<void>}
   */
  // async sendRegularizationNotification(regularizationRecord) {
  //   try {
  //     if (!teamsConfig.isValid()) {
  //       logger.warn('Teams webhook not configured, skipping notification');
  //       return;
  //     }

  //     const webhookUrl = teamsConfig.getWebhookUrl();

  //     // Format Teams message card
  //     const messageCard = {
  //       '@type': 'MessageCard',
  //       '@context': 'https://schema.org/extensions',
  //       summary: 'Attendance Regularization Request',
  //       themeColor: '0078D4',
  //       title: 'New Attendance Regularization Request',
  //       sections: [
  //         {
  //           activityTitle: `Employee: ${regularizationRecord.userId}`,
  //           activitySubtitle: `Date: ${regularizationRecord.date}`,
  //           facts: [
  //             {
  //               name: 'Date',
  //               value: regularizationRecord.date
  //             },
  //             {
  //               name: 'Reason',
  //               value: regularizationRecord.reason
  //             },
  //             {
  //               name: 'Status',
  //               value: regularizationRecord.status
  //             },
  //             {
  //               name: 'Submitted At',
  //               value: new Date(regularizationRecord.submittedAt).toLocaleString()
  //             }
  //           ],
  //           markdown: true
  //         }
  //       ],
  //       potentialAction: [
  //         {
  //           '@type': 'OpenUri',
  //           name: 'View Details',
  //           targets: [
  //             {
  //               os: 'default',
  //               uri: `https://your-hr-portal.com/attendance/${regularizationRecord.id}`
  //             }
  //           ]
  //         }
  //       ]
  //     };

  //     await axios.post(webhookUrl, messageCard, {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       timeout: 10000
  //     });

  //     logger.info('Teams notification sent successfully', {
  //       recordId: regularizationRecord.id
  //     });

  //   } catch (error) {
  //     logger.error('Error sending Teams notification:', error);
  //     // Don't throw error - notification failure shouldn't break the flow
  //   }
  // }

  /**
   * Send approval notification to employee
   * @param {Object} regularizationRecord - Regularization record
   * @param {string} status - 'approved' or 'rejected'
   * @returns {Promise<void>}
   */
  // async sendApprovalNotification(regularizationRecord, status) {
  //   try {
  //     if (!teamsConfig.isValid()) {
  //       logger.warn('Teams webhook not configured, skipping notification');
  //       return;
  //     }

  //     const webhookUrl = teamsConfig.getWebhookUrl();

  //     const messageCard = {
  //       '@type': 'MessageCard',
  //       '@context': 'https://schema.org/extensions',
  //       summary: `Attendance Regularization ${status}`,
  //       themeColor: status === 'approved' ? '28A745' : 'DC3545',
  //       title: `Attendance Regularization ${status.charAt(0).toUpperCase() + status.slice(1)}`,
  //       sections: [
  //         {
  //           activityTitle: `Your attendance regularization request has been ${status}`,
  //           facts: [
  //             {
  //               name: 'Date',
  //               value: regularizationRecord.date
  //             },
  //             {
  //               name: 'Reason',
  //               value: regularizationRecord.reason
  //             },
  //             {
  //               name: 'Status',
  //               value: status
  //             }
  //           ],
  //           markdown: true
  //         }
  //       ]
  //     };

  //     await axios.post(webhookUrl, messageCard, {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       timeout: 10000
  //     });

  //     logger.info('Teams approval notification sent', {
  //       recordId: regularizationRecord.id,
  //       status
  //     });

  //   } catch (error) {
  //     logger.error('Error sending Teams approval notification:', error);
  //   }
  // }
}

export const teamsService = new TeamsService();

