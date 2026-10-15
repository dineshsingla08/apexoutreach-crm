#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Installing Python requirements..."
pip install --no-cache-dir -r requirements.txt

echo "==> Verifying frontend static distribution..."
if [ -f "crm_app/dist/index.html" ]; then
  echo "✓ Frontend bundle found in crm_app/dist"
else
  echo "⚠️ Warning: Frontend bundle missing, compiling..."
  if command -v npm &> /dev/null; then
    npm --prefix crm_app install
    npm --prefix crm_app run build
  fi
fi

echo "==> Build process completed successfully!"
