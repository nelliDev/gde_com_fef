-- Database schema for FEF UNICAMP activities
-- Uses the existing 'gde' database (Docker instance)
-- If you need to create the database separately, uncomment the line below:
-- CREATE DATABASE IF NOT EXISTS gde CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gde;

-- Drop table if exists (for development/testing)
DROP TABLE IF EXISTS gde_activities;

-- Create activities table
CREATE TABLE gde_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    class_name VARCHAR(255) NOT NULL,
    schedule TEXT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    enrollment_deadline VARCHAR(255) NOT NULL,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_scraped_at (scraped_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a table to track scraping history
CREATE TABLE gde_scraping_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_activities INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    INDEX idx_scraped_at (scraped_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
