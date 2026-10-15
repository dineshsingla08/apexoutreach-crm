@echo off
title Gurgaon & Dwarka Google Maps Business Extractor
cd /d "%~dp0"

echo =========================================================================
echo       GURGAON & DWARKA BUSINESS EXTRACTOR (WITH EMAIL IDS)
echo =========================================================================
echo.
echo Target Locations: Gurgaon (Cyber City, Udyog Vihar, Manesar, Golf Course, etc.)
echo                   Dwarka (Sectors 6, 10, 12, Ramphal Chowk, Dwarka Mor, etc.)
echo.
echo Select Run Option:
echo   [1] Full Headless Scraping (All categories: Industry, IT, Food, Clinics, Shops)
echo   [2] Fast Scraping (3 scrolls per query for quick extraction)
echo   [3] Visible GUI Mode (Watch browser collect listings live)
echo.
set /p choice="Enter choice [1, 2, or 3]: "

if "%choice%"=="1" (
    echo.
    echo Starting Full Headless Extractor...
    python scrape_gurgaon_dwarka.py --scrolls 6
) else if "%choice%"=="2" (
    echo.
    echo Starting Fast Extractor (3 scrolls)...
    python scrape_gurgaon_dwarka.py --scrolls 3
) else if "%choice%"=="3" (
    echo.
    echo Starting in Visible GUI Mode...
    python scrape_gurgaon_dwarka.py --gui --scrolls 4
) else (
    echo Defaulting to option 1...
    python scrape_gurgaon_dwarka.py --scrolls 5
)

echo.
pause
