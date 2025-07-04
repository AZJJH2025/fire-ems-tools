# Fire EMS Tools - Troubleshooting Guide

Complete troubleshooting guide for Fire EMS Tools system administrators and users.

## 📋 **Quick Reference**

### **Emergency Contacts**
- **System Issues**: Check system health dashboard first
- **User Access Problems**: Verify user permissions and authentication
- **Data Issues**: Review data formatting and validation requirements
- **Performance Problems**: Check server resources and database status

### **Common Quick Fixes**
- **Clear Browser Cache**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- **Check Internet Connection**: Verify stable network connectivity
- **Restart Browser**: Close and reopen browser completely
- **Try Different Browser**: Test with Chrome, Firefox, or Safari

## 🚨 **Critical System Issues**

### **System Won't Load / White Screen**
**Symptoms**: Blank white screen when accessing tools
**Common Causes**:
- JavaScript errors preventing page load
- Asset loading failures (CSS/JS files)
- Server-side application errors

**Troubleshooting Steps**:
1. **Check Browser Console**: Press F12, look for JavaScript errors
2. **Verify Asset Loading**: Check Network tab for failed requests (404, 500 errors)
3. **Test Different Browser**: Rule out browser-specific issues
4. **Check Server Status**: Verify Flask application is running
5. **Review Server Logs**: Check `flask.log` for application errors

**Advanced Diagnostics**:
```bash
# Check server status
curl -I http://localhost:5006/
curl -I http://localhost:5006/app/

# Test asset loading
curl -I http://localhost:5006/app/assets/index-[hash].js

# Check application health
tail -f flask.log
```

### **Database Connection Errors**
**Symptoms**: "Database connection failed" or SQL-related errors
**Common Causes**:
- SQLite database file permissions
- Database corruption
- Concurrent access issues

**Troubleshooting Steps**:
1. **Check Database File**: Verify `instance/fire_ems.db` exists and is readable
2. **Verify Permissions**: Ensure write access to database directory
3. **Test Connection**: Use SQLite CLI to verify database integrity
4. **Check Disk Space**: Ensure adequate free space for database operations

**Recovery Actions**:
```bash
# Check database file
ls -la instance/fire_ems.db

# Test database integrity
sqlite3 instance/fire_ems.db "PRAGMA integrity_check;"

# Backup database before repairs
cp instance/fire_ems.db instance/fire_ems_backup.db
```

### **Authentication System Failures**
**Symptoms**: Users cannot log in, session errors, permission denied
**Common Causes**:
- Session management issues
- Authentication token problems
- User role/permission configuration

**Troubleshooting Steps**:
1. **Clear Session Data**: Delete browser cookies and session storage
2. **Check User Records**: Verify user exists and is active in database
3. **Test Admin Account**: Use known working admin credentials
4. **Review Role Assignments**: Verify user has appropriate permissions

## 🔧 **Data Processing Issues**

### **CSV Upload Failures**
**Symptoms**: "File upload failed" or "Invalid file format"
**Common Causes**:
- Unsupported file encoding (not UTF-8)
- Excel files saved with special characters
- Files exceeding size limits
- Corrupted file uploads

**Troubleshooting Steps**:
1. **Check File Size**: Verify file is under size limit (typically 50MB)
2. **Verify Encoding**: Ensure CSV is saved as UTF-8
3. **Test with Simple File**: Upload a minimal test CSV
4. **Check Special Characters**: Remove or escape special characters

**File Format Requirements**:
```csv
# Correct CSV format
incident_id,incident_date,incident_time,latitude,longitude
2024001,"01/15/2024","01/15/2024 14:23:45",39.7392,-104.9903

# Common problems to avoid
- Mixed date formats within same file
- Non-numeric coordinates
- Missing required quote marks around fields with commas
- Excel-specific formatting (currency symbols, etc.)
```

### **Field Mapping Problems**
**Symptoms**: Data appears but fields don't map correctly, wrong data in wrong columns
**Common Causes**:
- Field name variations not recognized
- Data type mismatches
- Hidden characters in field names

**Troubleshooting Steps**:
1. **Review Field Names**: Check source CSV for exact field names
2. **Test Manual Mapping**: Override auto-mapping with manual selections
3. **Check Data Preview**: Verify data appears correctly in preview
4. **Validate Transformations**: Ensure data transformations are working

