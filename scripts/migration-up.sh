source ./.env
psql -U $PGUSER -d $DB_NAME -a -q -f ./migrations/2026-01-08-1655-up.sql
