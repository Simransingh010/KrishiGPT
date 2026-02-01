# KrishiGPT

AI-powered agricultural assistant for Indian farmers. Built to provide real-time crop prices, market insights, and farming advice through natural language interaction.

## What This Does

KrishiGPT is a full-stack agricultural intelligence platform. It combines AI-powered chat with structured agricultural data to help farmers make informed decisions. The system understands farming context, validates safety-critical information, and provides localized advice.

## Architecture

Two-tier application with clear separation of concerns.

**Backend**: FastAPI application serving REST endpoints and streaming AI responses. Integrates Google Gemini for natural language processing, Supabase for persistence, and implements custom safety validation for agricultural advice.

**Frontend**: Next.js 15 application with React 19. Server-side rendering for initial page loads, client-side hydration for interactive features. TypeScript throughout for type safety.

**Database**: PostgreSQL via Supabase. Stores conversations, messages, crop data, market prices, and insights. Row-level security policies enforce user data isolation.

## Core Features

### AI Chat System

Conversational interface powered by Gemini 2.5 Flash. Implements streaming responses for real-time feedback. Context-aware prompting includes farm location, crop type, growth stage, soil conditions, and irrigation methods.

Safety validation layer prevents harmful advice. Dosage recommendations require minimum context (crop, stage, land size). Confidence scoring based on available context. Mandatory disclaimers for safety-critical operations.

Intent detection classifies queries: diagnosis, fertilizer, irrigation, weather, pricing, pesticides. Dynamic form requests when context insufficient. Conversation history maintained with sliding window (30 messages) for coherent multi-turn dialogue.

### Dashboard

Real-time agricultural data aggregation. Weather integration via OpenWeatherMap API with 7-day forecasts. Crop price tracking from database with trend analysis. Market insights with publish/expire scheduling. Status indicators for soil moisture, pH, air quality, rain probability.

Timeline view shows actionable items: price opportunities, weather alerts, irrigation windows, harvest reminders. Quick stats display farm metrics and active crop count.

### Admin Panel

CRUD operations for agricultural data management. Crop categories and crop definitions with MSP (Minimum Support Price) tracking. Price entry system with market, state, district granularity. Bulk price import capability.

Insight management with type classification (opportunity, weather, warning, harvest). Publish/unpublish workflow with scheduling. Target filtering by state and crop. Statistics dashboard for content overview.

### Authentication

Supabase Auth integration. Google OAuth provider configured. Session management with JWT tokens. Row-level security policies on database tables. User-scoped conversation and message access.

### Conversation Management

Multi-conversation support per user. Soft delete with deleted_at timestamps. Title editing and message pagination. Last message preview in conversation list. Message count tracking.

## Technical Implementation

### Backend Components

**KrishiGPT Controller**: Main orchestration logic. Processes messages, detects intent, validates context, manages tool execution. Implements streaming and non-streaming response modes.

**Safety Validator**: Validates dosage recommendations against safe limits. Adds mandatory disclaimers for critical advice. Confidence scoring based on context completeness.

**Prompt Builder**: Constructs context-aware prompts for Gemini. Includes system instructions, conversation history, and farm context. Enforces markdown formatting rules for structured responses.

**MCP Tools**: Modular agricultural tools (diagnose crop issues, recommend fertilizer, irrigation planning). Each tool defines required context, parameters, and clarification forms. Safety-critical flag for dosage calculations.

**Forms System**: Dynamic form generation for context collection. Multi-language support (English/Hindi). Field types: select, radio, checkbox, slider. Form submission triggers tool execution with validated data.

**Rate Limiting**: In-memory rate limiter with sliding window algorithm. Configurable limits per endpoint type. Request logging middleware with timing headers.

**Database Layer**: Supabase client wrapper. Connection pooling and error handling. Type-safe query builders.

### Frontend Components

**Chat Interface**: Message rendering with markdown support (react-markdown, remark-gfm). Code syntax highlighting (rehype-highlight). Streaming message updates via Server-Sent Events. Auto-scroll to latest message.

**Dashboard Components**: Weather cards with forecast visualization. Price charts using Recharts. Timeline items with type-based styling. Status chips with color-coded indicators.

