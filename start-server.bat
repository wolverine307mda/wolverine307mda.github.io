@echo off
echo 🚀 Iniciando servidor de Spotify Stats...
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si existe package.json
if not exist package.json (
    echo ❌ No se encontró package.json. Asegúrate de estar en el directorio correcto.
    pause
    exit /b 1
)

REM Verificar dependencias
if not exist node_modules (
    echo 📦 Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error al instalar dependencias
        pause
        exit /b 1
    )
)

echo ✅ Iniciando servidor...
echo.
echo 📊 Panel de admin: http://localhost:3000/admin.html
echo 🌐 Portfolio: http://localhost:3000/
echo 🔐 Autorizar Spotify: http://localhost:3000/admin/auth/spotify
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

node server.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ El servidor se detuvo con errores
    pause
)
