@echo off
title fortext-ticket-bot-v14
echo.
echo [fortext-ticket-bot-v14] Başlatılıyor...
echo -------------------------------
echo.

REM Gerekli modüller yüklü değilse otomatik kur
if not exist node_modules (
  echo Gerekli modüller yükleniyor...
  npm install
  echo Modüller yüklendi!
  echo.
)

REM Botu başlat
node index.js

echo.
echo [fortext-ticket-bot-v14] Bot durdu. Çıkmak için bir tuşa bas...
pause >nul
