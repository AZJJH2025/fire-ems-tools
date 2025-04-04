# API Testing Guide

This guide provides instructions for testing the Fire-EMS multi-tenant API system.

## Overview

The API allows external applications to integrate with the Fire-EMS Incident Logger system using secure API keys. The API tests verify:

1. Authentication and access control
2. Data validation
3. Endpoint functionality
4. Error handling
5. Performance under load

## Prerequisites

- Python 3.7 or higher
- The Flask application running on your development machine (localhost)
- A superadmin account to create test data

## Running the Tests

### Setup Test Data

Before running the full test suite, you may want to set up test data with:

```bash
python test_api.py --setup-only
```

This will:
1. Create a test department
2. Create a test admin user
3. Create a test regular user
4. Enable the API and generate an API key
5. Create sample incidents

### Run All Tests

To run the full test suite:

```bash
python test_api.py
```

### Run Specific Test Cases

To run a specific test class:

```bash
python test_api.py APIAuthenticationTests
```

To run a specific test method:

```bash
python test_api.py APIAuthenticationTests.test_api_valid_key_header
```

## Test Categories

### Authentication Tests

- Testing API access without authentication
- Testing with invalid API keys
- Testing with valid API keys in header
- Testing with valid API keys as query parameters

### Department Tests

- Retrieving department information

### Incident Tests

- Retrieving all incidents
- Filtering incidents by date
- Creating new incidents
- Retrieving specific incidents by ID

### Station Tests

- Retrieving all stations
- Creating new stations with valid data
- Testing duplicate station numbers
- Retrieving specific stations by ID

### User Tests

- Retrieving all users for a department
- Retrieving specific users by ID
- Creating new users with required fields
- Validating email format and uniqueness
- Validating role values against allowed options
- Updating existing users
- Testing security constraints for cross-department access

### Error Handling Tests

- Testing with missing required fields
- Testing with invalid data formats
- Testing with non-existent resources
- Testing email validation
- Testing role validation

### Load Tests

- Testing with concurrent API requests

## API Endpoints Tested

- `GET /api/v1/department` - Get department information
- `GET /api/v1/incidents` - Get all incidents
- `GET /api/v1/incidents/{id}` - Get a specific incident
- `POST /api/v1/incidents` - Create a new incident
- `GET /api/v1/stations` - Get all stations
- `GET /api/v1/stations/{id}` - Get a specific station
- `POST /api/v1/stations` - Create a new station
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/{id}` - Get a specific user
- `POST /api/v1/users` - Create a new user
- `PUT /api/v1/users/{id}` - Update an existing user

## Troubleshooting

- If the tests fail to connect to the server, make sure the Flask application is running
- If authentication tests fail, check that the superadmin account credentials are correct
- If department creation fails, check that no department with the same code already exists

## Next Steps

After running these tests, consider:

1. Implementing integration tests with actual client libraries
2. Setting up continuous integration with automated API tests
3. Adding performance benchmarks for API response times
4. Developing a monitoring system for API usage