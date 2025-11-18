# Architecture Overview

## System Architecture

This server implements a **professional multi-agent architecture** designed for Microsoft code review standards.

```
┌─────────────────┐
│   Frontend      │
│  (React App)    │
└────────┬────────┘
         │ HTTP POST
         │ /message
         ▼
┌─────────────────────────────────────┐
│         Express Server              │
│  ┌───────────────────────────────┐  │
│  │   Middleware Layer            │  │
│  │   - Request Validation        │  │
│  │   - Error Handling            │  │
│  │   - Logging                   │  │
│  └───────────────┬───────────────┘  │
│                  │                   │
│  ┌───────────────▼───────────────┐  │
│  │   Controller Layer            │  │
│  │   - message.controller.js     │  │
│  └───────────────┬───────────────┘  │
│                  │                   │
│  ┌───────────────▼───────────────┐  │
│  │   Service Layer               │  │
│  │   - message.service.js        │  │
│  └───────────────┬───────────────┘  │
└──────────────────┼──────────────────┘
                   │
         ┌─────────▼─────────┐
         │  Agent Orchestrator│
         │  (Routes queries)  │
         └─────────┬─────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │               │
┌───▼───┐    ┌─────▼─────┐   ┌────▼────┐
│ Leave │    │  Holiday  │   │Attendance│
│ Agent │    │   Agent   │   │  Agent   │
└───┬───┘    └─────┬─────┘   └────┬────┘
    │              │               │
    │              │               │
┌───▼───┐    ┌─────▼─────┐   ┌────▼────┐
│ Leave │    │  Holiday  │   │Attendance│
│Service│    │  Service  │   │ Service  │
└───┬───┘    └─────┬─────┘   └────┬────┘
    │              │               │
    │              │               │
┌───▼──────────────▼───────────────▼───┐
│      Azure AI Foundry Service        │
│      (For AI-powered responses)      │
└──────────────────────────────────────┘
```

## Component Details

### 1. Agent Orchestrator
- **Purpose**: Routes user queries to specialized agents
- **Location**: `src/agents/orchestrator.js`
- **Functionality**:
  - Intent detection (leave, holiday, attendance)
  - Query routing to appropriate agent
  - Fallback to general Azure AI if intent unclear

### 2. Specialized Agents

#### Leave Agent
- **Purpose**: Handle leave-related queries
- **Location**: `src/agents/leave.agent.js`
- **Capabilities**:
  - Query pending leaves
  - Check leave balance
  - Provide leave application guidance

#### Holiday Agent
- **Purpose**: Handle holiday-related queries
- **Location**: `src/agents/holiday.agent.js`
- **Capabilities**:
  - List all holidays
  - Get upcoming holidays
  - Filter holidays by month

#### Attendance Agent
- **Purpose**: Handle attendance-related queries
- **Location**: `src/agents/attendance.agent.js`
- **Capabilities**:
  - Check attendance status
  - Process attendance regularization
  - Handle approval workflow

### 3. Service Layer

#### Azure AI Service
- **Purpose**: Interface with Azure AI Foundry
- **Location**: `src/services/azure-ai.service.js`
- **Features**:
  - Flexible endpoint configuration
  - Error handling
  - Token usage logging

#### Data Services
- **Leave Service**: `src/services/leave.service.js`
- **Holiday Service**: `src/services/holiday.service.js`
- **Attendance Service**: `src/services/attendance.service.js`

Each service:
- Provides business logic
- Handles data transformation
- Prepares for SAP SF integration (commented out)

### 4. Future Integrations (Commented Out)

#### Cosmos DB Service
- **Purpose**: Store attendance regularization records
- **Location**: `src/services/cosmos.service.js`
- **Status**: Ready to enable when connection string provided

#### Teams Service
- **Purpose**: Send notifications to Microsoft Teams
- **Location**: `src/services/teams.service.js`
- **Status**: Ready to enable when webhook URL provided

#### SAP SuccessFactors Service
- **Purpose**: Fetch real data from SAP SF
- **Location**: `src/services/sap.service.js`
- **Status**: Ready to enable when credentials provided

## Data Flow

### Example: "What are my pending leaves?"

1. **Frontend** → POST `/message` with chat history
2. **Controller** → Validates request, calls service
3. **Message Service** → Extracts query, routes to orchestrator
4. **Orchestrator** → Detects intent: "leave"
5. **Leave Agent** → Processes query
6. **Leave Service** → Fetches data (dummy data for now)
7. **Leave Agent** → Formats response
8. **Response** → Returns to frontend

### Example: "Regularize attendance for 2024-01-15"

1. **Frontend** → POST `/message`
2. **Orchestrator** → Detects intent: "attendance"
3. **Attendance Agent** → Extracts date and reason
4. **Attendance Service** → Creates regularization record
   - (Future: Saves to Cosmos DB)
   - (Future: Sends Teams notification)
5. **Response** → Confirmation message

## Design Principles

### 1. Separation of Concerns
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic
- **Agents**: Domain-specific query handling
- **Config**: Environment configuration

### 2. Scalability
- Easy to add new agents
- Service layer abstracts data sources
- Ready for microservices migration

### 3. Maintainability
- Clear file structure
- Comprehensive logging
- Error handling at every layer

### 4. Extensibility
- Commented integration points
- Configuration-driven
- Plugin-ready architecture

## Security Features

1. **Helmet.js**: Security headers
2. **CORS**: Configurable cross-origin policies
3. **Input Validation**: express-validator
4. **Error Handling**: No sensitive data leakage
5. **Environment Variables**: Secure configuration

## Logging

- **Console**: Development logging
- **File**: Production logging
  - `logs/combined.log`: All logs
  - `logs/error.log`: Error logs only
- **Request Logging**: All API requests logged
- **Structured Logging**: JSON-compatible format

## Error Handling

1. **Validation Errors**: 400 Bad Request
2. **Azure AI Errors**: 502 Bad Gateway
3. **Internal Errors**: 500 Internal Server Error
4. **Not Found**: 404 Not Found
5. **Error Logging**: All errors logged with stack traces

## Testing Recommendations

1. **Unit Tests**: Test each service independently
2. **Integration Tests**: Test agent orchestration
3. **API Tests**: Test `/message` endpoint
4. **Mock Azure AI**: Use mocks for Azure AI calls
5. **Test Data**: Use dummy data for testing

## Performance Considerations

1. **Caching**: Consider caching holiday/leave data
2. **Rate Limiting**: Add rate limiting for production
3. **Connection Pooling**: For database connections
4. **Async Operations**: All I/O operations are async
5. **Compression**: Response compression enabled

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Configure Azure AI Foundry
- [ ] Set up logging directory
- [ ] Configure CORS for production
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure SSL/TLS
- [ ] Test all endpoints
- [ ] Review error handling
- [ ] Document API endpoints

