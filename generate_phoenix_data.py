import pandas as pd
import numpy as np
import datetime
import random
import os

# Ensure data directory exists
os.makedirs('data/stations', exist_ok=True)

# Generate 90 days of incident data for Phoenix Fire Department stations
start_date = datetime.datetime.now() - datetime.timedelta(days=90)
end_date = datetime.datetime.now()

# Phoenix Fire Department stations (actual station numbers)
# Using actual Phoenix coordinates
stations = {
    'Station 1': {'lat': 33.4484, 'lon': -112.0740, 'address': '323 N 4th Ave, Phoenix, AZ 85003'},
    'Station 4': {'lat': 33.4507, 'lon': -112.0455, 'address': '1125 N 3rd St, Phoenix, AZ 85004'},
    'Station 9': {'lat': 33.4818, 'lon': -112.0879, 'address': '2400 N 16th St, Phoenix, AZ 85006'},
    'Station 11': {'lat': 33.5202, 'lon': -112.0735, 'address': '2727 E Indianola Ave, Phoenix, AZ 85016'},
    'Station 18': {'lat': 33.4976, 'lon': -112.0222, 'address': '3325 W Flower St, Phoenix, AZ 85017'},
    'Station 20': {'lat': 33.4608, 'lon': -112.1183, 'address': '4635 E McDowell Rd, Phoenix, AZ 85008'},
    'Station 24': {'lat': 33.5125, 'lon': -112.1299, 'address': '2929 W Greenway Rd, Phoenix, AZ 85053'},
    'Station 32': {'lat': 33.6106, 'lon': -112.0493, 'address': '7025 N 35th Ave, Phoenix, AZ 85051'},
    'Station 40': {'lat': 33.4785, 'lon': -112.2195, 'address': '2650 N 40th Ave, Phoenix, AZ 85009'},
    'Station 50': {'lat': 33.3991, 'lon': -112.1141, 'address': '4411 S Priest Dr, Phoenix, AZ 85040'}
}

# More realistic call types with distribution weights
call_types = {
    "EMS - Chest Pain": 0.15,
    "EMS - Difficulty Breathing": 0.14,
    "EMS - Fall Injury": 0.12,
    "EMS - Traffic Accident": 0.10,
    "EMS - Unconscious Person": 0.08,
    "EMS - Abdominal Pain": 0.07,
    "EMS - Stroke": 0.05,
    "EMS - Overdose": 0.05,
    "Fire - Structure": 0.04,
    "Fire - Vehicle": 0.03,
    "Fire - Brush/Vegetation": 0.03,
    "Fire - Alarm Activation": 0.06,
    "Fire - Wires Down": 0.02,
    "Fire - Smoke Investigation": 0.03,
    "HAZMAT - Gas Leak": 0.02,
    "Technical Rescue": 0.01
}

# Generate unit types for each station
units = []
for station, _ in stations.items():
    station_num = station.split()[1]
    units.extend([
        f"E{station_num}",    # Engine
        f"L{station_num}",    # Ladder truck (some stations)
        f"BC{station_num}",   # Battalion Chief (some stations)
        f"R{station_num}",    # Rescue unit
        f"HM{station_num}"    # Hazmat unit (only at some stations)
    ])

# Add ambulances (not all stations have them)
ambulance_stations = ['1', '9', '11', '24', '40']
for station_num in ambulance_stations:
    units.append(f"A{station_num}")  # Ambulance

# The busiest stations have multiple units
busy_stations = ['1', '9', '24']
for station_num in busy_stations:
    units.append(f"E{station_num}B")  # Second engine for busy stations

# Generate realistic incident IDs
incident_counter = 10000
incident_ids = []

# Generate records
records = []
current_date = start_date

