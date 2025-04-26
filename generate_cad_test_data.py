import pandas as pd
import numpy as np
import datetime
import random
import os
import uuid
from faker import Faker
import sys

# Initialize faker for realistic addresses and names
fake = Faker()

# Ensure data directory exists
os.makedirs('data/incidents', exist_ok=True)

# ---------------------------------------------
# Common configuration and utility functions
# ---------------------------------------------

# Date range for incidents (last 90 days)
start_date = datetime.datetime.now() - datetime.timedelta(days=90)
end_date = datetime.datetime.now()

# Define several geographic regions with realistic coordinates
regions = {
    "Phoenix": {
        "center": {"lat": 33.4484, "lon": -112.0740},
        "variance": 0.05,
        "zip_codes": ["85001", "85002", "85003", "85004", "85005", "85006", "85007", "85008", "85009"],
        "streets": ["Camelback Rd", "Central Ave", "Thomas Rd", "Indian School Rd", "McDowell Rd", "Van Buren St", "Washington St", "Jefferson St", "Buckeye Rd"]
    },
    "Seattle": {
        "center": {"lat": 47.6062, "lon": -122.3321},
        "variance": 0.04,
        "zip_codes": ["98101", "98102", "98103", "98104", "98105", "98106", "98107", "98108", "98109"],
        "streets": ["Pike St", "Pine St", "Madison St", "Marion St", "Columbia St", "Cherry St", "James St", "Yesler Way", "Jackson St"]
    },
    "Chicago": {
        "center": {"lat": 41.8781, "lon": -87.6298},
        "variance": 0.06,
        "zip_codes": ["60601", "60602", "60603", "60604", "60605", "60606", "60607", "60608", "60609"],
        "streets": ["Michigan Ave", "State St", "Wacker Dr", "Clark St", "LaSalle St", "Randolph St", "Madison St", "Monroe St", "Adams St"]
    },
    "Boston": {
        "center": {"lat": 42.3601, "lon": -71.0589},
        "variance": 0.03,
        "zip_codes": ["02108", "02109", "02110", "02111", "02113", "02114", "02115", "02116", "02118"],
        "streets": ["Tremont St", "Washington St", "Beacon St", "Boylston St", "Commonwealth Ave", "Newbury St", "Huntington Ave", "Atlantic Ave", "Congress St"]
    }
}

# Common call types across all CAD systems
common_call_types = {
    "EMS": ["Medical Alarm", "Cardiac Arrest", "Chest Pain", "Difficulty Breathing", "Fall", "Unconscious Person", "Seizure", "Overdose", "Stroke", "Diabetic Emergency", "Allergic Reaction", "Traumatic Injury", "Back Pain", "Abdominal Pain", "Headache", "Psychiatric Emergency", "Sick Person", "Bleeding"],
    "FIRE": ["Structure Fire", "Vehicle Fire", "Grass/Brush Fire", "Dumpster Fire", "Fire Alarm", "Smoke Investigation", "CO Alarm", "Gas Leak", "Electrical Problem", "Water Problem", "Elevator Emergency", "Public Assist", "Wires Down", "Tree Down", "Trapped Person"],
    "RESCUE": ["Motor Vehicle Accident", "Vehicle vs Pedestrian", "Water Rescue", "Confined Space Rescue", "Technical Rescue", "High Angle Rescue", "Extrication", "Search & Rescue", "Building Collapse"]
}

# Priority levels
priority_levels = ["1", "2", "3", "4", "5"]
priority_weights = [0.15, 0.25, 0.35, 0.20, 0.05]  # Higher weights for middle priorities

