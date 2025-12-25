# 🌾 Krishi

AI-powered agricultural assistant for Indian farmers. Get real-time crop prices, market insights, and personalized farming advice.

## Features

- **AI Chat Assistant** - Ask farming questions in natural language, powered by Google Gemini
- **Live Crop Prices** - Real-time market prices across Indian mandis
- **Market Insights** - Curated tips, alerts, and recommendations for farmers
- **Admin Dashboard** - Manage crops, prices, and insights
- **Multi-language Support** - Hindi and English

## Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS  
**Backend:** FastAPI, Python  
**Database:** Supabase (PostgreSQL)  
**AI:** Google Gemini API

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Supabase account
- Google Gemini API key

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your keys:
# - SUPABASE_URL
# - SUPABASE_KEY
# - GEMINI_API_KEY

# Run server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Run dev server
npm run dev
```

### Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
├── backend/
│   └── app/
│       ├── routes/        # API endpoints
│       ├── krishi/        # AI chat logic
│       ├── db/            # Database config
│       └── utils/         # Helpers
├── frontend/
│   └── src/
│       ├── app/           # Next.js pages
│       ├── components/    # UI components
│       ├── hooks/         # Custom hooks
│       ├── services/      # API clients
│       └── types/         # TypeScript types
└── docker-compose.yml
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/krishi/chat` | AI chat |
| `GET /api/dashboard/prices` | Crop prices |
| `GET /api/dashboard/insights` | Market insights |
| `GET /api/admin/stats` | Admin statistics |

## Environment Variables

**Backend (.env)**
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_key
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## License

MIT
