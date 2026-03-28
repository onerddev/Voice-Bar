@echo off
chcp 65001 >nul
title VoiceBar

cd /d "%~dp0"

echo ==========================================
echo  VoiceBar - Assistente de Voz
echo  Pasta: %cd%
echo ==========================================
echo.

:: Verifica Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    start https://nodejs.org/en/download
    pause & exit /b 1
)
echo [OK] Node.js encontrado: 
node --version
echo.

:: Verifica se package.json existe aqui
if not exist "%~dp0package.json" (
    echo ERRO: package.json nao encontrado em %~dp0
    echo Extraia o ZIP completamente antes de rodar!
    pause & exit /b 1
)

:: Instala dependencias
if not exist "%~dp0node_modules\electron\dist\electron.exe" (
    echo Instalando dependencias...
    pushd "%~dp0"
    call npm install
    popd
    if not exist "%~dp0node_modules\electron\dist\electron.exe" (
        echo.
        echo ERRO: Electron nao foi instalado.
        echo Tente executar como Administrador.
        pause & exit /b 1
    )
    echo [OK] Instalado!
) else (
    echo [OK] Dependencias ja instaladas!
)
echo.

:: Inicia
echo Iniciando VoiceBar... (Alt+Space para mostrar/ocultar)
echo.
"%~dp0node_modules\electron\dist\electron.exe" "%~dp0main.js"
echo.
echo App encerrado.
pause
