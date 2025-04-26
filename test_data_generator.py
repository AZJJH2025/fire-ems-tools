#!/usr/bin/env python3
"""
Test Data Generator for Fire-EMS Tools

This script generates realistic test data for the Fire-EMS Tools application.
It can create various types of data including incidents, stations, units, and personnel.
"""

import argparse
import csv
import datetime
import json
import math
import os
import random
import sys
from typing import Dict, List, Any, Tuple, Optional

# Department types with realistic configurations
DEPARTMENT_TYPES = {
    'rural': {
        'station_count': (1, 3),
        'units_per_station': (1, 3),
        'personnel_per_unit': (2, 4),
        'annual_incidents': (100, 1000),
        'area_size_km2': (50, 200),
        'population': (1000, 15000),
        'response_times': {
            'turnout': (60, 180),  # seconds
            'travel': (300, 900)   # seconds
        }
    },
    'suburban': {
        'station_count': (3, 8),
        'units_per_station': (2, 4),
        'personnel_per_unit': (3, 5),
        'annual_incidents': (1000, 10000),
        'area_size_km2': (30, 100),
        'population': (15000, 100000),
        'response_times': {
            'turnout': (60, 150),  # seconds
            'travel': (240, 600)   # seconds
        }
    },
    'urban': {
        'station_count': (8, 30),
        'units_per_station': (3, 6),
        'personnel_per_unit': (3, 6),
        'annual_incidents': (10000, 100000),
        'area_size_km2': (20, 80),
        'population': (100000, 1000000),
        'response_times': {
            'turnout': (60, 120),  # seconds
            'travel': (180, 420)   # seconds
        }
    },
    'combined': {
        'station_count': (5, 20),
        'units_per_station': (2, 6),
        'personnel_per_unit': (2, 6),
        'annual_incidents': (5000, 50000),
        'area_size_km2': (100, 500),
        'population': (50000, 500000),
        'response_times': {
            'turnout': (60, 150),  # seconds
            'travel': (240, 720)   # seconds
        }
    }
}

# Incident types and their relative frequencies
INCIDENT_TYPES = {
    'EMS': 0.65,  # 65% of incidents are EMS
    'Fire': 0.15,  # 15% are fires
    'Service Call': 0.10,  # 10% are service calls
    'Hazmat': 0.03,  # 3% are hazmat
    'Rescue': 0.05,  # 5% are rescues
    'Other': 0.02  # 2% are other
}

# EMS incident sub-types and their relative frequencies
EMS_SUBTYPES = {
    'Medical Emergency': 0.40,
    'Cardiac/Respiratory Arrest': 0.10,
    'Traffic Accident with Injuries': 0.15,
    'Fall': 0.20,
    'Psychiatric Emergency': 0.05,
    'Overdose/Poisoning': 0.05,
    'Allergic Reaction': 0.02,
    'Stroke': 0.03
}

# Fire incident sub-types and their relative frequencies
FIRE_SUBTYPES = {
    'Structure Fire': 0.40,
    'Vehicle Fire': 0.20,
    'Brush/Grass Fire': 0.15,
    'Trash/Dumpster Fire': 0.10,
    'Alarm Activation': 0.10,
    'Electrical Fire': 0.05
}

# Service call sub-types
SERVICE_SUBTYPES = {
    'Public Assist': 0.30,
    'Water Problem': 0.20,
    'Smoke/Odor Investigation': 0.25,
    'Animal Rescue': 0.05,
    'Lockout': 0.15,
    'Elevator Rescue': 0.05
}

# Hazmat incident sub-types
HAZMAT_SUBTYPES = {
    'Gas Leak': 0.40,
    'Fuel Spill': 0.30,
    'Chemical Spill': 0.15,
    'Carbon Monoxide': 0.10,
    'Suspicious Package': 0.05
}

# Rescue incident sub-types
RESCUE_SUBTYPES = {
    'Water Rescue': 0.20,
    'Confined Space': 0.10,
    'Trench Collapse': 0.05,
    'High Angle': 0.15,
    'Machinery Entrapment': 0.15,
    'Building Collapse': 0.05,
    'Search': 0.30
}

