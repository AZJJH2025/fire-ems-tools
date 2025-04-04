# API Implementation Guide

This document outlines the implementation of the Fire-EMS multi-tenant API system.

## Features Implemented

### 1. Authentication
- API key-based authentication for all API endpoints
- Custom decorator (`@require_api_key`) to enforce authentication
- Support for API key in header (`X-API-Key`) and query parameter (`api_key`)

### 2. Endpoints
- `GET /api/v1/department`: Get department information
- `GET /api/v1/incidents`: Get all incidents with optional date filtering
- `GET /api/v1/incidents/{id}`: Get a specific incident by ID
- `POST /api/v1/incidents`: Create a new incident
- `GET /api/v1/stations`: Get all stations for a department
- `GET /api/v1/stations/{id}`: Get a specific station by ID
- `POST /api/v1/stations`: Create a new station
- `GET /api/v1/users`: Get all users for a department
- `GET /api/v1/users/{id}`: Get a specific user by ID
- `POST /api/v1/users`: Create a new user
- `PUT /api/v1/users/{id}`: Update an existing user

### 3. Input Validation
- Required field validation for incident creation
- Date format validation for ISO date strings
- Coordinate validation for latitude/longitude values
- Proper error responses with detailed messages

### 4. Rate Limiting
- Per-endpoint rate limits based on use case frequency
- Custom key function based on API key for fair distribution
- Rate limit headers to inform clients about limits and reset times
- Different limits for read vs. write operations

### 5. Testing
- Comprehensive test suite for all API functionality
- Authentication tests for valid and invalid scenarios
- Data validation tests for proper error handling
- Load testing for concurrent requests
- Rate limit testing with header validation

### 6. Documentation
- Detailed API documentation with endpoint descriptions
- Request/response examples for all endpoints
- Error handling information with status codes
- Rate limit information and backoff strategies
- Integration examples in multiple languages

## Implementation Details

### Authentication Flow
1. Client provides API key in header or query parameter
2. `@require_api_key` decorator extracts and validates the key
3. API key is checked against the database for a valid, enabled department
4. Department is passed to the endpoint function for data isolation

### Rate Limiting
- Used the Flask-Limiter extension for robust rate limiting
- Configured per-endpoint limits based on expected usage patterns:
  - Higher limits for reading single incidents (300/hour)
  - Lower limits for listing all incidents (100/hour)
  - Strict limits for creating incidents (50/hour)
- Custom key function to identify clients by API key instead of IP

### Input Validation
- Implemented validation for all required fields
- Added specific validation for date formats and geographic coordinates
- Return appropriate 400 Bad Request status with helpful error messages

### Data Isolation
- All API endpoints ensure data is properly isolated by department
- Incidents are filtered by department_id based on the authenticated API key
- No cross-department data access is possible

## Security Considerations

1. **API Key Protection**
   - Keys are randomly generated with high entropy
   - Keys are stored securely in the database
   - Only part of the key is used in logs or rate limit identifiers

2. **Data Isolation**
   - All queries filter by department_id
   - No access to other departments' data is possible

3. **Rate Limiting**
   - Prevents abuse and DoS attacks
   - Different limits for different operations
   - Proper backoff mechanisms documented

4. **Input Validation**
   - All inputs are validated
   - Proper error messages without exposing system details
   - Protection against injection attacks

## User Management API

The API includes comprehensive user management capabilities for departments:

### Endpoints

1. **GET /api/v1/users**
   - Retrieves all users for the authenticated department
   - Returns basic user information (ID, name, email, role, etc.)
   - Same rate limits as other collection endpoints (100/hour)

2. **GET /api/v1/users/{id}**
   - Retrieves a specific user by ID
   - Enforces department-based security (can only access users in your department)
   - Higher rate limits for single-resource access (300/hour)

3. **POST /api/v1/users**
   - Creates a new user for the department
   - Required fields: email, name, password, role
   - Validates email format and uniqueness
   - Validates role against allowed values (user, manager, admin)
   - Strict rate limits (30/hour) to prevent abuse

4. **PUT /api/v1/users/{id}**
   - Updates an existing user
   - Can update email, name, role, active status, and password
   - All field updates include validation
   - Moderate rate limits (50/hour)

### Security Considerations

- Password security:
  - Passwords are hashed before storage using Werkzeug's secure hashing
  - Passwords are never returned in API responses
  - Password complexity is not enforced at the API level

- Role-based access:
  - Only users with appropriate department association can be managed
  - Role changes are validated against allowed values

## Next Steps

The following enhancements could be considered for future implementation:

1. **API Versioning**
   - Implement formal API versioning in the URL path
   - Support multiple versions simultaneously for backward compatibility

2. **Pagination**
   - Add pagination for endpoints that return collections
   - Include next/prev links for easier navigation

3. **Filtering and Sorting**
   - Enhance filtering capabilities beyond date ranges
   - Add sorting options for collection endpoints

4. **Webhooks**
   - Implement webhook callbacks for real-time notifications
   - Allow departments to configure webhook URLs for incident events

5. **API Usage Analytics**
   - Track API usage patterns for optimization
   - Provide usage dashboards for department administrators

6. **Response Compression**
   - Implement gzip/deflate compression for responses
   - Reduce bandwidth usage for large payloads

7. **Additional User Management Features**
   - Password reset functionality via API
   - User activation/deactivation events
   - User activity logging and audit trails