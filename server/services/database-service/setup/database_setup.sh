#!/bin/bash

source .env

sql_folder_table="./server/services/database-service/initialization"

# Loop through each SQL file in the folder
for file in "$sql_folder_table"/*.sql; do
    if [ -f "$file" ]; then
        psql -U postgres -d "$PG_NAME" -f "$file"
    fi
done

# sql_folder_functions="./server/services/database-service/functions"

# find "$sql_folder_functions" -type f -name "*.sql" | while read -r file; do
#     psql -U postgres -d "$PG_NAME" -f "$file"
# done


