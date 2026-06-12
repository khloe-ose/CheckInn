#!/usr/bin/env zsh
set -e

echo "Screen sessions:"
screen -ls | grep checkinn || true

echo ""
echo "Ports:"
lsof -iTCP:3308 -sTCP:LISTEN -n -P || true
lsof -iTCP:5001 -sTCP:LISTEN -n -P || true
lsof -iTCP:5173 -sTCP:LISTEN -n -P || true

echo ""
echo "API health:"
curl -sS http://localhost:5001/api/health || true
echo ""
