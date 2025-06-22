# Quick Start Guide - Fire EMS Tools

Get up and running with professional fire department analytics in 15 minutes.

## 🎯 **What You'll Accomplish**

By the end of this guide, you'll have:
- ✅ Uploaded your first CAD data export
- ✅ Generated a professional NFPA 1710 compliance report
- ✅ Created an incident map showing your department's coverage
- ✅ Saved a template for future monthly workflows

**Time Required**: 15 minutes  
**Prerequisites**: Monthly CAD incident export (CSV format)

## 📋 **Before You Start**

### **What You Need**
1. **CAD Data Export**: CSV file with incident data (1+ months)
   - Should include: Incident ID, Date/Time, Location, Response Times
   - Common file names: `incidents_2025_06.csv`, `fire_ems_export.csv`
   - File size: Usually 50KB - 5MB for monthly data

2. **Login Credentials**: Provided by your department admin
   - Username (usually your email)
   - Temporary password (you'll change this on first login)

3. **Department Information**: 
   - Department name
   - Fire Chief name  
   - Service area population (approximate)

### **System Access**
- **URL**: Provided by your IT administrator
- **Browsers**: Chrome, Firefox, Safari, or Edge (recent versions)
- **Internet**: Standard broadband connection required

---

## 🚀 **Step 1: Login and First Access (2 minutes)**

### **1.1 Access the System**
1. Open your web browser
2. Navigate to your Fire EMS Tools URL (provided by admin)
3. You should see the Fire EMS Tools homepage

### **1.2 Login**
1. Click "Sign In" in the top right corner
2. Enter your email address and temporary password
3. Click "Login to Admin Console"

**⚠️ First Time Login**: You'll be prompted to change your password
- Choose a strong password (8+ characters, mix of letters/numbers)
- Write it down securely - you'll use this monthly

### **1.3 Verify Access**
You should see the main tools dashboard with cards for:
- **Data Formatter** ← We'll start here
- **Response Time Analyzer** 
- **Fire Map Pro**

**✅ Success Check**: Can you see all three tool cards? If not, contact your department admin.

---

## 📊 **Step 2: Upload and Format Your Data (5 minutes)**

### **2.1 Open Data Formatter**
1. Click on the **"Data Formatter"** card
2. You'll see the Data Formatter interface with upload area

### **2.2 Upload Your CAD Export**
1. **Drag and drop** your CSV file onto the upload area, OR
2. Click "Browse Files" and select your CSV file
3. Wait for upload confirmation (usually 5-10 seconds)

**Expected Result**: You'll see a preview of your data with column headers

### **2.3 Select Target Tool**
1. In the "Select Target Tool" dropdown, choose **"Response Time Analyzer"**
2. You'll see the field mapping interface appear

### **2.4 Field Mapping (Most Important Step)**

**What You'll See**: 
- **Left side**: Your CSV column names (e.g., "Call Receive Time", "Unit Dispatched")
- **Right side**: Target fields (e.g., "Incident Time", "Dispatch Time")

**How to Map Fields**:
1. **Drag** from your CSV columns to the appropriate target fields
2. **Start with Required Fields** (red indicators):
   - **Incident ID** ← Drag your incident number/ID column
   - **Incident Date** ← Drag your date column

**Common Field Mappings**:
```
Your CSV Column          →    Target Field
"Call Receive Time"      →    Incident Time
"Dispatch Time"          →    Dispatch Time  
"Arrival Time"           →    Arrival Time
"Unit ID"                →    Responding Unit
"Address"                →    Address
"Latitude", "Longitude"  →    Latitude, Longitude
```

**🔧 Pro Tip**: Look for auto-suggested mappings (highlighted in blue)

### **2.5 Validate Your Mapping**
1. Check the **Live Preview** at the bottom
2. Verify data looks correct (dates, times, locations)
3. Ensure no "undefined" values in critical fields

**✅ Success Check**: Live Preview shows clean, formatted data

---

## ⏱️ **Step 3: Generate NFPA Compliance Report (5 minutes)**

### **3.1 Send to Response Time Analyzer**
1. Click the **"Send to Tool"** button (should be blue/enabled)
2. Click **"Response Time Analyzer"** from the options
3. Wait for data transfer (5-10 seconds)

### **3.2 Review the Analysis Dashboard**
You'll see several panels:
- **Performance Overview**: Your department's key metrics
- **NFPA 1710 Compliance**: Pass/fail indicators
- **Incident Map**: Geographic view of your incidents
- **Performance Trends**: Monthly trends if you have historical data

**Key Metrics to Check**:
- **Dispatch Time**: Should average 30-60 seconds
- **Total Response Time**: Should average 4-8 minutes  
- **NFPA Compliance**: Percentage meeting standards

### **3.3 Generate Professional Report**
1. Click **"Professional Reports"** button (top right)
2. Select **"Monthly NFPA 1710 Compliance Report"**
3. Fill in department information:
   - Department Name
   - Fire Chief Name
   - Report Period (e.g., "June 2025")
4. Click **"Generate Report"**
5. Download the PDF when ready (30-60 seconds)

**✅ Success Check**: You have a professional PDF suitable for city council

---

## 🗺️ **Step 4: Create Incident Map (3 minutes)**

### **4.1 Send Data to Fire Map Pro**
1. Return to Data Formatter (browser back button)
2. Click **"Send to Tool"** → **"Fire Map Pro"**
3. Wait for data transfer

### **4.2 View Your Incident Map**
You'll see:
- **Interactive map** with your incidents plotted as markers
- **Different colors** indicating response times or incident types
- **Zoom controls** and **layer options** on the right

### **4.3 Customize the Display**
1. **Heat Map**: Toggle on to see incident density
2. **Color by Response Time**: Shows performance patterns
3. **Filter by Date Range**: Focus on specific time periods

### **4.4 Export Your Map**
1. Click **"Export"** in the top toolbar
2. Choose **"PNG Image"** for presentations
3. Download and save for your records

**✅ Success Check**: You have a professional incident map for presentations

---

## 💾 **Step 5: Save Template for Future Use (2 minutes)**

### **5.1 Return to Data Formatter**
Your field mappings should still be active

### **5.2 Save Your Template**
1. Look for **"Template Management"** section
2. Click **"Save as New Template"**
3. Name it: `[Department Name] - [CAD System] Monthly`
   - Example: "Houston FD - Tyler CAD Monthly"
4. Add description: "Monthly incident export template"
5. Click **"Save Template"**

**✅ Success Check**: Template appears in your saved templates list

---

## 🎉 **Congratulations! You're Ready for Monthly Workflows**

### **What You've Accomplished**
- ✅ Successfully uploaded and formatted CAD data
- ✅ Generated professional NFPA compliance report
- ✅ Created geographic incident map  
- ✅ Saved template for future monthly use

### **Your Monthly Workflow (Now 2 minutes)**
```
1. Export monthly incidents from CAD
2. Upload to Data Formatter
3. Apply your saved template (1-click)
4. Generate compliance report
5. Present to city leadership
```

### **Next Steps**
- **Share your success**: Show colleagues the professional reports
- **Monthly routine**: Set calendar reminder for monthly analysis
- **Explore features**: Try different report types and map visualizations
- **Template sharing**: Share successful templates with neighboring departments

---

## 🆘 **Troubleshooting**

### **"No data in preview"**
- Check CSV file format (headers in first row)
- Verify file isn't corrupted
- Try downloading fresh export from CAD system

### **"Unrealistic response times"**
- Check date/time field mapping
- Ensure "Incident Time" maps to full datetime (not date-only)
- Verify timezone consistency in your data

### **"Can't save template"**
- Ensure all required fields are mapped
- Check that template name is unique
- Try refreshing page and re-mapping

### **"Map shows no incidents"**  
- Verify latitude/longitude fields are mapped
- Check that coordinates are in decimal format
- Ensure address field is mapped if coordinates missing

### **Getting Help**
- **Documentation**: Check tool-specific guides for detailed instructions
- **Department Admin**: Contact for user account issues
- **IT Support**: Contact for technical/system issues
- **Email Support**: [Contact information provided by admin]

---

## 📚 **What's Next?**

### **Learn More**
- [Data Formatter Complete Guide](./DATA_FORMATTER.md) - Advanced field mapping and templates
- [Response Time Analyzer Guide](./RESPONSE_TIME_ANALYZER.md) - All report types and analysis features  
- [Fire Map Pro Guide](./FIRE_MAP_PRO.md) - Advanced mapping and spatial analysis

### **Advanced Features**
- **Multiple data sources**: Combine incident data with station locations
- **Historical analysis**: Upload multiple months for trend analysis
- **Custom reports**: Create reports for specific audiences (city council, grants, etc.)
- **Data export**: Export clean data for other systems

### **Share and Collaborate**
- **Template sharing**: Share successful templates with other departments
- **Best practices**: Learn from other departments' workflows
- **Regional coordination**: Coordinate with mutual aid partners

---

**Last Updated**: June 2025  
**Difficulty**: Beginner  
**Time to Complete**: 15 minutes

*Need help? Contact your department admin or check the detailed tool guides for step-by-step instructions.*