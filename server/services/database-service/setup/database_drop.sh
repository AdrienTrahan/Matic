#!/bin/bash

source .env

sql_drop="./server/services/database-service/development/drop_all.sql"
psql -U postgres -d "$DATABASE_NAME" -f "$sql_drop"
