# 🚀 KrishiGPT Installation Guide

## Prerequisites

Before running KrishiGPT, you need to install:

### 1. Python 3.8+ (Required for Backend)
```bash
# Option 1: Download from python.org
# Visit: https://python.org/downloads

# Option 2: Using winget (Windows)
winget install Python.Python.3.11

# Option 3: Using Chocolatey
choco install python

# Verify installation
python --version
```

### 2. Node.js 18+ (Required for Frontend)
```bash
# Option 1: Download from nodejs.org
# Visit: https://nodejs.org

# Option 2: Using winget (Windows)
winget install OpenJS.NodeJS

# Option 3: Using Chocolatey
choco install nodejs

# Verify installation
node --version
npm --version
```

### 3. Gemini API Key (Optional - for real AI responses)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key for later use

## 🛠️ Installation Steps

### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd KrishiGPT
```

### Step 2: Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
copy env.example .env

# Edit .env file and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### Step 3: Frontend Setup
```bash
cd frontend

# Install Node.js dependencies
npm install
```

## 🚀 Running KrishiGPT

### Option 1: Automated Startup (Recommended)
```bash
# Windows PowerShell
.\start.ps1

# Windows Command Prompt
start.bat
```

### Option 2: Manual Startup
```bash
# Terminal 1 - Backend
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌐 Access Points

- **Frontend App**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🧪 Testing

### Test Backend
```bash
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "How to improve wheat yield?"}'
```

### Test Frontend
1. Open http://localhost:3000
2. Type a farming question
3. Click "Ask 🌱" button
4. Verify response appears

## 🔧 Troubleshooting

### Python Issues
```bash
# Check Python installation
python --version

# If not found, add Python to PATH
# Or use full path: C:\Python311\python.exe
```

### Node.js Issues
```bash
# Check Node.js installation
node --version
npm --version

# Clear npm cache if needed
npm cache clean --force
```

### Port Conflicts
```bash
# Check if ports are in use
netstat -an | findstr :8000
netstat -an | findstr :3000

# Kill processes if needed
taskkill /F /PID <process_id>
```

### Dependencies Issues
```bash
# Backend
cd backend
pip install --upgrade pip
pip install -r requirements.txt

# Frontend
cd frontend
npm install --force
```

## 📱 First Run

1. **Start the application** using one of the startup methods
2. **Open your browser** to http://localhost:3000
3. **Ask a farming question** like "How to improve wheat yield?"
4. **Get an AI response** from KrishiGPT!
5. **Try more questions** to test the system

## 🌟 Success Indicators

✅ Backend starts without errors on port 8000  
✅ Frontend loads at http://localhost:3000  
✅ You can type questions and get responses  
✅ Chat history shows your Q&A  
✅ No console errors in browser  

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Verify all prerequisites are installed
- Check console logs for error messages
- Ensure ports 8000 and 3000 are available
- Try restarting both servers

---

**Happy Farming with AI! 🌾🤖**
