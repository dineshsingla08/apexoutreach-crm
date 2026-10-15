@echo off
echo =================================================================
echo   Registering Healthcare Outreach Daily Task (11:00 AM Daily)
echo =================================================================

schtasks /create /tn "HealthcareOutreach11AM" /tr "d:\Dinesh\antigravity\Scrapping\run_daily.bat" /sc daily /st 11:00 /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Windows Scheduled Task 'HealthcareOutreach11AM' registered successfully!
    echo [i] It will run automatically every day at 11:00 AM without intervention.
    echo [i] It sends 50 clinic emails per day and progresses automatically through the CSV.
) else (
    echo.
    echo [!] Note: To register the scheduled task, please run this .bat as Administrator.
)

pause
