#!/bin/bash

# FEF Activities Scraper - Setup Script

echo "=============================================="
echo "FEF Activities Scraper - Setup"
echo "=============================================="
echo ""

# Check if Python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Create virtual environment
echo ""
echo "Creating virtual environment..."
python3 -m venv venv

if [ $? -ne 0 ]; then
    echo "❌ Failed to create virtual environment"
    exit 1
fi

echo "✓ Virtual environment created"

# Activate virtual environment
echo ""
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo ""
echo "Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo ""
echo "Installing Python packages..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install requirements"
    exit 1
fi

echo "✓ All packages installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your MySQL credentials:"
    echo "   nano .env"
else
    echo ""
    echo "✓ .env file already exists"
fi

# Check if MySQL is running
echo ""
echo "Checking MySQL service..."
if command -v systemctl &> /dev/null; then
    if systemctl is-active --quiet mysql || systemctl is-active --quiet mariadb; then
        echo "✓ MySQL/MariaDB service is running"
    else
        echo "⚠️  MySQL/MariaDB service is not running"
        echo "   Start it with: sudo systemctl start mysql"
    fi
else
    echo "⚠️  Cannot check MySQL service status (systemctl not found)"
fi

echo ""
echo "=============================================="
echo "Setup Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your MySQL credentials:"
echo "   nano .env"
echo ""
echo "2. Create the database schema:"
echo "   mysql -u root -p < database_schema.sql"
echo ""
echo "3. Run the scraper:"
echo "   source venv/bin/activate"
echo "   python fef_scraper.py"
echo ""
echo "=============================================="
