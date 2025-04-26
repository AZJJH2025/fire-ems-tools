"""
Mock service implementations for Fire-EMS Tools testing.

This module provides mock implementations of external services used by the
Fire-EMS Tools application. These mocks can be used in tests to avoid making
real external API calls, ensuring tests are reliable and fast.
"""

import json
import os
import random
import datetime
from unittest.mock import MagicMock, patch
from typing import Dict, List, Any, Optional, Tuple

class MockGeocodingService:
    """
    Mock implementation of geocoding service used for address to coordinate conversion.
    
    This class mimics the behavior of the geocoding service without making actual
    API calls, suitable for use in tests.
    """
    
    def __init__(self, fixed_responses: Optional[Dict[str, Dict]] = None):
        """
        Initialize the mock geocoding service.
        
        Args:
            fixed_responses: Optional dictionary mapping addresses to fixed responses
        """
        self.fixed_responses = fixed_responses or {}
        self.call_history = []
        
        # Default locations for common city names
        self.default_cities = {
            "phoenix": (33.4484, -112.0740),
            "scottsdale": (33.4942, -111.9261),
            "tempe": (33.4255, -111.9400),
            "mesa": (33.4152, -111.8315),
            "chandler": (33.3062, -111.8413),
            "glendale": (33.5387, -112.1860),
            "gilbert": (33.3528, -111.7890),
            "peoria": (33.5806, -112.2378),
            "surprise": (33.6292, -112.3680),
            "avondale": (33.4356, -112.3496),
            "goodyear": (33.4490, -112.3508),
            "buckeye": (33.3703, -112.5838),
            "chicago": (41.8781, -87.6298),
            "new york": (40.7128, -74.0060),
            "los angeles": (34.0522, -118.2437),
            "miami": (25.7617, -80.1918),
            "dallas": (32.7767, -96.7970),
            "houston": (29.7604, -95.3698),
            "atlanta": (33.7490, -84.3880),
            "denver": (39.7392, -104.9903),
            "boston": (42.3601, -71.0589),
            "seattle": (47.6062, -122.3321),
            "san francisco": (37.7749, -122.4194),
            "las vegas": (36.1699, -115.1398),
        }
        
    def geocode(self, address: str) -> Dict[str, Any]:
        """
        Mock geocoding an address to coordinates.
        
        Args:
            address: The address to geocode
            
        Returns:
            Dictionary with geocoding result
        """
        self.call_history.append({
            "method": "geocode",
            "address": address,
            "timestamp": datetime.datetime.now().isoformat()
        })
        
        # Check if we have a fixed response for this address
        if address in self.fixed_responses:
            return self.fixed_responses[address]
        
        # Try to parse the address and generate a reasonable response
        normalized_address = address.lower()
        
        # Find any known city in the address
        coords = None
        for city, city_coords in self.default_cities.items():
            if city in normalized_address:
                coords = city_coords
                break
        
        # If no city found, generate random coordinates in the US
        if coords is None:
            # Random coordinates in the continental US
            coords = (
                random.uniform(24.0, 49.0),  # lat
                random.uniform(-125.0, -66.0)  # lng
            )
        
        # Add some randomness to make coordinates unique
        lat = coords[0] + random.uniform(-0.01, 0.01)
        lng = coords[1] + random.uniform(-0.01, 0.01)
        
        return {
            "status": "OK",
            "result": {
                "formatted_address": address,
                "geometry": {
                    "location": {
                        "lat": lat,
                        "lng": lng
                    }
                }
            }
        }
    
    def reverse_geocode(self, lat: float, lng: float) -> Dict[str, Any]:
        """
        Mock reverse geocoding coordinates to an address.
        
        Args:
            lat: Latitude
            lng: Longitude
            
        Returns:
            Dictionary with reverse geocoding result
        """
        self.call_history.append({
            "method": "reverse_geocode",
            "lat": lat,
            "lng": lng,
            "timestamp": datetime.datetime.now().isoformat()
        })
        
        # Find the closest city to these coordinates
        closest_city = None
        closest_distance = float('inf')
        
        for city, coords in self.default_cities.items():
            city_lat, city_lng = coords
            distance = ((lat - city_lat) ** 2 + (lng - city_lng) ** 2) ** 0.5
            
            if distance < closest_distance:
                closest_distance = distance
                closest_city = city
        
        # Generate a fake address based on the closest city
        street_number = random.randint(100, 9999)
        street_names = ["Main St", "Oak Ave", "Maple Dr", "Washington Blvd", 
                     "Lincoln Ave", "Park St", "River Rd", "Mountain View Dr"]
        street_name = random.choice(street_names)
        
        city_name = closest_city.title() if closest_city else "Phoenix"
        state = "AZ"  # Default to Arizona
        zip_code = f"{random.randint(10000, 99999)}"
        
        formatted_address = f"{street_number} {street_name}, {city_name}, {state} {zip_code}"
        
        return {
            "status": "OK",
            "result": {
                "formatted_address": formatted_address,
                "address_components": [
                    {"long_name": str(street_number), "short_name": str(street_number), 
                     "types": ["street_number"]},
                    {"long_name": street_name, "short_name": street_name, 
                     "types": ["route"]},
                    {"long_name": city_name, "short_name": city_name, 
                     "types": ["locality", "political"]},
                    {"long_name": state, "short_name": state, 
                     "types": ["administrative_area_level_1", "political"]},
                    {"long_name": "United States", "short_name": "US", 
                     "types": ["country", "political"]},
                    {"long_name": zip_code, "short_name": zip_code, 
                     "types": ["postal_code"]}
                ],
                "geometry": {
                    "location": {
                        "lat": lat,
                        "lng": lng
                    }
                }
            }
        }

