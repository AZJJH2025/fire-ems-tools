#!/bin/bash
cd /Users/josephhester/fire-ems-tools

# Initialize git repository if it doesn't exist
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Check git status
echo "Git status:"
git status

# Add the debug.html file
echo "Adding debug.html to git..."
git add app/debug.html

# Check git status again
echo "Git status after adding debug.html:"
git status

# Create commit
echo "Creating commit..."
git commit -m "Add debug page for troubleshooting authentication issues

This debug page provides:
- Authentication system testing tools
- API endpoint testing capabilities
- System information display
- Quick navigation to key application sections

The page helps diagnose authentication issues and provides
developers with essential debugging tools for the FireEMS application.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Show final git status
echo "Final git status:"
git status

echo "Git commit completed successfully!"