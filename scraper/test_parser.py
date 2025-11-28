"""
Test script to verify HTML parsing without database connection

This script tests the scraper's ability to parse the HTML file
without requiring a database connection.
"""

from fef_scraper import FEFActivityScraper, DB_CONFIG
from bs4 import BeautifulSoup
import os


def test_with_local_file():
    """Test the scraper with the local HTML file"""
    
    # Path to the example HTML file
    html_file = "../atividades-fef-example.html"
    
    if not os.path.exists(html_file):
        print(f"❌ File not found: {html_file}")
        return
    
    print("="*60)
    print("Testing HTML Parser with Local File")
    print("="*60)
    
    # Read the HTML file
    print(f"\nReading file: {html_file}")
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    print("✓ File loaded successfully")
    
    # Create scraper instance (won't connect to DB)
    scraper = FEFActivityScraper(DB_CONFIG)
    
    # Extract activities
    print("\nExtracting activities...")
    activities = scraper.extract_activities(html_content)
    
    print(f"\n✓ Total activities extracted: {len(activities)}")
    
    # Display summary by category
    print("\n" + "="*60)
    print("Summary by Category")
    print("="*60)
    
    categories = {}
    for activity in activities:
        cat = activity['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(activity)
    
    for category, items in sorted(categories.items()):
        print(f"\n📚 {category}: {len(items)} activities")
        for activity in items[:3]:  # Show first 3 in each category
            cost_str = f"R$ {activity['cost']:.2f}" if activity['cost'] > 0 else "FREE"
            print(f"   • {activity['class_name']}")
            print(f"     ⏰ {activity['schedule']}")
            print(f"     💰 {cost_str}")
        if len(items) > 3:
            print(f"   ... and {len(items) - 3} more")
    
    # Display detailed view of first 5 activities
    print("\n" + "="*60)
    print("First 5 Activities (Detailed View)")
    print("="*60)
    
    for i, activity in enumerate(activities[:5], 1):
        print(f"\n{i}. Category: {activity['category']}")
        print(f"   Class: {activity['class_name']}")
        print(f"   Schedule: {activity['schedule']}")
        print(f"   Cost: R$ {activity['cost']:.2f}")
        print(f"   Deadline: {activity['enrollment_deadline']}")
    
    # Statistics
    print("\n" + "="*60)
    print("Statistics")
    print("="*60)
    
    total = len(activities)
    free = sum(1 for a in activities if a['cost'] == 0)
    paid = total - free
    
    print(f"\n📊 Total Activities: {total}")
    print(f"🆓 Free Activities: {free}")
    print(f"💵 Paid Activities: {paid}")
    
    if paid > 0:
        costs = [a['cost'] for a in activities if a['cost'] > 0]
        avg_cost = sum(costs) / len(costs)
        min_cost = min(costs)
        max_cost = max(costs)
        
        print(f"\n💰 Price Range:")
        print(f"   Minimum: R$ {min_cost:.2f}")
        print(f"   Maximum: R$ {max_cost:.2f}")
        print(f"   Average: R$ {avg_cost:.2f}")
    
    print("\n" + "="*60)
    print("✓ Test completed successfully!")
    print("="*60)
    
    return activities


if __name__ == "__main__":
    activities = test_with_local_file()
    
    if activities:
        print(f"\n✅ Successfully extracted {len(activities)} activities from HTML file")
        print("\nThe scraper is working correctly!")
        print("\nNext steps:")
        print("1. Set up your MySQL database")
        print("2. Configure .env with your database credentials")
        print("3. Run: python fef_scraper.py")
    else:
        print("\n❌ Failed to extract activities")
