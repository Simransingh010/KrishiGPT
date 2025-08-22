# KrishiGPT Backend

AI Assistant for Farmers - Powered by Gemini API

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set up Gemini API Key
1. Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Copy `env.example` to `.env`
3. Add your API key: `GEMINI_API_KEY=your_key_here`

### 3. Run the Server
```bash
# Option 1: Direct Python
python app/main.py

# Option 2: Using uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The server will start at `http://localhost:8000`

## 📚 API Endpoints

### GET `/`
- Health check and welcome message

### GET `/health`
- Server status and Gemini API configuration status

### POST `/ask`
- Send farming questions and get AI-powered answers

**Request Body:**
```json
{
  "question": "How to improve wheat yield?"
}
```

**Response:**
```json
{
  "answer": "Practical farming advice...",
  "source": "Gemini AI"
}
```

## 🔧 Features

- **Gemini AI Integration**: Uses Google's Gemini Pro model for intelligent farming advice
- **Fallback Mode**: Provides mock responses if Gemini API is unavailable
- **CORS Enabled**: Frontend can communicate from localhost:3000
- **Error Handling**: Graceful fallbacks and comprehensive logging
- **Farming Focus**: AI responses are specifically tailored for agricultural questions

## 🌾 Mock Responses

If Gemini API is not configured, the system provides intelligent mock responses covering:
- Soil preparation and irrigation
- Crop rotation and pest management
- Water management
- Fertilization and soil health
- Timing and climate considerations

## 📝 Environment Variables

- `GEMINI_API_KEY`: Your Gemini API key (optional for MVP)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)

## 🧪 Testing

Test the API using curl:
```bash
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "How to improve wheat yield?"}'
```
