"""
Example script to query activities from the database

This demonstrates how to query and display the scraped data.
"""

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from typing import List, Tuple

# Load environment variables
load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'fef_activities'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
}


def connect_to_database():
    """Connect to MySQL database"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error: {e}")
        return None


def display_all_activities():
    """Display all activities grouped by category"""
    connection = connect_to_database()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        query = """
            SELECT category, class_name, schedule, cost, enrollment_deadline
            FROM activities
            ORDER BY category, class_name
        """
        cursor.execute(query)
        results = cursor.fetchall()
        
        current_category = None
        print("\n" + "="*80)
        print("FEF UNICAMP ACTIVITIES")
        print("="*80)
        
        for row in results:
            category, class_name, schedule, cost, deadline = row
            
            # Print category header when it changes
            if category != current_category:
                current_category = category
                print(f"\n{'─'*80}")
                print(f"📚 {category}")
                print(f"{'─'*80}")
            
            # Format cost
            cost_str = f"R$ {cost:.2f}" if cost > 0 else "FREE"
            
            print(f"\n  🏃 {class_name}")
            print(f"     ⏰ Schedule: {schedule}")
            print(f"     💰 Cost: {cost_str}")
            print(f"     📅 Enrollment: {deadline}")
        
        print("\n" + "="*80)
        print(f"Total activities: {len(results)}")
        print("="*80 + "\n")
        
        cursor.close()
    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            connection.close()


def display_activities_by_category(category: str):
    """Display activities for a specific category"""
    connection = connect_to_database()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        query = """
            SELECT class_name, schedule, cost, enrollment_deadline
            FROM activities
            WHERE category = %s
            ORDER BY class_name
        """
        cursor.execute(query, (category,))
        results = cursor.fetchall()
        
        print(f"\n{'='*80}")
        print(f"Activities in category: {category}")
        print(f"{'='*80}")
        
        for row in results:
            class_name, schedule, cost, deadline = row
            cost_str = f"R$ {cost:.2f}" if cost > 0 else "FREE"
            
            print(f"\n  🏃 {class_name}")
            print(f"     ⏰ {schedule}")
            print(f"     💰 {cost_str}")
            print(f"     📅 {deadline}")
        
        print(f"\n{'='*80}")
        print(f"Total: {len(results)} activities")
        print(f"{'='*80}\n")
        
        cursor.close()
    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            connection.close()


def get_all_categories() -> List[str]:
    """Get list of all categories"""
    connection = connect_to_database()
    if not connection:
        return []
    
    try:
        cursor = connection.cursor()
        query = "SELECT DISTINCT category FROM activities ORDER BY category"
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        return [row[0] for row in results]
    except Error as e:
        print(f"Error: {e}")
        return []
    finally:
        if connection.is_connected():
            connection.close()


def display_statistics():
    """Display statistics about the activities"""
    connection = connect_to_database()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        
        # Total activities
        cursor.execute("SELECT COUNT(*) FROM activities")
        total = cursor.fetchone()[0]
        
        # Activities by category
        cursor.execute("""
            SELECT category, COUNT(*) as count
            FROM activities
            GROUP BY category
            ORDER BY count DESC
        """)
        by_category = cursor.fetchall()
        
        # Free activities
        cursor.execute("SELECT COUNT(*) FROM activities WHERE cost = 0")
        free_count = cursor.fetchone()[0]
        
        # Average cost
        cursor.execute("SELECT AVG(cost) FROM activities WHERE cost > 0")
        avg_cost = cursor.fetchone()[0]
        
        # Price range
        cursor.execute("SELECT MIN(cost), MAX(cost) FROM activities WHERE cost > 0")
        min_cost, max_cost = cursor.fetchone()
        
        print("\n" + "="*80)
        print("STATISTICS")
        print("="*80)
        print(f"\n📊 Total Activities: {total}")
        print(f"🆓 Free Activities: {free_count}")
        print(f"💵 Paid Activities: {total - free_count}")
        
        if avg_cost:
            print(f"\n💰 Price Statistics (paid activities):")
            print(f"   Average: R$ {avg_cost:.2f}")
            print(f"   Range: R$ {min_cost:.2f} - R$ {max_cost:.2f}")
        
        print(f"\n📚 Activities by Category:")
        for category, count in by_category:
            print(f"   • {category}: {count}")
        
        print("="*80 + "\n")
        
        cursor.close()
    except Error as e:
        print(f"Error: {e}")
    finally:
        if connection.is_connected():
            connection.close()


def main():
    """Main menu"""
    while True:
        print("\n" + "="*80)
        print("FEF UNICAMP Activities Database Query Tool")
        print("="*80)
        print("\n1. Display all activities")
        print("2. Display activities by category")
        print("3. Display statistics")
        print("4. List all categories")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == '1':
            display_all_activities()
        elif choice == '2':
            categories = get_all_categories()
            if categories:
                print("\nAvailable categories:")
                for i, cat in enumerate(categories, 1):
                    print(f"{i}. {cat}")
                cat_choice = input("\nEnter category number: ").strip()
                try:
                    idx = int(cat_choice) - 1
                    if 0 <= idx < len(categories):
                        display_activities_by_category(categories[idx])
                    else:
                        print("Invalid category number")
                except ValueError:
                    print("Invalid input")
        elif choice == '3':
            display_statistics()
        elif choice == '4':
            categories = get_all_categories()
            print("\nAll Categories:")
            for cat in categories:
                print(f"  • {cat}")
        elif choice == '5':
            print("\nGoodbye!\n")
            break
        else:
            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()
