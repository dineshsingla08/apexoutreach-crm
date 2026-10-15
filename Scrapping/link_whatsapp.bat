@echo off
title WhatsApp Web One-Time Device Pairing
cls
echo =======================================================================
echo          WHATSAPP WEB ONE-TIME DEVICE PAIRING SETUP
echo =======================================================================
echo.
echo Launching Google Chrome to link phone: +91 8958573159
echo Session Directory: d:\Dinesh\antigravity\Scrapping\.whatsapp_session
echo.
echo STEPS:
echo   1. Scan the QR code shown in the Chrome window using WhatsApp on
echo      your phone (+91 8958573159):
echo      Tap Menu (3 dots) or Settings -^> Linked Devices -^> Link a Device
echo.
echo   2. As soon as you see your chats appear on the screen,
echo      CLOSE THIS CHROME WINDOW.
echo.
echo   3. Your authentication will be permanently saved!
echo =======================================================================
echo.

start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="d:\Dinesh\antigravity\Scrapping\.whatsapp_session" "https://web.whatsapp.com"

echo Chrome launched! Press any key after you have scanned and closed Chrome.
pause
