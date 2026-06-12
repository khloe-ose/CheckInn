#!/usr/bin/env zsh
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MYSQL_DIR="$ROOT_DIR/.local-mysql"
MYSQL_DATA="$MYSQL_DIR/data"
MYSQL_RUN="$MYSQL_DIR/run"
MYSQL_PORT="3308"

mkdir -p "$MYSQL_DATA" "$MYSQL_RUN"

fresh_db=0
if [ ! -d "$MYSQL_DATA/mysql" ]; then
  fresh_db=1
  mysqld --no-defaults --initialize-insecure --datadir="$MYSQL_DATA"
fi

screen -S checkinn-mysql -X quit >/dev/null 2>&1 || true
screen -S checkinn-api -X quit >/dev/null 2>&1 || true
screen -S checkinn-client -X quit >/dev/null 2>&1 || true

screen -dmS checkinn-mysql zsh -lc "cd '$ROOT_DIR' && mysqld --no-defaults --datadir='$MYSQL_DATA' --port=$MYSQL_PORT --socket='$MYSQL_RUN/mysql.sock' --pid-file='$MYSQL_RUN/mysql.pid' --bind-address=127.0.0.1 --mysqlx=0 > '$ROOT_DIR/mysql-local.log' 2>&1"

for attempt in {1..20}; do
  if mysqladmin -h 127.0.0.1 -P "$MYSQL_PORT" -u root ping >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! mysqladmin -h 127.0.0.1 -P "$MYSQL_PORT" -u root ping >/dev/null 2>&1; then
  echo "MySQL did not start. Check mysql-local.log."
  exit 1
fi

if [ "$fresh_db" -eq 1 ]; then
  mysql -h 127.0.0.1 -P "$MYSQL_PORT" -u root < "$ROOT_DIR/server/database/schema.sql"
  mysql -h 127.0.0.1 -P "$MYSQL_PORT" -u root checkinn_db < "$ROOT_DIR/server/database/seed.sql"
fi

screen -dmS checkinn-api zsh -lc "cd '$ROOT_DIR/server' && npm run dev > '$ROOT_DIR/server-dev.log' 2>&1"
screen -dmS checkinn-client zsh -lc "cd '$ROOT_DIR/client' && npm run dev -- --host 127.0.0.1 > '$ROOT_DIR/client-dev.log' 2>&1"

echo "CheckInn local deployment is starting."
echo "Frontend: http://127.0.0.1:5173"
echo "API: http://localhost:5001/api"
echo "Run npm run local:status to verify."