**Common Field Mapping Issues**:
- `incident_date` vs `Incident Date` vs `INCIDENT_DATE`
- Time fields with timezone information
- Numeric fields formatted as text
- Date fields containing time information

### **Geographic Data Issues**
**Symptoms**: Incidents don't appear on maps, coordinates seem wrong
**Common Causes**:
- Latitude/longitude reversed
- Coordinates in wrong format
- Invalid coordinate ranges

**Troubleshooting Steps**:
1. **Verify Coordinate Format**: Ensure decimal degrees (not DMS)
2. **Check Coordinate Ranges**: Latitude -90 to 90, Longitude -180 to 180
3. **Test Sample Coordinates**: Manually verify a few coordinates on external map
4. **Check Field Assignment**: Ensure lat/lng fields are correctly mapped

**Coordinate Format Examples**:
```
✅ Correct: 39.7392, -104.9903 (decimal degrees)
✅ Correct: 39.739200, -104.990300 (extended precision)
❌ Wrong: 39°44'21"N, 104°59'25"W (degrees/minutes/seconds)
❌ Wrong: 39.7392, 104.9903 (missing negative for west longitude)
```

## 📊 **Analysis & Reporting Issues**

### **Response Time Calculation Errors**
**Symptoms**: Unrealistic response times (800+ minutes), negative times, "N/A" results
**Common Causes**:
- Missing timestamp data
- Date/time field confusion
- Timezone inconsistencies
- Field mapping errors

**Troubleshooting Steps**:
1. **Check Time Field Mapping**: Verify all time fields map to correct data
2. **Review Date Formats**: Ensure consistent date/time formatting
3. **Test Sample Calculations**: Manually verify a few response time calculations
4. **Check for Missing Data**: Identify records with incomplete time information

**Common Time Data Problems**:
- Call received time mapped to date-only field
- Dispatch time showing as "0:00:00" (midnight fallback)
- Time fields containing text instead of timestamps
- Mixed 12-hour and 24-hour time formats

### **Report Generation Failures**
**Symptoms**: "Report generation failed", blank PDFs, incomplete reports
**Common Causes**:
- Insufficient data for report generation
- PDF rendering issues
- Missing report template information

**Troubleshooting Steps**:
1. **Verify Data Completeness**: Ensure sufficient incident data for analysis
2. **Check Department Information**: Verify all required report fields are populated
3. **Test Simple Report**: Try generating basic report without custom formatting
4. **Review Browser Console**: Check for PDF generation errors

### **Performance & Speed Issues**
**Symptoms**: Slow page loading, unresponsive interface, timeouts
**Common Causes**:
- Large datasets overwhelming browser
- Server resource constraints
- Network connectivity issues

**Troubleshooting Steps**:
1. **Reduce Data Size**: Filter to smaller date ranges or incident counts
2. **Check System Resources**: Monitor CPU, memory, and disk usage
3. **Test Network Speed**: Verify adequate internet connectivity
4. **Clear Browser Cache**: Remove stored temporary files

## 🔐 **User Access & Permission Issues**

### **Login Problems**
**Symptoms**: "Invalid credentials", "Access denied", login page loops
**Common Causes**:
- Incorrect username/password
- Account deactivated
- Session management issues
- Browser cookie problems

**Troubleshooting Steps**:
1. **Verify Credentials**: Double-check username and password
2. **Test Incognito Mode**: Rule out browser cache/cookie issues
3. **Check Account Status**: Verify user account is active
4. **Clear Browser Data**: Remove cookies and session storage

### **Permission Errors**
**Symptoms**: "Permission denied", "Admin access required", missing features
**Common Causes**:
- Insufficient user role permissions
- Department assignment issues
- Role configuration problems

**Troubleshooting Steps**:
1. **Check User Role**: Verify user has appropriate role (admin, super_admin)
2. **Review Department Assignment**: Ensure user is assigned to correct department
3. **Test with Known Admin**: Use confirmed admin account to test access
4. **Verify Role Hierarchy**: Understand permission levels and requirements

### **Admin Console Access**
**Symptoms**: Cannot access admin features, admin menu missing
**Common Causes**:
- User lacks admin role
- Admin console not configured
- Authentication state issues

**Troubleshooting Steps**:
1. **Verify Admin Role**: Check user record in database for admin/super_admin role
2. **Test Admin URL**: Access `/admin` directly to test admin console
3. **Check User Session**: Verify user is properly logged in with admin privileges
4. **Review Admin Configuration**: Ensure admin console is properly configured

