# Data Formatter - Complete User Guide

Transform messy CAD exports into clean, standardized data for professional analysis. The Data Formatter is the foundation tool that prepares your incident data for Response Time Analyzer, Fire Map Pro, and other tools.

## 📋 **Table of Contents**

1. [Overview and Purpose](#overview-and-purpose)
2. [Getting Started](#getting-started)
3. [File Upload and Data Import](#file-upload-and-data-import)
4. [Field Mapping Workflows](#field-mapping-workflows)
5. [Template Management](#template-management)
6. [Data Quality and Validation](#data-quality-and-validation)
7. [Advanced Features](#advanced-features)
8. [Common CAD Systems](#common-cad-systems)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## 🎯 **Overview and Purpose**

### **What the Data Formatter Does**
The Data Formatter solves the universal problem of inconsistent CAD data formats. Every CAD vendor exports data differently - Tyler uses "ALARM_TIME", Hexagon uses "CallDateTime", Console One uses "INC_DATE_TIME" - but fire departments need consistent, reliable data for analysis.

**Input**: Messy CSV files from any CAD system  
**Output**: Clean, standardized data ready for professional analysis

### **Key Features**
- **Universal CAD Support**: Works with Tyler, Hexagon, TriTech, Console One, and any CSV export
- **Smart Field Detection**: Automatically identifies common field patterns
- **Template System**: Save successful mappings for monthly reuse  
- **Data Quality Intelligence**: Handles problematic data gracefully
- **Live Preview**: See exactly how your data will be transformed
- **Multiple Output Formats**: Send to any tool or export clean CSV

### **Why This Matters**
- **Consistency**: Same analysis every month regardless of who runs it
- **Time Savings**: 45-minute manual process becomes 2-minute automated workflow
- **Quality**: Professional-grade data processing with error handling
- **Flexibility**: Works with any CAD system, any data format

---

## 🚀 **Getting Started**

### **Access the Data Formatter**
1. **Login** to Fire EMS Tools with your credentials
2. **Navigate** to the main dashboard
3. **Click** the "Data Formatter" card

### **Interface Overview**
When you open the Data Formatter, you'll see:

**Top Section**: File upload area
- Drag-and-drop zone for CSV files
- Browse button for file selection
- File format requirements and limits

**Middle Section**: Tool selection and field mapping
- Target tool dropdown (Response Time Analyzer, Fire Map Pro, etc.)
- Field mapping interface (appears after file upload)
- Auto-mapping suggestions and manual mapping controls

**Bottom Section**: Live preview and validation
- Sample of transformed data
- Validation errors and warnings
- Export and "Send to Tool" buttons

**Right Sidebar**: Template management
- Saved templates
- Template suggestions
- Template creation and sharing

---

## 📁 **File Upload and Data Import**

### **Supported File Formats**
- **CSV Files** (Primary): Comma-separated values with headers
- **Excel Files**: .xlsx and .xls formats (converted to CSV)
- **Text Files**: Tab-delimited or other delimited formats

### **File Requirements**
- **Header Row**: First row must contain column names
- **Data Rows**: Actual incident data in subsequent rows
- **File Size**: Up to 50MB (typically handles 100,000+ incidents)
- **Encoding**: UTF-8 preferred, but system handles most encodings

### **Step-by-Step Upload Process**

#### **Method 1: Drag and Drop (Recommended)**
1. **Locate your CAD export file** on your computer
2. **Drag the file** from your file explorer
3. **Drop it** onto the upload area in Data Formatter
4. **Wait for upload confirmation** (usually 5-10 seconds)

#### **Method 2: Browse and Select**
1. **Click "Browse Files"** in the upload area
2. **Navigate** to your CAD export file location
3. **Select the file** and click "Open"
4. **Wait for upload confirmation**

### **What Happens After Upload**
1. **File Analysis**: System analyzes column headers and data patterns
2. **Format Detection**: Identifies likely CAD vendor and field types
3. **Preview Display**: Shows first few rows of your data
4. **Auto-Suggestions**: Recommends field mappings based on column names

**✅ Success Indicators**:
- File name appears with green checkmark
- Data preview shows your incident records
- Column headers are displayed for mapping

**⚠️ Common Upload Issues**:
- **Empty file**: Check that CSV contains data rows
- **No headers**: Ensure first row contains column names
- **Encoding errors**: Try saving CSV with UTF-8 encoding
- **Size limit**: Files over 50MB need to be split

---

## 🔗 **Field Mapping Workflows**

Field mapping is the core function - connecting your CAD system's field names to standardized field names that all tools understand.

### **Understanding Field Mapping**

**Source Fields** (Left Side): Your CAD system's column names
- Examples: "Call Receive Time", "ALARM_TIME", "INC_DATE_TIME"
- These vary by CAD vendor and department configuration

**Target Fields** (Right Side): Standardized field names
- Examples: "Incident Time", "Dispatch Time", "Arrival Time"
- These are consistent across all tools and departments

### **Required vs. Optional Fields**

**Required Fields** (Red indicators):
- **Incident ID**: Unique identifier for each incident
- **Incident Date**: Date of the incident (for Response Time Analyzer)
- **Latitude/Longitude**: Geographic coordinates (for Fire Map Pro)

**Optional Fields** (Blue indicators):
- **Response Times**: Dispatch Time, Arrival Time, Clear Time
- **Classification**: Incident Type, Priority, Response Category
- **Location**: Address, City, State, Zip Code
- **Unit Information**: Responding Unit, Station

### **Auto-Mapping Process**

The system automatically suggests field mappings based on:

**Exact Name Matches**:
```
"incident_id" → Incident ID
"dispatch_time" → Dispatch Time
"latitude" → Latitude
```

**Fuzzy Name Matching**:
```
"Call Receive Time" → Incident Time
"Unit Dispatched" → Responding Unit  
"Incident Address" → Address
```

**Pattern Recognition**:
```
"INC_DATE_TIME" → Incident Time (Console One pattern)
"ALARM_TIME" → Incident Time (Tyler pattern)
"CallDateTime" → Incident Time (Hexagon pattern)
```

### **Manual Field Mapping**

When auto-mapping doesn't catch everything, map fields manually:

#### **Method 1: Drag and Drop**
1. **Click and hold** a source field (left side)
2. **Drag** to the appropriate target field (right side)
3. **Release** to create the mapping
4. **Verify** the connection appears

#### **Method 2: Dropdown Selection**  
1. **Click** the dropdown arrow on a target field
2. **Select** the appropriate source field from the list
3. **Confirm** the mapping is created

#### **Method 3: Search and Select**
1. **Type** in the search box above source fields
2. **Filter** to find specific fields
3. **Click** to select and map

### **Special Field Types**

#### **Date and Time Fields**
The system handles various datetime formats automatically:

**Combined DateTime Fields**:
```
"01/15/2025 14:23:45" → Properly parsed
"2025-01-15 14:23:45" → Properly parsed  
"15-Jan-2025 2:23 PM" → Properly parsed
```

**Split Date/Time Fields**:
- Map "Date" field to "Incident Date"
- Map "Time" field to "Incident Time"
- System automatically combines them

**Time-Only Fields**:
```
"14:23:45" → Uses incident date + time
"2:23:45 PM" → Converted to 24-hour format
```

#### **Geographic Fields**

**Coordinate Fields**:
```
"Latitude" → 29.7604 (decimal degrees)
"Longitude" → -95.3698 (decimal degrees)
```

**Address Fields**:
```
"2805 Navigation Blvd Houston TX" → System extracts:
- Address: "2805 Navigation Blvd"
- City: "Houston"  
- State: "TX"
```

#### **Classification Fields**

**Incident Types**:
```
"Structure Fire" → Standardized classification
"111" → NFIRS code (converted to description)
"Medical Emergency" → Medical incident type
```

### **Field Mapping Validation**

#### **Real-Time Validation**
As you create mappings, the system checks:
- **Required field coverage**: All red fields must be mapped
- **Data type compatibility**: Dates map to date fields, numbers to number fields  
- **Value format checking**: Coordinates in valid ranges, dates in valid formats

#### **Validation Indicators**
- **Green checkmark**: Field mapped successfully
- **Yellow warning**: Field mapped but data quality issues detected
- **Red X**: Field mapping has errors or missing required mapping

#### **Common Validation Errors**
- **"Date field contains text"**: Source field has non-date values
- **"Coordinates out of range"**: Latitude/longitude values are invalid
- **"Required field not mapped"**: Must map all red indicator fields

---

## 💾 **Template Management**

Templates save your field mappings for reuse, turning a 30-minute mapping process into a 30-second workflow. The system now includes professional vendor templates, community sharing, and advanced collaboration features.

### **Understanding Templates**

**What Templates Save**:
- Field mapping relationships (source → target)
- CAD vendor information and signatures
- Department-specific configurations
- Data transformation rules
- Quality scoring and certification status
- Usage statistics and metadata

**What Templates Don't Save**:
- Actual data (only mapping configuration)
- File paths or specific filenames
- User-specific settings
- Private or sensitive department information

### **Creating Templates**

#### **After Successful Field Mapping**:
1. **Complete your field mapping** with all required fields
2. **Verify data quality** in Live Preview
3. **Click "Save as New Template"** in Template Management
4. **Fill in template details**:
   - **Template Name**: "Houston FD - Tyler CAD Monthly"
   - **Description**: "Monthly incident export from Tyler Dispatch"
   - **CAD Vendor**: Select from dropdown
   - **Department Name**: Your department
   - **Make Public**: Check if you want to share with other departments

#### **Template Naming Best Practices**:
```
[Department] - [CAD System] [Frequency]
Examples:
- "Baytown FD - Console One Monthly"
- "Metro Fire - Hexagon Weekly"  
- "Rural FD - Manual Export Quarterly"
```

### **Using Saved Templates**

#### **Quick Start - New Users**:
If you're new to the system, the fastest way to get started is:
1. **Upload your CAD export** from your monthly incident data
2. **Click "Load Vendor Templates"** in Template Manager (top right)
3. **Browse vendor templates** and select the one matching your CAD system
4. **Click the template name** - all field mappings are automatically applied
5. **Validation should show all green** - your data is ready for analysis!

#### **Template Suggestions**:
When you upload a file, the system automatically suggests templates based on:
- **Field name patterns**: Matching column headers
- **CAD vendor signatures**: Recognizing system-specific patterns
- **Department history**: Your previously used templates

#### **Applying Templates**:
1. **Upload your CAD export** as usual
2. **Review suggested templates** in the sidebar or use "Load Vendor Templates"
3. **Click the template name** to immediately apply all field mappings
4. **Field mappings are automatically applied** to your current data
5. **Verify mappings** are correct (usually 95%+ accuracy)
6. **Make minor adjustments** if needed

#### **Template Compatibility**:
Templates show compatibility percentages:
- **95-100%**: Excellent match, likely no adjustments needed
- **80-94%**: Good match, minor adjustments may be needed
- **60-79%**: Partial match, review all mappings carefully
- **<60%**: Poor match, consider manual mapping

### **Load Vendor Templates**

#### **Professional CAD System Templates**:
The system includes certified templates for major CAD vendors, created by fire department professionals and validated for accuracy:

**Available CAD Vendor Templates**:
- **Console One CAD Standard Template** - Optimized for Console One field patterns
- **Tyler Technologies CAD Standard Template** - For Tyler/New World CAD systems
- **Hexagon/Intergraph CAD Standard Template** - For Hexagon CAD systems
- **TriTech/CentralSquare CAD Standard Template** - For TriTech and CentralSquare systems
- **Motorola/Spillman CAD Standard Template** - For Motorola and Spillman systems
- **Zuercher CAD Standard Template** - For Zuercher dispatch systems
- **Locution CAD Standard Template** - For Locution communication systems

**Water Infrastructure Templates**:
- **ESRI/ArcGIS Hydrant Management Template** - For GIS-based hydrant data
- **AWWA Standard Hydrant Template** - Following AWWA M17 guidelines
- **Municipal Public Works Hydrant Template** - For city/county water departments
- **Water Tank & Storage Template** - For water storage infrastructure
- **Fire Department Water Supply Template** - For fire suppression water analysis

**Loading Vendor Templates**:
1. **Click "Load Vendor Templates"** in Template Manager
2. **Dialog opens** showing only professional vendor templates
3. **System automatically filters** to "Vendor" category and seeds vendor template library
4. **Templates appear** with quality certification badges and high compatibility scores
5. **Click any template name** to immediately apply all field mappings to your data

**Vendor Template Benefits**:
- **Certified Quality**: Professionally validated field mappings (90-99% quality scores)
- **Automatic CAD Detection**: System recognizes your CAD vendor and suggests appropriate templates
- **High Compatibility**: 95%+ accuracy with standard CAD exports
- **Immediate Application**: Clicking a template automatically applies all field mappings
- **Regular Updates**: Templates updated as CAD systems evolve

**Important Notes**:
- **First Time Use**: The system automatically seeds vendor templates to your library when you first click "Load Vendor Templates"
- **Template Application**: Clicking a template name applies the field mappings immediately - no additional steps needed
- **Vendor Category Filter**: "Load Vendor Templates" automatically filters to show only certified vendor templates
- **Persistent Storage**: Once loaded, vendor templates remain available in your personal template library

### **Browse Template Library**

#### **Enhanced Template Discovery**:
The template library provides intelligent template browsing with advanced search and filtering capabilities:

**Access Methods**:
- **"Browse Template Library"** in Template Manager - Opens comprehensive template browser
- **"Load Template"** dropdown - Quick access to all your saved templates
- **"Load Vendor Templates"** - Filtered view of certified vendor templates only

**Search & Filter Features**:
- **Smart Search**: Search across template names, descriptions, tags, and departments
- **Category Filtering**: Filter by CAD System, Monthly Report, Response Time, Fire Map, Test Data, General, Vendor
- **Tool Grouping**: View templates grouped by target tool (Response Time Analyzer, Fire Map Pro, etc.)
- **Quality Filtering**: Sort by quality score, certification status, and compatibility
- **Real-time Results**: Filter count updates as you type and change filters

**Template Statistics Dashboard**:
- **Total Templates**: See total available templates in your library
- **Certified Templates**: Count of professionally validated templates with verification badges
- **My Templates**: Your personal template collection (excludes vendor templates)
- **Filtered Count**: Real-time count of search results matching your criteria

**Template Preview & Details**:
- **Field Mapping Preview**: See exactly which fields are mapped (source → target)
- **Quality Indicators**: Visual quality scores and certification badges
- **Usage Statistics**: See how often templates are used and when last used
- **Compatibility Scores**: Match percentage with your current data structure
- **Template Categories**: Visual category chips (CAD System, Vendor, etc.)

**Template Interaction**:
- **Single Click Application**: Click any template name to immediately apply all field mappings
- **Duplicate Templates**: Create copies of templates for customization
- **Delete Templates**: Remove templates from your library
- **Template Details**: View complete field mapping configuration before applying

### **Share & Collaborate**

#### **Template Export & Import**:
Share templates with other departments or backup your configurations:

**Export Templates**:
1. **Click "Share & Collaborate"** in Template Manager
2. **Select "Export Templates" tab** in sharing dialog
3. **Choose templates** to export from your library
4. **Click "Export Selected"** to download JSON package
5. **Package includes**: Template metadata, field mappings, quality scores, and compatibility information
6. **Share file** with other departments via email or file sharing

**Import Templates**:
1. **Click "Share & Collaborate"** in Template Manager
2. **Select "Import Templates" tab** in sharing dialog
3. **Choose JSON file** from another department or drag-and-drop
4. **Review import summary** showing new templates and potential conflicts
5. **Resolve conflicts** by choosing to keep existing, import new versions, or rename
6. **Templates automatically added** to your library for immediate use

**Shareable Links**:
- **Generate Share Link**: Create secure URL for template sharing via Base64 encoding
- **Send to Colleagues**: Share link via email, messaging, or department communication systems
- **Automatic Import**: Recipients click link to automatically import templates to their library
- **Cross-Platform**: Works across different Fire EMS Tools installations and deployments
- **URL-based Sharing**: No file downloads required - templates embedded in URL

#### **Department-to-Department Sharing**:
Advanced collaboration features enable seamless sharing between fire departments:

**Community Template System**:
1. **Browse Community Templates** in "Share & Collaborate" dialog
2. **Filter by Department Type**: Find templates from similar departments (urban/rural/volunteer)
3. **Preview Template Details**: See complete field mappings, quality scores, and user reviews
4. **One-click Download**: Import community-shared templates directly to your library
5. **Rate & Review**: Provide feedback to help other departments assess template quality

**Template Submission**:
1. **Create High-Quality Template** with comprehensive field mapping and validation
2. **Submit to Community** via "Share & Collaborate" dialog
3. **Include Description**: Detailed description of CAD system, department type, and use case
4. **Template Review**: Community verification process ensures quality and accuracy
5. **Public Availability**: Approved templates become available to all departments nationwide

**Collaborative Features**:
- **Department Attribution**: See which departments created and actively use templates
- **Usage Statistics**: Track how many departments use your shared templates
- **Quality Ratings**: 1-5 star rating system with detailed review comments
- **Version Control**: Track template versions and updates over time with conflict resolution
- **Conflict Resolution**: Smart handling of duplicate template names with automatic versioning
- **Cross-Department Learning**: Learn from other departments' field mapping approaches

### **Template Management Interface**

#### **Template Manager Dropdown Menu**:
The Template Manager provides four main actions accessible from the Templates dropdown:

**"Save Template As..."**:
- **Save Current Mapping**: Saves your current field mappings as a reusable template
- **Template Details**: Enter name, description, CAD vendor, and department information
- **Smart Naming**: System suggests intelligent template names based on your data
- **Quality Assessment**: Automatic quality scoring and metadata generation

**"Load Template"**:
- **Quick Access**: Dropdown showing all your saved templates
- **Immediate Application**: Click any template name to instantly apply all field mappings
- **Template Preview**: See template details, field mappings, and quality scores
- **Usage Tracking**: Shows when templates were last used and how often

**"Load Vendor Templates"**:
- **Certified Templates Only**: Filtered view showing only professional vendor templates
- **Automatic Seeding**: First use automatically adds vendor templates to your library
- **Quality Guaranteed**: All vendor templates have 90-99% quality scores
- **CAD System Specific**: Templates optimized for specific CAD vendors

**"Browse Template Library"**:
- **Comprehensive View**: Full template browser with search and filtering
- **All Categories**: View templates by CAD System, Monthly Report, Response Time, Fire Map, etc.
- **Advanced Search**: Search by name, description, tags, or department
- **Quality Filtering**: Sort by quality score, certification status, and compatibility

**"Share & Collaborate"**:
- **Template Sharing**: Export/import templates with other departments
- **Community Access**: Browse and contribute to community template library
- **URL Sharing**: Generate shareable links for instant template distribution
- **Department Collaboration**: Connect with other fire departments for template exchange

#### **Template Dialog Features**:

**Search and Filter Controls**:
- **Smart Search Bar**: Search across template names, descriptions, tags, and departments
- **Category Dropdown**: Filter by template type (All, CAD System, Vendor, Monthly Report, etc.)
- **Real-time Results**: Filter count updates instantly as you type and change filters
- **Quality Sorting**: Templates sorted by quality score and certification status

**Template Statistics Dashboard**:
- **Total Templates**: Complete count of templates in your library
- **Certified Templates**: Count of professionally validated templates with verification badges
- **My Templates**: Your personal template collection (excludes vendor templates)
- **Filtered Count**: Real-time count of search results matching your criteria

**Template Information Display**:
- **Template Categories**: Visual category chips (CAD System, Vendor, Monthly Report, etc.)
- **Quality Indicators**: Visual quality scores and certification badges
- **Usage Statistics**: Last used dates and frequency of use
- **Field Mapping Preview**: See exactly which fields are mapped (source → target)
- **Compatibility Scores**: Match percentage with your current data structure

**Template Actions**:
- **Single Click Application**: Click any template name to immediately apply all field mappings
- **Duplicate Templates**: Create copies of templates for customization
- **Delete Templates**: Remove templates from your library (not available for vendor templates)
- **Template Management**: Edit, rename, or modify existing templates

---

## ✅ **Data Quality and Validation**

The Data Formatter includes sophisticated data quality checking to ensure reliable analysis results.

### **Live Preview**

The Live Preview shows exactly how your data will appear after transformation:

**What You See**:
- **First 10 rows** of transformed data
- **All mapped fields** with actual values
- **Data format consistency** across records
- **Quality indicators** for each field

**How to Use Live Preview**:
1. **Review data formats**: Dates, times, coordinates look correct
2. **Check for null values**: Important fields shouldn't be empty
3. **Verify transformations**: Original messy data is now clean
4. **Identify patterns**: Consistent formatting across all records

### **Data Quality Checks**

#### **Automatic Quality Assessment**:
- **Date/Time Validation**: Ensures realistic dates and times
- **Geographic Validation**: Coordinates within valid ranges
- **Data Type Checking**: Numbers are numeric, dates are valid dates
- **Completeness Analysis**: Percentage of fields with data

#### **Quality Indicators**:
- **🟢 Excellent (90-100%)**: High-quality data, ready for analysis
- **🟡 Good (70-89%)**: Minor issues, analysis still reliable
- **🟠 Fair (50-69%)**: Some data quality issues, review recommended
- **🔴 Poor (<50%)**: Significant issues, manual review required

### **Handling Problem Data**

#### **Missing Data**:
- **Empty fields**: Displayed as "N/A" in analysis tools
- **Partial records**: Tools skip calculations for incomplete data
- **Fallback values**: System uses intelligent defaults when appropriate

#### **Invalid Data**:
- **Bad dates**: "Invalid Date" entries are excluded from time calculations
- **Invalid coordinates**: Geographic tools exclude records with bad coordinates
- **Text in number fields**: Non-numeric values are excluded from calculations

#### **Data Cleaning Features**:
- **Automatic trimming**: Removes extra spaces from text fields
- **Case normalization**: Standardizes text case for consistency
- **Format standardization**: Converts dates/times to standard formats
- **Duplicate detection**: Identifies potential duplicate incidents

### **Validation Errors and Warnings**

#### **Error Types**:
- **Critical Errors** (Red): Must be fixed before proceeding
- **Warnings** (Yellow): Recommended fixes for better results
- **Info Messages** (Blue): Helpful information about data processing

#### **Common Error Messages**:

**"Required field not mapped"**:
- **Solution**: Map all fields with red indicators
- **Impact**: Tool won't function without required fields

**"Date field contains invalid dates"**:
- **Solution**: Check source field mapping, verify date format
- **Impact**: Time calculations may be incorrect

**"No geographic data found"**:
- **Solution**: Map latitude/longitude or address fields
- **Impact**: Fire Map Pro won't work without location data

**"Duplicate incident IDs detected"**:
- **Solution**: Review data export for duplicates
- **Impact**: Analysis may show incorrect incident counts

---

## 🔧 **Advanced Features**

### **Multi-File Processing**

#### **Combining Multiple Exports**:
Sometimes you need to combine data from multiple time periods:

1. **Upload first file** and complete field mapping
2. **Save template** for the field configuration
3. **Upload additional files** one at a time
4. **Apply same template** to maintain consistency
5. **Export combined data** or send to tools for analysis

#### **Data Concatenation**:
- **Automatic deduplication**: System removes duplicate incident IDs
- **Date range validation**: Ensures logical date sequences
- **Field consistency**: Warns if field formats differ between files

### **Custom Field Transformations**

#### **Address Parsing**:
For fields containing full addresses like "2805 Navigation Blvd Houston TX 77003":
- **Automatic extraction**: System extracts city, state, zip code
- **Smart parsing**: Handles various address formats
- **Validation**: Checks for valid state codes and zip formats

#### **Time Zone Handling**:
- **Local time assumed**: Times processed as local to your department
- **Daylight saving**: Automatic handling of DST transitions
- **24-hour conversion**: AM/PM times converted to 24-hour format

#### **Incident Type Classification**:
- **NFIRS code mapping**: Converts numeric codes to descriptions
- **Text standardization**: Normalizes incident type descriptions
- **Category grouping**: Groups similar incident types for analysis

### **Export Options**

#### **Clean CSV Export**:
1. **Complete field mapping** and validation
2. **Click "Export Data"** button
3. **Choose "Clean CSV"** format
4. **Download** standardized data file
5. **Use in other systems** or for manual analysis

#### **Tool-Specific Exports**:
- **Response Time Analyzer Format**: Optimized for NFPA calculations
- **Fire Map Pro Format**: Includes geographic optimization
- **Custom Format**: Configure specific fields and formats

### **Batch Processing**

#### **Multiple Department Processing**:
For IT administrators managing multiple departments:

1. **Create department-specific templates** for each CAD system
2. **Process multiple exports** using saved templates
3. **Generate standardized outputs** for each department
4. **Maintain data isolation** between departments

#### **Automated Workflows**:
- **Template auto-application**: System remembers your preferences
- **Quality threshold settings**: Define acceptable data quality levels
- **Notification settings**: Email alerts for processing completion

---

## 🏥 **Common CAD Systems**

### **Tyler Technologies CAD**

**Common Field Names**:
```
INCIDENT_NUMBER → Incident ID
ALARM_TIME → Incident Time
DISPATCH_TIME → Dispatch Time
ARRIVAL_TIME → Arrival Time
INCIDENT_TYPE → Incident Type
ADDRESS → Address
```

**Tyler-Specific Features**:
- **Mixed datetime formats**: Some fields full datetime, others time-only
- **Unit tracking**: Multiple units per incident in separate rows
- **Zone information**: Geographic zones and districts

**Template Recommendations**:
- Save templates for different export configurations
- Handle split date/time fields carefully
- Map unit information for multi-unit incidents

### **Hexagon/Intergraph CAD**

**Common Field Names**:
```
CallDateTime → Incident Time
DispatchDateTime → Dispatch Time
ArrivalDateTime → Arrival Time
IncidentType → Incident Type
LocationAddress → Address
```

**Hexagon-Specific Features**:
- **PascalCase naming**: CallDateTime instead of call_date_time
- **Consistent datetime formats**: Usually full datetime stamps
- **Rich location data**: Multiple address fields available

**Template Recommendations**:
- Leverage consistent datetime formatting
- Map multiple address fields for completeness
- Use location enrichment features

### **TriTech/CentralSquare CAD**

**Common Field Names**:
```
EventNum → Incident ID
Call_Date_Time → Incident Time
Unit_Dispatched_Time → Dispatch Time
Unit_Arrived_Time → Arrival Time
Nature_Code → Incident Type
```

**TriTech-Specific Features**:
- **Underscore naming**: call_date_time convention
- **Event-centric model**: EventNum as primary identifier
- **Nature codes**: Numeric incident classification

**Template Recommendations**:
- Map EventNum to Incident ID consistently
- Handle nature codes with classification mapping
- Leverage unit-specific time stamps

### **Console One CAD**

**Common Field Names**:
```
INC_DATE_TIME → Incident Time
PROBLEM_TYPE → Incident Type
UNIT_ID → Responding Unit
DISPATCH_TIME → Dispatch Time
ARRIVAL_TIME → Arrival Time
```

**Console One-Specific Features**:
- **ALL_CAPS naming**: INC_DATE_TIME convention
- **Combined datetime**: Most time fields include date and time
- **Numeric problem types**: NFIRS codes in PROBLEM_TYPE

**Template Recommendations**:
- Map PROBLEM_TYPE carefully for incident classification
- Leverage combined datetime fields for accuracy
- Handle numeric incident types with descriptions

### **Manual/Small System Exports**

**Common Patterns**:
```
"Incident #" → Incident ID
"Date" + "Time" → Combine for Incident Time
"Call Type" → Incident Type
"Location" → Address
```

**Manual System Features**:
- **Inconsistent formats**: Varies by person entering data
- **Split date/time**: Often separate date and time columns
- **Text descriptions**: Incident types as full text descriptions

**Template Recommendations**:
- Create multiple templates for different data entry personnel
- Handle split date/time fields carefully
- Standardize text descriptions with classification mapping

---

## 🚨 **Troubleshooting**

### **Upload Issues**

#### **"File won't upload"**
- **Check file size**: Must be under 50MB
- **Verify file format**: CSV preferred, Excel acceptable
- **Browser refresh**: Try refreshing the page
- **Different browser**: Test with Chrome or Firefox

#### **"No data preview shown"**
- **Check header row**: First row must contain column names
- **Verify CSV format**: Ensure comma-separated values
- **Encoding issues**: Try saving file as UTF-8 CSV
- **Empty file**: Ensure file contains data rows

#### **"Corrupted file error"**
- **Re-export from CAD**: Generate fresh export
- **Open in Excel**: Verify file opens correctly
- **Save as CSV**: Re-save as CSV from Excel
- **Text editor check**: Open in Notepad to check format

### **Field Mapping Issues**

#### **"No auto-mapping suggestions"**
- **Column names unclear**: System can't recognize field patterns
- **Manual mapping required**: Use drag-and-drop mapping
- **Create custom template**: Save mapping for future use
- **Check field variations**: System may need training on your field names

#### **"Required fields not mapping"**
- **Review source columns**: Ensure required data exists
- **Check field names**: Look for variations of required fields
- **Manual mapping**: Drag appropriate fields to required targets
- **Contact support**: May need system configuration update

#### **"Date/time fields not working"**
- **Check date format**: Ensure recognizable date format
- **Time zone issues**: Verify times are in local time zone
- **Split fields**: Map date and time separately if needed
- **Format validation**: Use Live Preview to verify formatting

### **Data Quality Issues**

#### **"Unrealistic response times"**
- **Check time field mapping**: Verify incident time vs arrival time
- **Date-only detection**: System may be using date without time
- **Time zone problems**: Ensure consistent time zone usage
- **Data validation**: Review source data for accuracy

#### **"Missing geographic data"**
- **Map coordinates**: Ensure latitude/longitude fields mapped
- **Address parsing**: Map address field if coordinates unavailable
- **Coordinate format**: Ensure decimal degrees format
- **Data completeness**: Check that source has location data

#### **"Duplicate incidents"**
- **Incident ID mapping**: Ensure unique identifiers mapped correctly
- **Multi-unit responses**: May show same incident multiple times
- **Data export settings**: Check CAD export configuration
- **Deduplication**: System can help identify duplicates

### **Template Issues**

#### **"Template doesn't work with new data"**
- **Field name changes**: CAD system may have updated field names
- **Export format changes**: Different export configuration used
- **Template compatibility**: Check compatibility percentage
- **Update template**: Modify template for new field names

#### **"Can't save template"**
- **Required fields**: Ensure all required fields mapped
- **Template name**: Use unique template name
- **Permissions**: Verify user permissions for template creation
- **Browser issues**: Try different browser or refresh page

#### **"Template suggestions poor"**
- **Column naming**: System may not recognize field patterns
- **CAD vendor detection**: System may not identify your CAD type
- **Manual template creation**: Create custom template
- **Community templates**: Check if others have shared templates

#### **"Load Vendor Templates shows empty"**
- **First Time Use**: Click "Load Vendor Templates" to automatically seed your library
- **Template Filtering**: System filters to show only vendor templates
- **Refresh Browser**: Clear browser cache and refresh page
- **Check Network**: Ensure stable internet connection for template loading

#### **"Template not applying field mappings"**
- **Wrong Action**: Use "Load Template" or "Browse Template Library" to apply mappings
- **Template vs Template Manager**: "Load Vendor Templates" only shows templates for selection
- **Click Template Name**: Click the template name/title to apply mappings
- **Verify Data**: Ensure uploaded data matches template field expectations

#### **"Shared template link not working"**
- **URL Integrity**: Ensure complete URL was copied (URLs are very long)
- **Browser Compatibility**: Try different browser or incognito mode
- **Link Expiration**: Some shared links may have expiration dates
- **Network Issues**: Check internet connection and firewall settings

#### **"Template import failed"**
- **File Format**: Ensure importing correct JSON template file
- **File Corruption**: Try re-downloading or re-generating template file
- **Version Compatibility**: Older templates may need updating
- **Conflict Resolution**: Choose appropriate action for duplicate template names

### **Performance Issues**

#### **"Slow upload/processing"**
- **File size**: Large files take longer to process
- **Internet connection**: Verify stable internet connection
- **Browser memory**: Close other browser tabs
- **Server load**: May be busy during peak usage times

#### **"Browser crashes"**
- **Memory issues**: Try with smaller data files
- **Browser compatibility**: Use Chrome, Firefox, Safari, or Edge
- **Clear cache**: Clear browser cache and cookies
- **Restart browser**: Close and reopen browser

### **Getting Help**

#### **Self-Help Resources**:
1. **Check this guide**: Review relevant sections above
2. **Live Preview**: Use Live Preview to diagnose issues
3. **Template library**: Look for similar department templates
4. **Error messages**: Read error messages carefully for specific solutions
5. **Template Library Help**: Browse community templates for similar use cases
6. **Quality Scores**: Use template quality indicators to identify best options

#### **Community Support**:
1. **Template Sharing**: Share your successful templates with other departments
2. **Template Reviews**: Rate and review templates you've used
3. **Community Forums**: Connect with other fire departments using the system
4. **Best Practices**: Learn from other departments' field mapping strategies

#### **Technical Support**:
1. **Department Admin**: For user account and permission issues
2. **IT Support**: For technical/system issues
3. **Email Support**: Include error messages and file details
4. **Emergency Contact**: For urgent operational issues
5. **Template Support**: For help with complex template creation
6. **Integration Support**: For CAD system integration assistance

#### **When Contacting Support, Include**:
- **Error message** (exact text)
- **File details** (size, format, CAD system)
- **Steps taken** (what you tried)
- **Browser information** (Chrome, Firefox, etc.)
- **Screenshot** (if helpful for visual issues)
- **Template Information** (template name, source, quality score)
- **Department Context** (department size, CAD system, special requirements)

#### **Advanced Support Options**:
1. **Custom Template Creation**: Professional template development services
2. **CAD Integration Consulting**: Help with direct CAD system connections
3. **Training Sessions**: Department-wide training on template management
4. **Template Optimization**: Review and enhance existing templates
5. **Workflow Consulting**: Optimize your monthly data processing workflow

---

## 💡 **Best Practices**

### **Monthly Workflow Optimization**

#### **Template Strategy**:
1. **Create department template** on first successful mapping
2. **Name descriptively**: Include CAD system and frequency
3. **Test template** with next month's data to verify consistency
4. **Update as needed** when CAD system changes
5. **Share with colleagues** for consistency across staff

#### **Data Quality Routine**:
1. **Consistent exports**: Use same CAD export settings monthly
2. **Quick preview**: Always check Live Preview before proceeding
3. **Quality threshold**: Establish minimum acceptable quality levels
4. **Issue tracking**: Document and resolve recurring data problems
5. **Backup exports**: Keep copies of CAD exports for reference

### **Multi-User Coordination**

#### **Department Standards**:
1. **Standardize templates**: All staff use same template for consistency
2. **Naming conventions**: Consistent template and file naming
3. **Quality checks**: Establish department data quality standards
4. **Training**: Ensure all staff understand field mapping principles
5. **Documentation**: Maintain department-specific notes and procedures

#### **Template Sharing**:
1. **Regional coordination**: Share templates with neighboring departments
2. **CAD vendor groups**: Coordinate with departments using same CAD system
3. **Mutual aid**: Standardize for multi-agency incidents
4. **Quality feedback**: Rate and review shared templates
5. **Best practices**: Share lessons learned and optimization tips

### **Data Security and Privacy**

#### **Data Handling**:
1. **Department data only**: Never upload other department's data
2. **Export cleanup**: Remove exported files after use
3. **Template privacy**: Mark templates private if they contain sensitive info
4. **Access controls**: Only authorized personnel should handle CAD exports
5. **Audit trails**: System maintains logs of data processing activities

#### **Compliance Considerations**:
1. **HIPAA awareness**: Be cautious with medical incident details
2. **Public records**: Understand what incident data is public record
3. **Data retention**: Follow department policies for data retention
4. **Backup security**: Secure storage of CAD export backups
5. **Access logging**: Monitor who accesses and processes department data

### **Performance Optimization**

#### **File Management**:
1. **Appropriate file sizes**: Monthly exports usually 1-10MB optimal
2. **Data range limits**: 3-6 months maximum for single processing
3. **Field selection**: Only export needed fields from CAD system
4. **Format optimization**: CSV preferred over Excel for large files
5. **Compression**: ZIP large files for upload speed

#### **System Usage**:
1. **Peak hours**: Avoid processing during heavy usage periods
2. **Browser choice**: Chrome and Firefox generally perform best
3. **Memory management**: Close unnecessary browser tabs during processing
4. **Cache clearing**: Periodically clear browser cache for optimal performance
5. **Connection stability**: Ensure stable internet during large file processing

### **Continuous Improvement**

#### **Monthly Review**:
1. **Template effectiveness**: Review template match percentages
2. **Data quality trends**: Track quality improvements over time
3. **Processing time**: Monitor and optimize workflow efficiency
4. **Error patterns**: Identify and address recurring issues
5. **User feedback**: Gather input from all staff users

#### **System Evolution**:
1. **Feature requests**: Suggest improvements based on department needs
2. **Template refinement**: Continuously improve template accuracy
3. **Process documentation**: Update department procedures as system evolves
4. **Training updates**: Keep staff training current with system changes
5. **Integration opportunities**: Identify connections with other department systems

---

**Last Updated**: June 2025  
**Tool Version**: 1.0.0  
**Difficulty**: Beginner to Advanced

*The Data Formatter is the foundation of all Fire EMS Tools workflows. Master this tool first, and all other tools become easy to use with clean, reliable data.*