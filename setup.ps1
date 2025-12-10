# 🚀 Setup Script for Agent Builder Platform
# Este script automatiza a configuração inicial

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Agent Builder Platform - Setup Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "✓ Verificando Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "  Node.js encontrado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "  Instale Node.js 18+ em: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check Ollama
Write-Host ""
Write-Host "✓ Verificando Ollama..." -ForegroundColor Yellow
if (Get-Command ollama -ErrorAction SilentlyContinue) {
    Write-Host "  Ollama encontrado!" -ForegroundColor Green
    
    # Check if models are installed
    Write-Host "  Verificando modelos..." -ForegroundColor Yellow
    $models = ollama list
    
    if ($models -match "llama3.1") {
        Write-Host "  ✓ llama3.1 instalado" -ForegroundColor Green
    } else {
        Write-Host "  Baixando llama3.1..." -ForegroundColor Yellow
        ollama pull llama3.1
    }
    
    if ($models -match "nomic-embed-text") {
        Write-Host "  ✓ nomic-embed-text instalado" -ForegroundColor Green
    } else {
        Write-Host "  Baixando nomic-embed-text..." -ForegroundColor Yellow
        ollama pull nomic-embed-text
    }
} else {
    Write-Host "  ✗ Ollama não encontrado!" -ForegroundColor Red
    Write-Host "  Instale em: https://ollama.com/download" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "✓ Instalando dependências..." -ForegroundColor Yellow
Write-Host "  Isso pode levar alguns minutos..." -ForegroundColor Gray

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Dependências instaladas" -ForegroundColor Green

# Setup backend
Write-Host ""
Write-Host "✓ Configurando backend..." -ForegroundColor Yellow
if (!(Test-Path "packages\backend\.env")) {
    Copy-Item "packages\backend\.env.example" "packages\backend\.env"
    Write-Host "  ✓ Arquivo .env criado" -ForegroundColor Green
} else {
    Write-Host "  .env já existe" -ForegroundColor Gray
}

# Create data directory
New-Item -ItemType Directory -Force -Path "packages\backend\data" | Out-Null
Write-Host "  ✓ Diretório de dados criado" -ForegroundColor Green

# Load example agents (optional)
$loadExamples = Read-Host "Carregar agentes de exemplo? (S/N)"
if ($loadExamples -eq "S" -or $loadExamples -eq "s") {
    Copy-Item "packages\backend\data\agents.example.json" "packages\backend\data\agents.json"
    Write-Host "  ✓ Agentes de exemplo carregados" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   ✓ Setup Concluído!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Inicie o Ollama (em outro terminal):" -ForegroundColor White
Write-Host "   ollama serve" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Inicie a aplicação:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Acesse:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor Gray
Write-Host ""
Write-Host "Para mais informações, veja QUICKSTART.md" -ForegroundColor Yellow
Write-Host ""
