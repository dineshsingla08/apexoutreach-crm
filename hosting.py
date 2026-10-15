#!/usr/bin/env python3
"""
=============================================================================
  APEXOUTREACH CRM & CAMPAIGN STUDIO - UNIFIED HOSTING ENGINE
=============================================================================
Hosts both the React 19 Frontend and Python Flask Backend in working condition
on a single port, with zero configuration.

Usage:
    python hosting.py                 # Standard production hosting (default: port 5005)
    python hosting.py --port 8080     # Host on custom port
    python hosting.py --build         # Force fresh build of React frontend before hosting
    python hosting.py --dev           # Launch in full live dev mode (Vite 3000 + Flask 5005)
    python hosting.py --no-browser    # Host in headless/server mode without opening browser
=============================================================================
"""

import os
import sys
import time
import socket
import argparse
import webbrowser
import subprocess
import threading
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Base paths
ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, "crm_app")
BACKEND_DIR = os.path.join(ROOT_DIR, "crm_backend")
DIST_DIR = os.path.join(FRONTEND_DIR, "dist")
SCRAPPING_DIR = os.path.join(ROOT_DIR, "Scrapping")

def print_banner(host, port, mode="Production (Unified)"):
    lan_ip = get_lan_ip()
    print("\n" + "=" * 74)
    print("  🚀 APEXOUTREACH CRM & CAMPAIGN STUDIO - HOSTING RUNNER")
    print("=" * 74)
    print(f"  • Mode:         {mode}")
    print(f"  • Local URL:    http://localhost:{port}/")
    print(f"  • Network URL:  http://{lan_ip}:{port}/")
    print(f"  • Backend API:  http://localhost:{port}/api/")
    print(f"  • Dist Bundle:  {DIST_DIR}")
    print("=" * 74 + "\n")

def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def check_frontend_bundle(force_build=False):
    index_html = os.path.join(DIST_DIR, "index.html")
    needs_build = force_build or not os.path.exists(index_html)
    
    if needs_build:
        print("📦 Building React production bundle with Vite in crm_app...")
        cmd = "npm run build"
        try:
            res = subprocess.run(cmd, shell=True, cwd=FRONTEND_DIR, check=True)
            if res.returncode == 0:
                print("✓ React frontend compiled successfully to crm_app/dist!\n")
            else:
                print("⚠️ Build command returned non-zero exit code.")
        except Exception as e:
            print(f"❌ Error during frontend build: {e}")
            if not os.path.exists(index_html):
                print("Aborting: Frontend bundle is missing.")
                sys.exit(1)
    else:
        print("✓ Production frontend assets verified in crm_app/dist.\n")

def wait_for_server(port, timeout=15):
    start = time.time()
    url = f"http://127.0.0.1:{port}/"
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'HostingHealthCheck'})
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(0.4)
    return False

def open_browser_later(url):
    time.sleep(1.2)
    try:
        webbrowser.open(url)
    except Exception:
        pass

def run_dev_mode():
    print("\n🛠️  Starting ApexOutreach in Full Development Mode...")
    print("   • Backend API on http://127.0.0.1:5005")
    print("   • Vite Hot-Reloading Frontend on http://localhost:3000\n")
    
    # Start Backend
    backend_proc = subprocess.Popen([sys.executable, os.path.join(BACKEND_DIR, "server.py")], cwd=ROOT_DIR)
    
    # Start Frontend
    time.sleep(1)
    frontend_proc = subprocess.Popen("npm run dev", shell=True, cwd=FRONTEND_DIR)
    
    threading.Thread(target=open_browser_later, args=("http://localhost:3000",), daemon=True).start()
    
    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down dev servers...")
        backend_proc.terminate()
        frontend_proc.terminate()

def run_production_hosting(host, port, open_browser=True):
    # Ensure Scrapping folder and files exist
    os.makedirs(SCRAPPING_DIR, exist_ok=True)
    
    print_banner(host, port, mode="Unified Full-Stack (Flask + Vite Dist)")
    
    # Set environment variables for server.py
    env = os.environ.copy()
    env["HOST"] = host
    env["PORT"] = str(port)
    env["BASE_DIR"] = ROOT_DIR
    
    server_path = os.path.join(BACKEND_DIR, "server.py")
    
    # Launch server
    proc = subprocess.Popen([sys.executable, server_path], cwd=ROOT_DIR, env=env)
    
    if open_browser:
        app_url = f"http://localhost:{port}/"
        def browser_task():
            if wait_for_server(port):
                print(f"🌐 Server is responsive! Opening browser at {app_url}...")
                webbrowser.open(app_url)
            else:
                print(f"⚠️ Health check timed out, but server is listening on port {port}.")
        threading.Thread(target=browser_task, daemon=True).start()
        
    try:
        proc.wait()
    except KeyboardInterrupt:
        print("\nStopping ApexOutreach server...")
        proc.terminate()
        proc.wait()
        print("Server safely stopped.")

def main():
    parser = argparse.ArgumentParser(description="ApexOutreach CRM & Campaign Studio Hosting Runner")
    parser.add_argument("-p", "--port", type=int, default=int(os.environ.get("PORT", 5005)), help="Hosting port (default: 5005)")
    parser.add_argument("-H", "--host", type=str, default=os.environ.get("HOST", "0.0.0.0"), help="Host address (default: 0.0.0.0)")
    parser.add_argument("-b", "--build", action="store_true", help="Force rebuild React frontend before hosting")
    parser.add_argument("-d", "--dev", action="store_true", help="Launch in split development mode (Vite 3000 + Flask 5005)")
    parser.add_argument("--no-browser", action="store_true", help="Do not automatically open browser on startup")
    
    args = parser.parse_args()
    
    if args.dev:
        run_dev_mode()
        return

    # Verify or compile React frontend
    check_frontend_bundle(force_build=args.build)
    
    # Run unified hosting
    run_production_hosting(args.host, args.port, open_browser=not args.no_browser)

if __name__ == "__main__":
    main()