# Unit types for different department types
UNIT_TYPES = {
    'rural': {
        'Engine': 0.50,
        'Tanker/Tender': 0.25,
        'Brush Truck': 0.15,
        'Ambulance': 0.10
    },
    'suburban': {
        'Engine': 0.40,
        'Ladder/Truck': 0.10,
        'Ambulance': 0.30,
        'Battalion Chief': 0.05,
        'Rescue': 0.10,
        'Brush Truck': 0.05
    },
    'urban': {
        'Engine': 0.35,
        'Ladder/Truck': 0.15,
        'Ambulance': 0.35,
        'Battalion Chief': 0.05,
        'Rescue': 0.05,
        'Hazmat': 0.03,
        'Command': 0.02
    },
    'combined': {
        'Engine': 0.30,
        'Ladder/Truck': 0.10,
        'Ambulance': 0.30,
        'Battalion Chief': 0.05,
        'Rescue': 0.10,
        'Tanker/Tender': 0.05,
        'Brush Truck': 0.05,
        'Hazmat': 0.05
    }
}

# Priority levels
PRIORITY_LEVELS = {
    'Low': 0.20,
    'Medium': 0.50,
    'High': 0.25,
    'Critical': 0.05
}

class TestDataGenerator:
    """Generate realistic test data for Fire-EMS Tools."""
    
    def __init__(self, 
                department_type: str = 'suburban', 
                base_location: Tuple[float, float] = (33.4484, -112.0740),
                time_range: Tuple[datetime.datetime, datetime.datetime] = None,
                random_seed: Optional[int] = None):
        """
        Initialize the test data generator.
        
        Args:
            department_type: Type of department to generate data for
            base_location: Base location (latitude, longitude)
            time_range: Date range for incidents (start, end)
            random_seed: Optional random seed for reproducibility
        """
        # Validate department type
        if department_type not in DEPARTMENT_TYPES:
            raise ValueError(f"Invalid department type: {department_type}. "
                           f"Must be one of {list(DEPARTMENT_TYPES.keys())}")
        self.department_type = department_type
        
        # Set random seed if provided
        if random_seed is not None:
            random.seed(random_seed)
        
        # Set base location
        self.base_latitude, self.base_longitude = base_location
        
        # Set time range
        if time_range is None:
            # Default to past year
            end_date = datetime.datetime.now()
            start_date = end_date - datetime.timedelta(days=365)
            self.time_range = (start_date, end_date)
        else:
            self.time_range = time_range
        
        # Get configuration for this department type
        self.config = DEPARTMENT_TYPES[department_type]
        
        # Generate basic department data
        self._generate_department()
    
    def _generate_department(self):
        """Generate basic department data."""
        # Number of stations
        min_stations, max_stations = self.config['station_count']
        self.num_stations = random.randint(min_stations, max_stations)
        
        # Department area size
        min_area, max_area = self.config['area_size_km2']
        self.area_size_km2 = random.uniform(min_area, max_area)
        
        # Department population
        min_pop, max_pop = self.config['population']
        self.population = random.randint(min_pop, max_pop)
        
        # Calculate radius of coverage area (approximated as a circle)
        self.radius_km = math.sqrt(self.area_size_km2 / math.pi)
        
        # Number of incidents
        min_incidents, max_incidents = self.config['annual_incidents']
        self.num_incidents = random.randint(min_incidents, max_incidents)
    
    def generate_stations(self) -> List[Dict[str, Any]]:
        """
        Generate a list of fire/EMS stations.
        
        Returns:
            List of station dictionaries
        """
        stations = []
        
        # Distribution factors - stations are more concentrated in urban areas
        if self.department_type == 'urban':
            distribution_factor = 0.7  # More concentrated
        elif self.department_type == 'rural':
            distribution_factor = 1.3  # More spread out
        else:
            distribution_factor = 1.0  # Standard
        
        # Generate each station
        for i in range(self.num_stations):
            # Calculate station location
            # Use a combination of random and structured placement
            if i == 0:
                # First station is at the center
                latitude = self.base_latitude
                longitude = self.base_longitude
            else:
                # Other stations are distributed around the area
                # This uses a modified polar coordinate approach
                # for more realistic station distribution
                
                # For angle, use a triangular distribution for directional bias
                angle = random.triangular(0, 2 * math.pi, random.uniform(0, 2 * math.pi))
                
                # For distance, use a beta distribution for clustering effect
                # Beta distribution (1, 2) gives more stations closer to center
                # Beta distribution (2, 1) gives more stations toward the periphery
                # Beta distribution (2, 2) gives more stations in the middle ring
                if self.department_type == 'urban':
                    alpha, beta = 1, 2  # More central
                elif self.department_type == 'rural':
                    alpha, beta = 2, 1  # More peripheral
                else:
                    alpha, beta = 2, 2  # More in the middle
                
                distance_factor = random.betavariate(alpha, beta)
                distance = distance_factor * self.radius_km * distribution_factor
                
                # Convert to lat/lng (approximate, not accounting for Earth's curvature)
                # 111,111 meters/degree for latitude (roughly)
                # 111,111 * cos(latitude) meters/degree for longitude
                latitude = self.base_latitude + (distance / 111.111) * math.cos(angle)
                longitude = self.base_longitude + (distance / (111.111 * math.cos(math.radians(self.base_latitude)))) * math.sin(angle)
            
            # Create station object
            station = {
                'station_id': f"STA-{i+1:03d}",
                'name': f"Station {i+1}",
                'latitude': latitude,
                'longitude': longitude,
                'address': f"{random.randint(100, 9999)} Main St, City, ST {random.randint(10000, 99999)}",
                'units': self.generate_units_for_station(i+1)
            }
            
            stations.append(station)
        
        return stations
    
    def generate_units_for_station(self, station_num: int) -> List[Dict[str, Any]]:
        """
        Generate units for a station.
        
        Args:
            station_num: Station number
            
        Returns:
            List of unit dictionaries
        """
        min_units, max_units = self.config['units_per_station']
        num_units = random.randint(min_units, max_units)
        
        units = []
        
        # Special case for first station - typically has more diverse units
        is_main_station = (station_num == 1)
        
        # Set of unit types already added to this station
        added_types = set()
        
        # Unit weights for this department type
        unit_weights = UNIT_TYPES[self.department_type]
        
        for i in range(num_units):
            # For first unit in main station, ensure it's an engine
            if is_main_station and i == 0:
                unit_type = "Engine"
            # For second unit in main station (if exists), prefer a ladder or ambulance
            elif is_main_station and i == 1 and num_units > 1:
                if "Ambulance" not in added_types and "Ladder/Truck" not in added_types:
                    unit_type = random.choices(
                        ["Ambulance", "Ladder/Truck"], 
                        weights=[0.7, 0.3], 
                        k=1
                    )[0]
                else:
                    # Randomly select a unit type based on department configuration
                    unit_type = self._weighted_choice(unit_weights)
            else:
                # Randomly select a unit type based on department configuration
                unit_type = self._weighted_choice(unit_weights)
            
            added_types.add(unit_type)
            
            # Unit ID format varies by type
            unit_prefix = {
                'Engine': 'E',
                'Ladder/Truck': 'L',
                'Ambulance': 'A',
                'Battalion Chief': 'BC',
                'Rescue': 'R',
                'Tanker/Tender': 'T',
                'Brush Truck': 'BR',
                'Hazmat': 'HM',
                'Command': 'C'
            }.get(unit_type, 'U')
            
            # Generate personnel for this unit
            min_personnel, max_personnel = self.config['personnel_per_unit']
            
            # Adjust personnel count based on unit type
            if unit_type == 'Battalion Chief':
                personnel_count = 1
            elif unit_type == 'Ambulance':
                personnel_count = random.randint(2, 3)
            elif unit_type == 'Command':
                personnel_count = random.randint(1, 2)
            else:
                personnel_count = random.randint(min_personnel, max_personnel)
            
            unit = {
                'unit_id': f"{unit_prefix}{station_num}",
                'type': unit_type,
                'station_id': f"STA-{station_num:03d}",
                'personnel_count': personnel_count,
                'status': 'Active'
            }
            
            units.append(unit)
        
        return units
    
    def generate_incidents(self, count: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Generate a list of incidents.
        
        Args:
            count: Number of incidents to generate (defaults to self.num_incidents)
            
        Returns:
            List of incident dictionaries
        """
        if count is None:
            count = self.num_incidents
        
        incidents = []
        
        # Get date range
        start_date, end_date = self.time_range
        date_range_seconds = (end_date - start_date).total_seconds()
        
        # Generate stations first if not already generated
        if not hasattr(self, 'stations'):
            self.stations = self.generate_stations()
        
        # Pre-generate a map of unit IDs to station locations
        unit_to_station = {}
        for station in self.stations:
            for unit in station['units']:
                unit_to_station[unit['unit_id']] = {
                    'station_id': station['station_id'],
                    'latitude': station['latitude'],
                    'longitude': station['longitude']
                }
        
        # Generate each incident
        for i in range(count):
            # Incident ID
            incident_id = f"INC-{datetime.datetime.now().year}-{i+1:06d}"
            
            # Incident date/time
            # Not completely random - use realistic time distributions
            
            # Random time within range
            random_seconds = random.uniform(0, date_range_seconds)
            incident_datetime = start_date + datetime.timedelta(seconds=random_seconds)
            
            # Adjust for time of day distribution
            # Incidents are more common during daytime and early evening
            hour_weights = [
                0.02, 0.015, 0.01, 0.01, 0.01, 0.02,  # 0-5 hour
                0.03, 0.05, 0.06, 0.07, 0.07, 0.08,   # 6-11 hour
                0.08, 0.07, 0.07, 0.07, 0.08, 0.09,   # 12-17 hour
                0.08, 0.07, 0.06, 0.05, 0.04, 0.03    # 18-23 hour
            ]
            
            # Apply hour adjustment
            current_hour = incident_datetime.hour
            target_hour = self._weighted_choice_from_list(range(24), hour_weights)
            
            # Adjust datetime to target hour
            incident_datetime = incident_datetime.replace(
                hour=target_hour,
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )
            
            # Incident type
            incident_type = self._weighted_choice(INCIDENT_TYPES)
            
            # Incident subtype based on type
            if incident_type == 'EMS':
                subtype = self._weighted_choice(EMS_SUBTYPES)
            elif incident_type == 'Fire':
                subtype = self._weighted_choice(FIRE_SUBTYPES)
            elif incident_type == 'Service Call':
                subtype = self._weighted_choice(SERVICE_SUBTYPES)
            elif incident_type == 'Hazmat':
                subtype = self._weighted_choice(HAZMAT_SUBTYPES)
            elif incident_type == 'Rescue':
                subtype = self._weighted_choice(RESCUE_SUBTYPES)
            else:
                subtype = 'General'
            
            # Incident priority
            priority = self._weighted_choice(PRIORITY_LEVELS)
            
            # Incident location
            # More complex - needs to account for population density
            # For simplicity, use a modified version of station placement
            # with some randomness to simulate population clustering
            
            # Select a random station as a reference point
            reference_station = random.choice(self.stations)
            
            # Distance from station depends on department type
            # Rural incidents are more spread out
            if self.department_type == 'rural':
                max_distance_km = 20.0
                dist_alpha, dist_beta = 1.5, 2.0  # More spread toward periphery
            elif self.department_type == 'urban':
                max_distance_km = 5.0
                dist_alpha, dist_beta = 2.0, 3.0  # More clustered
            else:  # suburban or combined
                max_distance_km = 10.0
                dist_alpha, dist_beta = 2.0, 2.0  # Moderate spread
            
            # Generate a random distance and angle from the reference station
            distance_km = random.betavariate(dist_alpha, dist_beta) * max_distance_km
            angle = random.uniform(0, 2 * math.pi)
            
            # Convert to lat/lng offset
            lat_offset = (distance_km / 111.111) * math.cos(angle)
            lng_offset = (distance_km / (111.111 * math.cos(math.radians(reference_station['latitude'])))) * math.sin(angle)
            
            # Calculate incident location
            incident_lat = reference_station['latitude'] + lat_offset
            incident_lng = reference_station['longitude'] + lng_offset
            
            # Dispatch, en route, and arrival times
            dispatch_time = incident_datetime
            
            # Calculate turnout time (time from dispatch to en route)
            min_turnout, max_turnout = self.config['response_times']['turnout']
            
            # Adjust for time of day - turnout times are longer at night
            hour = dispatch_time.hour
            if 22 <= hour or hour < 6:  # Night
                turnout_factor = 1.3
            elif 6 <= hour < 8:  # Early morning
                turnout_factor = 1.1
            else:  # Day
                turnout_factor = 1.0
            
            turnout_seconds = random.uniform(
                min_turnout, 
                max_turnout * turnout_factor
            )
            
            en_route_time = dispatch_time + datetime.timedelta(seconds=turnout_seconds)
            
            # Calculate travel time (time from en route to arrival)
            min_travel, max_travel = self.config['response_times']['travel']
            
            # Adjust for time of day and incident distance
            if 7 <= hour < 9 or 16 <= hour < 18:  # Rush hour
                travel_factor = 1.2
            else:
                travel_factor = 1.0
            
            # Distance factor based on how far the incident is from the station
            # Assuming response units come from nearest station to the incident
            
            # Find closest station
            closest_station = min(
                self.stations,
                key=lambda s: self._haversine_distance(
                    s['latitude'], s['longitude'],
                    incident_lat, incident_lng
                )
            )
            
            # Calculate distance in km
            distance_km = self._haversine_distance(
                closest_station['latitude'], closest_station['longitude'],
                incident_lat, incident_lng
            )
            
            # Adjust travel time based on distance
            # Simple linear model: time = base + (seconds_per_km * distance)
            # Rural areas have longer per-km times due to road conditions
            if self.department_type == 'rural':
                seconds_per_km = random.uniform(70, 90)  # 70-90 seconds per km
            elif self.department_type == 'urban':
                seconds_per_km = random.uniform(45, 70)  # 45-70 seconds per km
            else:  # suburban or combined
                seconds_per_km = random.uniform(55, 75)  # 55-75 seconds per km
            
            # Calculate travel time
            base_travel_seconds = random.uniform(min_travel * 0.7, min_travel)
            distance_travel_seconds = seconds_per_km * distance_km
            total_travel_seconds = (base_travel_seconds + distance_travel_seconds) * travel_factor
            
            # Ensure travel time is within reasonable bounds
            total_travel_seconds = min(total_travel_seconds, max_travel * 1.5)
            
            arrival_time = en_route_time + datetime.timedelta(seconds=total_travel_seconds)
            
            # Determine responding units
            # Number of units depends on incident type and priority
            if incident_type == 'Fire' and subtype == 'Structure Fire':
                num_units = random.randint(3, 6)
            elif incident_type == 'Fire':
                num_units = random.randint(2, 4)
            elif incident_type == 'EMS' and priority in ['High', 'Critical']:
                num_units = random.randint(2, 3)
            elif incident_type == 'EMS':
                num_units = 1
            elif incident_type == 'Hazmat':
                num_units = random.randint(2, 4)
            elif incident_type == 'Rescue':
                num_units = random.randint(2, 5)
            else:
                num_units = random.randint(1, 2)
            
            # Limit number of units based on department type
            if self.department_type == 'rural':
                num_units = min(num_units, 3)
            
            # Get all unit IDs
            all_unit_ids = list(unit_to_station.keys())
            
            # Start with the closest station's units
            closest_station_units = [
                u['unit_id'] for u in closest_station['units']
            ]
            
            # Select appropriate unit types based on incident
            if incident_type == 'EMS':
                # Prefer an ambulance if available
                preferred_units = [u for u in closest_station_units if u.startswith('A')]
                if not preferred_units:
                    # Otherwise use an engine
                    preferred_units = [u for u in closest_station_units if u.startswith('E')]
            elif incident_type == 'Fire' and subtype == 'Structure Fire':
                # Need engines and ladder if available
                engines = [u for u in all_unit_ids if u.startswith('E')]
                ladders = [u for u in all_unit_ids if u.startswith('L')]
                chief = [u for u in all_unit_ids if u.startswith('BC')]
                preferred_units = engines + ladders + chief
            elif incident_type == 'Hazmat':
                # Need hazmat unit if available
                hazmat = [u for u in all_unit_ids if u.startswith('HM')]
                engines = [u for u in all_unit_ids if u.startswith('E')]
                preferred_units = hazmat + engines
            else:
                # General preference for engines
                preferred_units = [u for u in all_unit_ids if u.startswith('E')]
            
            # Fill with other units if needed
            if len(preferred_units) < num_units:
                other_units = [u for u in all_unit_ids if u not in preferred_units]
                preferred_units.extend(other_units)
            
            # Select final responding units
            if len(preferred_units) > num_units:
                responding_units = preferred_units[:num_units]
            else:
                responding_units = preferred_units
            
            # Create incident object
            incident = {
                'incident_id': incident_id,
                'date': incident_datetime.strftime('%Y-%m-%d'),
                'time': incident_datetime.strftime('%H:%M:%S'),
                'dispatch_time': dispatch_time.strftime('%Y-%m-%d %H:%M:%S'),
                'en_route_time': en_route_time.strftime('%Y-%m-%d %H:%M:%S'),
                'arrival_time': arrival_time.strftime('%Y-%m-%d %H:%M:%S'),
                'type': incident_type,
                'subtype': subtype,
                'priority': priority,
                'latitude': incident_lat,
                'longitude': incident_lng,
                'responding_units': responding_units,
                'closest_station_id': closest_station['station_id']
            }
            
            incidents.append(incident)
        
        return incidents
    
    def export_csv(self, 
                  data: List[Dict[str, Any]], 
                  file_path: str,
                  data_type: str = 'incidents') -> None:
        """
        Export data to a CSV file.
        
        Args:
            data: List of data dictionaries
            file_path: Path to save the CSV file
            data_type: Type of data ('incidents', 'stations', 'units')
        """
        if not data:
            print(f"No {data_type} data to export")
            return
        
        # Determine fields based on data type
        if data_type == 'incidents':
            fieldnames = [
                'incident_id', 'date', 'time', 'dispatch_time', 'en_route_time', 
                'arrival_time', 'type', 'subtype', 'priority', 'latitude', 
                'longitude', 'responding_units', 'closest_station_id'
            ]
        elif data_type == 'stations':
            fieldnames = [
                'station_id', 'name', 'latitude', 'longitude', 'address'
            ]
        elif data_type == 'units':
            fieldnames = [
                'unit_id', 'type', 'station_id', 'personnel_count', 'status'
            ]
        else:
            raise ValueError(f"Invalid data type: {data_type}")
        
        # Flatten nested data if needed
        processed_data = []
        for item in data:
            if data_type == 'stations':
                # Exclude units from stations for CSV
                item_copy = item.copy()
                if 'units' in item_copy:
                    del item_copy['units']
                processed_data.append(item_copy)
            elif data_type == 'incidents':
                # Convert responding_units list to comma-separated string
                item_copy = item.copy()
                if isinstance(item_copy.get('responding_units'), list):
                    item_copy['responding_units'] = ','.join(item_copy['responding_units'])
                processed_data.append(item_copy)
            else:
                processed_data.append(item)
        
        # Write CSV file
        with open(file_path, 'w', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for item in processed_data:
                # Only include fields in fieldnames
                filtered_item = {k: item.get(k, '') for k in fieldnames}
                writer.writerow(filtered_item)
        
        print(f"Exported {len(processed_data)} {data_type} to {file_path}")
    
    def export_json(self, 
                   data: Any, 
                   file_path: str) -> None:
        """
        Export data to a JSON file.
        
        Args:
            data: Data to export
            file_path: Path to save the JSON file
        """
        with open(file_path, 'w') as jsonfile:
            json.dump(data, jsonfile, indent=2)
        
        print(f"Exported data to {file_path}")
    
    def generate_all(self, 
                    base_path: str = 'data/test',
                    incident_count: Optional[int] = None) -> Dict[str, Any]:
        """
        Generate and export all test data.
        
        Args:
            base_path: Base directory for output files
            incident_count: Number of incidents to generate
            
        Returns:
            Dictionary with generated data
        """
        # Create output directory if it doesn't exist
        os.makedirs(base_path, exist_ok=True)
        
        # Generate stations
        stations = self.generate_stations()
        
        # Extract units from stations
        units = []
        for station in stations:
            if 'units' in station:
                units.extend(station['units'])
        
        # Generate incidents
        incidents = self.generate_incidents(count=incident_count)
        
        # Export data
        self.export_csv(incidents, os.path.join(base_path, 'incidents.csv'), 'incidents')
        self.export_csv(stations, os.path.join(base_path, 'stations.csv'), 'stations')
        self.export_csv(units, os.path.join(base_path, 'units.csv'), 'units')
        
        # Export as JSON as well
        all_data = {
            'department_type': self.department_type,
            'department_info': {
                'area_size_km2': self.area_size_km2,
                'population': self.population,
                'num_stations': self.num_stations
            },
            'stations': stations,
            'units': units,
            'incidents': incidents
        }
        
        self.export_json(all_data, os.path.join(base_path, 'test_data.json'))
        
        return all_data
    
    def _weighted_choice(self, weights_dict: Dict[str, float]) -> str:
        """
        Make a weighted random choice from a dictionary of options.
        
        Args:
            weights_dict: Dictionary mapping choices to their weights
            
        Returns:
            Selected choice
        """
        choices = list(weights_dict.keys())
        weights = list(weights_dict.values())
        return random.choices(choices, weights=weights, k=1)[0]
    
    def _weighted_choice_from_list(self, choices: List[Any], weights: List[float]) -> Any:
        """
        Make a weighted random choice from a list of options.
        
        Args:
            choices: List of choices
            weights: List of weights
            
        Returns:
            Selected choice
        """
        return random.choices(choices, weights=weights, k=1)[0]
    
    def _haversine_distance(self, 
                          lat1: float, 
                          lon1: float, 
                          lat2: float, 
                          lon2: float) -> float:
        """
        Calculate the Haversine distance between two lat/lon points.
        
        Args:
            lat1: Latitude of point 1
            lon1: Longitude of point 1
            lat2: Latitude of point 2
            lon2: Longitude of point 2
            
        Returns:
            Distance in kilometers
        """
        # Convert decimal degrees to radians
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        # Haversine formula
        dlon = lon2_rad - lon1_rad
        dlat = lat2_rad - lat1_rad
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        r = 6371  # Radius of earth in kilometers
        
        return c * r

def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description='Generate test data for Fire-EMS Tools')
    parser.add_argument('--type', choices=list(DEPARTMENT_TYPES.keys()), 
                      default='suburban', help='Type of department')
    parser.add_argument('--incidents', type=int, help='Number of incidents to generate')
    parser.add_argument('--output', default='data/test', help='Output directory')
    parser.add_argument('--seed', type=int, help='Random seed for reproducibility')
    parser.add_argument('--format', choices=['csv', 'json', 'both'], 
                      default='both', help='Output format')
    args = parser.parse_args()
    
    # Create generator
    generator = TestDataGenerator(
        department_type=args.type,
        random_seed=args.seed
    )
    
    # Generate and export data
    generator.generate_all(
        base_path=args.output,
        incident_count=args.incidents
    )

if __name__ == '__main__':
    main()