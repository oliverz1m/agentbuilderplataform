# Script Otimizado de Inicializacao
# Configura prioridades e limites para melhor performance

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Sistema Otimizado" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = "c:\Users\Gabriel.TI\Desktop\VTEX"
Set-Location $projectPath

# 1. Configurar variaveis de ambiente para performance
Write-Host "[1/4] Configurando variaveis de ambiente..." -ForegroundColor Yellow
$env:NODE_OPTIONS="--max-old-space-size=2048"
$env:OLLAMA_NUM_THREAD="4"
Write-Host "[OK] Variaveis configuradas" -ForegroundColor Green
Write-Host ""

# 2. Verificar se Ollama esta rodando
Write-Host "[2/4] Verificando Ollama..." -ForegroundColor Yellow
$ollamaRunning = Get-Process ollama* -ErrorAction SilentlyContinue
if (-not $ollamaRunning) {
    Write-Host "[...] Iniciando Ollama..." -ForegroundColor Cyan
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 5
    Write-Host "[OK] Ollama iniciado" -ForegroundColor Green
} else {
    Write-Host "[OK] Ollama ja esta rodando" -ForegroundColor Green
}
Write-Host ""

# 3. Iniciar Backend com prioridade alta
Write-Host "[3/4] Iniciando Backend (prioridade alta)..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; `$Host.UI.RawUI.WindowTitle='Backend API'; npm run dev:backend" -PassThru
Start-Sleep -Seconds 2
$backendProcess.PriorityClass = 'AboveNormal'
Write-Host "[OK] Backend rodando na porta 3001" -ForegroundColor Green
Write-Host ""

# 4. Iniciar Frontend
Write-Host "[4/4] Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; `$Host.UI.RawUI.WindowTitle='Frontend Vite'; npm run dev:frontend"
Start-Sleep -Seconds 3
Write-Host "[OK] Frontend rodando na porta 3000" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Sistema Iniciado (Modo Otimizado)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Otimizacoes aplicadas:" -ForegroundColor Cyan
Write-Host "  - Modelo: phi3 (3.8B - mais leve)" -ForegroundColor White
Write-Host "  - Context: 1024 tokens" -ForegroundColor White
Write-Host "  - Compression: Ativado" -ForegroundColor White
Write-Host "  - Cache: 60s stale time" -ForegroundColor White
Write-Host "  - Prioridade: Backend em AboveNormal" -ForegroundColor White
Write-Host "  - Memory: Node limitado a 2GB" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para abrir o navegador..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Sistema pronto! Performance otimizada." -ForegroundColor Green