## 🌐 **Browser & Compatibility Issues**

### **Browser-Specific Problems**
**Symptoms**: Features work in one browser but not another
**Common Causes**:
- Browser feature support differences
- JavaScript compatibility issues
- CSS rendering differences

**Supported Browsers**:
- ✅ Chrome 90+ (recommended)
- ✅ Firefox 85+ 
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ Internet Explorer (not supported)

**Troubleshooting Steps**:
1. **Update Browser**: Ensure using current browser version
2. **Test in Chrome**: Use Chrome as reference browser for testing
3. **Check JavaScript**: Verify JavaScript is enabled
4. **Disable Extensions**: Test with browser extensions disabled

### **Mobile Device Issues**
**Symptoms**: Interface doesn't work properly on phones/tablets
**Common Causes**:
- Touch interface compatibility
- Screen size limitations
- Mobile browser differences

**Mobile Recommendations**:
- Use tablets (iPad, Android tablet) for best mobile experience
- Landscape orientation for most tools
- Chrome or Safari mobile browsers
- Avoid complex analysis on phone screens

## 🔧 **Server Administration Issues**

### **Flask Application Problems**
**Symptoms**: Server won't start, application crashes, HTTP 500 errors
**Common Causes**:
- Python dependency issues
- Configuration problems
- Port conflicts

**Troubleshooting Steps**:
1. **Check Python Environment**: Verify virtual environment is activated
2. **Install Dependencies**: Run `pip install -r requirements.txt`
3. **Review Configuration**: Check Flask configuration settings
4. **Test Port Availability**: Ensure port 5006 is available

**Common Server Issues**:
```bash
# Check if port is in use
lsof -i :5006

# Test Flask application startup
python app.py

# Check Python path and imports
python -c "import flask; print(flask.__version__)"
```

### **Database Administration**
**Symptoms**: Database corruption, performance issues, connection problems
**Common Causes**:
- Disk space issues
- Concurrent access problems
- Database file corruption

**Database Maintenance**:
```bash
# Check database size
ls -lh instance/fire_ems.db

# Vacuum database (compact and optimize)
sqlite3 instance/fire_ems.db "VACUUM;"

# Analyze database statistics
sqlite3 instance/fire_ems.db "ANALYZE;"

# Check for corruption
sqlite3 instance/fire_ems.db "PRAGMA integrity_check;"
```

## 📋 **Diagnostic Tools & Commands**

### **System Health Checks**
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check Python environment
which python
python --version
pip list

# Check Flask application
python -c "from app import create_app; print('Flask app imports successfully')"
```

### **Network Diagnostics**
```bash
# Test local server connectivity
curl -I http://localhost:5006/

# Check specific endpoints
curl -I http://localhost:5006/app/data-formatter
curl -I http://localhost:5006/admin/api/analytics/overview

# Test asset loading
curl -I http://localhost:5006/app/assets/index-[hash].js
```

### **Browser Diagnostics**
1. **Open Developer Tools**: Press F12
2. **Check Console Tab**: Look for JavaScript errors
3. **Check Network Tab**: Monitor for failed requests
4. **Check Application Tab**: Review stored data and cookies
5. **Test Incognito Mode**: Rule out cache/extension issues

## 📞 **Getting Additional Help**

### **Escalation Process**
1. **Check This Guide**: Review relevant troubleshooting section
2. **Test Basic Functions**: Verify core functionality works
3. **Gather Information**: Collect error messages, browser console logs
4. **Document Steps**: Record what was tried and results
5. **Contact Support**: Provide detailed information about the issue

### **Information to Provide**
- **Error Messages**: Exact text of any error messages
- **Browser Information**: Browser type and version
- **Operating System**: Windows, Mac, Linux version
- **User Role**: Admin, super_admin, regular user
- **Steps to Reproduce**: Exact steps that cause the problem
- **Expected Behavior**: What should happen vs. what actually happens

### **Log Files to Check**
- `flask.log`: Flask application logs
- Browser Console: JavaScript errors and warnings
- Network Tab: Failed HTTP requests
- Server Logs: System-level errors (if applicable)

---

**Still Need Help?** If this troubleshooting guide doesn't resolve your issue, check the [System Administrator Guide](/docs/admin/SYSTEM_ADMIN_GUIDE) for advanced configuration options, or review the [User Guides](/docs/users/QUICK_START) for usage questions.