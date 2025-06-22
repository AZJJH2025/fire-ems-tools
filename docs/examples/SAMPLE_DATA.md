# Sample Data & Training Materials

Practice datasets and examples for learning Fire EMS Tools.

## 📋 **Quick Reference**

- **Purpose**: Realistic practice data for training and testing
- **Data Sources**: Anonymized fire department records from various department types
- **Formats**: CSV files compatible with Data Formatter and all analysis tools
- **Use Cases**: Training, testing, demonstrations, and template development

## 📁 **Available Sample Datasets**

### **1. Metro Fire Department Sample**
**Description**: Large urban fire department serving 400,000+ population
**Records**: 2,500 incidents over 12 months
**Characteristics**:
- High call volume (200+ calls/month)
- Mixed Fire/EMS incidents (70% EMS, 30% Fire)
- Multiple station responses
- Urban response challenges

**Download**: [`metro_fire_sample.csv`](#) (Sample data)

**Key Fields**:
- Complete response time data (call received through clear time)
- GPS coordinates for all incidents
- Incident types: Structure Fire, EMS Medical, Vehicle Accident, Alarm
- Multiple responding units per incident
- NFPA 1710 compliant time recording

### **2. Rural Volunteer Department Sample**
**Description**: Small rural volunteer department serving 25,000 population
**Records**: 400 incidents over 12 months
**Characteristics**:
- Lower call volume (30-35 calls/month)
- Longer response times due to volunteer staffing
- Large geographic service area
- Limited resources

**Download**: [`rural_volunteer_sample.csv`](#) (Sample data)

**Key Fields**:
- Volunteer response time patterns
- Large geographic coverage area
- Mixed incident types appropriate for rural setting
- Resource constraints reflected in data
- Mutual aid requests and responses

### **3. Console One CAD Export Sample**
**Description**: Real Console One CAD system export format
**Records**: 500 incidents, realistic field names and formats
**Characteristics**:
- Authentic Console One field naming conventions
- Numeric incident type codes (NFIRS)
- Mixed timestamp formats
- Real-world data quality issues

**Download**: [`console_one_export_sample.csv`](#) (Sample data)

**Key Fields**:
- `INC_DATE_TIME`: Call received timestamp
- `PROBLEM_TYPE`: Numeric incident codes
- `UNIT_ID`: Responding apparatus
- `LATITUDE`/`LONGITUDE`: GPS coordinates
- `DISPATCH_TIME`, `ENROUTE_TIME`, `ARRIVE_TIME`

### **4. Tyler CAD Export Sample**
**Description**: Tyler Technologies CAD export format
**Records**: 750 incidents with Tyler-specific formatting
**Characteristics**:
- Tyler CAD field naming conventions
- Text-based incident classifications
- Standard municipal CAD structure
- Complete response time data

**Download**: [`tyler_cad_export_sample.csv`](#) (Sample data)

**Key Fields**:
- `Call_Received_Time`: Primary timestamp
- `Incident_Type_Desc`: Text incident descriptions
- `Primary_Unit`: First responding unit
- `Address`: Full street addresses
- `Call_Priority`: Emergency priority levels

### **5. Multi-Department Regional Sample**
**Description**: Regional data from multiple cooperating departments
**Records**: 1,200 incidents showing mutual aid patterns
**Characteristics**:
- Multiple department codes
- Mutual aid responses
- Varied response capabilities
- Regional coordination examples

**Download**: [`regional_multi_dept_sample.csv`](#) (Sample data)

**Key Fields**:
- `Department_Code`: Identifying which department
- `Mutual_Aid_Given`/`Mutual_Aid_Received`: Cooperation tracking
- `Station_Assignment`: Primary and backup stations
- `Resource_Type`: Different apparatus types

## 🎯 **Training Scenarios**

### **Scenario 1: Monthly NFPA Compliance Report**
**Department**: Metro Fire Department
**Task**: Generate monthly compliance report for city manager
**Steps**:
1. Upload `metro_fire_sample.csv` to Data Formatter
2. Map fields using auto-detection
3. Send data to Response Time Analyzer
4. Generate NFPA 1710 compliance report
5. Export professional PDF for city presentation

**Learning Objectives**:
- Practice field mapping with real CAD data
- Understand NFPA 1710 compliance calculations
- Create executive-ready reports
- Learn professional report formatting

### **Scenario 2: Coverage Gap Analysis**
**Department**: Rural Volunteer Department
**Task**: Identify service coverage gaps for strategic planning
**Steps**:
1. Upload `rural_volunteer_sample.csv` to Data Formatter
2. Ensure geographic data is properly mapped
3. Send data to Fire Map Pro
4. Generate heat map showing incident density
5. Analyze coverage gaps and response times by geography

**Learning Objectives**:
- Work with large geographic service areas
- Understand volunteer department response patterns
- Practice geographic analysis and mapping
- Identify strategic improvement opportunities

### **Scenario 3: CAD System Integration**
**Department**: Console One user
**Task**: Process real Console One export for first time
**Steps**:
1. Upload `console_one_export_sample.csv` to Data Formatter
2. Use auto-mapping for Console One field recognition
3. Handle numeric incident codes and timestamp variations
4. Validate data quality and resolve any issues
5. Generate response time analysis

**Learning Objectives**:
- Practice with authentic CAD export formats
- Handle data quality issues in real data
- Understand field naming variations
- Work with numeric incident classification systems

### **Scenario 4: Grant Application Data Package**
**Department**: Multi-department regional
**Task**: Prepare comprehensive data package for federal grant
**Steps**:
1. Upload `regional_multi_dept_sample.csv` to Data Formatter
2. Analyze mutual aid patterns and regional cooperation
3. Generate response time analysis for all departments
4. Create geographic coverage analysis
5. Prepare professional grant application data package

**Learning Objectives**:
- Work with complex multi-department data
- Understand regional cooperation and mutual aid
- Prepare professional grant application materials
- Practice comprehensive analysis and reporting

## 📊 **Template Files**

### **Data Formatter Templates**
Pre-configured field mapping templates for common CAD systems:

**Console One Template**
- Automatically maps all standard Console One fields
- Handles numeric incident types and NFIRS codes
- Manages timestamp format variations
- Includes data validation rules

**Tyler CAD Template**
- Maps Tyler-specific field naming conventions
- Handles text-based incident classifications
- Processes priority level coding
- Includes address validation

**Hexagon CAD Template**
- Compatible with Hexagon CAD exports
- Maps emergency priority systems
- Handles multi-unit response data
- Includes geographic validation

**Generic Template**
- Works with any CAD system
- Basic field mapping for essential data
- Flexible field assignment options
- Suitable for custom or unknown CAD systems

### **Report Templates**
Professional report templates for common use cases:

**City Council Presentation**
- Executive summary format
- Key metrics dashboard
- Visual charts and graphs
- Professional municipal formatting

**Grant Application Package**
- Comprehensive data analysis
- Need justification documentation
- Professional federal grant formatting
- Supporting charts and visualizations

**Internal Monthly Report**
- Operational performance summary
- Trend analysis and comparisons
- Department-specific formatting
- Action item identification

## 🧪 **Testing Data**

### **Data Quality Test Files**
Special datasets designed to test specific functionality:

**Perfect Data Sample**
- Complete data with no missing fields
- All timestamps properly formatted
- All geographic data accurate
- Ideal for testing core functionality

**Problematic Data Sample**
- Missing timestamps
- Invalid coordinates
- Mixed date formats
- Real-world data quality issues

**Edge Case Sample**
- Unusual incident types
- Extreme response times
- Geographic boundary cases
- Stress testing scenarios

### **Performance Test Files**
Large datasets for testing system performance:

**Large Dataset (10,000 records)**
- Tests system performance with high volume
- Realistic data distribution
- Multiple years of historical data
- Memory and processing optimization testing

**Very Large Dataset (50,000 records)**
- Stress testing for enterprise-level usage
- Multi-year historical analysis
- Advanced filtering and analysis testing
- Maximum system capability testing

## 🎓 **Training Exercises**

### **Exercise 1: Basic Data Processing**
**Objective**: Learn fundamental data import and processing
**Time**: 15 minutes
**Steps**:
1. Download Metro Fire Department sample
2. Import to Data Formatter
3. Review auto-mapping results
4. Correct any mapping issues
5. Validate data preview

### **Exercise 2: Response Time Analysis**
**Objective**: Understand NFPA compliance calculations
**Time**: 20 minutes
**Steps**:
1. Use processed Metro Fire data
2. Send to Response Time Analyzer
3. Review compliance calculations
4. Understand what affects compliance scores
5. Generate basic compliance report

### **Exercise 3: Geographic Analysis**
**Objective**: Learn mapping and spatial analysis
**Time**: 25 minutes
**Steps**:
1. Use Rural Department geographic data
2. Create incident heat map
3. Analyze response coverage patterns
4. Identify potential coverage gaps
5. Export professional coverage map

### **Exercise 4: Professional Reporting**
**Objective**: Create executive-quality reports
**Time**: 30 minutes
**Steps**:
1. Use any sample dataset
2. Complete full analysis workflow
3. Select appropriate report template
4. Customize with department branding
5. Generate publication-ready PDF

## 📋 **Data Dictionary**

### **Standard Field Names**
Common fields across all sample datasets:

**Required Fields**:
- `incident_id`: Unique identifier
- `incident_date`: Date of incident
- `incident_time`: Full timestamp of call received

**Response Time Fields**:
- `dispatch_time`: When units were notified
- `enroute_time`: When units began responding
- `arrival_time`: When first unit arrived on scene
- `clear_time`: When units returned to service

**Geographic Fields**:
- `latitude`: Decimal degrees
- `longitude`: Decimal degrees
- `address`: Street address
- `city`: Municipality
- `zip_code`: Postal code

**Classification Fields**:
- `incident_type`: Type of emergency
- `priority`: Emergency priority level
- `responding_unit`: Primary apparatus
- `department`: Department identifier

### **Data Formats**
Standard formats used in all sample data:

**Dates**: MM/DD/YYYY or YYYY-MM-DD
**Times**: HH:MM:SS (24-hour format)
**Coordinates**: Decimal degrees (e.g., 39.7392, -104.9903)
**Text Fields**: UTF-8 encoding, quotes around fields containing commas

## 🔗 **Download Links**

### **Sample Datasets**
- [Metro Fire Department Sample (2.1 MB)](#)
- [Rural Volunteer Department Sample (380 KB)](#)
- [Console One CAD Export Sample (850 KB)](#)
- [Tyler CAD Export Sample (1.2 MB)](#)
- [Regional Multi-Department Sample (1.8 MB)](#)

### **Template Files**
- [Console One Field Mapping Template](#)
- [Tyler CAD Field Mapping Template](#)
- [Hexagon CAD Field Mapping Template](#)
- [Generic CAD Field Mapping Template](#)

### **Report Templates**
- [City Council Presentation Template](#)
- [Grant Application Package Template](#)
- [Internal Monthly Report Template](#)
- [NFPA Compliance Report Template](#)

### **Training Materials**
- [Training Exercise Workbook (PDF)](#)
- [Video Tutorial Series](#)
- [Best Practices Guide](#)
- [Advanced Analysis Techniques](#)

---

**Getting Started**: Download the Metro Fire Department sample to begin practicing with realistic fire department data. Use the training scenarios to learn each tool systematically.

**Need Help?** Check the [Quick Start Guide](/docs/users/QUICK_START) for step-by-step instructions, or review tool-specific guides for [Data Formatter](/docs/users/DATA_FORMATTER), [Response Time Analyzer](/docs/users/RESPONSE_TIME_ANALYZER), and [Fire Map Pro](/docs/users/FIRE_MAP_PRO).