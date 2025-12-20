Write-Host "🌾 Starting KrishiGPT..." -ForegroundColor Green
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
    } else {
        throw "Python not found"
    }
} catch {
    Write-Host "❌ Python not found!" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://python.org" -ForegroundColor Yellow
    Write-Host "Or use: winget install Python.Python.3.11" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to continue after installing Python"
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Yellow
    Write-Host "Or use: winget install OpenJS.NodeJS" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to continue after installing Node.js"
}

Write-Host ""
Write-Host "🚀 Starting Backend (FastAPI)..." -ForegroundColor Cyan

# Try to find Python 3.11 (where packages are installed)
$python311 = "C:\Users\Anhad Tahseen\AppData\Local\Programs\Python\Python311\python.exe"
if (Test-Path $python311) {
    Write-Host "Using Python 3.11: $python311" -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; & '$python311' -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
} else {
    Write-Host "Python 3.11 not found, using default python" -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
}

Write-Host "Waiting 5 seconds for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "🚀 Starting Frontend (Next.js)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "🎉 KrishiGPT is starting up!" -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