# Generate different station formats for each CAD provider
def generate_stations(provider):
    if provider == "Motorola":
        return [f"Station {i}" for i in range(1, 21)]
    elif provider == "CentralSquare":
        return [f"FS{i:02d}" for i in range(1, 21)]
    elif provider == "ESO":
        return [f"STA {i:02d}" for i in range(1, 21)]
    elif provider == "Hexagon":
        return [f"FD-{i:02d}" for i in range(1, 21)]
    elif provider == "Tyler":
        return [f"FIRE{i:02d}" for i in range(1, 21)]
    elif provider == "ImageTrend":
        return [f"Station #{i}" for i in range(1, 21)]
    elif provider == "Zoll":
        return [f"FDST{i:02d}" for i in range(1, 21)]
    
# Generate different unit formats for each CAD provider
def generate_units(provider, stations):
    units = []
    for station in stations:
        station_num = ''.join(filter(str.isdigit, station))
        
        if provider == "Motorola":
            units.extend([
                f"E{station_num}",  # Engine
                f"L{station_num}",  # Ladder
                f"R{station_num}",  # Rescue
                f"M{station_num}",  # Medic
                f"BC{station_num}"  # Battalion Chief
            ])
        elif provider == "CentralSquare":
            units.extend([
                f"ENG{station_num}",  # Engine
                f"LAD{station_num}",  # Ladder
                f"RES{station_num}",  # Rescue
                f"MED{station_num}",  # Medic
                f"BAT{station_num}"   # Battalion Chief
            ])
        elif provider == "ESO":
            units.extend([
                f"ENGINE {station_num}",  # Engine
                f"LADDER {station_num}",  # Ladder
                f"RESCUE {station_num}",  # Rescue
                f"MEDIC {station_num}",   # Medic
                f"BATT {station_num}"     # Battalion Chief
            ])
        elif provider == "Hexagon":
            units.extend([
                f"E-{station_num}",  # Engine
                f"L-{station_num}",  # Ladder
                f"R-{station_num}",  # Rescue
                f"M-{station_num}",  # Medic
                f"B-{station_num}"   # Battalion Chief
            ])
        elif provider == "Tyler":
            units.extend([
                f"ENG{station_num:02d}",  # Engine
                f"LAD{station_num:02d}",  # Ladder
                f"RES{station_num:02d}",  # Rescue
                f"MED{station_num:02d}",  # Medic
                f"BAT{station_num:02d}"   # Battalion Chief
            ])
        elif provider == "ImageTrend":
            units.extend([
                f"Engine {station_num}",  # Engine
                f"Ladder {station_num}",  # Ladder
                f"Rescue {station_num}",  # Rescue
                f"Medic {station_num}",   # Medic
                f"Battalion {station_num}" # Battalion Chief
            ])
        elif provider == "Zoll":
            units.extend([
                f"E{station_num}",  # Engine
                f"T{station_num}",  # Truck
                f"R{station_num}",  # Rescue
                f"A{station_num}",  # Ambulance
                f"BC{station_num}"  # Battalion Chief
            ])
    
    return units

# Generate a random address based on region
def generate_address(region_data):
    street_number = random.randint(100, 9999)
    street = random.choice(region_data["streets"])
    zip_code = random.choice(region_data["zip_codes"])
    return f"{street_number} {street}, {zip_code}"

# Generate random coordinates within a region
def generate_coordinates(region_data):
    lat = region_data["center"]["lat"] + random.uniform(-region_data["variance"], region_data["variance"])
    lon = region_data["center"]["lon"] + random.uniform(-region_data["variance"], region_data["variance"])
    return lat, lon

