# 🌾 KrishiGPT

**AI Assistant for Farmers - Powered by Google Gemini**

KrishiGPT is an intelligent farming assistant that helps farmers get instant answers to agricultural questions using cutting-edge AI technology.

## 🚀 Quick Start (4-Hour MVP)

### Prerequisites
- Python 3.8+
- Node.js 18+
- Gemini API key (free from [Google AI Studio](https://makersuite.google.com/app/apikey))

### 1. Clone & Setup
```bash
git clone <your-repo>
cd KrishiGPT
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Copy environment template
copy env.example .env

# Edit .env and add your Gemini API key
GEMINI_API_KEY=your_key_here
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Start Everything
```bash
# Option 1: Use the startup script (Windows)
start.bat

# Option 2: Manual startup
# Terminal 1 - Backend
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 5. Access the App
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🎯 What You Get

✅ **Working Demo**: Ask farming questions, get AI answers  
✅ **Gemini Integration**: Real AI responses (with fallback)  
✅ **Beautiful UI**: Modern, responsive design  
✅ **Chat Interface**: Q&A history during session  
✅ **Error Handling**: Graceful fallbacks  

## 🌾 Example Questions

- "How to improve wheat yield?"
- "What are organic pest control methods?"
- "Best time to plant tomatoes?"
- "How to manage soil erosion?"
- "Crop rotation benefits?"

## 🏗️ Architecture

```
Frontend (Next.js + Tailwind) ←→ Backend (FastAPI + Gemini)
     ↓                              ↓
  Beautiful UI              AI-Powered Responses
  Chat Interface            Farming Expertise
  Real-time Updates        Mock Fallbacks
```

## 🔧 Features

### Backend (FastAPI)
- **Gemini AI Integration**: Google's latest AI model
- **Smart Fallbacks**: Mock responses if API unavailable
- **Farming Focus**: Agricultural expertise prompts
- **CORS Enabled**: Frontend communication ready
- **Error Handling**: Comprehensive logging & fallbacks

### Frontend (Next.js)
- **Modern UI**: Clean, responsive design
- **Real-time Chat**: Interactive Q&A interface
- **Loading States**: Smooth user experience
- **Chat History**: Session-based conversation memory
- **Mobile Ready**: Works on all devices

## 🚀 Deployment Ready

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Render/Railway)
```bash
cd backend
# Add production requirements
# Deploy to your preferred platform
```

## 📚 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check & welcome |
| `/health` | GET | API status & Gemini config |
| `/ask` | POST | Send farming questions |

### Ask Endpoint
```json
POST /ask
{
  "question": "How to improve wheat yield?"
}

Response:
{
  "answer": "Practical farming advice...",
  "source": "Gemini AI"
}
```

## 🌟 MVP Success Criteria

- [x] User can open web app
- [x] User can type farming question
- [x] Backend responds with AI answer
- [x] Frontend displays response beautifully
- [x] Works with or without Gemini API
- [x] Demo-ready in under 4 hours

## 🔑 Environment Variables

```bash
# Backend (.env)
GEMINI_API_KEY=your_gemini_api_key
HOST=0.0.0.0
PORT=8000
```

## 🧪 Testing

### Backend
```bash
cd backend
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "How to improve wheat yield?"}'
```

### Frontend
- Open http://localhost:3000
- Type a farming question
- Verify response appears
- Check chat history

## 🎨 Customization

### Styling
- Edit `frontend/src/app/page.tsx` for UI changes
- Modify Tailwind classes for styling
- Update colors, fonts, layouts

### AI Behavior
- Edit `backend/app/main.py` for prompt engineering
- Adjust farming expertise focus
- Modify response length/style

## 🚨 Troubleshooting

### Backend Won't Start
- Check Python version (3.8+)
- Install requirements: `pip install -r requirements.txt`
- Verify port 8000 is free

### Frontend Won't Start
- Check Node.js version (18+)
- Install dependencies: `npm install`
- Verify port 3000 is free

### API Connection Issues
- Ensure backend is running on port 8000
- Check CORS settings in backend
- Verify network connectivity

## 🌟 Next Steps (Post-MVP)

- [ ] User authentication
- [ ] Chat history persistence
- [ ] Image upload support
- [ ] Multi-language support
- [ ] Mobile app (Flutter)
- [ ] Advanced farming modules
- [ ] Weather integration
- [ ] Crop disease detection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for farmers worldwide**

*KrishiGPT - Making farming smarter with AI*
