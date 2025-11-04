"""
Test script to fetch and parse the live website without database

This script tests fetching from the actual FEF UNICAMP website
and parsing the HTML, without requiring a database connection.
"""

from fef_scraper import FEFActivityScraper, DB_CONFIG, SCRAPER_URL


def test_live_website():
    """Test the scraper with the live website"""
    
    print("="*60)
    print("Testing Scraper with Live Website")
    print("="*60)
    print(f"\nTarget URL: {SCRAPER_URL}")
    
    # Create scraper instance (won't connect to DB yet)
    scraper = FEFActivityScraper(DB_CONFIG)
    
    # Fetch webpage
    html_content = scraper.fetch_webpage(SCRAPER_URL)
    
    if not html_content:
        print("\n❌ Failed to fetch webpage")
        return None
    
    # Extract activities
    print("\nExtracting activities...")
    activities = scraper.extract_activities(html_content)
    
    print(f"\n✓ Total activities extracted: {len(activities)}")
    
    if not activities:
        print("\n⚠️  No activities found. The website structure may have changed.")
        print("Saving HTML for inspection...")
        with open('debug_output.html', 'w', encoding='utf-8') as f:
            f.write(html_content)
        print("✓ HTML saved to debug_output.html")
        return None
    
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
        for activity in items[:2]:  # Show first 2 in each category
            cost_str = f"R$ {activity['cost']:.2f}" if activity['cost'] > 0 else "FREE"
            print(f"   • {activity['class_name']}")
            print(f"     ⏰ {activity['schedule']}")
            print(f"     💰 {cost_str}")
        if len(items) > 2:
            print(f"   ... and {len(items) - 2} more")
    
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
    activities = test_live_website()
    
    if activities:
        print(f"\n✅ Successfully extracted {len(activities)} activities from website")
        print("\nThe scraper is working correctly!")
        print("\nNext steps:")
        print("1. Set up your MySQL database (run database_schema.sql)")
        print("2. Configure .env with your database credentials")
        print("3. Run: python fef_scraper.py")
    else:
        print("\n⚠️  Could not extract activities")
        print("Check debug_output.html to inspect the website structure")