# Generate timestamps with realistic progressions
def generate_timestamps(base_datetime):
    # Call received
    received = base_datetime
    
    # Dispatch: 30 seconds to 2 minutes after received
    dispatch_delay = random.randint(30, 120)
    dispatched = received + datetime.timedelta(seconds=dispatch_delay)
    
    # En route: 30 seconds to 2 minutes after dispatch
    enroute_delay = random.randint(30, 120)
    enroute = dispatched + datetime.timedelta(seconds=enroute_delay)
    
    # On scene: 3 to 15 minutes after en route
    onscene_delay = random.randint(180, 900)
    onscene = enroute + datetime.timedelta(seconds=onscene_delay)
    
    # Transport (for EMS calls): 10 to 30 minutes after on scene
    transport_delay = random.randint(600, 1800)
    transport = onscene + datetime.timedelta(seconds=transport_delay)
    
    # At hospital (for EMS calls): 10 to 20 minutes after transport
    athospital_delay = random.randint(600, 1200)
    athospital = transport + datetime.timedelta(seconds=athospital_delay)
    
    # Available: 5 to 15 minutes after at hospital or 10 to 40 minutes after on scene for non-transports
    available_delay = random.randint(300, 900)
    available = athospital + datetime.timedelta(seconds=available_delay)
    
    return {
        "Received": received,
        "Dispatched": dispatched,
        "Enroute": enroute,
        "Onscene": onscene,
        "Transport": transport,
        "AtHospital": athospital,
        "Available": available
    }

# Format datetime according to CAD provider conventions
def format_datetime(dt, provider):
    if provider == "Motorola":
        return dt.strftime("%m/%d/%Y %H:%M:%S")
    elif provider == "CentralSquare":
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    elif provider == "ESO":
        return dt.strftime("%m/%d/%Y %I:%M:%S %p")
    elif provider == "Hexagon":
        return dt.strftime("%Y-%m-%dT%H:%M:%S")
    elif provider == "Tyler":
        return dt.strftime("%d-%b-%Y %H:%M:%S")
    elif provider == "ImageTrend":
        return dt.strftime("%m/%d/%Y %H:%M")
    elif provider == "Zoll":
        return dt.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]

# Generate a realistic CAD incident number based on provider format
def generate_incident_number(provider, date):
    year = date.year
    month = date.month
    day = date.day
    sequence = random.randint(1, 999)
    
    if provider == "Motorola":
        return f"{year}{month:02d}{day:02d}-{sequence:04d}"
    elif provider == "CentralSquare":
        return f"INC-{year}-{sequence:06d}"
    elif provider == "ESO":
        return f"E{year}{month:02d}{day:02d}{sequence:04d}"
    elif provider == "Hexagon":
        return f"FD-{year}-{sequence:05d}"
    elif provider == "Tyler":
        return f"{year}{month:02d}{day:02d}F{sequence:03d}"
    elif provider == "ImageTrend":
        return f"{year}-{sequence:06d}"
    elif provider == "Zoll":
        return f"Z{year}{month:02d}{day:02d}-{sequence:04d}"

# ---------------------------------------------
# CAD Provider-specific data generators
# ---------------------------------------------

