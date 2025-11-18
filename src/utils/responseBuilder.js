/**
 * Response Builder
 * Builds structured responses with UI component hints for frontend
 */

class ResponseBuilder {
  /**
   * Build a response with UI components
   * @param {string} text - Response text
   * @param {Object} uiComponents - UI component specifications
   * @returns {Object} Structured response
   */
  buildResponse(text, uiComponents = {}) {
    return {
      text,
      ui: {
        ...uiComponents,
        hasComponents: Object.keys(uiComponents).length > 0
      }
    };
  }

  /**
   * Build date picker component
   * @param {string} label - Label for the date picker
   * @param {string} field - Field name
   * @param {string} placeholder - Placeholder text
   * @param {boolean} required - Is required
   * @returns {Object} Date picker component spec
   */
  datePicker(label, field, placeholder = 'Select date', required = true) {
    return {
      type: 'datePicker',
      label,
      field,
      placeholder,
      required,
      format: 'YYYY-MM-DD'
    };
  }

  /**
   * Build dropdown component
   * @param {string} label - Label for the dropdown
   * @param {string} field - Field name
   * @param {Array} options - Array of {value, label} objects
   * @param {boolean} required - Is required
   * @returns {Object} Dropdown component spec
   */
  dropdown(label, field, options, required = true) {
    return {
      type: 'dropdown',
      label,
      field,
      options,
      required
    };
  }

  /**
   * Build text input component
   * @param {string} label - Label for the input
   * @param {string} field - Field name
   * @param {string} placeholder - Placeholder text
   * @param {boolean} required - Is required
   * @returns {Object} Text input component spec
   */
  textInput(label, field, placeholder = '', required = false) {
    return {
      type: 'textInput',
      label,
      field,
      placeholder,
      required
    };
  }

  /**
   * Build attendance regularization form
   * @param {Object} existingData - Existing data if any
   * @returns {Object} Response with form components
   */
  buildRegularizationForm(existingData = {}) {
    const reasonOptions = [
      { value: 'forgot_to_mark', label: 'Forgot to mark attendance' },
      { value: 'late_arrival', label: 'Late arrival' },
      { value: 'early_departure', label: 'Early departure' },
      { value: 'system_error', label: 'System error' },
      { value: 'network_issue', label: 'Network issue' },
      { value: 'other', label: 'Other' }
    ];

    const components = {};

    if (!existingData.date) {
      components.date = this.datePicker(
        'Select Date',
        'date',
        'Choose the date to regularize',
        true
      );
      const text = '📅 **Attendance Regularization**\n\nPlease select the date you want to regularize:';
      return this.buildResponse(text, components);
    }

    if (!existingData.reason) {
      components.reason = this.dropdown(
        'Reason for Regularization',
        'reason',
        reasonOptions,
        true
      );
      const text = `📅 **Attendance Regularization**\n\nDate selected: ${existingData.date}\n\nPlease select the reason for regularization:`;
      return this.buildResponse(text, components);
    }

    // If reason is "other", add text input for custom reason
    if (existingData.reason === 'other' && !existingData.customReason) {
      components.customReason = this.textInput(
        'Please specify the reason',
        'customReason',
        'Enter your reason here...',
        true
      );
      const text = `📅 **Attendance Regularization**\n\nDate: ${existingData.date}\nReason: Other\n\nPlease provide details:`;
      return this.buildResponse(text, components);
    }

    // All data collected (shouldn't reach here, but just in case)
    return this.buildResponse('All information collected. Processing...', {});
  }

  /**
   * Build leave application form
   * @param {Object} existingData - Existing data if any
   * @returns {Object} Response with form components
   */
  buildLeaveApplicationForm(existingData = {}) {
    const leaveTypeOptions = [
      { value: 'casual_leave', label: 'Casual Leave (CL)' },
      { value: 'sick_leave', label: 'Sick Leave (SL)' },
      { value: 'privilege_leave', label: 'Privilege Leave (PL)' },
      { value: 'compensatory_off', label: 'Compensatory Off' },
      { value: 'maternity_leave', label: 'Maternity Leave' },
      { value: 'paternity_leave', label: 'Paternity Leave' },
      { value: 'emergency_leave', label: 'Emergency Leave' }
    ];

    const components = {};
    let text = '';

    if (!existingData.leaveType) {
      components.leaveType = this.dropdown(
        'Leave Type',
        'leaveType',
        leaveTypeOptions,
        true
      );
      text = 'Please select the type of leave you want to apply for:';
    } else if (!existingData.fromDate) {
      components.fromDate = this.datePicker(
        'From Date',
        'fromDate',
        'Select start date',
        true
      );
      text = `You selected ${leaveTypeOptions.find(opt => opt.value === existingData.leaveType)?.label}. Please select the start date:`;
    } else if (!existingData.toDate) {
      components.toDate = this.datePicker(
        'To Date',
        'toDate',
        'Select end date',
        true
      );
      text = `Leave type: ${leaveTypeOptions.find(opt => opt.value === existingData.leaveType)?.label}\nFrom: ${existingData.fromDate}\n\nPlease select the end date:`;
    } else if (!existingData.reason) {
      components.reason = this.textInput(
        'Reason for Leave (Optional)',
        'reason',
        'Enter reason for leave...',
        false
      );
      text = `Leave Application Summary:\n- Type: ${leaveTypeOptions.find(opt => opt.value === existingData.leaveType)?.label}\n- From: ${existingData.fromDate}\n- To: ${existingData.toDate}\n\nPlease provide a reason (optional):`;
    }

    return this.buildResponse(text, components);
  }
}

export const responseBuilder = new ResponseBuilder();

