/**
 * UI Data Parser
 * Parses user input that may come from UI components (dropdowns, date pickers, etc.)
 */

class UIDataParser {
  /**
   * Parse user query to extract data from UI components
   * The frontend can send data in format: "date:2024-01-15|reason:forgot_to_mark"
   * Or as JSON in the query
   * @param {string} query - User query
   * @returns {Object} Parsed data object
   */
  parseQuery(query) {
    const data = {};

    // Try to parse as pipe-separated key-value pairs (format: "key:value|key:value")
    if (query.includes('|')) {
      const pairs = query.split('|');
      pairs.forEach(pair => {
        const [key, value] = pair.split(':').map(s => s.trim());
        if (key && value) {
          data[key] = value;
        }
      });
      return data;
    }

    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(query);
      if (typeof jsonData === 'object' && !Array.isArray(jsonData)) {
        return jsonData;
      }
    } catch (e) {
      // Not JSON, continue with other parsing
    }

    // Try to extract date (YYYY-MM-DD format)
    const dateMatch = query.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      data.date = dateMatch[1];
    }

    // Try to extract reason
    const reasonMatch = query.match(/reason[:\s]+(.+?)(?:\n|$)/i);
    if (reasonMatch) {
      data.reason = reasonMatch[1].trim();
    }

    // Try to extract leave type
    const leaveTypeMatch = query.match(/(casual|sick|privilege|compensatory|maternity|paternity|emergency)\s*leave/i);
    if (leaveTypeMatch) {
      const typeMap = {
        'casual': 'casual_leave',
        'sick': 'sick_leave',
        'privilege': 'privilege_leave',
        'compensatory': 'compensatory_off',
        'maternity': 'maternity_leave',
        'paternity': 'paternity_leave',
        'emergency': 'emergency_leave'
      };
      data.leaveType = typeMap[leaveTypeMatch[1].toLowerCase()];
    }

    // Try to extract dates (from date and to date)
    const dates = query.match(/(\d{4}-\d{2}-\d{2})/g);
    if (dates) {
      if (dates[0] && !data.fromDate) {
        data.fromDate = dates[0];
      }
      if (dates[1] && !data.toDate) {
        data.toDate = dates[1];
      }
    }

    return data;
  }

  /**
   * Merge parsed data with existing state
   * @param {Object} existingState - Existing conversation state
   * @param {Object} parsedData - Parsed data from query
   * @returns {Object} Merged state
   */
  mergeWithState(existingState, parsedData) {
    return {
      ...existingState,
      ...parsedData
    };
  }
}

export const uiDataParser = new UIDataParser();