def generate_motorola_data(num_records=500):
    """Generate data in Motorola PremierOne CAD format"""
    provider = "Motorola"
    region = "Phoenix"
    region_data = regions[region]
    stations = generate_stations(provider)
    units = generate_units(provider, stations)
    
    records = []
    current_date = start_date
    
    for _ in range(num_records):
        # Random time during the date range
        days_offset = random.randint(0, (end_date - start_date).days)
        hours_offset = random.randint(0, 23)
        minutes_offset = random.randint(0, 59)
        seconds_offset = random.randint(0, 59)
        
        incident_time = start_date + datetime.timedelta(days=days_offset, hours=hours_offset, minutes=minutes_offset, seconds=seconds_offset)
        
        # Random incident location
        lat, lon = generate_coordinates(region_data)
        address = generate_address(region_data)
        
        # Random incident type and priority
        incident_category = random.choice(list(common_call_types.keys()))
        incident_type = random.choice(common_call_types[incident_category])
        priority = random.choices(priority_levels, weights=priority_weights)[0]
        
        # Random units responded (1-4)
        num_units = random.randint(1, 4)
        responding_units = random.sample(units, min(num_units, len(units)))
        primary_unit = responding_units[0]
        
        # Generate timestamps
        timestamps = generate_timestamps(incident_time)
        
        record = {
            "CAD_Incident_Number": generate_incident_number(provider, incident_time),
            "Incident_Type": incident_type,
            "Priority": priority,
            "Incident_Category": incident_category,
            "Address": address,
            "City": region,
            "State": "AZ" if region == "Phoenix" else ("WA" if region == "Seattle" else "IL" if region == "Chicago" else "MA"),
            "Latitude": lat,
            "Longitude": lon,
            "Cross_Street": fake.street_name(),
            "Received_DateTime": format_datetime(timestamps["Received"], provider),
            "Dispatched_DateTime": format_datetime(timestamps["Dispatched"], provider),
            "Enroute_DateTime": format_datetime(timestamps["Enroute"], provider),
            "Onscene_DateTime": format_datetime(timestamps["Onscene"], provider),
            "Transport_DateTime": format_datetime(timestamps["Transport"], provider) if incident_category == "EMS" else "",
            "AtHospital_DateTime": format_datetime(timestamps["AtHospital"], provider) if incident_category == "EMS" else "",
            "Available_DateTime": format_datetime(timestamps["Available"], provider),
            "Primary_Unit": primary_unit,
            "All_Units": ",".join(responding_units),
            "ALS_Unit": random.choice(["Y", "N"]) if incident_category == "EMS" else "N",
            "Station_Area": random.choice(stations),
            "First_Due": random.choice(stations).replace("Station ", ""),
            "CallTaker_ID": f"CT{random.randint(100, 999)}",
            "Dispatcher_ID": f"DISP{random.randint(100, 999)}"
        }
        
        records.append(record)
    
    # Create DataFrame
    df = pd.DataFrame(records)
    
    # Sort by Received_DateTime
    df["Temp_Sort"] = pd.to_datetime(df["Received_DateTime"])
    df = df.sort_values("Temp_Sort")
    df = df.drop("Temp_Sort", axis=1)
    
    # Save to Excel
    output_file = f'data/incidents/motorola_cad_{num_records}_records.xlsx'
    df.to_excel(output_file, index=False)
    print(f"Generated {len(df)} Motorola PremierOne CAD records and saved to {output_file}")
    return df

