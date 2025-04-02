# FireEMS.ai Tools

A collection of AI-powered analytics tools for Fire and EMS agencies.

## Overview

FireEMS.ai provides specialized analytics tools designed specifically for Fire and EMS agencies. These tools help you visualize incident data, optimize response times, identify coverage gaps, and make data-driven decisions to improve emergency services.

## Tools Included

1. **Response Time Analyzer** - Upload and analyze incident data to visualize response time patterns
2. **Isochrone Map Generator** - Create coverage area maps based on emergency response travel times
3. **Incident Logger with NFIRS Integration** - Comprehensive incident data entry and management with NFIRS compliance
4. **Call Density Heatmap** - Visualize historical call data with customizable heatmaps
5. **Station Overview** - Comprehensive overview of station performance and unit utilization
6. **Coverage Gap Finder** - Identify underserved areas in your jurisdiction
7. **FireMapPro** - Advanced interactive map creator with multiple data layers
8. **Data Formatter** - Convert and standardize data for use with all tools

## NFIRS Integration

The Incident Logger now includes NFIRS (National Fire Incident Reporting System) compliance features:

- NFIRS code validation for incident reports
- Standardized NFIRS code selection for incident types, property use, and actions taken
- Conditional display of Fire Module for fire incidents
- Search functionality for NFIRS codes
- Export capabilities in NFIRS-compliant formats (XML, CSV, JSON)
- Comprehensive NFIRS validation with error/warning classification
- Complete library of NFIRS code tables

## Requirements

- Python 3.8+
- Flask
- Required Python packages (see requirements.txt)

## Installation

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Start the server: `./start.sh` or `python app.py`

## Usage

1. Start the server
2. Navigate to http://localhost:8080 (or other available port)
3. Select a tool from the home page

## License

All rights reserved. This software is proprietary.