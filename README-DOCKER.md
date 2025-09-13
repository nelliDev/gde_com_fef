# GDE - Docker Setup

This repository contains a complete Docker setup for the GDE (academic system) application.

## Quick Start

1. **Clone and setup the repository**:
   ```bash
   git clone <your-repo-url>
   cd gde_com_fef
   ```

2. **Start the application**:
   ```bash
   docker-compose up -d
   ./setup.sh
   ```

3. **Access the application**:
   - **Main application**: http://localhost:3000
   - **phpMyAdmin**: http://localhost:8081

## Services

### Web Application (Port 3000)
- **Technology**: PHP 8.1 with Apache
- **Framework**: Doctrine ORM
- **Extensions**: GD, PDO, MySQL, mbstring, curl, zip, intl, opcache, xml

### Database (Port 3306)
- **Technology**: MySQL 8.0
- **Database**: `gde`
- **Username**: `Web`
- **Password**: `gde123`
- **Root password**: `root`

### phpMyAdmin (Port 8081)
- **URL**: http://localhost:8081
- **Username**: `Web`
- **Password**: `gde123`

## Database Setup

The application currently runs with a minimal database setup for testing. For full functionality, you need to import the complete database:

1. **Download the database package**:
   ```bash
   wget https://gde.guaycuru.net/gde_pacote.zip
   unzip gde_pacote.zip
   ```

2. **Import the database**:
   ```bash
   docker-compose exec db mysql -u root -proot gde < gde_pacote.sql
   ```

3. **Update Doctrine schema** (if needed):
   ```bash
   docker-compose exec web php vendor/bin/doctrine orm:schema-tool:update --force
   ```

## Login Credentials

According to the README, you can use these credentials:
- **Username**: `login1`
- **Password**: `gde42`

## Docker Commands

### Start the application
```bash
docker-compose up -d
```

### Stop the application
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f web
docker-compose logs -f db
```

### Access the web container
```bash
docker-compose exec web bash
```

### Access the database container
```bash
docker-compose exec db mysql -u root -proot
```

### Rebuild containers
```bash
docker-compose down
docker-compose up --build -d
```

## Configuration

### Database Configuration
The database connection is configured in `common/config.inc.php`:
- Host: `db` (Docker service name)
- Database: `gde`
- Username: `Web`
- Password: `gde123`

### Application URL
The application is configured to run at `http://localhost:8080/`

## Development

### Making Changes
1. Edit the source code
2. The changes will be reflected immediately (volume mounted)
3. For PHP configuration changes, restart the web container:
   ```bash
   docker-compose restart web
   ```

### Adding PHP Extensions
1. Edit the `Dockerfile`
2. Add the required extensions to the `docker-php-ext-install` command
3. Rebuild the container:
   ```bash
   docker-compose up --build -d
   ```

## Troubleshooting

### Port Conflicts
If you get "port already in use" errors:
1. Stop any local MySQL/Apache services:
   ```bash
   sudo systemctl stop mysql
   sudo systemctl stop apache2
   ```
2. Or change the port mappings in `docker-compose.yml`

### Permission Issues
If you encounter permission issues:
```bash
docker-compose exec web chown -R www-data:www-data /var/www/html
```

### Database Connection Issues
1. Check if the database container is running:
   ```bash
   docker-compose ps
   ```
2. Check database logs:
   ```bash
   docker-compose logs db
   ```

## Original Installation Notes

This is the GDE version 2.5, which replaced version 2.3 on 22/12/2017. It uses:
- PHP 7.4+ with Doctrine ORM
- MySQL 5.6.4+ or MariaDB 10.0.5+
- Apache with mod_rewrite

All original installation requirements have been containerized for easy deployment.
