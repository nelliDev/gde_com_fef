# Quick Start Guide - Using Docker MySQL

This guide shows how to use the existing Docker MySQL setup from the main repo.

## ✅ Already Set Up

The following has been configured for you:

1. ✅ `.env` file created with Docker MySQL credentials
2. ✅ Database `fef_activities` created
3. ✅ 200 activities scraped and saved
4. ✅ Docker MySQL container running

## Using the Scraper with Docker

### 1. Start MySQL Container (if not running)

```bash
cd /home/nelli/coding/gde_com_fef
docker-compose up -d db
```

### 2. Run the Scraper

```bash
cd scraper
source venv/bin/activate
python fef_scraper.py
```

### 3. Query the Data

```bash
# Interactive query tool
python query_activities.py

# Or query MySQL directly
docker exec gde_com_fef-db-1 mysql -uroot -proot fef_activities -e "SELECT * FROM activities LIMIT 10;"
```

## Access phpMyAdmin

The Docker setup includes phpMyAdmin for easy database browsing:

1. Make sure phpMyAdmin is running:
   ```bash
   docker-compose up -d phpmyadmin
   ```

2. Open in browser:
   ```
   http://localhost:8081
   ```

3. Login with:
   - Server: `db`
   - Username: `root`
   - Password: `root`

4. Navigate to database: `fef_activities`

## Current Data

**Database:** `fef_activities`
**Host:** `localhost:3306`
**User:** `root`
**Password:** `root`

**Tables:**
- `activities` - 200 records (all FEF UNICAMP activities)
- `scraping_history` - Scraping logs

## Common Commands

### Check if MySQL is running
```bash
docker ps | grep mysql
```

### View MySQL logs
```bash
docker logs gde_com_fef-db-1
```

### Stop MySQL
```bash
docker-compose stop db
```

### Restart MySQL
```bash
docker-compose restart db
```

### Backup database
```bash
docker exec gde_com_fef-db-1 mysqldump -uroot -proot fef_activities > backup.sql
```

### Restore database
```bash
docker exec -i gde_com_fef-db-1 mysql -uroot -proot fef_activities < backup.sql
```

## Database Schema

```sql
-- View table structure
docker exec gde_com_fef-db-1 mysql -uroot -proot fef_activities -e "DESCRIBE activities;"

-- Count records
docker exec gde_com_fef-db-1 mysql -uroot -proot fef_activities -e "SELECT COUNT(*) FROM activities;"

-- View recent scraping history
docker exec gde_com_fef-db-1 mysql -uroot -proot fef_activities -e "SELECT * FROM scraping_history ORDER BY scraped_at DESC LIMIT 5;"
```

## Troubleshooting

### Cannot connect to database
```bash
# Check if container is running
docker ps

# Restart container
docker-compose restart db

# Check logs
docker logs gde_com_fef-db-1
```

### Port 3306 already in use
If you have another MySQL running:
```bash
# Stop local MySQL
sudo systemctl stop mysql

# Or change port in docker-compose.yml
ports:
  - "3307:3306"  # Use port 3307 instead

# Then update .env
DB_HOST=localhost:3307
```

## Re-scraping Data

To fetch fresh data from the website:

```bash
cd scraper
source venv/bin/activate
python fef_scraper.py
```

This will:
1. Delete all existing records
2. Fetch fresh data from FEF UNICAMP
3. Save new records to database
4. Log the scraping event

## Scheduling Automatic Scraping

Use cron to run daily:

```bash
crontab -e

# Add this line to run every day at 2 AM
0 2 * * * cd /home/nelli/coding/gde_com_fef/scraper && /home/nelli/coding/gde_com_fef/scraper/venv/bin/python fef_scraper.py >> /var/log/fef_scraper.log 2>&1
```

---

**Status:** ✅ **WORKING**
- MySQL: Running in Docker
- Database: Created with 200 activities
- Scraper: Tested and functional
- Query Tool: Working
