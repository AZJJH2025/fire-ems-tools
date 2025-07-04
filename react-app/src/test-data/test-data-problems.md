# Test Data Problems & Solutions Tracking

## Overview
This document tracks specific data problems found in real-world fire department CAD exports and ensures our Universal Data Normalization Engine addresses each issue.

**Research Sources:**
- Tyler Technologies CAD systems (30% market share)
- Hexagon/Intergraph CAD systems (25% market share)  
- TriTech/CentralSquare CAD systems (20% market share)
- NFIRS 5.0 standard requirements
- Small/volunteer department formats (65% of firefighters)

---

## 1. tyler_cad_split_datetime.csv
**Simulates:** Tyler Technologies New World CAD export format

**Problems Identified:**
- **P1: Split DateTime Fields** - Date in "MM/DD/YYYY" format, Time in "HH:MM:SS" separate columns
- **P2: Inconsistent Field Names** - "Inc_Date" vs expected "incident_date", "Alarm_Time" vs "incident_time"
- **P3: Empty String Handling** - Missing data shows as "" instead of null/empty
- **P4: NFIRS Code Integration** - Uses NFIRS incident type codes (111, 321, etc.) instead of plain text
- **P5: Multiple Time Fields** - Separate columns for Alarm, Dispatch, Arrival, Clear times

**Must Solve:**
- Auto-detect split datetime pattern and combine into single field
- Field name mapping intelligence for Tyler-specific naming conventions
- Handle empty string normalization to proper null values
- Convert NFIRS codes to human-readable incident types
- Smart time field selection for primary incident time

**Real-World Impact:** 30% of fire departments use Tyler CAD systems

---

## 2. hexagon_combined_datetime.csv
**Simulates:** Hexagon/Intergraph HxGN OnCall Dispatch export format

**Problems Identified:**
- **P6: Combined DateTime Format** - Single field "CallDateTime" in "MM/DD/YYYY HH:MM:SS" format
- **P7: Inconsistent Seconds** - Some timestamps missing ":SS" seconds portion
- **P8: Hexagon Field Names** - "CallDateTime" vs "incident_time", "IncidentNum" vs "incident_id"
- **P9: Location Data Mix** - Some records have coordinates, others only addresses
- **P10: Unit Identifier Format** - Complex unit IDs like "ENG01-STATION12" vs simple "E1"

**Must Solve:**
- Parse combined datetime fields correctly
- Handle missing seconds in timestamps (assume :00)
- Map Hexagon-specific field names to standard schema
- Handle mixed geographic data (coordinates vs addresses)
- Normalize unit identifier formats

**Real-World Impact:** 25% of fire departments use Hexagon CAD systems

---

## 3. tritech_narrative_heavy.csv
**Simulates:** TriTech/CentralSquare CAD with heavy narrative content

**Problems Identified:**
- **P11: Narrative Overload** - Critical structured data buried in long narrative text
- **P12: Inconsistent Incident Types** - Mix of codes and free text: "F111", "STRUCTURE FIRE", "fire - residential"
- **P13: Missing Critical Fields** - No dedicated incident_type column, buried in "Comments" field
- **P14: CentralSquare Naming** - "CallTime" vs "incident_time", "EventNum" vs "incident_id"
- **P15: Multiple Narrative Fields** - "Comments", "Disposition", "Units_Notes" all contain relevant info

**Must Solve:**
- Extract structured data from narrative text using regex patterns
- Standardize mixed incident type formats
- Parse multiple narrative fields for missing critical data
- Map CentralSquare field names to standard schema
- Confidence scoring for extracted vs native structured data

**Real-World Impact:** 20% of fire departments use TriTech/CentralSquare systems

---

## 4. volunteer_dept_minimal.csv
**Simulates:** Small volunteer fire department with basic record keeping

**Problems Identified:**
- **P16: Minimal Data Structure** - Only basic fields: Date, Time, Location, Type, Units
- **P17: Manual Data Entry Errors** - Inconsistent formatting, typos, missing data
- **P18: Non-Standard Incident Types** - Local terminology: "House Fire", "Car Wreck", "Medical"
- **P19: Simple Time Format** - Time as "14:23" without seconds or full datetime
- **P20: Limited Location Data** - Simple addresses without coordinates or detailed location info
- **P21: Volunteer Constraints** - Data entry done by volunteers with varying computer skills

**Must Solve:**
- Handle minimal data structures gracefully
- Auto-correct common manual entry errors
- Map local terminology to standard incident classifications
- Enhance simple time formats to full datetime
- Provide user-friendly error correction suggestions
- Accommodate low-tech data entry workflows

**Real-World Impact:** 65% of firefighters are volunteers in small departments

---

## 5. houston_fd_working.csv
**Simulates:** Large municipal department with well-structured data (our baseline)

**Problems Identified:**
- **P22: Baseline Validation** - Ensure our system doesn't break already-good data
- **P23: Combined DateTime Success** - "Call Received Date/Time" format works correctly
- **P24: Standard Field Names** - Verify auto-mapping doesn't misidentify correct fields
- **P25: High Data Quality** - Ensure quality data flows through unchanged

**Must Solve:**
- Preserve existing good data structure
- Auto-detect when data is already clean
- Skip unnecessary transformations for quality data
- Maintain response time calculation accuracy

**Real-World Impact:** Reference standard for what good CAD data should look like

---

## Test Data Coverage Matrix

| Problem Category | Tyler | Hexagon | TriTech | Volunteer | Houston |
|-----------------|-------|---------|---------|-----------|---------|
| DateTime Handling | Split | Combined | Mixed | Simple | Combined |
| Field Names | Tyler-specific | Hexagon-specific | CentralSquare | Generic | Standard |
| Data Quality | Good | Good | Mixed | Poor | Excellent |
| Narrative Data | Minimal | Moderate | Heavy | Simple | Structured |
| Location Data | Standard | Mixed | Standard | Basic | Complete |
| Incident Types | NFIRS Codes | Mixed | Mixed | Local Terms | Standard |

---

## Success Criteria

**Phase 1: Core Patterns (80% Coverage)**
- ✅ Auto-detect and handle split vs combined datetime
- ✅ Map top 20 most common field name variations
- ✅ Parse narrative text for missing incident types
- ✅ Handle empty/null data normalization
- ✅ Preserve quality data unchanged

**Phase 2: Advanced Intelligence**
- ✅ NFIRS code to text conversion
- ✅ Location data enhancement
- ✅ Unit identifier normalization
- ✅ Confidence scoring for transformations
- ✅ Manual entry error detection/correction

**Phase 3: Volunteer Department Support**
- ✅ Low-tech workflow accommodation
- ✅ Local terminology mapping
- ✅ Data quality improvement suggestions
- ✅ Progressive enhancement rather than replacement

---

## Implementation Priority

**Week 1: High-Impact Problems (Affects 80% of departments)**
- P1, P6: Split vs Combined DateTime handling
- P2, P8, P14: Field name mapping intelligence
- P11, P13: Basic narrative parsing for incident types

**Week 2: Data Quality Issues**
- P3, P17: Empty string and error handling
- P4, P12: Incident type standardization
- P19: Time format enhancement

**Week 3: Advanced Features**
- P9, P20: Location data handling
- P15: Multiple narrative field parsing
- P21: Volunteer workflow optimization

**Week 4: Polish & Edge Cases**
- P22-P25: Quality data preservation
- P10: Unit identifier normalization
- Confidence scoring and user feedback