class MockRoutingService:
    """
    Mock implementation of routing service for distance and travel time calculations.
    
    This class mimics the behavior of routing services without making actual
    API calls, suitable for use in tests.
    """
    
    def __init__(self, fixed_responses: Optional[Dict[str, Dict]] = None):
        """
        Initialize the mock routing service.
        
        Args:
            fixed_responses: Optional dictionary mapping route keys to fixed responses
        """
        self.fixed_responses = fixed_responses or {}
        self.call_history = []
        
        # Average speeds in km/h for different road types
        self.speeds = {
            "highway": 100.0,  # 100 km/h on highways
            "major_road": 60.0,  # 60 km/h on major roads
            "urban": 40.0,  # 40 km/h in urban areas
            "residential": 30.0,  # 30 km/h in residential areas
            "rural": 80.0,  # 80 km/h on rural roads
        }
        
        # Traffic adjustment factors for different times of day
        self.traffic_factors = {
            "overnight": 0.8,  # 20% faster than average
            "morning_rush": 1.5,  # 50% slower than average
            "midday": 1.0,  # Average
            "evening_rush": 1.6,  # 60% slower than average
            "evening": 0.9,  # 10% faster than average
        }
        
        # Traffic patterns by hour (24-hour clock)
        self.hourly_patterns = {
            0: "overnight", 1: "overnight", 2: "overnight", 3: "overnight", 
            4: "overnight", 5: "overnight", 
            6: "morning_rush", 7: "morning_rush", 8: "morning_rush", 9: "morning_rush",
            10: "midday", 11: "midday", 12: "midday", 13: "midday", 14: "midday",
            15: "evening_rush", 16: "evening_rush", 17: "evening_rush", 18: "evening_rush",
            19: "evening", 20: "evening", 21: "evening", 
            22: "overnight", 23: "overnight"
        }
        
    def _calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """
        Calculate the distance between two points using the Haversine formula.
        
        Args:
            lat1: Latitude of point 1
            lng1: Longitude of point 1
            lat2: Latitude of point 2
            lng2: Longitude of point 2
            
        Returns:
            Distance in meters
        """
        import math
        
        # Convert to radians
        lat1_rad = math.radians(lat1)
        lng1_rad = math.radians(lng1)
        lat2_rad = math.radians(lat2)
        lng2_rad = math.radians(lng2)
        
        # Haversine formula
        dlat = lat2_rad - lat1_rad
        dlng = lng2_rad - lng1_rad
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        radius = 6371000  # Earth's radius in meters
        distance = radius * c
        
        return distance
    
    def get_route(self, 
                origin_lat: float, 
                origin_lng: float, 
                dest_lat: float, 
                dest_lng: float,
                time_of_day: Optional[str] = None,
                departure_time: Optional[datetime.datetime] = None) -> Dict[str, Any]:
        """
        Mock getting a route between two points.
        
        Args:
            origin_lat: Origin latitude
            origin_lng: Origin longitude
            dest_lat: Destination latitude
            dest_lng: Destination longitude
            time_of_day: Optional string indicating time of day 
                         (overnight, morning_rush, midday, evening_rush, evening)
            departure_time: Optional departure time
            
        Returns:
            Dictionary with route information
        """
        route_key = f"{origin_lat},{origin_lng}|{dest_lat},{dest_lng}"
        
        self.call_history.append({
            "method": "get_route",
            "origin": (origin_lat, origin_lng),
            "destination": (dest_lat, dest_lng),
            "time_of_day": time_of_day,
            "departure_time": departure_time.isoformat() if departure_time else None,
            "timestamp": datetime.datetime.now().isoformat()
        })
        
        # Check if we have a fixed response for this route
        if route_key in self.fixed_responses:
            return self.fixed_responses[route_key]
        
        # Calculate a reasonable route
        
        # Base distance in meters
        distance = self._calculate_distance(origin_lat, origin_lng, dest_lat, dest_lng)
        
        # Adjust for road networks (roads aren't straight lines)
        distance *= random.uniform(1.1, 1.4)  # Add 10-40% for road networks
        
        # Determine road type based on distance
        road_type = "urban"  # Default
        if distance > 10000:  # > 10km
            road_type = "highway"
        elif distance > 5000:  # > 5km
            road_type = "major_road"
        elif distance < 2000:  # < 2km
            road_type = "residential"
        
        # Get base speed for this road type
        speed_kph = self.speeds[road_type]
        
        # Convert to m/s
        speed_mps = speed_kph / 3.6
        
        # Calculate base travel time in seconds
        travel_time = distance / speed_mps
        
        # Apply traffic factor if time_of_day is specified
        if time_of_day and time_of_day in self.traffic_factors:
            traffic_factor = self.traffic_factors[time_of_day]
        elif departure_time:
            hour = departure_time.hour
            time_pattern = self.hourly_patterns.get(hour, "midday")
            traffic_factor = self.traffic_factors[time_pattern]
        else:
            # Default to midday traffic
            traffic_factor = self.traffic_factors["midday"]
        
        # Apply traffic factor to travel time
        travel_time *= traffic_factor
        
        # Add some randomness to make it realistic
        travel_time *= random.uniform(0.9, 1.1)
        
        # Create response
        return {
            "status": "OK",
            "routes": [
                {
                    "legs": [
                        {
                            "distance": {
                                "value": int(distance),
                                "text": f"{distance/1000:.1f} km"
                            },
                            "duration": {
                                "value": int(travel_time),
                                "text": f"{travel_time/60:.1f} mins"
                            },
                            "steps": [
                                {
                                    "distance": {"value": int(distance)},
                                    "duration": {"value": int(travel_time)}
                                }
                            ]
                        }
                    ],
                    "overview_polyline": {
                        "points": "MOCK_POLYLINE"  # Placeholder for a real polyline
                    }
                }
            ]
        }
    
    def get_isochrone(self, 
                     lat: float, 
                     lng: float, 
                     time_minutes: int,
                     travel_mode: str = "driving",
                     time_of_day: Optional[str] = None) -> Dict[str, Any]:
        """
        Mock getting an isochrone (travel time polygon) from a point.
        
        Args:
            lat: Center latitude
            lng: Center longitude
            time_minutes: Travel time in minutes
            travel_mode: Mode of travel (driving, walking, cycling)
            time_of_day: Optional time of day for traffic conditions
            
        Returns:
            Dictionary with isochrone polygon
        """
        isochrone_key = f"{lat},{lng}|{time_minutes}|{travel_mode}|{time_of_day}"
        
        self.call_history.append({
            "method": "get_isochrone",
            "center": (lat, lng),
            "time_minutes": time_minutes,
            "travel_mode": travel_mode,
            "time_of_day": time_of_day,
            "timestamp": datetime.datetime.now().isoformat()
        })
        
        # Check if we have a fixed response for this isochrone
        if isochrone_key in self.fixed_responses:
            return self.fixed_responses[isochrone_key]
        
        # Get base speed for given travel mode
        if travel_mode == "walking":
            speed_kph = 5.0  # 5 km/h walking speed
        elif travel_mode == "cycling":
            speed_kph = 15.0  # 15 km/h cycling speed
        else:  # driving
            # Use the urban speed as default for isochrones
            speed_kph = self.speeds["urban"]
        
        # Apply traffic factor if time_of_day is specified
        if time_of_day and time_of_day in self.traffic_factors:
            traffic_factor = self.traffic_factors[time_of_day]
        else:
            # Default to midday traffic
            traffic_factor = self.traffic_factors["midday"]
        
        # Apply traffic factor to speed
        speed_kph /= traffic_factor
        
        # Calculate approximate radius in km
        radius_km = (speed_kph * time_minutes) / 60.0
        
        # Convert to meters
        radius_m = radius_km * 1000
        
        # Create a simple circular polygon with 16 points
        polygon = []
        num_points = 16
        for i in range(num_points):
            angle = (2 * 3.14159 * i) / num_points
            # Convert polar to cartesian coordinates
            # (Note: this is approximate and doesn't account for Earth's curvature)
            point_lat = lat + (radius_m / 111111) * math.cos(angle)
            point_lng = lng + (radius_m / (111111 * math.cos(math.radians(lat)))) * math.sin(angle)
            polygon.append([point_lat, point_lng])
        
        # Close the polygon
        polygon.append(polygon[0])
        
        return {
            "status": "OK",
            "isochrone": {
                "center": {
                    "lat": lat,
                    "lng": lng
                },
                "time_minutes": time_minutes,
                "travel_mode": travel_mode,
                "polygon": polygon,
                "area_km2": 3.14159 * radius_km * radius_km  # Simple circle area
            }
        }

