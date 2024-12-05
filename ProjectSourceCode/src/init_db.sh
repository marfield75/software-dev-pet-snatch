#!/bin/bash

# DO NOT PUSH THIS FILE TO GITHUB
# This file contains sensitive information and should be kept private

# TODO: Set your PostgreSQL URI - Use the External Database URL from the Render dashboard
PG_URI="postgresql://users_db_qgkn_user:Ox9h1fe3cZcm4k10Bf5EXQ1PUQ76NRQ9@dpg-ct8lblu8ii6s73ccb30g-a.oregon-postgres.render.com/users_db_qgkn"

# Execute each .sql file in the directory
for file in init_data/*.sql; do
    echo "Executing $file..."
    psql $PG_URI -f "$file"
done