@echo off
title Karnal Businesses Mutual Fund Outreach Campaign
cd /d "%~dp0"

echo =======================================================
echo     Karnal Businesses Mutual Fund Outreach Runner
echo =======================================================
echo.
echo Select Run Mode:
echo   [1] Send 1 Test Email to test_recipient (dineshsingla08@gmail.com)
echo   [2] Dry Run (Preview terminal output without sending)
echo   [3] Live Send One by One to All Karnal Businesses
echo.
set /p choice="Enter choice [1, 2, or 3]: "

if "%choice%"=="1" (
    echo.
    echo Running in TEST mode...
    python send_karnal_mf_outreach.py --test
) else if "%choice%"=="2" (
    echo.
    echo Running DRY RUN preview...
    python send_karnal_mf_outreach.py --dry-run
) else if "%choice%"=="3" (
    echo.
    echo Starting LIVE Mutual Fund email campaign one by one...
    python send_karnal_mf_outreach.py --live
) else (
    echo Invalid choice. Defaulting to test mode.
    python send_karnal_mf_outreach.py --test
)

echo.
pause