class MockWeatherService:
    """
    Mock implementation of weather service for current and forecast weather data.
    
    This class mimics the behavior of weather APIs without making actual
    API calls, suitable for use in tests.
    """
    
    def __init__(self, fixed_responses: Optional[Dict[str, Dict]] = None):
        """
        Initialize the mock weather service.
        
        Args:
            fixed_responses: Optional dictionary mapping locations to fixed responses
        """
        self.fixed_responses = fixed_responses or {}
        self.call_history = []
        
        # Default seasonal temperatures for Phoenix, AZ (°C)
        self.seasonal_temps = {
            # month: (min, max)
            1: (8, 20),    # January
            2: (10, 22),   # February
            3: (12, 25),   # March
            4: (15, 30),   # April
            5: (20, 35),   # May
            6: (25, 40),   # June
            7: (28, 42),   # July
            8: (28, 41),   # August
            9: (25, 38),   # September
            10: (18, 32),  # October
            11: (12, 25),  # November
            12: (8, 21),   # December
        }
        
        # Weather conditions by season for Phoenix
        self.seasonal_conditions = {
            # (month, min_temp, max_temp): [(condition, probability), ...]
            # Winter (Dec-Feb)
            (12, 0, 15): [("Clear", 0.5), ("Partly cloudy", 0.3), ("Cloudy", 0.15), ("Rain", 0.05)],
            (12, 15, 30): [("Clear", 0.7), ("Partly cloudy", 0.2), ("Cloudy", 0.1)],
            (1, 0, 15): [("Clear", 0.5), ("Partly cloudy", 0.3), ("Cloudy", 0.15), ("Rain", 0.05)],
            (1, 15, 30): [("Clear", 0.7), ("Partly cloudy", 0.2), ("Cloudy", 0.1)],
            (2, 0, 15): [("Clear", 0.5), ("Partly cloudy", 0.3), ("Cloudy", 0.15), ("Rain", 0.05)],
            (2, 15, 30): [("Clear", 0.7), ("Partly cloudy", 0.2), ("Cloudy", 0.1)],
            
            # Spring (Mar-May)
            (3, 5, 20): [("Clear", 0.6), ("Partly cloudy", 0.25), ("Cloudy", 0.1), ("Rain", 0.05)],
            (3, 20, 35): [("Clear", 0.7), ("Partly cloudy", 0.2), ("Cloudy", 0.1)],
            (4, 10, 25): [("Clear", 0.7), ("Partly cloudy", 0.2), ("Cloudy", 0.05), ("Rain", 0.05)],
            (4, 25, 40): [("Clear", 0.8), ("Partly cloudy", 0.15), ("Cloudy", 0.05)],
            (5, 15, 30): [("Clear", 0.8), ("Partly cloudy", 0.15), ("Cloudy", 0.05)],
            (5, 30, 45): [("Clear", 0.9), ("Partly cloudy", 0.1)],
            
            # Summer (Jun-Aug)
            (6, 20, 35): [("Clear", 0.8), ("Partly cloudy", 0.1), ("Cloudy", 0.05), ("Thunderstorm", 0.05)],
            (6, 35, 50): [("Clear", 0.7), ("Partly cloudy", 0.2), ("Thunderstorm", 0.1)],
            (7, 25, 40): [("Clear", 0.6), ("Partly cloudy", 0.2), ("Cloudy", 0.1), ("Thunderstorm", 0.1)],
            (7, 40, 50): [("Clear", 0.5), ("Partly cloudy", 0.3), ("Thunderstorm", 0.2)],
            (8, 25, 40): [("Clear", 0.6), ("Partly cloudy", 0.2), ("Cloudy", 0.1), ("Thunderstorm", 0.1)],
            (8, 40, 50): [("Clear", 0.5), ("Partly cloudy", 0.3), ("Thunderstorm", 0.2)],
            
            # Fall (Sep-Nov)
            (9, 20, 35): [("Clear", 0.7), ("Partly cloudy", 0.2), ("Cloudy", 0.05), ("Thunderstorm", 0.05)],
            (9, 35, 45): [("Clear", 0.6), ("Partly cloudy", 0.3), ("Thunderstorm", 0.1)],
            (10, 15, 30): [("Clear", 0.8), ("Partly cloudy", 0.15), ("Cloudy", 0.05)],
            (10, 30, 40): [("Clear", 0.7), ("Partly cloudy", 0.2), ("Cloudy", 0.1)],
            (11, 10, 25): [("Clear", 0.7), ("Partly cloudy", 0.2), ("Cloudy", 0.05), ("Rain", 0.05)],
            (11, 25, 35): [("Clear", 0.6), ("Partly cloudy", 0.3), ("Cloudy", 0.1)],
        }
        
    def _random_condition(self, month: int, temp: float) -> str:
        """
        Get a random weather condition based on month and temperature.
        
        Args:
            month: Month (1-12)
            temp: Temperature in Celsius
            
        Returns:
            Weather condition string
        """
        # Find matching season and temperature range
        matched_key = None
        for key in self.seasonal_conditions.keys():
            key_month, min_temp, max_temp = key
            if key_month == month and min_temp <= temp <= max_temp:
                matched_key = key
                break
        
        # If no exact match, use default
        if matched_key is None:
            return "Clear"
        
        # Select random condition based on probabilities
        conditions = self.seasonal_conditions[matched_key]
        r = random.random()
        cumulative_prob = 0
        
        for condition, prob in conditions:
            cumulative_prob += prob
            if r <= cumulative_prob:
                return condition
        
        # Default if something goes wrong
        return "Clear"
    
    def get_current_weather(self, lat: float, lng: float) -> Dict[str, Any]:
        """
        Mock getting current weather for a location.
        
        Args:
            lat: Latitude
            lng: Longitude
            
        Returns:
            Dictionary with current weather data
        """
        location_key = f"{lat},{lng}"
        
        self.call_history.append({
            "method": "get_current_weather",
            "location": (lat, lng),
            "timestamp": datetime.datetime.now().isoformat()
        })
        
        # Check if we have a fixed response for this location
        if location_key in self.fixed_responses:
            return self.fixed_responses[location_key]
        
        # Generate realistic weather data
        now = datetime.datetime.now()
        month = now.month
        
        # Get seasonal temperature range
        min_temp, max_temp = self.seasonal_temps.get(month, (15, 30))
        
        # Generate temperature within seasonal range
        # Add time-of-day variation
        hour = now.hour
        if 6 <= hour < 12:  # Morning
            temp_factor = 0.3 + ((hour - 6) / 6) * 0.5  # 0.3-0.8
        elif 12 <= hour < 18:  # Afternoon
            temp_factor = 0.8 + ((hour - 12) / 6) * 0.2  # 0.8-1.0
        elif 18 <= hour < 24:  # Evening
            temp_factor = 0.7 - ((hour - 18) / 6) * 0.4  # 0.7-0.3
        else:  # Night (0-6)
            temp_factor = 0.3 - ((hour if hour < 6 else 0) / 6) * 0.1  # 0.3-0.2
        
        # Calculate temperature using the factor
        temp_range = max_temp - min_temp
        temp = min_temp + temp_range * temp_factor
        
        # Add some randomness
        temp += random.uniform(-2, 2)
        
        # Get weather condition based on month and temperature
        condition = self._random_condition(month, temp)
        
        # Generate other weather values
        humidity = random.uniform(10, 60)  # Desert climate
        wind_speed = random.uniform(0, 25)  # km/h
        if condition in ["Thunderstorm", "Rain"]:
            humidity = random.uniform(50, 90)
            wind_speed = random.uniform(10, 40)
        
        precipitation = 0
        if condition == "Rain":
            precipitation = random.uniform(0.5, 10)
        elif condition == "Thunderstorm":
            precipitation = random.uniform(5, 30)
        
        return {
            "status": "OK",
            "location": {
                "lat": lat,
                "lng": lng
            },
            "current": {
                "time": now.isoformat(),
                "temperature": round(temp, 1),
                "temperature_unit": "C",
                "condition": condition,
                "humidity": round(humidity, 1),
                "wind_speed": round(wind_speed, 1),
                "wind_direction": random.choice(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]),
                "precipitation": round(precipitation, 1),
                "pressure": round(random.uniform(1000, 1020), 1)
            }
        }
    
    def get_forecast(self, 
                   lat: float, 
                   lng: float, 
                   days: int = 7) -> Dict[str, Any]:
        """
        Mock getting weather forecast for a location.
        
        Args:
            lat: Latitude
            lng: Longitude
            days: Number of days to forecast
            
        Returns:
            Dictionary with forecast data
        """
        forecast_key = f"{lat},{lng}|{days}"
        
        self.call_history.append({
            "method": "get_forecast",
            "location": (lat, lng),
            "days": days,
            "timestamp": datetime.datetime.now().isoformat()
        })
        
        # Check if we have a fixed response for this forecast
        if forecast_key in self.fixed_responses:
            return self.fixed_responses[forecast_key]
        
        # Start with current weather
        current_weather = self.get_current_weather(lat, lng)["current"]
        
        # Generate forecast days
        forecast_days = []
        start_date = datetime.datetime.now()
        
        prev_temp = current_weather["temperature"]
        prev_condition = current_weather["condition"]
        
        for i in range(days):
            forecast_date = start_date + datetime.timedelta(days=i)
            month = forecast_date.month
            
            # Get seasonal temperature range
            min_temp, max_temp = self.seasonal_temps.get(month, (15, 30))
            
            # Generate temperature with some continuity from previous day
            # (limit large swings)
            temp_high = prev_temp + random.uniform(-3, 3)
            # Ensure temp stays within seasonal range
            temp_high = max(min(temp_high, max_temp), min_temp)
            
            # Low is typically 5-15 degrees below high
            temp_difference = random.uniform(5, 15)
            temp_low = temp_high - temp_difference
            
            # Condition has some continuity but can change
            r = random.random()
            if r < 0.7:  # 70% chance of similar condition
                condition = prev_condition
            else:
                # New condition based on temperature
                avg_temp = (temp_high + temp_low) / 2
                condition = self._random_condition(month, avg_temp)
            
            # Generate other weather values
            humidity = random.uniform(10, 60)  # Desert climate
            wind_speed = random.uniform(0, 25)  # km/h
            
            if condition in ["Thunderstorm", "Rain"]:
                humidity = random.uniform(50, 90)
                wind_speed = random.uniform(10, 40)
            
            precipitation = 0
            precipitation_probability = 0
            if condition == "Rain":
                precipitation = random.uniform(0.5, 10)
                precipitation_probability = random.uniform(60, 100)
            elif condition == "Thunderstorm":
                precipitation = random.uniform(5, 30)
                precipitation_probability = random.uniform(70, 100)
            elif condition == "Cloudy":
                precipitation_probability = random.uniform(10, 40)
            elif condition == "Partly cloudy":
                precipitation_probability = random.uniform(0, 20)
            
            forecast_days.append({
                "date": forecast_date.strftime("%Y-%m-%d"),
                "temperature_high": round(temp_high, 1),
                "temperature_low": round(temp_low, 1),
                "temperature_unit": "C",
                "condition": condition,
                "humidity": round(humidity, 1),
                "wind_speed": round(wind_speed, 1),
                "wind_direction": random.choice(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]),
                "precipitation": round(precipitation, 1),
                "precipitation_probability": round(precipitation_probability, 1),
                "pressure": round(random.uniform(1000, 1020), 1)
            })
            
            # Set for next iteration
            prev_temp = temp_high
            prev_condition = condition
        
        return {
            "status": "OK",
            "location": {
                "lat": lat,
                "lng": lng
            },
            "current": current_weather,
            "forecast": forecast_days
        }

