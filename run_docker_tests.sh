#!/bin/bash

# Script to run Fire-EMS Tools tests in Docker

set -e  # Exit on any error

# Create test results directory if it doesn't exist
mkdir -p test-results

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${YELLOW}\n===== $1 =====${NC}\n"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Function to run a specific test container
run_test() {
    service_name=$1
    test_name=$2
    
    print_header "Running $test_name tests"
    
    # Check if container exists and remove it if it does
    if docker ps -a --format '{{.Names}}' | grep -q "^fire-ems-tools-$service_name$"; then
        docker rm -f "fire-ems-tools-$service_name" > /dev/null
    fi
    
    # Run the test
    if docker-compose up --build --exit-code-from "$service_name" "$service_name"; then
        print_success "$test_name tests completed successfully!"
        return 0
    else
        print_error "$test_name tests failed!"
        return 1
    fi
}

# Check arguments
if [ $# -eq 0 ]; then
    print_header "Building Docker image"
    docker-compose build
    
    print_header "Running all test types"
    
    failures=0
    
    run_test "test" "Simplified" || ((failures++))
    run_test "test-error" "Error Condition" || ((failures++))
    run_test "test-boundary" "Boundary Condition" || ((failures++))
    
    if [ $failures -eq 0 ]; then
        print_success "\nAll tests passed successfully!"
        exit 0
    else
        print_error "\n$failures test types failed!"
        exit 1
    fi
else
    case "$1" in
        "simplified")
            run_test "test" "Simplified"
            ;;
        "error")
            run_test "test-error" "Error Condition"
            ;;
        "boundary")
            run_test "test-boundary" "Boundary Condition"
            ;;
        "performance")
            print_header "Running Performance tests"
            print_header "This may take several minutes"
            run_test "test-performance" "Performance"
            ;;
        "app")
            print_header "Starting the application"
            docker-compose up --build app
            ;;
        "clean")
            print_header "Cleaning up containers and volumes"
            docker-compose down
            print_success "Cleanup complete!"
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Usage: $0 [simplified|error|boundary|performance|app|clean]"
            echo "  - No arguments: Run all test types"
            echo "  - simplified: Run only simplified tests"
            echo "  - error: Run only error condition tests"
            echo "  - boundary: Run only boundary condition tests"
            echo "  - performance: Run only performance tests"
            echo "  - app: Start the application"
            echo "  - clean: Remove all containers and volumes"
            exit 1
            ;;
    esac
fi