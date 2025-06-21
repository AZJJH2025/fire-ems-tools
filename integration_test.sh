#!/bin/bash
# Integration test script for the Data Formatter and Response Time Analyzer

# Stop any running Flask servers
echo "Stopping any running Flask servers..."
pkill -f "python3 app.py" || true
pkill -f "python3 test_session_app.py" || true
pkill -f "python3 simple_test_app.py" || true
pkill -f "python3 minimal_server.py" || true

# Start the simple test server to verify connectivity
echo "Starting test session server..."
python3 test_session_app.py &
TEST_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 2

# Test server connectivity
echo "Testing server connectivity..."
if curl -s http://127.0.0.1:5010/ > /dev/null; then
    echo "✅ Test server is running correctly!"
    
    echo "Integration test URLs:"
    echo "- Main test page: http://127.0.0.1:5010/"
    echo "- Data Formatter: http://127.0.0.1:5010/data-formatter-react"
    echo "- Response Time Analyzer: http://127.0.0.1:5010/response-time-analyzer"
    
    echo ""
    echo "Integration Test Instructions:"
    echo "1. Open the main test page in your browser"
    echo "2. Click 'Generate Sample Data' to create test incident data"
    echo "3. Click 'Store in Session Storage' to save the data"
    echo "4. Click 'Redirect to Analyzer' to test data transfer to the Response Time Analyzer"
    echo "5. You should see the data displayed in the Response Time Analyzer page"
    echo ""
    echo "Keep this terminal window open. Press Ctrl+C to stop the server when done."
    
    # Keep script running
    wait $TEST_PID
else
    echo "❌ Failed to connect to test server"
    echo "Try running the test server manually with: python3 test_session_app.py"
    # Kill the server process if it didn't start correctly
    kill $TEST_PID 2>/dev/null || true
fi