while current_date < end_date:
    # Daily incidents vary by day of week
    weekday = current_date.weekday()
    
    # Weekends have different patterns
    if weekday >= 5:  # Weekend
        daily_incidents = random.randint(120, 180)
    else:  # Weekday
        daily_incidents = random.randint(80, 150)
    
    for _ in range(daily_incidents):
        # Select station with weighted distribution (some stations are busier)
        station_weights = {
            'Station 1': 0.15,
            'Station 9': 0.14,
            'Station 11': 0.12,
            'Station 4': 0.10,
            'Station 18': 0.10,
            'Station 24': 0.13,
            'Station 20': 0.09,
            'Station 32': 0.07,
            'Station 40': 0.06,
            'Station 50': 0.04
        }
        station_names = list(station_weights.keys())
        station_probabilities = list(station_weights.values())
        station_name = random.choices(station_names, station_probabilities)[0]
        
        station_coords = stations[station_name]
        
        # Time varies by hour of day (busier during certain times)
        hour_weights = {
            0: 0.02, 1: 0.01, 2: 0.01, 3: 0.01, 4: 0.01, 5: 0.02,
            6: 0.03, 7: 0.05, 8: 0.06, 9: 0.06, 10: 0.05, 11: 0.05,
            12: 0.06, 13: 0.06, 14: 0.05, 15: 0.06, 16: 0.07, 17: 0.08,
            18: 0.07, 19: 0.06, 20: 0.05, 21: 0.04, 22: 0.03, 23: 0.02
        }
        
        hour = random.choices(list(hour_weights.keys()), list(hour_weights.values()))[0]
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        
        incident_time = current_date.replace(hour=hour, minute=minute, second=second)
        
        # Select call type based on weighted distribution
        call_type = random.choices(list(call_types.keys()), list(call_types.values()))[0]
        
        # Response times vary by call type
        if 'EMS' in call_type:
            # EMS calls are higher priority and typically get faster response
            dispatch_time = random.randint(60, 180)  # 1-3 minutes
            response_time = random.randint(240, 480)  # 4-8 minutes
        elif 'Structure' in call_type or 'Unconscious' in call_type:
            # Structure fires and unconscious persons are highest priority
            dispatch_time = random.randint(45, 120)  # 45s-2min
            response_time = random.randint(180, 360)  # 3-6 minutes
        else:
            # Other calls
            dispatch_time = random.randint(90, 240)  # 1.5-4 minutes
            response_time = random.randint(300, 600)  # 5-10 minutes
            
        # On-scene times vary by call type
        if 'Fire' in call_type:
            on_scene_time = random.randint(1800, 7200)  # 30min-2hrs
        elif 'HAZMAT' in call_type or 'Technical Rescue' in call_type:
            on_scene_time = random.randint(3600, 10800)  # 1-3hrs
        else:
            on_scene_time = random.randint(900, 3600)  # 15min-1hr
            
        # Add some variability to coordinates (incidents occur near stations)
        lat_variance = random.uniform(-0.01, 0.01)
        lon_variance = random.uniform(-0.01, 0.01)
        
        # Generate a unique incident ID with date format
        date_str = incident_time.strftime('%Y%m%d')
        incident_counter += 1
        incident_id = f"PFD-{date_str}-{incident_counter}"
        
        # Determine responding units based on call type
        station_num = station_name.split()[1]
        primary_unit = f"E{station_num}"  # Default primary unit is engine
        
        # Unit assignment logic
        if 'Fire - Structure' in call_type:
            # Structure fires get multiple units
            num_units = random.randint(4, 8)
            # Include units from neighboring stations
            possible_units = [u for u in units if u.startswith(('E', 'L', 'BC'))]
            responding_units = random.sample(possible_units, min(num_units, len(possible_units)))
            # Make sure primary unit is from this station
            if primary_unit not in responding_units:
                responding_units[0] = primary_unit
                
        elif 'HAZMAT' in call_type:
            # HAZMAT calls get specialized units
            hazmat_units = [u for u in units if u.startswith('HM')]
            engine_units = [u for u in units if u.startswith('E')]
            bc_units = [u for u in units if u.startswith('BC')]
            
            responding_units = random.sample(hazmat_units, min(1, len(hazmat_units)))
            responding_units += random.sample(engine_units, min(2, len(engine_units)))
            responding_units += random.sample(bc_units, min(1, len(bc_units)))
            
            # Primary might be HAZMAT unit
            primary_unit = responding_units[0]
            
        elif 'Technical Rescue' in call_type:
            # Technical rescues get specialized units
            rescue_units = [u for u in units if u.startswith('R')]
            engine_units = [u for u in units if u.startswith('E')]
            bc_units = [u for u in units if u.startswith('BC')]
            
            responding_units = random.sample(rescue_units, min(1, len(rescue_units)))
            responding_units += random.sample(engine_units, min(2, len(engine_units)))
            responding_units += random.sample(bc_units, min(1, len(bc_units)))
            
            # Primary might be rescue unit
            primary_unit = responding_units[0]
            
        elif 'EMS' in call_type:
            # EMS calls typically get engine and ambulance
            ambulance_units = [u for u in units if u.startswith('A')]
            
            # Start with station's engine
            responding_units = [primary_unit]
            
            # Add an ambulance if available
            if ambulance_units:
                responding_units.append(random.choice(ambulance_units))
                
            # Some cases add battalion chief
            if 'Unconscious' in call_type or 'Stroke' in call_type or random.random() < 0.2:
                bc_units = [u for u in units if u.startswith('BC')]
                if bc_units:
                    responding_units.append(random.choice(bc_units))
                    
        else:
            # Default assignment - just the engine from this station
            responding_units = [primary_unit]
            
            # Sometimes add a ladder truck
            if random.random() < 0.3:
                ladder_units = [u for u in units if u.startswith('L')]
                if ladder_units:
                    responding_units.append(random.choice(ladder_units))
        
        # Create incident record
        record = {
            'IncidentID': incident_id,
            'Date': incident_time.strftime('%Y-%m-%d'),
            'Time': incident_time.strftime('%H:%M:%S'),
            'Datetime': incident_time,
            'Station': station_name,
            'CallType': call_type,
            'Address': station_coords['address'],
            'PrimaryUnit': primary_unit,
            'RespondingUnits': ','.join(responding_units),
            'ResponseTimeSec': response_time,
            'DispatchTimeSec': dispatch_time,
            'OnSceneTimeSec': on_scene_time,
            'Priority': 1 if 'Structure' in call_type or 'Unconscious' in call_type else 
                       (2 if 'EMS' in call_type else 3),
            'Latitude': station_coords['lat'] + lat_variance,
            'Longitude': station_coords['lon'] + lon_variance,
            'UnitCount': len(responding_units),
            'FirstUnitArrival': response_time,
            'TotalCallDuration': response_time + on_scene_time,
            'HoursOfDay': hour,
            'DayOfWeek': incident_time.strftime('%A'),
            'MonthOfYear': incident_time.strftime('%B')
        }
        
        records.append(record)
    
    current_date += datetime.timedelta(days=1)

# Create DataFrame
df = pd.DataFrame(records)

# Sort by datetime
df = df.sort_values('Datetime')

# Remove the datetime column used for sorting
df = df.drop('Datetime', axis=1)

# Add some "data noise" to make it more realistic
# Randomly set some response times to None (incomplete data)
random_indices = np.random.choice(df.index, size=int(len(df) * 0.02), replace=False)
df.loc[random_indices, 'ResponseTimeSec'] = None

# Save to CSV and Excel
df.to_csv('data/stations/phoenix_fire_data.csv', index=False)
df.to_excel('data/stations/phoenix_fire_data.xlsx', index=False)

# Create a smaller sample for testing
sample_df = df.sample(n=min(2000, len(df)))
sample_df.to_csv('data/stations/phoenix_fire_data_sample.csv', index=False)

print(f"Generated {len(df)} mock Phoenix Fire Department incident records")
print(f"Across {len(stations)} stations for a {(end_date - start_date).days} day period")
print(f"Files saved to:")
print(f"- data/stations/phoenix_fire_data.csv (full dataset)")
print(f"- data/stations/phoenix_fire_data.xlsx (full dataset)")
print(f"- data/stations/phoenix_fire_data_sample.csv (sample dataset)")