"""
FEF UNICAMP Activities Web Scraper

This script scrapes physical activity offerings from the FEF UNICAMP website
and stores them in a MySQL database.

Requirements:
- Python 3.7+
- Libraries: requests, beautifulsoup4, mysql-connector-python, python-dotenv
"""

import requests
from bs4 import BeautifulSoup
import mysql.connector
from mysql.connector import Error
import re
from datetime import datetime
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'fef_activities'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_unicode_ci'
}

# Target URL
SCRAPER_URL = "https://sistemas.fef.unicamp.br/extensao/registrations/showOpenRegistrations/26"


class FEFActivityScraper:
    """Scraper for FEF UNICAMP physical activities"""
    
    def __init__(self, db_config: Dict):
        """Initialize the scraper with database configuration"""
        self.db_config = db_config
        self.connection = None
        
    def connect_to_database(self) -> bool:
        """Establish connection to MySQL database"""
        try:
            self.connection = mysql.connector.connect(**self.db_config)
            if self.connection.is_connected():
                print(f"✓ Successfully connected to MySQL database: {self.db_config['database']}")
                return True
        except Error as e:
            print(f"✗ Error connecting to MySQL database: {e}")
            return False
        return False
    
    def close_connection(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("✓ Database connection closed")
    
    def fetch_webpage(self, url: str) -> Optional[str]:
        """
        Fetch the webpage content
        
        Args:
            url: The URL to fetch
            
        Returns:
            HTML content as string or None if failed
        """
        try:
            print(f"Fetching webpage: {url}")
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            # Note: verify=True is the default, but some sites may have certificate issues
            # If you encounter SSL errors, you can set verify=False (not recommended for production)
            response = requests.get(url, headers=headers, timeout=30, verify=True)
            response.raise_for_status()
            response.encoding = 'utf-8'
            print(f"✓ Successfully fetched webpage (Status: {response.status_code})")
            return response.text
        except requests.exceptions.SSLError as e:
            print(f"⚠ SSL Certificate error. Retrying without verification...")
            try:
                response = requests.get(url, headers=headers, timeout=30, verify=False)
                response.raise_for_status()
                response.encoding = 'utf-8'
                print(f"✓ Successfully fetched webpage (Status: {response.status_code})")
                return response.text
            except requests.exceptions.RequestException as e2:
                print(f"✗ Error fetching webpage even without SSL verification: {e2}")
                return None
        except requests.exceptions.RequestException as e:
            print(f"✗ Error fetching webpage: {e}")
            return None
    
    def parse_schedule(self, schedule_text: str) -> str:
        """
        Parse and clean schedule text
        
        Args:
            schedule_text: Raw schedule text from HTML
            
        Returns:
            Cleaned schedule string
        """
        # Remove extra whitespace and <br> tags
        schedule = re.sub(r'<br\s*/?>', ' | ', schedule_text)
        schedule = re.sub(r'\s+', ' ', schedule).strip()
        # Remove trailing separator
        schedule = re.sub(r'\s*\|\s*$', '', schedule)
        return schedule
    
    def parse_cost(self, cost_text: str) -> float:
        """
        Parse cost text to extract numerical value
        
        Args:
            cost_text: Raw cost text (e.g., "R$ 250,00")
            
        Returns:
            Cost as float
        """
        # Remove "R$" and convert comma to dot
        cost_str = re.sub(r'[^\d,]', '', cost_text.strip())
        cost_str = cost_str.replace(',', '.')
        try:
            return float(cost_str)
        except ValueError:
            return 0.0
    
    def extract_activities(self, html_content: str) -> List[Dict]:
        """
        Extract activity information from HTML content
        
        Args:
            html_content: HTML content of the webpage
            
        Returns:
            List of dictionaries containing activity information
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        activities = []
        
        # Find all tables - handle both direct tables and tables with Bootstrap classes
        tables = soup.find_all('table', class_=lambda c: c and 'table-bordered' in c if c else False)
        
        if not tables:
            # Fallback: try finding tables without class requirement
            tables = soup.find_all('table')
        
        for table in tables:
            # Find category header (the row with background-color: #153975)
            category_row = table.find('td', style=lambda value: value and '#153975' in value)
            
            if not category_row:
                continue
                
            # Extract category name
            category = category_row.get_text(strip=True)
            
            # Find all activity rows (tbody elements)
            tbody_elements = table.find_all('tbody')
            
            for tbody in tbody_elements:
                tr = tbody.find('tr', class_=lambda c: c and 'text-center' in c if c else False)
                if not tr:
                    # Try without class filter
                    tr = tbody.find('tr')
                if not tr:
                    continue
                
                # Extract all td elements
                tds = tr.find_all('td')
                
                if len(tds) >= 4:
                    # Extract data from each column
                    class_name = tds[0].get_text(strip=True)
                    schedule_html = str(tds[1])
                    schedule = self.parse_schedule(tds[1].get_text(separator=' ', strip=True))
                    cost_text = tds[2].get_text(strip=True)
                    cost = self.parse_cost(cost_text)
                    enrollment_deadline = tds[3].get_text(strip=True)
                    
                    activity = {
                        'category': category,
                        'class_name': class_name,
                        'schedule': schedule,
                        'cost': cost,
                        'enrollment_deadline': enrollment_deadline
                    }
                    
                    activities.append(activity)
                    print(f"  ✓ Extracted: {category} - {class_name}")
        
        return activities
    
    def clear_existing_data(self) -> bool:
        """
        Clear existing data from the activities table
        
        Returns:
            True if successful, False otherwise
        """
        try:
            cursor = self.connection.cursor()
            cursor.execute("DELETE FROM activities")
            self.connection.commit()
            deleted_count = cursor.rowcount
            cursor.close()
            print(f"✓ Cleared {deleted_count} existing records from database")
            return True
        except Error as e:
            print(f"✗ Error clearing existing data: {e}")
            return False
    
    def save_to_database(self, activities: List[Dict]) -> bool:
        """
        Save activities to MySQL database
        
        Args:
            activities: List of activity dictionaries
            
        Returns:
            True if successful, False otherwise
        """
        if not activities:
            print("⚠ No activities to save")
            return False
        
        try:
            cursor = self.connection.cursor()
            
            insert_query = """
                INSERT INTO activities 
                (category, class_name, schedule, cost, enrollment_deadline)
                VALUES (%s, %s, %s, %s, %s)
            """
            
            for activity in activities:
                cursor.execute(insert_query, (
                    activity['category'],
                    activity['class_name'],
                    activity['schedule'],
                    activity['cost'],
                    activity['enrollment_deadline']
                ))
            
            self.connection.commit()
            print(f"✓ Successfully saved {len(activities)} activities to database")
            cursor.close()
            return True
            
        except Error as e:
            print(f"✗ Error saving to database: {e}")
            self.connection.rollback()
            return False
    
    def log_scraping_history(self, total_activities: int, status: str, error_message: str = None) -> bool:
        """
        Log scraping attempt to history table
        
        Args:
            total_activities: Number of activities scraped
            status: Status of the scraping (success/failure)
            error_message: Optional error message
            
        Returns:
            True if successful, False otherwise
        """
        try:
            cursor = self.connection.cursor()
            insert_query = """
                INSERT INTO scraping_history 
                (total_activities, status, error_message)
                VALUES (%s, %s, %s)
            """
            cursor.execute(insert_query, (total_activities, status, error_message))
            self.connection.commit()
            cursor.close()
            return True
        except Error as e:
            print(f"⚠ Warning: Could not log scraping history: {e}")
            return False
    
    def scrape(self, url: str = None, clear_existing: bool = True) -> bool:
        """
        Main scraping method
        
        Args:
            url: URL to scrape (default: SCRAPER_URL)
            clear_existing: Whether to clear existing data before inserting new data
            
        Returns:
            True if successful, False otherwise
        """
        if url is None:
            url = SCRAPER_URL
        
        print("="*60)
        print("FEF UNICAMP Activities Scraper")
        print("="*60)
        
        # Connect to database
        if not self.connect_to_database():
            return False
        
        try:
            # Fetch webpage
            html_content = self.fetch_webpage(url)
            if not html_content:
                self.log_scraping_history(0, 'failure', 'Failed to fetch webpage')
                return False
            
            # Extract activities
            print("\nExtracting activities...")
            activities = self.extract_activities(html_content)
            
            if not activities:
                print("⚠ No activities found")
                self.log_scraping_history(0, 'failure', 'No activities found in webpage')
                return False
            
            print(f"\n✓ Total activities extracted: {len(activities)}")
            
            # Clear existing data if requested
            if clear_existing:
                print("\nClearing existing data...")
                self.clear_existing_data()
            
            # Save to database
            print("\nSaving to database...")
            success = self.save_to_database(activities)
            
            # Log scraping history
            if success:
                self.log_scraping_history(len(activities), 'success')
                print("\n" + "="*60)
                print("✓ Scraping completed successfully!")
                print("="*60)
            else:
                self.log_scraping_history(0, 'failure', 'Failed to save to database')
            
            return success
            
        except Exception as e:
            print(f"\n✗ Unexpected error during scraping: {e}")
            self.log_scraping_history(0, 'failure', str(e))
            return False
        
        finally:
            self.close_connection()


def main():
    """Main entry point for the scraper"""
    scraper = FEFActivityScraper(DB_CONFIG)
    
    # Run the scraper
    success = scraper.scrape()
    
    if success:
        exit(0)
    else:
        exit(1)


if __name__ == "__main__":
    main()
