# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure at minimum:
   - `AZURE_AI_ENDPOINT`
   - `AZURE_AI_MODEL_NAME`
   - `AZURE_AI_API_KEY`

3. **Start Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Azure AI Foundry Configuration

### Option 1: Base Endpoint + Model Name
If you provide the base endpoint and model name separately:

```env
AZURE_AI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_AI_MODEL_NAME=your-deployment-name
AZURE_AI_API_KEY=your-api-key
```

The server will construct the endpoint as:
```
https://your-resource.openai.azure.com/openai/deployments/your-deployment-name/chat/completions?api-version=2024-02-15-preview
```

### Option 2: Full Endpoint Path
If you provide the complete endpoint path:

```env
AZURE_AI_ENDPOINT=https://your-resource.openai.azure.com/openai/deployments/your-deployment-name/chat/completions?api-version=2024-02-15-preview
AZURE_AI_MODEL_NAME=your-deployment-name
AZURE_AI_API_KEY=your-api-key
```

The server will use the endpoint as-is.

## Frontend Configuration

Update your frontend `.env` file to point to the server:

```env
VITE_API_URL=http://localhost:3000/message
```

## Testing the API

### Using cURL

```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "What are my pending leaves?"
          }
        ]
      }
    ]
  }'
```

### Health Check

```bash
curl http://localhost:3000/health
```

## Enabling Future Integrations

### Cosmos DB
1. Install: `npm install @azure/cosmos`
2. Set environment variables in `.env`
3. Uncomment code in `src/services/cosmos.service.js`
4. Uncomment import in `src/services/attendance.service.js`

### Microsoft Teams
1. Set `TEAMS_WEBHOOK_URL` in `.env`
2. Uncomment code in `src/services/teams.service.js`
3. Uncomment import in `src/services/attendance.service.js`

### SAP SuccessFactors
1. Set SAP SF environment variables in `.env`
2. Uncomment code in `src/services/sap.service.js`
3. Uncomment imports in:
   - `src/services/leave.service.js`
   - `src/services/holiday.service.js`
   - `src/services/attendance.service.js`

