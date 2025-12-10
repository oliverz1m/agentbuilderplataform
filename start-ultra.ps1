# Script Ultra Otimizado - Modo Performance Máxima
# Use este quando o sistema estiver muito lento

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MODO ULTRA PERFORMANCE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = "c:\Users\Gabriel.TI\Desktop\VTEX"
Set-Location $projectPath

# 1. Limpar processos antigos
Write-Host "[1/6] Limpando processos antigos..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "[OK] Processos limpos" -ForegroundColor Green
Write-Host ""

# 2. Configurar variáveis de ambiente AGRESSIVAS
Write-Host "[2/6] Configurando modo ultra performance..." -ForegroundColor Yellow
$env:NODE_OPTIONS="--max-old-space-size=1024 --max-semi-space-size=2"
$env:OLLAMA_NUM_THREAD="2"
$env:OLLAMA_NUM_GPU="0"
$env:OLLAMA_MAX_LOADED_MODELS="1"
$env:VITE_FORCE_OPTIMIZE="true"
Write-Host "[OK] Modo agressivo ativado" -ForegroundColor Green
Write-Host ""

# 3. Iniciar Ollama com limites
Write-Host "[3/6] Iniciando Ollama (modo limitado)..." -ForegroundColor Yellow
Get-Process ollama* -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
Start-Sleep -Seconds 5
Write-Host "[OK] Ollama iniciado" -ForegroundColor Green
Write-Host ""

# 4. Build de produção (muito mais rápido)
Write-Host "[4/6] Verificando builds..." -ForegroundColor Yellow
if (-not (Test-Path "packages\backend\dist")) {
    Write-Host "[...] Criando build do backend (apenas primeira vez)..." -ForegroundColor Cyan
    cd packages\backend
    npm run build
    cd ..\..
    Write-Host "[OK] Build criado" -ForegroundColor Green
} else {
    Write-Host "[OK] Build já existe" -ForegroundColor Green
}
Write-Host ""

# 5. Iniciar Backend em produção
Write-Host "[5/6] Iniciando Backend (modo produção)..." -ForegroundColor Yellow
$backendCmd = "cd '$projectPath\packages\backend'; `$Host.UI.RawUI.WindowTitle='Backend PROD'; node dist/index.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Start-Sleep -Seconds 3
Write-Host "[OK] Backend rodando" -ForegroundColor Green
Write-Host ""

# 6. Iniciar Frontend otimizado
Write-Host "[6/6] Iniciando Frontend..." -ForegroundColor Yellow
$frontendCmd = "cd '$projectPath\packages\frontend'; `$Host.UI.RawUI.WindowTitle='Frontend'; npm run dev -- --host"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
Start-Sleep -Seconds 3
Write-Host "[OK] Frontend rodando" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  MODO ULTRA ATIVADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Otimizações extremas aplicadas:" -ForegroundColor Cyan
Write-Host "  - Backend em modo PRODUÇÃO (build)" -ForegroundColor White
Write-Host "  - Ollama: 2 threads apenas" -ForegroundColor White
Write-Host "  - Node: 1GB RAM max" -ForegroundColor White
Write-Host "  - Modelo: tinyllama (se disponível)" -ForegroundColor White
Write-Host "  - Sem GPU" -ForegroundColor White
Write-Host "  - Cache agressivo" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANTE: Se ainda estiver lento, considere:" -ForegroundColor Yellow
Write-Host "  1. Fechar TODOS os outros programas" -ForegroundColor White
Write-Host "  2. Usar modelo tinyllama: ollama pull tinyllama" -ForegroundColor White
Write-Host "  3. Aumentar prioridade do Node no Gerenciador de Tarefas" -ForegroundColor White
Write-Host "  4. Verificar antivírus/firewall" -ForegroundColor White
Write-Host ""

Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host "Sistema em modo ultra performance!" -ForegroundColor Green
