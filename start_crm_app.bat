@echo off
title ApexOutreach CRM & Campaign Studio
cd /d "%~dp0"

echo =========================================================================
echo       APEXOUTREACH CRM & MULTI-CHANNEL CAMPAIGN STUDIO
echo =========================================================================
echo.
echo Launching unified production hosting (Frontend + Backend on Port 5005)...
echo.
python hosting.py %*
pause
