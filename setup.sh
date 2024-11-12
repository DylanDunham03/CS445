#!/bin/bash

# Define colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create and activate virtual environment
cd backend
echo -e "${BLUE}[*] Changing directory to backend${NC}"
python3.12 -m venv venv
echo -e "${GREEN}[✓] Created virtual environment${NC}"
source venv/bin/activate
echo -e "${GREEN}[✓] Activated virtual environment${NC}"

# Install dependencies
echo -e "${BLUE}[*] Installing backend requirements...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}[✓] Finished installing backend requirements${NC}"

# Install frontend dependencies
cd ..
cd frontend
echo -e "${BLUE}[*] Changing directory to frontend${NC}"
echo -e "${BLUE}[*] Installing frontend dependencies...${NC}"
npm install
echo -e "${GREEN}[✓] Finished installing frontend dependencies${NC}"

# Return to root directory
cd ..

echo -e "${GREEN}[✓] Setup completed successfully!${NC}"