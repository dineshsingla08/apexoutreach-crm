@echo off
cd /d "d:\Dinesh\antigravity\Scrapping"
echo ================================================================= >> daily_run.log
echo [Daily Healthcare Outreach] Starting automated dispatches at %date% %time% >> daily_run.log

echo [1/2] Running Email Outreach Batch (50 contacts)... >> daily_run.log
"C:\Python312\python.exe" send_outreach.py >> daily_run.log 2>&1

echo [2/2] Running WhatsApp Outreach Batch (50 contacts)... >> daily_run.log
"C:\Python312\python.exe" send_whatsapp.py >> daily_run.log 2>&1

echo [Daily Healthcare Outreach] All batches finished at %date% %time% >> daily_run.log
echo ================================================================= >> daily_run.log
