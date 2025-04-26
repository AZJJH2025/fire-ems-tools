#!/usr/bin/env python3
"""
Generate Sample Data for Coverage Gap Finder

This script generates sample data files for testing the Coverage Gap Finder tool,
creating both station and incident data with realistic attributes.
"""

import pandas as pd
import numpy as np
import os
import random
from datetime import datetime, timedelta

def generate_station_data(num_stations=20, city="Phoenix"):
    """Generate sample fire station data"""
    
    # Base coordinates for Phoenix, AZ (adjust for other cities)
    if city.lower() == "phoenix":
        base_lat, base_lng = 33.4484, -112.0740
        lat_range, lng_range = 0.2, 0.2
    elif city.lower() == "seattle":
        base_lat, base_lng = 47.6062, -122.3321
        lat_range, lng_range = 0.15, 0.15
    elif city.lower() == "chicago":
        base_lat, base_lng = 41.8781, -87.6298
        lat_range, lng_range = 0.18, 0.18
    else:
        base_lat, base_lng = 33.4484, -112.0740  # Default to Phoenix
        lat_range, lng_range = 0.2, 0.2
    
    # Station names and types
    station_data = []
    for i in range(1, num_stations + 1):
        # Generate random coordinates within range
        lat = base_lat + (random.random() * lat_range * 2 - lat_range)
        lng = base_lng + (random.random() * lng_range * 2 - lng_range)
        
        # Determine station type (mostly engine, some ladder, few specialty)
        station_type = random.choices(
            ["Engine", "Ladder", "Rescue", "Hazmat", "Battalion"],
            weights=[0.7, 0.15, 0.05, 0.05, 0.05],
            k=1
        )[0]
        
        # Create apparatus based on station type
        if station_type == "Engine":
            apparatus = f"Engine {i}"
            personnel = random.randint(3, 5)
        elif station_type == "Ladder":
            apparatus = f"Ladder {i}"
            personnel = random.randint(4, 6)
        elif station_type == "Rescue":
            apparatus = f"Rescue {i}"
            personnel = random.randint(2, 4)
        elif station_type == "Hazmat":
            apparatus = f"Hazmat {i}"
            personnel = random.randint(3, 5)
        else:  # Battalion
            apparatus = f"Battalion {i}"
            personnel = random.randint(1, 2)
        
        # Add attributes
        station_data.append({
            "station": f"Station {i}",
            "station_number": i,
            "station_type": station_type,
            "primary_apparatus": apparatus,
            "personnel": personnel,
            "latitude": lat,
            "longitude": lng,
            "address": f"{random.randint(100, 9999)} Main St, {city}, AZ",
            "phone": f"(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
            "built_year": random.randint(1970, 2022)
        })
    
    # Convert to DataFrame
    df = pd.DataFrame(station_data)
    
    return df

def generate_incident_data(num_incidents=500, start_date="2023-01-01", days=90, city="Phoenix"):
    """Generate sample incident data"""
    
    # Base coordinates for Phoenix, AZ (adjust for other cities)
    if city.lower() == "phoenix":
        base_lat, base_lng = 33.4484, -112.0740
        lat_range, lng_range = 0.25, 0.25
    elif city.lower() == "seattle":
        base_lat, base_lng = 47.6062, -122.3321
        lat_range, lng_range = 0.2, 0.2
    elif city.lower() == "chicago":
        base_lat, base_lng = 41.8781, -87.6298
        lat_range, lng_range = 0.22, 0.22
    else:
        base_lat, base_lng = 33.4484, -112.0740  # Default to Phoenix
        lat_range, lng_range = 0.25, 0.25
    
    # Parse start date
    start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
    
    # Incident types and priorities
    incident_types = [
        "Medical Emergency", "Fire Alarm", "Structure Fire", "Vehicle Fire",
        "Traffic Accident", "Gas Leak", "Water Rescue", "Hazmat", "Public Assist",
        "Cardiac Arrest", "Stroke", "Fall", "Difficulty Breathing", "Unconscious Person"
    ]
    
    priorities = ["High", "Medium", "Low"]
    
    # Create incidents
    incident_data = []
    for i in range(1, num_incidents + 1):
        # Generate random coordinates within range
        # Use normal distribution to cluster incidents in city center
        lat = base_lat + np.random.normal(0, lat_range/2)
        lng = base_lng + np.random.normal(0, lng_range/2)
        
        # Generate random time within date range
        incident_time = start_datetime + timedelta(
            days=random.randint(0, days-1),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        
        # Select random incident type (weighted)
        incident_type = random.choices(
            incident_types,
            weights=[0.3, 0.15, 0.1, 0.05, 0.15, 0.05, 0.03, 0.02, 0.05, 0.03, 0.02, 0.02, 0.02, 0.01],
            k=1
        )[0]
        
        # Determine if it's a fire or EMS call
        call_category = "EMS" if "Fire" not in incident_type and "Gas" not in incident_type and "Hazmat" not in incident_type else "Fire"
        
        # Priority based on incident type
        if incident_type in ["Cardiac Arrest", "Structure Fire", "Unconscious Person", "Difficulty Breathing"]:
            priority = "High"
        elif incident_type in ["Medical Emergency", "Traffic Accident", "Vehicle Fire", "Gas Leak", "Water Rescue"]:
            priority = "Medium"
        else:
            priority = "Low"
        
        # Response time is longer for lower priority calls
        if priority == "High":
            response_minutes = max(1, random.normalvariate(4, 1.5))
        elif priority == "Medium":
            response_minutes = max(2, random.normalvariate(6, 2))
        else:
            response_minutes = max(3, random.normalvariate(8, 2.5))
        
        # Create incident record
        incident_data.append({
            "incident_id": f"INC-{incident_time.strftime('%Y%m%d')}-{i:04d}",
            "type": incident_type,
            "category": call_category,
            "priority": priority,
            "latitude": lat,
            "longitude": lng,
            "date": incident_time.strftime('%Y-%m-%d'),
            "time": incident_time.strftime('%H:%M:%S'),
            "timestamp": incident_time.strftime('%Y-%m-%d %H:%M:%S'),
            "response_time_minutes": round(response_minutes, 1),
            "units_dispatched": random.randint(1, 3),
            "address": f"{random.randint(100, 9999)} {random.choice(['Main', 'Oak', 'Pine', 'Maple', 'Cedar'])} {random.choice(['St', 'Ave', 'Blvd', 'Dr'])}, {city}, AZ",
        })
    
    # Convert to DataFrame
    df = pd.DataFrame(incident_data)
    
    return df

def generate_sample_dataset(city="Phoenix", output_dir="sample_data"):
    """Generate a complete sample dataset with stations and incidents"""
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate station data
    stations_df = generate_station_data(num_stations=15, city=city)
    stations_file = os.path.join(output_dir, f"{city.lower()}_stations.csv")
    stations_df.to_csv(stations_file, index=False)
    print(f"Created {stations_file} with {len(stations_df)} stations")
    
    # Generate incident data
    incidents_df = generate_incident_data(num_incidents=500, city=city, days=90)
    incidents_file = os.path.join(output_dir, f"{city.lower()}_incidents.csv")
    incidents_df.to_csv(incidents_file, index=False)
    print(f"Created {incidents_file} with {len(incidents_df)} incidents")
    
    return stations_file, incidents_file

if __name__ == "__main__":
    # Generate datasets for different cities
    for city in ["Phoenix", "Seattle", "Chicago"]:
        stations_file, incidents_file = generate_sample_dataset(city=city)