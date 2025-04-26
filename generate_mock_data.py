import pandas as pd
import numpy as np
import datetime
import random
import os

# Ensure data directory exists
os.makedirs('data/stations', exist_ok=True)

# Generate 60 days of incident data for 5 stations
start_date = datetime.datetime.now() - datetime.timedelta(days=60)
end_date = datetime.datetime.now()

# Station information
stations = {
    'Station 1': {'lat': 38.9072, 'lon': -77.0369},  # Washington DC
    'Station 2': {'lat': 38.9122, 'lon': -77.0469},
    'Station 3': {'lat': 38.9022, 'lon': -77.0269},
    'Station 4': {'lat': 38.8972, 'lon': -77.0569},
    'Station 5': {'lat': 38.9172, 'lon': -77.0169}
}

call_types = ["Medical", "Fire", "MVA", "Gas Leak", "Structure Fire", "Cardiac Arrest", 
              "Fall", "Breathing Problem", "Overdose", "Stroke", "Seizure", "Public Assist"]

units = []
for station, _ in stations.items():
    station_num = station.split()[1]
    units.extend([
        f"E{station_num}",  # Engine
        f"T{station_num}",  # Truck
        f"M{station_num}",  # Medic
        f"BC{station_num}"  # Battalion Chief
    ])

# Generate records
records = []
current_date = start_date

while current_date < end_date:
    # Generate 20-40 incidents per day
    daily_incidents = random.randint(20, 40)
    
    for _ in range(daily_incidents):
        station_name = random.choice(list(stations.keys()))
        station_coords = stations[station_name]
        
        # Random time during the day
        hour = random.randint(0, 23)
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        
        incident_time = current_date.replace(hour=hour, minute=minute, second=second)
        
        # Response time between 4 and 12 minutes
        response_time = random.randint(4 * 60, 12 * 60)  # in seconds
        
        # Dispatch time between 2 and 5 minutes
        dispatch_time = random.randint(2 * 60, 5 * 60)  # in seconds
        
        # On-scene time between 10 and 60 minutes
        on_scene_time = random.randint(10 * 60, 60 * 60)  # in seconds
        
        # Add some variability to coordinates
        lat_variance = random.uniform(-0.02, 0.02)
        lon_variance = random.uniform(-0.02, 0.02)
        
        # Unit assigned based on call type
        call_type = random.choice(call_types)
        
        # Select 1-3 units from the same station to respond
        num_units = random.randint(1, 3)
        station_units = [unit for unit in units if unit[1] == station_name.split()[1]]
        if len(station_units) > num_units:
            responding_units = random.sample(station_units, num_units)
        else:
            responding_units = station_units
            
        primary_unit = responding_units[0] if responding_units else f"E{station_name.split()[1]}"
        
        record = {
            'IncidentID': f"INC-{random.randint(10000, 99999)}",
            'Date': incident_time.strftime('%Y-%m-%d'),
            'Time': incident_time.strftime('%H:%M:%S'),
            'Datetime': incident_time,
            'Station': station_name,
            'CallType': call_type,
            'ResponseTimeSec': response_time,
            'DispatchTimeSec': dispatch_time,
            'OnSceneTimeSec': on_scene_time,
            'PrimaryUnit': primary_unit,
            'RespondingUnits': ','.join(responding_units),
            'Latitude': station_coords['lat'] + lat_variance,
            'Longitude': station_coords['lon'] + lon_variance,
            'Location': f"{station_coords['lat'] + lat_variance}, {station_coords['lon'] + lon_variance}"
        }
        
        records.append(record)
    
    current_date += datetime.timedelta(days=1)

# Create DataFrame
df = pd.DataFrame(records)

# Sort by datetime
df = df.sort_values('Datetime')

# Remove the datetime column used for sorting
df = df.drop('Datetime', axis=1)

# Save to CSV
df.to_csv('data/stations/mock_station_data.csv', index=False)

# Also save to Excel for testing both formats
df.to_excel('data/stations/mock_station_data.xlsx', index=False)

print(f"Generated {len(df)} mock incident records across {len(stations)} stations")
print(f"Files saved to data/stations/mock_station_data.csv and mock_station_data.xlsx")