def generate_centralsquare_data(num_records=500):
    """Generate data in CentralSquare CAD format"""
    provider = "CentralSquare"
    region = "Seattle"
    region_data = regions[region]
    stations = generate_stations(provider)
    units = generate_units(provider, stations)
    
    records = []
    
    for _ in range(num_records):
        # Random time during the date range
        days_offset = random.randint(0, (end_date - start_date).days)
        hours_offset = random.randint(0, 23)
        minutes_offset = random.randint(0, 59)
        seconds_offset = random.randint(0, 59)
        
        incident_time = start_date + datetime.timedelta(days=days_offset, hours=hours_offset, minutes=minutes_offset, seconds=seconds_offset)
        
        # Random incident location
        lat, lon = generate_coordinates(region_data)
        address = generate_address(region_data)
        
        # Random incident type and priority
        incident_category = random.choice(list(common_call_types.keys()))
        incident_type = random.choice(common_call_types[incident_category])
        priority = random.choices(priority_levels, weights=priority_weights)[0]
        
        # Random units responded (1-4)
        num_units = random.randint(1, 4)
        responding_units = random.sample(units, min(num_units, len(units)))
        primary_unit = responding_units[0]
        
        # Generate timestamps
        timestamps = generate_timestamps(incident_time)
        
        record = {
            "IncidentID": generate_incident_number(provider, incident_time),
            "CallType": incident_type,
            "CallPriority": priority,
            "CallCategory": incident_category,
            "StreetAddress": address,
            "City": region,
            "State": "WA",
            "Zip": random.choice(region_data["zip_codes"]),
            "Latitude": lat,
            "Longitude": lon,
            "CrossStreets": fake.street_name() + " & " + fake.street_name(),
            "ReceivedTime": format_datetime(timestamps["Received"], provider),
            "DispatchTime": format_datetime(timestamps["Dispatched"], provider),
            "EnrouteTime": format_datetime(timestamps["Enroute"], provider),
            "ArrivalTime": format_datetime(timestamps["Onscene"], provider),
            "TransportTime": format_datetime(timestamps["Transport"], provider) if incident_category == "EMS" else None,
            "HospitalArrivalTime": format_datetime(timestamps["AtHospital"], provider) if incident_category == "EMS" else None,
            "ClearTime": format_datetime(timestamps["Available"], provider),
            "PrimaryUnit": primary_unit,
            "RespondingUnits": ";".join(responding_units),
            "ALSResponse": random.choice([True, False]) if incident_category == "EMS" else False,
            "FireDistrict": random.choice(stations),
            "ResponseZone": f"Zone{random.randint(1,10)}",
            "CallerName": fake.name() if random.random() > 0.5 else "",
            "CallerPhone": fake.phone_number() if random.random() > 0.5 else "",
            "IncidentNotes": fake.paragraph(nb_sentences=2) if random.random() > 0.7 else "",
            "WeatherConditions": random.choice(["Clear", "Cloudy", "Rain", "Snow", "Fog", "Windy"]),
        }
        
        records.append(record)
    
    # Create DataFrame
    df = pd.DataFrame(records)
    
    # Sort by ReceivedTime
    df["Temp_Sort"] = pd.to_datetime(df["ReceivedTime"])
    df = df.sort_values("Temp_Sort")
    df = df.drop("Temp_Sort", axis=1)
    
    # Save to Excel
    output_file = f'data/incidents/centralsquare_cad_{num_records}_records.xlsx'
    df.to_excel(output_file, index=False)
    print(f"Generated {len(df)} CentralSquare CAD records and saved to {output_file}")
    return df

def generate_eso_data(num_records=500):
    """Generate data in ESO Fire RMS format"""
    provider = "ESO"
    region = "Chicago"
    region_data = regions[region]
    stations = generate_stations(provider)
    units = generate_units(provider, stations)
    
    records = []
    
    for _ in range(num_records):
        # Random time during the date range
        days_offset = random.randint(0, (end_date - start_date).days)
        hours_offset = random.randint(0, 23)
        minutes_offset = random.randint(0, 59)
        seconds_offset = random.randint(0, 59)
        
        incident_time = start_date + datetime.timedelta(days=days_offset, hours=hours_offset, minutes=minutes_offset, seconds=seconds_offset)
        
        # Random incident location
        lat, lon = generate_coordinates(region_data)
        address = generate_address(region_data)
        
        # Random incident type and priority
        incident_category = random.choice(list(common_call_types.keys()))
        incident_type = random.choice(common_call_types[incident_category])
        priority = random.choices(priority_levels, weights=priority_weights)[0]
        
        # Random units responded (1-4)
        num_units = random.randint(1, 4)
        responding_units = random.sample(units, min(num_units, len(units)))
        primary_unit = responding_units[0]
        
        # Generate timestamps
        timestamps = generate_timestamps(incident_time)
        
        record = {
            "Incident Number": generate_incident_number(provider, incident_time),
            "Incident Type": incident_type,
            "Response Priority": priority,
            "Incident Category": incident_category,
            "Address Line 1": address,
            "City": region,
            "State": "IL",
            "Postal Code": random.choice(region_data["zip_codes"]),
            "Latitude": lat,
            "Longitude": lon,
            "Cross Streets": fake.street_name() + " & " + fake.street_name(),
            "Alarm Time": format_datetime(timestamps["Received"], provider),
            "Dispatch Time": format_datetime(timestamps["Dispatched"], provider),
            "En Route Time": format_datetime(timestamps["Enroute"], provider),
            "On Scene Time": format_datetime(timestamps["Onscene"], provider),
            "Begin Transport Time": format_datetime(timestamps["Transport"], provider) if incident_category == "EMS" else "",
            "At Destination Time": format_datetime(timestamps["AtHospital"], provider) if incident_category == "EMS" else "",
            "In Service Time": format_datetime(timestamps["Available"], provider),
            "First Arriving Unit": primary_unit,
            "Units Responded": ", ".join(responding_units),
            "ALS Provided": "Yes" if incident_category == "EMS" and random.random() > 0.5 else "No",
            "Station Territory": random.choice(stations),
            "Response District": f"District {random.randint(1,5)}",
            "Caller Name": fake.name() if random.random() > 0.6 else "",
            "Caller Phone": fake.phone_number() if random.random() > 0.6 else "",
            "Patient Count": random.randint(1, 3) if incident_category == "EMS" else 0,
            "Property Use": random.choice(["Residential", "Commercial", "Industrial", "Educational", "Assembly"]) if incident_category == "FIRE" else "",
            "Weather Conditions": random.choice(["Clear", "Cloudy", "Rain", "Snow", "Fog"]),
            "Temperature": round(random.uniform(20, 95), 1),
        }
        
        records.append(record)
    
    # Create DataFrame
    df = pd.DataFrame(records)
    
    # Sort by Alarm Time
    df["Temp_Sort"] = pd.to_datetime(df["Alarm Time"])
    df = df.sort_values("Temp_Sort")
    df = df.drop("Temp_Sort", axis=1)
    
    # Save to Excel
    output_file = f'data/incidents/eso_firerms_{num_records}_records.xlsx'
    df.to_excel(output_file, index=False)
    print(f"Generated {len(df)} ESO Fire RMS records and saved to {output_file}")
    return df

