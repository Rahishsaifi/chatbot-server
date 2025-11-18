/**
 * Conversation State Manager
 * Manages multi-step conversation flows for attendance regularization and leave application
 */

class ConversationStateManager {
  constructor() {
    // In-memory store (in production, use Redis or database)
    this.states = new Map();
  }

  /**
   * Get conversation state for a user
   * @param {string} userId - User ID
   * @returns {Object|null} Conversation state or null
   */
  getState(userId) {
    return this.states.get(userId) || null;
  }

  /**
   * Set conversation state for a user
   * @param {string} userId - User ID
   * @param {Object} state - State object
   */
  setState(userId, state) {
    this.states.set(userId, state);
    // Auto-expire after 30 minutes
    setTimeout(() => {
      this.clearState(userId);
    }, 30 * 60 * 1000);
  }

  /**
   * Clear conversation state for a user
   * @param {string} userId - User ID
   */
  clearState(userId) {
    this.states.delete(userId);
  }

  /**
   * Update conversation state
   * @param {string} userId - User ID
   * @param {Object} updates - Partial state updates
   */
  updateState(userId, updates) {
    const currentState = this.getState(userId) || {};
    this.setState(userId, { ...currentState, ...updates });
  }
}

export const conversationState = new ConversationStateManager();

