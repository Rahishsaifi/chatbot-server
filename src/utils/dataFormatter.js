/**
 * Data Formatter Utility
 * Formats data from APIs or dummy JSON into human-readable format
 */

class DataFormatter {
  /**
   * Format leave data into human-readable text
   * @param {Object} leaveData - Leave data object
   * @returns {string} Formatted text
   */
  formatLeaveData(leaveData) {
    if (!leaveData || !leaveData.leaveBalance) {
      return 'No leave information available.';
    }

    let formatted = '📋 **Leave Information:**\n\n';
    
    // Leave Balance Section
    formatted += '**Leave Balance:**\n';
    leaveData.leaveBalance.forEach(leave => {
      const percentage = ((leave.available / leave.total) * 100).toFixed(0);
      formatted += `• **${leave.type}**: ${leave.available} days available out of ${leave.total} days (${percentage}% remaining)\n`;
    });

    // Pending Leaves Section
    if (leaveData.pendingLeaves && leaveData.pendingLeaves.length > 0) {
      formatted += '\n⏳ **Pending Leave Applications:**\n';
      leaveData.pendingLeaves.forEach((leave, index) => {
        formatted += `\n${index + 1}. **${leave.type}**\n`;
        formatted += `   📅 Dates: ${leave.fromDate} to ${leave.toDate}\n`;
        formatted += `   📝 Reason: ${leave.reason || 'Not specified'}\n`;
        formatted += `   📊 Status: ${leave.status}\n`;
        formatted += `   📆 Applied: ${leave.appliedDate || 'N/A'}\n`;
      });
    } else {
      formatted += '\n✅ **No pending leave applications.**\n';
    }

    return formatted;
  }

  /**
   * Format holiday data into human-readable text
   * @param {Array} holidays - Array of holiday objects
   * @param {string} title - Optional title for the section
   * @returns {string} Formatted text
   */
  formatHolidayData(holidays, title = 'Holidays') {
    if (!holidays || holidays.length === 0) {
      return `📅 No ${title.toLowerCase()} found.`;
    }

    let formatted = `📅 **${title}:**\n\n`;
    
    holidays.forEach((holiday, index) => {
      const date = new Date(holiday.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      formatted += `${index + 1}. **${holiday.name}**\n`;
      formatted += `   📅 Date: ${formattedDate} (${dayName})\n`;
      if (holiday.type) {
        formatted += `   🏷️ Type: ${holiday.type}\n`;
      }
      if (holiday.description) {
        formatted += `   📝 ${holiday.description}\n`;
      }
      formatted += '\n';
    });

    return formatted;
  }

  /**
   * Format upcoming holidays with countdown
   * @param {Array} holidays - Array of holiday objects
   * @returns {string} Formatted text
   */
  formatUpcomingHolidays(holidays) {
    if (!holidays || holidays.length === 0) {
      return '📅 No upcoming holidays found.';
    }

    let formatted = '📅 **Upcoming Holidays:**\n\n';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    holidays.forEach((holiday, index) => {
      const holidayDate = new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.ceil((holidayDate - today) / (1000 * 60 * 60 * 24));
      const formattedDate = holidayDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });

      formatted += `${index + 1}. **${holiday.name}**\n`;
      formatted += `   📅 ${formattedDate}\n`;
      if (daysUntil > 0) {
        formatted += `   ⏰ ${daysUntil} day${daysUntil !== 1 ? 's' : ''} from now\n`;
      } else if (daysUntil === 0) {
        formatted += `   🎉 Today!\n`;
      }
      if (holiday.type) {
        formatted += `   🏷️ ${holiday.type}\n`;
      }
      formatted += '\n';
    });

    return formatted;
  }

  /**
   * Format attendance data into human-readable text
   * @param {Object} attendanceData - Attendance data object
   * @returns {string} Formatted text
   */
  formatAttendanceData(attendanceData) {
    if (!attendanceData) {
      return '📊 No attendance information available.';
    }

    let formatted = '📊 **Attendance Summary:**\n\n';
    
    // Overall Statistics
    formatted += '**Overall Statistics:**\n';
    formatted += `• Total Working Days: ${attendanceData.totalDays || 0}\n`;
    formatted += `• Present Days: ${attendanceData.presentDays || 0}\n`;
    formatted += `• Absent Days: ${attendanceData.absentDays || 0}\n`;
    formatted += `• Leave Days: ${attendanceData.leaveDays || 0}\n`;
    formatted += `• Attendance Percentage: ${attendanceData.attendancePercentage || 0}%\n`;

    // Status indicator
    const percentage = attendanceData.attendancePercentage || 0;
    if (percentage >= 95) {
      formatted += `   ✅ Excellent attendance!\n`;
    } else if (percentage >= 85) {
      formatted += `   👍 Good attendance\n`;
    } else if (percentage >= 75) {
      formatted += `   ⚠️ Needs improvement\n`;
    } else {
      formatted += `   ❌ Low attendance - please contact HR\n`;
    }

    // Irregularities
    if (attendanceData.irregularities && attendanceData.irregularities.length > 0) {
      formatted += '\n⚠️ **Irregularities:**\n';
      attendanceData.irregularities.forEach((irregularity, index) => {
        formatted += `\n${index + 1}. Date: ${irregularity.date}\n`;
        formatted += `   Reason: ${irregularity.reason || 'Not specified'}\n`;
        formatted += `   Status: ${irregularity.status || 'Pending'}\n`;
      });
    } else {
      formatted += '\n✅ **No irregularities found.**\n';
    }

    // Monthly Summary (if available)
    if (attendanceData.monthlySummary && attendanceData.monthlySummary.length > 0) {
      formatted += '\n📅 **Recent Activity:**\n';
      const recentRecords = attendanceData.monthlySummary.slice(-5); // Last 5 records
      recentRecords.forEach(record => {
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        formatted += `• ${formattedDate}: ${record.status}`;
        if (record.checkIn && record.checkOut) {
          formatted += ` (${record.checkIn} - ${record.checkOut})`;
        }
        if (record.note) {
          formatted += ` - ${record.note}`;
        }
        formatted += '\n';
      });
    }

    return formatted;
  }

  /**
   * Format attendance regularization result
   * @param {Object} result - Regularization result object
   * @returns {string} Formatted text
   */
  formatRegularizationResult(result) {
    if (!result || !result.success) {
      return '❌ Attendance regularization request failed. Please try again or contact HR support.';
    }

    let formatted = '✅ **Attendance Regularization Submitted Successfully!**\n\n';
    formatted += `📋 **Request Details:**\n`;
    formatted += `• Request ID: ${result.recordId || 'N/A'}\n`;
    formatted += `• Status: Under review with L1 Manager, Anamika\n`;
    formatted += `\n📧 You will receive a notification on Teams once your manager reviews the request.\n`;
    
    if (result.message) {
      formatted += `\n${result.message}`;
    }

    return formatted;
  }

  /**
   * Combine formatted data with conversational context
   * @param {string} formattedData - Formatted data string
   * @param {string} context - Additional context or explanation
   * @returns {string} Combined formatted text
   */
  addContext(formattedData, context) {
    return `${formattedData}\n\n${context}`;
  }
}

export const dataFormatter = new DataFormatter();

