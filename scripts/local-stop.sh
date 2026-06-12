#!/usr/bin/env zsh
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

screen -S checkinn-client -X quit >/dev/null 2>&1 || true
screen -S checkinn-api -X quit >/dev/null 2>&1 || true

if mysqladmin -h 127.0.0.1 -P 3308 -u root ping >/dev/null 2>&1; then
  mysqladmin -h 127.0.0.1 -P 3308 -u root shutdown >/dev/null 2>&1 || true
fi

screen -S checkinn-mysql -X quit >/dev/null 2>&1 || true

echo "CheckInn local deployment stopped."
echo "Logs are in $ROOT_DIR/*.log."