def generate_imagetrend_data(num_records=500):
    """Generate data in ImageTrend format"""
    provider = "ImageTrend"
    region = "Boston"
    region_data = regions[region]
    stations = generate_stations(provider)
    units = generate_units(provider, stations)
    
    records = []
    
    for _ in range(num_records):
        # Random time during the date range
        days_offset = random.randint(0, (end_date - start_date).days)
        hours_offset = random.randint(0, 23)
        minutes_offset = random.randint(0, 59)
        seconds_offset = random.randint(0, 59)
        
        incident_time = start_date + datetime.timedelta(days=days_offset, hours=hours_offset, minutes=minutes_offset, seconds=seconds_offset)
        
        # Random incident location
        lat, lon = generate_coordinates(region_data)
        address = generate_address(region_data)
        
        # Random incident type and priority
        incident_category = random.choice(list(common_call_types.keys()))
        incident_type = random.choice(common_call_types[incident_category])
        priority = random.choices(priority_levels, weights=priority_weights)[0]
        
        # Random units responded (1-4)
        num_units = random.randint(1, 4)
        responding_units = random.sample(units, min(num_units, len(units)))
        primary_unit = responding_units[0]
        
        # Generate timestamps
        timestamps = generate_timestamps(incident_time)
        
        record = {
            "IncidentNumber": generate_incident_number(provider, incident_time),
            "IncidentDate": incident_time.strftime("%m/%d/%Y"),
            "DispatchComplaint": incident_type,
            "IncidentPriority": priority,
            "IncidentType": incident_category,
            "IncidentAddress": address,
            "City": region,
            "State": "MA",
            "PostalCode": random.choice(region_data["zip_codes"]),
            "Latitude": lat,
            "Longitude": lon,
            "NearestCrossStreets": fake.street_name() + " & " + fake.street_name(),
            "PSAPDispatchTime": format_datetime(timestamps["Received"], provider),
            "UnitNotifiedByDispatch": format_datetime(timestamps["Dispatched"], provider),
            "UnitEnRouteTime": format_datetime(timestamps["Enroute"], provider),
            "UnitArrivedOnScene": format_datetime(timestamps["Onscene"], provider),
            "UnitLeftScene": format_datetime(timestamps["Transport"], provider) if incident_category == "EMS" else "",
            "UnitArrivedAtDestination": format_datetime(timestamps["AtHospital"], provider) if incident_category == "EMS" else "",
            "UnitBackInService": format_datetime(timestamps["Available"], provider),
            "PrimaryUnit": primary_unit,
            "RespondingUnits": " | ".join(responding_units),
            "AdvancedLifeSupport": "Yes" if incident_category == "EMS" and random.random() > 0.5 else "No",
            "StationNumber": random.choice(stations),
            "FirstDueArea": random.choice(stations).replace("Station #", "Area "),
            "CallerName": fake.name() if random.random() > 0.7 else "",
            "CallerPhone": fake.phone_number() if random.random() > 0.7 else "",
            "PatientCount": random.randint(1, 3) if incident_category == "EMS" else 0,
            "PropertyType": random.choice(["Single Family", "Multi-Family", "Commercial", "Industrial", "Educational"]) if incident_category == "FIRE" else "",
            "WeatherConditions": random.choice(["Clear", "Cloudy", "Rain", "Snow", "Fog"])
        }
        
        records.append(record)
    
    # Create DataFrame
    df = pd.DataFrame(records)
    
    # Sort by dispatch time
    df["Temp_Sort"] = pd.to_datetime(df["PSAPDispatchTime"])
    df = df.sort_values("Temp_Sort")
    df = df.drop("Temp_Sort", axis=1)
    
    # Save to Excel
    output_file = f'data/incidents/imagetrend_{num_records}_records.xlsx'
    df.to_excel(output_file, index=False)
    print(f"Generated {len(df)} ImageTrend records and saved to {output_file}")
    return df

