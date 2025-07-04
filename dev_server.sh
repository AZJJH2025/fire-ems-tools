#!/bin/bash
# Improved development server script
# This script:
# 1. Aggressively kills any processes using port 5006
# 2. Starts the simple_server.py with the watchdog to auto-restart
# 3. Provides clear instructions for accessing the tools

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}FireEMS Tools Development Server${NC}"
echo -e "${BLUE}=========================================${NC}"

# Kill any existing processes on port 5006
echo -e "${YELLOW}Checking for processes using port 5006...${NC}"
PORT_PIDS=$(lsof -ti:5006)
if [ -n "$PORT_PIDS" ]; then
    echo -e "${YELLOW}Found processes using port 5006: $PORT_PIDS${NC}"
    echo -e "${YELLOW}Killing these processes...${NC}"
    kill -9 $PORT_PIDS
    echo -e "${GREEN}Processes killed.${NC}"
else
    echo -e "${GREEN}No processes found using port 5006.${NC}"
fi

# Kill any Python processes running the server
echo -e "\n${YELLOW}Checking for Python processes running the server...${NC}"
PYTHON_PIDS=$(ps aux | grep "python.*server.py" | grep -v grep | awk '{print $2}')
if [ -n "$PYTHON_PIDS" ]; then
    echo -e "${YELLOW}Found Python processes: $PYTHON_PIDS${NC}"
    echo -e "${YELLOW}Killing these processes...${NC}"
    kill -9 $PYTHON_PIDS
    echo -e "${GREEN}Processes killed.${NC}"
else
    echo -e "${GREEN}No Python server processes found.${NC}"
fi

# Wait a moment to ensure all processes are terminated
sleep 1

# Check if python3 exists (for macOS compatibility)
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python" 
    echo -e "${YELLOW}Python3 not found, using 'python' command instead${NC}"
fi

# Make sure simple_server.py is executable
chmod +x simple_server.py 2>/dev/null
chmod +x watchdog.py 2>/dev/null

echo -e "\n${GREEN}Starting development server with watchdog...${NC}"
echo -e "${YELLOW}The server will automatically restart if it crashes.${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server when done.${NC}\n"

# Start the watchdog
$PYTHON_CMD watchdog.py