**Admin Interface**: Tabbed layout for crops, prices, insights. Form validation and error handling. Toast notifications for user feedback. Loading states and skeletons.

**3D Logo**: Three.js integration via react-three-fiber. Animated wheat grain model. Responsive canvas sizing.

**Error Boundaries**: Graceful error handling with retry capability. Prevents full application crashes. User-friendly error messages.

### API Structure

```
/api/krishi/send          - Send message (non-streaming)
/api/krishi/send/stream   - Send message (streaming SSE)
/api/krishi/forms         - Get available forms
/api/krishi/tools         - List available tools
/api/krishi/tools/execute - Execute specific tool

/api/conversations        - CRUD for conversations
/api/conversations/{id}/messages - Get conversation messages

/api/dashboard            - Complete dashboard data
/api/dashboard/weather    - Weather data only
/api/dashboard/prices     - Crop prices only
/api/dashboard/locations  - Location search

/api/admin/crops          - Crop management
/api/admin/prices         - Price management
/api/admin/insights       - Insight management
/api/admin/stats          - Admin statistics

/health                   - Health check
/docs                     - OpenAPI documentation
```

## Data Models

**Conversations**: id, user_id, title, created_at, updated_at, deleted_at

**Messages**: id, conversation_id, role (user/assistant), content, tokens_used, created_at

**Crops**: id, category_id, name, name_hindi, icon, unit, msp_price, msp_year, is_active

**Crop Prices**: id, crop_id, price, price_type, market_name, state, district, recorded_at, source

**Insights**: id, type_id, title, message, is_actionable, action_url, priority, target_states, target_crops, publish_at, expires_at, is_published, is_pinned

## Technology Stack

**Backend**:
- FastAPI 0.109+
- Python 3.11+
- Google Generative AI (Gemini 2.5 Flash)
- Supabase Python Client
- Uvicorn ASGI server
- Pydantic for validation

**Frontend**:
- Next.js 16.1 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Framer Motion for animations
- Three.js for 3D graphics
- Recharts for data visualization
- TipTap for rich text editing

**Infrastructure**:
- Supabase (PostgreSQL + Auth + Storage)
- Docker containerization
- GitHub Actions CI/CD

## Configuration

Backend requires three environment variables:
- GEMINI_API_KEY - Google AI Studio API key
- SUPABASE_URL - Supabase project URL
- SUPABASE_KEY - Supabase service role key

Optional:
- OPENWEATHER_API_KEY - For real weather data
- ALLOWED_ORIGINS - CORS configuration (comma-separated)

Frontend requires:
- NEXT_PUBLIC_API_URL - Backend API endpoint
- NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase anonymous key

## Deployment

Docker Compose provides full stack orchestration. Backend runs on port 8000, frontend on port 3000. Environment variables loaded from .env files.

Startup scripts provided for Windows (PowerShell, Batch), macOS/Linux (Bash). Scripts check dependencies, create virtual environments, install packages, start services.

GitHub Actions workflow runs on push: linting, type checking, build verification. Separate jobs for frontend and backend.

## Code Quality

Type safety enforced throughout. Backend uses Pydantic models for validation. Frontend uses TypeScript strict mode. No any types except in legacy code.

Error handling at multiple layers: global exception handler, route-level try-catch, client-side error boundaries. Structured error responses with error codes.

Logging configured with timestamps and severity levels. Request timing tracked via middleware. Health check endpoint for monitoring.

Input validation and sanitization. XSS prevention in message content. Rate limiting on AI endpoints. SQL injection prevented by parameterized queries.

## Development

Backend hot reload via uvicorn --reload. Frontend hot reload via Next.js dev server with Turbopack.

API documentation auto-generated at /docs (Swagger UI) and /redoc (ReDoc). Type definitions exported from backend models.

Component library follows composition pattern. Reusable primitives: Button, Input, Toast, Loading. Domain-specific components built from primitives.

## Testing

No test suite currently implemented. Recommended additions: pytest for backend, Jest for frontend, Playwright for E2E.

## License

MIT
