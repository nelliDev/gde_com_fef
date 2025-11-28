# Database Configuration Guide

This guide explains how to configure the `.env` file for the FEF Activities Scraper.

## Quick Setup

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file:
   ```bash
   nano .env
   ```

3. Update the values as explained below.

## Configuration Variables

### DB_HOST
**Description:** The hostname or IP address of your MySQL server

**Common Values:**
- `localhost` - If MySQL is on the same machine
- `127.0.0.1` - Alternative to localhost
- `192.168.1.100` - If MySQL is on another machine in your network
- `mysql.example.com` - If using a remote MySQL server

**Example:**
```ini
DB_HOST=localhost
```

### DB_NAME
**Description:** The name of the database to use

**Default:** `fef_activities` (created by database_schema.sql)

**Note:** If you want to use a different database name:
1. Update this value
2. Also update the database name in `database_schema.sql`

**Example:**
```ini
DB_NAME=fef_activities
```

### DB_USER
**Description:** MySQL username with access to the database

**Common Values:**
- `root` - Default MySQL admin user (not recommended for production)
- `fef_user` - A dedicated user for this application (recommended)

**Example:**
```ini
DB_USER=root
```

### DB_PASSWORD
**Description:** Password for the MySQL user

**Security Notes:**
- Never commit `.env` to git (it's in .gitignore)
- Use a strong password for production
- Consider creating a dedicated MySQL user with limited permissions

**Example:**
```ini
DB_PASSWORD=your_secure_password_here
```

## Complete Example

Here's a complete `.env` file example:

```ini
# Database Configuration for FEF Activities Scraper
DB_HOST=localhost
DB_NAME=fef_activities
DB_USER=root
DB_PASSWORD=MySecurePassword123!
```

## Creating a Dedicated MySQL User (Recommended)

For better security, create a dedicated MySQL user instead of using root:

```sql
-- Log in to MySQL as root
mysql -u root -p

-- Create a new user
CREATE USER 'fef_user'@'localhost' IDENTIFIED BY 'your_password_here';

-- Grant permissions to the database
GRANT ALL PRIVILEGES ON fef_activities.* TO 'fef_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

Then update your `.env`:
```ini
DB_HOST=localhost
DB_NAME=fef_activities
DB_USER=fef_user
DB_PASSWORD=your_password_here
```

## Testing Your Configuration

After configuring `.env`, test the database connection:

```bash
# Activate virtual environment
source venv/bin/activate

# Try to run the scraper (it will test the connection)
python fef_scraper.py
```

If the connection fails, you'll see an error message like:
```
✗ Error connecting to MySQL database: Access denied for user 'username'@'localhost'
```

## Common Issues

### "Access denied for user"
**Problem:** Wrong username or password
**Solution:** Verify credentials in MySQL and update `.env`

### "Unknown database 'fef_activities'"
**Problem:** Database doesn't exist
**Solution:** Run `mysql -u root -p < database_schema.sql`

### "Can't connect to MySQL server"
**Problem:** MySQL service is not running or wrong host
**Solution:** 
```bash
# Start MySQL
sudo systemctl start mysql

# Check status
sudo systemctl status mysql
```

### "Host 'xxx' is not allowed to connect"
**Problem:** User not configured for remote access
**Solution:** Grant access for specific host in MySQL

## Environment Variables Priority

The scraper uses the following priority for configuration:
1. Values from `.env` file (if it exists)
2. Default values in the code:
   - DB_HOST: `localhost`
   - DB_NAME: `fef_activities`
   - DB_USER: `root`
   - DB_PASSWORD: `` (empty)

## Security Best Practices

1. ✅ **Never commit `.env` to version control**
   - The `.gitignore` file prevents this

2. ✅ **Use strong passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, and symbols

3. ✅ **Limit database user permissions**
   - Create a dedicated user
   - Grant only necessary permissions

4. ✅ **Protect file permissions**
   ```bash
   chmod 600 .env  # Only owner can read/write
   ```

5. ✅ **Use different passwords for different environments**
   - Development
   - Testing
   - Production

## Multiple Environments

If you need different configurations for different environments:

```bash
# Development
.env              # Default for development

# Production
.env.production   # Production settings

# Testing
.env.test         # Test database
```

Then modify the scraper to load different files:
```python
from dotenv import load_dotenv
import os

# Load production config
load_dotenv('.env.production')
```

## Troubleshooting Checklist

- [ ] MySQL is installed and running
- [ ] Database `fef_activities` exists
- [ ] User has correct permissions
- [ ] Password is correct (no extra spaces)
- [ ] `.env` file is in the `scraper/` directory
- [ ] Virtual environment is activated
- [ ] All dependencies are installed

## Getting Help

If you're still having issues:

1. Check MySQL is running:
   ```bash
   sudo systemctl status mysql
   ```

2. Test MySQL connection manually:
   ```bash
   mysql -u root -p
   ```

3. Verify the database exists:
   ```sql
   SHOW DATABASES;
   ```

4. Check the user exists:
   ```sql
   SELECT User, Host FROM mysql.user;
   ```