def apply_service_mocks():
    """
    Apply all service mocks to the application.
    
    This function should be called before running tests that need
    to mock external service calls.
    
    Returns:
        Dictionary of mock objects that can be used in tests
    """
    mocks = {}
    
    # Create mock services
    geocoding_mock = MockGeocodingService()
    routing_mock = MockRoutingService()
    weather_mock = MockWeatherService()
    
    # Apply patches
    geocoding_patch = patch('services.geocoding_service.GeocodingService', return_value=geocoding_mock)
    routing_patch = patch('services.routing_service.RoutingService', return_value=routing_mock)
    weather_patch = patch('services.weather_service.WeatherService', return_value=weather_mock)
    
    # Start patches
    geocoding_patch.start()
    routing_patch.start()
    weather_patch.start()
    
    # Store mocks for test use
    mocks['geocoding'] = geocoding_mock
    mocks['routing'] = routing_mock
    mocks['weather'] = weather_mock
    
    # Store patches to stop later
    mocks['patches'] = [
        geocoding_patch,
        routing_patch,
        weather_patch
    ]
    
    return mocks

def remove_service_mocks(mocks: Dict):
    """
    Remove all service mocks.
    
    Args:
        mocks: Dictionary of mocks from apply_service_mocks()
    """
    # Stop all patches
    for patch_obj in mocks.get('patches', []):
        patch_obj.stop()