Write-Host "🔧 Setting up Python for KrishiGPT..." -ForegroundColor Cyan
Write-Host ""

# Try to find Python in common locations
$pythonPaths = @(
    "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python311\python.exe",
    "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python311\python.exe",
    "C:\Program Files\Python311\python.exe",
    "C:\Python311\python.exe"
)

$pythonFound = $false
$pythonPath = ""

foreach ($path in $pythonPaths) {
    if (Test-Path $path) {
        $pythonPath = $path
        $pythonFound = $true
        Write-Host "✅ Found Python at: $path" -ForegroundColor Green
        break
    }
}

if (-not $pythonFound) {
    Write-Host "❌ Python not found in common locations!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Let's install Python manually:" -ForegroundColor Yellow
    Write-Host "1. Download Python from: https://python.org/downloads" -ForegroundColor White
    Write-Host "2. During installation, CHECK 'Add Python to PATH'" -ForegroundColor White
    Write-Host "3. Restart this PowerShell window" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter after installing Python and restarting PowerShell"
    
    # Try to find Python again
    foreach ($path in $pythonPaths) {
        if (Test-Path $path) {
            $pythonPath = $path
            $pythonFound = $true
            Write-Host "✅ Found Python at: $path" -ForegroundColor Green
            break
        }
    }
}

if ($pythonFound) {
    Write-Host ""
    Write-Host "🚀 Setting up KrishiGPT..." -ForegroundColor Green
    
    # Set up backend
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    Set-Location "backend"
    
    # Use full path to Python
    & $pythonPath -m pip install --upgrade pip
    & $pythonPath -m pip install -r requirements.txt
    
    # Create .env file
    if (-not (Test-Path ".env")) {
        Copy-Item "env.example" ".env"
        Write-Host "✅ Created .env file - edit it to add your Gemini API key" -ForegroundColor Green
    }
    
    Set-Location ".."
    
    # Set up frontend
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location "frontend"
    npm install
    Set-Location ".."
    
    Write-Host ""
    Write-Host "🎉 Setup complete! Now you can run KrishiGPT:" -ForegroundColor Green
    Write-Host ""
    Write-Host "Option 1: Use the startup script" -ForegroundColor White
    Write-Host "  .\start.ps1" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 2: Manual startup" -ForegroundColor White
    Write-Host "  Terminal 1: cd backend && $pythonPath -m uvicorn app.main:app --reload" -ForegroundColor Yellow
    Write-Host "  Terminal 2: cd frontend && npm run dev" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
} else {
    Write-Host "❌ Python setup failed. Please install Python manually and restart." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to continue"