# Generate multi-sheet file with different agency data
def generate_multi_agency_data(num_records=300):
    """Generate a single Excel file with multiple sheets for different agencies"""
    
    # Generate smaller datasets for each agency
    motorola_df = generate_motorola_data(num_records)
    centralsquare_df = generate_centralsquare_data(num_records)
    eso_df = generate_eso_data(num_records)
    imagetrend_df = generate_imagetrend_data(num_records)
    
    # Create Excel writer object
    output_file = f'data/incidents/multi_agency_cad_{num_records}_records.xlsx'
    with pd.ExcelWriter(output_file) as writer:
        motorola_df.to_excel(writer, sheet_name='Motorola PremierOne', index=False)
        centralsquare_df.to_excel(writer, sheet_name='CentralSquare', index=False)
        eso_df.to_excel(writer, sheet_name='ESO FireRMS', index=False)
        imagetrend_df.to_excel(writer, sheet_name='ImageTrend', index=False)
    
    print(f"Generated multi-agency Excel file with {num_records} records per sheet and saved to {output_file}")
    
# Helper functions to run the data generation
def generate_all_datasets(records_per_file=500):
    print("Generating all CAD test datasets...")
    generate_motorola_data(records_per_file)
    generate_centralsquare_data(records_per_file)
    generate_eso_data(records_per_file)
    generate_imagetrend_data(records_per_file)
    generate_multi_agency_data(records_per_file)
    print("All datasets generated successfully!")

# Main execution
if __name__ == "__main__":
    # Check if Faker is installed
    try:
        import faker
    except ImportError:
        print("Faker library is required but not installed.")
        print("Please install it using: pip install faker")
        sys.exit(1)
        
    # Default number of records
    num_records = 500
    
    # Check for command line argument
    if len(sys.argv) > 1:
        try:
            num_records = int(sys.argv[1])
        except ValueError:
            print(f"Invalid number of records: {sys.argv[1]}. Using default: {num_records}")
    
    print(f"Generating test data with {num_records} records per file...")
    generate_all_datasets(num_records)