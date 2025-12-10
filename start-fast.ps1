# Script SIMPLIFICADO - Modo Dev Ultra Otimizado
# Sem build de produção, apenas dev com todas otimizações

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MODO DEV ULTRA OTIMIZADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = "c:\Users\Gabriel.TI\Desktop\VTEX"
Set-Location $projectPath

# Limpar tudo
Write-Host "[1/4] Limpando ambiente..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process ollama -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "[OK] Ambiente limpo" -ForegroundColor Green
Write-Host ""

# Configurar modo extremo
Write-Host "[2/4] Ativando modo extremo..." -ForegroundColor Yellow
$env:NODE_OPTIONS="--max-old-space-size=1024"
$env:OLLAMA_NUM_THREAD="2"
$env:OLLAMA_MAX_LOADED_MODELS="1"
Write-Host "[OK] Configurações aplicadas" -ForegroundColor Green
Write-Host ""

# Ollama
Write-Host "[3/4] Iniciando Ollama..." -ForegroundColor Yellow
Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
Start-Sleep -Seconds 5
Write-Host "[OK] Ollama rodando" -ForegroundColor Green
Write-Host ""

# Serviços
Write-Host "[4/4] Iniciando serviços..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; `$Host.UI.RawUI.WindowTitle='Backend'; npm run dev:backend"
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; `$Host.UI.RawUI.WindowTitle='Frontend'; npm run dev:frontend"
Start-Sleep -Seconds 3
Write-Host "[OK] Tudo iniciado" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  SISTEMA ULTRA OTIMIZADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "MODELO: tinyllama (1.1B - ultra rapido)" -ForegroundColor Cyan
Write-Host "TOKENS: 512 max" -ForegroundColor Cyan
Write-Host "CACHE: Infinito (sem refetch)" -ForegroundColor Cyan
Write-Host "LOGS: Apenas 10 entradas" -ForegroundColor Cyan
Write-Host ""
Write-Host "Acesse: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
