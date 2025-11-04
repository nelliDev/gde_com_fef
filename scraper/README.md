# FEF UNICAMP Activities Web Scraper

A Python web scraper that extracts physical activity offerings from the FEF UNICAMP extension website and stores them in a MySQL database.

## Features

- 🕷️ Scrapes activity data from [FEF UNICAMP Extension Website](https://sistemas.fef.unicamp.br/extensao/registrations/showOpenRegistrations/26)
- 📊 Extracts the following information:
  - Activity category (e.g., Artes Marciais, Atletismo, etc.)
  - Class name/turma (e.g., "A - Taichichuan (Iniciante)")
  - Schedule (days of the week + start and finish times)
  - Cost (in Brazilian Reais)
  - Enrollment deadline
- 💾 Stores data in MySQL database
- 📝 Tracks scraping history
- 🔄 Option to clear existing data before new scraping

## Project Structure

```
scraper/
├── fef_scraper.py          # Main scraper script
├── database_schema.sql     # MySQL database schema
├── requirements.txt        # Python dependencies
├── .env.example           # Example environment configuration
└── README.md              # This file
```

## Requirements

- Python 3.7 or higher
- MySQL 5.7 or higher (or MariaDB)
- pip (Python package manager)

## Installation

### 1. Clone or navigate to the project directory

```bash
cd /home/nelli/coding/gde_com_fef/scraper
```

### 2. Create a virtual environment (recommended)

```bash
python3 -m venv venv
source venv/bin/activate  # On Linux/Mac
# or
venv\Scripts\activate  # On Windows
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up MySQL database

First, create the database and tables:

```bash
mysql -u root -p < database_schema.sql
```

Or manually run the SQL commands from `database_schema.sql` in your MySQL client.

### 5. Configure environment variables

Copy the example environment file and edit it with your database credentials:

```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

Edit the `.env` file with your MySQL configuration:

```ini
DB_HOST=localhost
DB_NAME=fef_activities
DB_USER=root
DB_PASSWORD=your_actual_password
```

## Usage

### Basic Usage

Run the scraper to fetch and store activities:

```bash
python fef_scraper.py
```

### What the scraper does:

1. ✅ Connects to MySQL database
2. 🌐 Fetches the webpage from FEF UNICAMP
3. 🔍 Extracts all activities with their details
4. 🗑️ Clears existing data (optional, default: yes)
5. 💾 Saves new data to the database
6. 📝 Logs the scraping attempt in history table

### Expected Output

```
============================================================
FEF UNICAMP Activities Scraper
============================================================
✓ Successfully connected to MySQL database: fef_activities
Fetching webpage: https://sistemas.fef.unicamp.br/extensao/registrations/showOpenRegistrations/26
✓ Successfully fetched webpage (Status: 200)

Extracting activities...
  ✓ Extracted: Artes Marciais - A - Taichichuan (Iniciante)
  ✓ Extracted: Artes Marciais - B - Kungfu Tradicional
  ✓ Extracted: ATLETISMO - A - Grupo De Corrida
  ...

✓ Total activities extracted: 87

Clearing existing data...
✓ Cleared 0 existing records from database

Saving to database...
✓ Successfully saved 87 activities to database

============================================================
✓ Scraping completed successfully!
============================================================
✓ Database connection closed
```

## Database Schema

### `activities` table

| Column              | Type          | Description                          |
|---------------------|---------------|--------------------------------------|
| id                  | INT (PK)      | Auto-incrementing ID                 |
| category            | VARCHAR(255)  | Activity category                    |
| class_name          | VARCHAR(255)  | Class/turma name                     |
| schedule            | TEXT          | Class schedule (days and times)      |
| cost                | DECIMAL(10,2) | Cost in Reais                        |
| enrollment_deadline | VARCHAR(255)  | Enrollment deadline                  |
| scraped_at          | TIMESTAMP     | When the data was scraped            |

### `scraping_history` table

| Column          | Type          | Description                    |
|-----------------|---------------|--------------------------------|
| id              | INT (PK)      | Auto-incrementing ID           |
| scraped_at      | TIMESTAMP     | When scraping occurred         |
| total_activities| INT           | Number of activities scraped   |
| status          | VARCHAR(50)   | success or failure             |
| error_message   | TEXT          | Error details (if any)         |

## Querying the Data

### View all activities:

```sql
SELECT * FROM activities ORDER BY category, class_name;
```

### Get activities by category:

```sql
SELECT * FROM activities WHERE category = 'ATLETISMO';
```

### Find free activities:

```sql
SELECT * FROM activities WHERE cost = 0;
```

### Get activities within a price range:

```sql
SELECT * FROM activities WHERE cost BETWEEN 200 AND 300;
```

### Check scraping history:

```sql
SELECT * FROM scraping_history ORDER BY scraped_at DESC LIMIT 10;
```

## Customization

### Modify the scraper behavior

You can modify the scraper by editing `fef_scraper.py`:

```python
from fef_scraper import FEFActivityScraper, DB_CONFIG

scraper = FEFActivityScraper(DB_CONFIG)

# Scrape without clearing existing data
scraper.scrape(clear_existing=False)

# Scrape from a different URL (if needed)
scraper.scrape(url="https://different-url.com")
```

## Troubleshooting

### Connection Error

If you get a database connection error:
- Check your `.env` file has correct credentials
- Verify MySQL is running: `systemctl status mysql`
- Test connection: `mysql -u root -p`

### No activities found

If the scraper reports "No activities found":
- Check if the website structure has changed
- Verify the URL is accessible
- Check your internet connection

### Import Errors

If you get import errors:
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

## Scheduling Automatic Scraping

You can schedule the scraper to run automatically using cron (Linux/Mac):

```bash
# Edit crontab
crontab -e

# Add a line to run daily at 2 AM
0 2 * * * cd /home/nelli/coding/gde_com_fef/scraper && /path/to/venv/bin/python fef_scraper.py >> /var/log/fef_scraper.log 2>&1
```

## License

This project is for educational purposes. Please respect the terms of service of the FEF UNICAMP website.

## Notes

- The scraper includes a 30-second timeout for HTTP requests
- Data is encoded in UTF-8 to handle Portuguese characters
- The scraper uses BeautifulSoup for robust HTML parsing
- All timestamps are in the server's local timezone

## Support

For issues or questions, please check:
1. The website structure hasn't changed
2. Your database credentials are correct
3. All dependencies are installed
4. MySQL service is running

## Example HTML Structure

The scraper expects HTML with this structure:

```html
<table class="table-bordered">
  <thead>
    <tr>
      <td colspan="4" style="background-color: #153975;">
        <strong>Category Name</strong>
      </td>
    </tr>
    <tr>
      <td>Turma</td>
      <td>Horários</td>
      <td>Valor</td>
      <td>Inscrições</td>
    </tr>
  </thead>
  <tbody>
    <tr class="text-center">
      <td>A - Class Name</td>
      <td>Mon, Wed - 18:00 to 19:00<br/></td>
      <td>R$ 250,00</td>
      <td>07/08/25 8:00 until 30/09/25 23:55</td>
    </tr>
  </tbody>
</table>
```
