# Fire-EMS Tools Testing Framework

This document outlines the comprehensive testing framework for the Fire-EMS Tools application. The framework is designed to ensure that all features work correctly across different department configurations and scenarios.

## Testing Architecture

The testing framework consists of several components:

1. **Test Department Generation**: Creates realistic department profiles with varying configurations
2. **Automated Tests**: Validates functionality across these department profiles
3. **Data Import Tests**: Ensures compatibility with different CAD systems
4. **Performance Testing**: Validates application responsiveness under load

## Test Department Profiles

Our testing approach uses four distinct department profiles to represent the range of potential customers:

| Profile | Description | Features | Configuration |
|---------|-------------|----------|---------------|
| **Rural** | Small fire department (1-2 stations) | Basic features only | Limited API, No webhooks |
| **Suburban** | Mid-sized combined department (3-6 stations) | Most features | API enabled, Basic webhooks |
| **Urban** | Large city department (10+ stations) | All features | Full API, Advanced webhooks |
| **Regional** | Multi-jurisdiction agency (5-10 stations) | All features | Complex API integration |

## Running the Tests

### 1. Set Up Test Departments

Before running tests, you need to create the test departments:

```bash
python create_test_departments.py
```

This will create four department profiles with appropriate settings, stations, users, and sample incident data.

### 2. Run Automated Tests

```bash
python test_departments.py
```

Optional arguments:
- `--verbose` or `-v`: Show detailed test output
- `--department CODE` or `-d CODE`: Test only a specific department (rural, suburban, urban, regional)
- `--tool TOOLNAME` or `-t TOOLNAME`: Test only a specific tool (incident_logger, call_density, etc.)

Example: Test only the incident logger for urban departments:
```bash
python test_departments.py -d urban -t incident_logger
```

## Test Categories

### Department Configuration Tests

Validates that department profiles match expected configurations:
- Department information (name, type, stations)
- Feature enablement
- API and webhook settings
- Department home page content

### Feature Access Tests

Validates feature access control based on department configuration:
- Incident Logger
- Call Density Heatmap
- Isochrone Map
- Coverage Gap Finder
- Fire Map Pro
- Data Formatter
- Station Overview

### API Functionality Tests

Tests API endpoints and authentication for departments with API enabled:
- API key authentication
- Incident retrieval
- Station information
- Department data

### Webhook Integration Tests

Validates webhook configuration and delivery:
- Webhook URL configuration
- Event subscription settings
- Webhook payload delivery

### Incident Data Tests

Tests incident data functionality:
- Incident counts across departments
- Incident type distribution
- Incident data consistency

### User Permission Tests

Validates user role-based access control:
- Admin access to configuration
- Manager access to operations
- Regular user restrictions

## Test Department Access

After running `create_test_departments.py`, you'll receive login information for each test department. Here's a summary:

### Rural Department
- Code: rural
- Admin Login: chief@pinecrestfire.org
- Password: rural-admin-pass
- URL: /dept/rural

### Suburban Department
- Code: suburban
- Admin Login: chief@oakridgefd.gov
- Password: suburban-admin-pass
- URL: /dept/suburban

### Urban Department
- Code: urban
- Admin Login: chief@bayportfire.gov
- Password: urban-admin-pass
- URL: /dept/urban

### Regional Agency
- Code: regional
- Admin Login: director@tricountyems.org
- Password: combined-admin-pass
- URL: /dept/regional

### Super Admin
- Email: super@fireems.ai
- Password: super-admin-pass
- URL: /admin/dashboard

## Extending the Framework

To add new tests:

1. Add a new test case class to `test_departments.py`
2. Create test methods that work with all department profiles
3. Use the `get_department()` and `get_admin_client()` helper methods
4. Follow the naming convention: `test_feature_functionality()`

## Performance Testing

For performance testing with larger data volumes:

```bash
python create_test_departments.py --incidents 500
```

This will create departments with larger incident datasets to test application performance under load.

## Data Import Testing

The framework includes tests for different CAD system data formats:
- CentralSquare
- ImageTrend
- ESO FireRMS
- Motorola
- Spillman Flex

Sample data files are available in the `data/incidents/` directory.

## Interpreting Test Results

Test results include:
- Configuration validation
- Feature access verification
- API functionality
- Data integrity checks

A successful test run indicates that all features work correctly across all department profiles.

## Reporting Issues

When reporting issues, include:
1. Department profile where the issue occurs
2. Steps to reproduce
3. Expected vs. actual behavior
4. Any error messages
5. Test output with `--verbose` flag