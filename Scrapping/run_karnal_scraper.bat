@echo off
title Karnal Business Scraper for GST Returns
cls
echo =======================================================================
echo     KARNAL BUSINESS SCRAPER - GST RETURN FILING OUTREACH
echo =======================================================================
echo.
echo Target City: Karnal, Haryana (Rice Mills, Mandi, Industrial, Auto, Trade)
echo Output CSV:  d:\Dinesh\antigravity\Scrapping\businesses_in_karnal_gst.csv
echo Dashboard:   d:\Dinesh\antigravity\Scrapping\preview_karnal_gst.html
echo.
echo Running scraper...
echo =======================================================================
echo.

C:\Python312\python.exe d:\Dinesh\antigravity\Scrapping\scrape_karnal_gst.py %*

echo.
echo Scraper finished!
pause
