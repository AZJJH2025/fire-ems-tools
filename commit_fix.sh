#!/bin/bash
cd /Users/josephhester/fire-ems-tools
git add react-app/src/hooks/useAuth.ts
git add app/debug.html
git commit -m "Fix authentication timeout and add debug tools

- Added 5-second timeout to authentication API calls to prevent UI freezing
- Created debug page with authentication testing tools
- Resolves dead buttons issue reported after email system testing

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"