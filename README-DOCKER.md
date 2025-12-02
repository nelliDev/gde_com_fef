# GDE - Docker Installation Guide

Complete installation guide for running GDE using Docker.

## Installation Steps

1. **Start Docker containers**:
   ```bash
   docker-compose up -d
   ```

2. **Run setup script**:
   ```bash
   ./setup.sh
   ```

3. **Install PHP dependencies**:
   ```bash
   docker-compose exec web composer install
   ```

4. **Create and configure the config file**:
   ```bash
   cp common/config-sample.inc.php common/config.inc.php
   ```
   
   Edit `common/config.inc.php` and update:
   - Line 9: Change `define('CONFIG_DB_HOST', '127.0.0.1');` to `define('CONFIG_DB_HOST', 'db');`
   - Line 12: Change `define('CONFIG_DB_PASS', '');` to `define('CONFIG_DB_PASS', 'gde123');`
   - Line 27: Change `define('CONFIG_URL', 'http://localhost/Web/gde/');` to `define('CONFIG_URL', 'http://localhost:3000/');`

5. **Fix permissions**:
   ```bash
   docker-compose exec web chmod -R 777 /var/www/html/proxies
   ```

6. **Update database schema**:
   ```bash
   docker-compose exec web php vendor/bin/doctrine orm:schema-tool:update --force
   ```

## Access the Application

- **Main application**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8081

## Login Credentials

- **Username**: `login1`
- **Password**: `gde42`

## Database Credentials

- **Database**: `gde`
- **Username**: `Web`
- **Password**: `gde123`
- **Root password**: `root`

## Optional: Import Full Database

For full functionality with actual course data:

1. Download the database package:
   ```bash
   wget https://gde.guaycuru.net/gde_pacote.zip
   unzip gde_pacote.zip
   ```

2. Import the database:
   ```bash
   docker-compose exec db mysql -u root -proot gde < gde_pacote.sql
   ```

## Useful Commands

**Stop the application**:
```bash
docker-compose down
```

**View logs**:
```bash
docker-compose logs -f web
docker-compose logs -f db
```

**Restart containers**:
```bash
docker-compose restart
```
