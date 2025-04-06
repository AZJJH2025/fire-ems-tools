# FireEMS.ai Deployment Guide

This document provides information and solutions for common deployment issues with the FireEMS.ai application.

## Prerequisites

- Python 3.9+
- SQLite or PostgreSQL database
- Web server (for production deployments)

## Deployment Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/fire-ems-tools.git
   cd fire-ems-tools
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the deployment fix script to ensure compatibility:
   ```bash
   python deployment_fix.py --all
   ```

4. Start the application:
   ```bash
   # Development
   python app.py
   
   # Production (using gunicorn)
   gunicorn -w 4 -b 0.0.0.0:8000 app:app
   ```

## Known Deployment Issues and Solutions

### Database Schema Evolution

The application uses a fix_deployment.py script to handle database schema changes and missing fields. This ensures backward compatibility with existing databases when new features are added.

### FireMapPro Export Issues

The map export functionality in FireMapPro may encounter issues in certain deployment environments:

- **Problem**: Map tiles don't fully load before export
- **Solution**: Use deployment_fix.py script to apply patches that improve the tile loading tracking and export process

### Call Volume Forecaster Chart Rendering

- **Problem**: Chart.js rendering issues in some browsers
- **Solution**: The deployment_fix.py script adds error handling for Chart.js to prevent crashes

### Quick Stats Fetch Operations

- **Problem**: Network requests may time out in certain environments
- **Solution**: The deployment_fix.py script adds global error handling and better timeout management

### Data Formatter File Upload Timeouts

- **Problem**: Large file uploads may time out in production environments
- **Solution**: The script adds proper timeout handling for large file uploads

## Troubleshooting

If you encounter deployment issues even after running the fix script, try the following:

1. Check the deployment_fix.log file for detailed error information
2. Ensure all required dependencies are installed
3. Verify database connection and permissions
4. Check server logs for any missing paths or resources

## Running Diagnostics Only

If you want to check for potential issues without applying fixes:

```bash
python deployment_fix.py --diagnose
```

This will generate a detailed log of potential issues without modifying any files.

## Applying Fixes Only

If you've already diagnosed issues and want to apply fixes:

```bash
python deployment_fix.py --fix
```

## Production Deployment Recommendations

1. Use a dedicated web server (nginx, Apache) in front of gunicorn
2. Configure proper database backups
3. Use environment variables for sensitive configuration
4. Implement proper logging and monitoring
5. Consider using a CDN for static assets

## Contact Support

If you continue to experience deployment issues, please contact:
support@fireems.ai

## Version Compatibility

This deployment guide is applicable to version 2.0+ of the FireEMS.ai platform.