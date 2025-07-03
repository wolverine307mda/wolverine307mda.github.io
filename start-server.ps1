# Script para iniciar el servidor de Spotify Stats
Write-Host "🚀 Iniciando servidor de Spotify Stats..." -ForegroundColor Green
Write-Host ""

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org/" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar si existe package.json
if (!(Test-Path "package.json")) {
    Write-Host "❌ No se encontró package.json. Asegúrate de estar en el directorio correcto." -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar dependencias
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

Write-Host "✅ Iniciando servidor..." -ForegroundColor Green
Write-Host ""
Write-Host "📊 Panel de admin: http://localhost:3000/admin.html" -ForegroundColor Cyan
Write-Host "🌐 Portfolio: http://localhost:3000/" -ForegroundColor Cyan
Write-Host "🔐 Autorizar Spotify: http://localhost:3000/admin/auth/spotify" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

node server.js
