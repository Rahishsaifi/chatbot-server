# UI Components Integration Guide

## Overview

The server now supports multi-step interactive flows for:
1. **Attendance Regularization** - Date picker + Reason dropdown
2. **Leave Application** - Leave type dropdown + From/To date pickers + Optional reason

## Response Format

When the server returns a response with UI components, it includes a `ui` object:

```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "Please select the date you want to regularize:"
      }]
    }
  }],
  "ui": {
    "hasComponents": true,
    "date": {
      "type": "datePicker",
      "label": "Select Date",
      "field": "date",
      "placeholder": "Choose the date to regularize",
      "required": true,
      "format": "YYYY-MM-DD"
    }
  }
}
```

## UI Component Types

### 1. Date Picker (`datePicker`)

```json
{
  "type": "datePicker",
  "label": "Select Date",
  "field": "date",
  "placeholder": "Choose the date to regularize",
  "required": true,
  "format": "YYYY-MM-DD"
}
```

**Frontend Implementation:**
- Show a calendar/date picker component
- Format: YYYY-MM-DD (e.g., "2024-01-15")
- When user selects date, send: `date:2024-01-15` or `{"date": "2024-01-15"}`

### 2. Dropdown (`dropdown`)

```json
{
  "type": "dropdown",
  "label": "Reason for Regularization",
  "field": "reason",
  "options": [
    { "value": "forgot_to_mark", "label": "Forgot to mark attendance" },
    { "value": "late_arrival", "label": "Late arrival" },
    { "value": "other", "label": "Other" }
  ],
  "required": true
}
```

**Frontend Implementation:**
- Show a dropdown/select component with the options
- When user selects option, send: `reason:forgot_to_mark` or `{"reason": "forgot_to_mark"}`

### 3. Text Input (`textInput`)

```json
{
  "type": "textInput",
  "label": "Please specify the reason",
  "field": "customReason",
  "placeholder": "Enter your reason here...",
  "required": true
}
```

**Frontend Implementation:**
- Show a text input field
- When user enters text, send: `customReason:User's reason text` or `{"customReason": "User's reason text"}`

## Sending Data Back to Server

When the user interacts with UI components, send the data in one of these formats:

### Format 1: Pipe-separated key-value pairs
```
date:2024-01-15|reason:forgot_to_mark
```

### Format 2: JSON object (as string)
```json
{"date": "2024-01-15", "reason": "forgot_to_mark"}
```

### Format 3: Natural language (fallback)
```
Regularize attendance for 2024-01-15, reason: forgot to mark
```

## Multi-Step Flow Examples

### Attendance Regularization Flow

**Step 1: User says "regularize attendance"**
- Server responds with date picker
- Frontend shows calendar

**Step 2: User selects date (e.g., 2024-01-15)**
- Frontend sends: `date:2024-01-15`
- Server responds with reason dropdown
- Frontend shows dropdown with reasons

**Step 3: User selects reason (e.g., "Forgot to mark attendance")**
- Frontend sends: `reason:forgot_to_mark`
- Server processes and returns confirmation

### Leave Application Flow

**Step 1: User says "apply for leave"**
- Server responds with leave type dropdown
- Frontend shows dropdown

**Step 2: User selects leave type (e.g., "Casual Leave")**
- Frontend sends: `leaveType:casual_leave`
- Server responds with from date picker
- Frontend shows calendar

**Step 3: User selects from date (e.g., 2024-01-15)**
- Frontend sends: `fromDate:2024-01-15`
- Server responds with to date picker
- Frontend shows calendar

**Step 4: User selects to date (e.g., 2024-01-17)**
- Frontend sends: `toDate:2024-01-17`
- Server responds with optional reason text input
- Frontend shows text input

**Step 5: User enters reason (optional)**
- Frontend sends: `reason:Personal work`
- Server processes and returns confirmation

## Frontend Implementation Tips

1. **Check for UI components**: Always check `response.ui.hasComponents` before rendering UI
2. **Render components dynamically**: Loop through `response.ui` object to render components
3. **Handle multiple components**: A response can have multiple UI components at once
4. **Send data immediately**: When user interacts with a component, send the data right away
5. **Show loading state**: While waiting for server response, show loading indicator
6. **Handle errors**: If server returns error, clear the flow and show error message

## Example Frontend Code (React)

```javascript
const handleResponse = (response) => {
  const { candidates, ui } = response;
  const text = candidates[0].content.parts[0].text;
  
  // Display text
  addMessage(text, 'bot');
  
  // Check for UI components
  if (ui && ui.hasComponents) {
    // Render UI components
    Object.keys(ui).forEach(key => {
      if (key === 'hasComponents') return;
      
      const component = ui[key];
      switch (component.type) {
        case 'datePicker':
          renderDatePicker(component, (date) => {
            sendMessage(`date:${date}`);
          });
          break;
        case 'dropdown':
          renderDropdown(component, (value) => {
            sendMessage(`${component.field}:${value}`);
          });
          break;
        case 'textInput':
          renderTextInput(component, (value) => {
            sendMessage(`${component.field}:${value}`);
          });
          break;
      }
    });
  }
};
```

## State Management

The server maintains conversation state for each user. The state automatically expires after 30 minutes of inactivity.

- **State is per-user**: Each user has their own conversation state
- **State persists**: State is maintained across multiple messages
- **State expires**: After 30 minutes, state is cleared
- **State can be cleared**: User can say "cancel" to clear the flow

## Error Handling

If the user wants to cancel a flow, they can:
- Say "cancel" or "nevermind"
- The server will clear the state and return to normal conversation

If there's an error:
- Server returns error message
- State is cleared
- User can start the flow again

