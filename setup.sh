#!/bin/bash

# GDE Setup Script for Docker

echo "Setting up GDE database..."

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
until docker-compose exec db mysql -u root -proot -e "SELECT 1" >/dev/null 2>&1; do
    sleep 2
done

echo "MySQL is ready!"

# Create a simple table for testing
docker-compose exec db mysql -u root -proot -e "
USE gde;
CREATE TABLE IF NOT EXISTS test_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO test_table (name) VALUES ('Test data');
"

echo "Database setup complete!"
echo ""
echo "Application URLs:"
echo "- Main application: http://localhost:8080"
echo "- phpMyAdmin: http://localhost:8081"
echo ""
echo "Database credentials:"
echo "- Host: db (from inside container) or localhost:3306 (from host)"
echo "- Database: gde"
echo "- Username: Web"
echo "- Password: gde123"
echo "- Root password: root"
echo ""
echo "Note: According to the README, you should download and import the full database:"
echo "1. Download gde_pacote.zip from https://gde.guaycuru.net/gde_pacote.zip"
echo "2. Extract the SQL file"
echo "3. Import it using: docker-compose exec db mysql -u root -proot gde < gde_pacote.sql"
