# Agent Builder Platform - Setup e Execucao Completa
# Script de instalacao automatizada

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Agent Builder Platform - Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Funcao para verificar se um comando existe
function Test-Command {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Funcao para verificar se uma porta esta em uso
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
    return $connection
}

# ============================================
# ETAPA 1: Verificar Pre-requisitos
# ============================================
Write-Host "[1/8] Verificando pre-requisitos..." -ForegroundColor Yellow
Write-Host ""

# Verificar Node.js
if (Test-Command node) {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "[ERRO] Node.js nao encontrado!" -ForegroundColor Red
    Write-Host "   Instale em: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar npm
if (Test-Command npm) {
    $npmVersion = npm --version
    Write-Host "[OK] npm instalado: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "[ERRO] npm nao encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================
# ETAPA 2: Instalar Ollama
# ============================================
Write-Host "[2/8] Verificando Ollama..." -ForegroundColor Yellow

if (Test-Command ollama) {
    $ollamaVersion = ollama --version
    Write-Host "[OK] Ollama ja instalado: $ollamaVersion" -ForegroundColor Green
} else {
    Write-Host "[...] Instalando Ollama via winget..." -ForegroundColor Cyan
    try {
        winget install Ollama.Ollama --silent --accept-source-agreements --accept-package-agreements
        Write-Host "[OK] Ollama instalado com sucesso!" -ForegroundColor Green
        Write-Host "   Reiniciando ambiente..." -ForegroundColor Yellow
        
        # Atualizar PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Start-Sleep -Seconds 3
    } catch {
        Write-Host "[ERRO] Erro ao instalar Ollama: $_" -ForegroundColor Red
        Write-Host "   Instale manualmente em: https://ollama.com/download" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# ============================================
# ETAPA 3: Iniciar Ollama Server
# ============================================
Write-Host "[3/8] Iniciando servidor Ollama..." -ForegroundColor Yellow

# Verificar se Ollama ja esta rodando
$ollamaRunning = Test-Port 11434

if ($ollamaRunning) {
    Write-Host "[OK] Ollama ja esta rodando na porta 11434" -ForegroundColor Green
} else {
    Write-Host "[...] Iniciando Ollama em background..." -ForegroundColor Cyan
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 5
    
    # Verificar novamente
    $ollamaRunning = Test-Port 11434
    if ($ollamaRunning) {
        Write-Host "[OK] Ollama iniciado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "[AVISO] Ollama pode nao ter iniciado corretamente" -ForegroundColor Yellow
        Write-Host "   Tente executar manualmente: ollama serve" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================
# ETAPA 4: Baixar Modelos
# ============================================
Write-Host "[4/8] Verificando modelos do Ollama..." -ForegroundColor Yellow

$models = ollama list 2>$null
$hasLlama = $models -match "llama3.1"
$hasEmbed = $models -match "nomic-embed-text"

if (-not $hasLlama) {
    Write-Host "[...] Baixando modelo llama3.1 (pode demorar varios minutos)..." -ForegroundColor Cyan
    ollama pull llama3.1
    Write-Host "[OK] llama3.1 baixado!" -ForegroundColor Green
} else {
    Write-Host "[OK] llama3.1 ja instalado" -ForegroundColor Green
}

if (-not $hasEmbed) {
    Write-Host "[...] Baixando modelo nomic-embed-text..." -ForegroundColor Cyan
    ollama pull nomic-embed-text
    Write-Host "[OK] nomic-embed-text baixado!" -ForegroundColor Green
} else {
    Write-Host "[OK] nomic-embed-text ja instalado" -ForegroundColor Green
}

Write-Host ""

# ============================================
# ETAPA 5: Instalar Dependencias
# ============================================
Write-Host "[5/8] Instalando dependencias do projeto..." -ForegroundColor Yellow

$projectPath = "c:\Users\Gabriel.TI\Desktop\VTEX"
Set-Location $projectPath

if (Test-Path "package.json") {
    Write-Host "[...] Executando npm install (pode demorar)..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Dependencias instaladas com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "[ERRO] Erro ao instalar dependencias" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[ERRO] package.json nao encontrado em $projectPath" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================
# ETAPA 6: Configurar Backend
# ============================================
Write-Host "[6/8] Configurando backend..." -ForegroundColor Yellow

$envFile = "$projectPath\packages\backend\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "[...] Criando arquivo .env..." -ForegroundColor Cyan
    @"
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# ChromaDB Configuration (Optional)
CHROMA_URL=http://localhost:8000
CHROMA_COLLECTION=agent_memory

# Server Configuration
PORT=3001
NODE_ENV=development

# Storage
DATA_DIR=./data
"@ | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "[OK] Arquivo .env criado!" -ForegroundColor Green
} else {
    Write-Host "[OK] Arquivo .env ja existe" -ForegroundColor Green
}

Write-Host ""

# ============================================
# ETAPA 7: Verificar Portas
# ============================================
Write-Host "[7/8] Verificando portas..." -ForegroundColor Yellow

$port3001 = Test-Port 3001
$port3000 = Test-Port 3000

if ($port3001) {
    Write-Host "[AVISO] Porta 3001 (backend) ja esta em uso" -ForegroundColor Yellow
}
if ($port3000) {
    Write-Host "[AVISO] Porta 3000 (frontend) ja esta em uso" -ForegroundColor Yellow
}

if (-not $port3001 -and -not $port3000) {
    Write-Host "[OK] Portas 3000 e 3001 disponiveis" -ForegroundColor Green
}

Write-Host ""

# ============================================
# ETAPA 8: Iniciar Aplicacao
# ============================================
Write-Host "[8/8] Iniciando aplicacao..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Iniciando backend na porta 3001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; npm run dev:backend"

Start-Sleep -Seconds 5

Write-Host "Iniciando frontend na porta 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; npm run dev:frontend"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  APLICACAO INICIADA COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs da aplicacao:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "   Ollama:   http://localhost:11434" -ForegroundColor White
Write-Host ""
Write-Host "Documentacao disponivel:" -ForegroundColor Cyan
Write-Host "   README.md - Documentacao principal" -ForegroundColor White
Write-Host "   QUICKSTART.md - Guia rapido" -ForegroundColor White
Write-Host "   CHECKLIST.md - Verificacao de instalacao" -ForegroundColor White
Write-Host "   TROUBLESHOOTING.md - Solucao de problemas" -ForegroundColor White
Write-Host ""
Write-Host "Dicas:" -ForegroundColor Cyan
Write-Host "   - Aguarde 10-15 segundos para os servidores iniciarem" -ForegroundColor White
Write-Host "   - Acesse http://localhost:3000 no navegador" -ForegroundColor White
Write-Host "   - Crie seu primeiro agente na interface" -ForegroundColor White
Write-Host "   - Teste o chat com IA local" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para abrir o navegador..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Setup concluido! Boa codificacao!" -ForegroundColor Green
