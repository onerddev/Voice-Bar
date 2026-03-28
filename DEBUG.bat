@echo off
chcp 65001 >nul
title VoiceBar - DEBUG

cd /d "%~dp0"

echo ==========================================
echo  VoiceBar - Modo Debug
echo ==========================================
echo.
echo Pasta atual: %cd%
echo.

echo Versao do Node:
node --version
echo.

echo Versao do NPM:
npm --version
echo.

echo Arquivos na pasta:
dir /b
echo.

echo Iniciando app...
echo.
npm start

echo.
echo ==========================================
echo  App encerrado. Pressione qualquer tecla.
echo ==========================================
pause
