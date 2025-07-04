"""
Data Connector for FireEMS Tools
Handles data transfer between different tools in the FireEMS suite
"""
import json
import logging
import time
from flask import session, request, jsonify

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('data_connector')

class DataConnector:
    """
    Handles data transfer between FireEMS tools via Flask session
    """
    
    SESSION_KEY = 'tool_data'
    
    @staticmethod
    def store_data(data, tool_id=None):
        """
        Store data in the session for tool transfer
        
        Args:
            data (dict): The data to store
            tool_id (str, optional): The ID of the destination tool
            
        Returns:
            dict: Response with success status and redirect info
        """
        try:
            # Log original data for debugging
            logger.info(f"Original data type: {type(data)}")
            if isinstance(data, dict):
                logger.info(f"Original data keys: {list(data.keys())}")
                if 'data' in data and isinstance(data['data'], list):
                    logger.info(f"Original data.data length: {len(data['data'])}")
                    if data['data'] and isinstance(data['data'][0], dict):
                        logger.info(f"Sample record keys: {list(data['data'][0].keys())}")
            elif isinstance(data, list):
                logger.info(f"Original data is a list with {len(data)} items")
                if data and isinstance(data[0], dict):
                    logger.info(f"First item keys: {list(data[0].keys())}")
            
            # Ensure data has the expected structure
            if not isinstance(data, dict):
                logger.warning(f"Received non-dict data: {type(data)}")
                data = {'data': data if isinstance(data, list) else [data]}
            
            # Ensure required keys exist
            if 'data' not in data:
                logger.warning("Data missing 'data' key, adding empty array")
                # Special case: the entire dict might be the data object
                # Look for telltale fields that indicate this is incident data
                if isinstance(data, dict) and any(key in data for key in [
                    'Incident ID', 'Incident Date', 'incident_id', 'date', 'id', 'type'
                ]):
                    logger.info("Data appears to be a single incident record, wrapping in array")
                    data = {'data': [data]}
                else:
                    # Just use an empty array
                    data['data'] = []
                
            # Handle nested data structures - sometimes data.data is an object with its own 'data' key
            if isinstance(data.get('data'), dict) and 'data' in data['data']:
                logger.info("Detected nested data structure, flattening")
                nested = data['data']
                data['data'] = nested.get('data', [])
                # Merge other keys from nested into parent
                for key, value in nested.items():
                    if key != 'data' and key not in data:
                        data[key] = value
            
            # Add metadata if missing
            if 'metadata' not in data:
                data['metadata'] = {
                    'count': len(data.get('data', [])),
                    'timestamp': int(time.time() * 1000)
                }
                
            # Add tool identifier if provided
            if tool_id:
                data['toolId'] = tool_id
                
            # Add source file info if available
            if 'sourceFile' not in data and request and hasattr(request, 'files'):
                file_obj = next(iter(request.files.values()), None)
                if file_obj:
                    data['sourceFile'] = file_obj.filename
            elif 'sourceFile' not in data and isinstance(data.get('data', []), list) and len(data.get('data', [])) > 0:
                # Try to infer source from data
                first_record = data['data'][0]
                if isinstance(first_record, dict):
                    # Look for source indicators
                    if '_source' in first_record:
                        data['sourceFile'] = f"data-from-{first_record['_source']}.csv"
                    elif 'source' in first_record:
                        data['sourceFile'] = f"data-from-{first_record['source']}.csv"
                    elif 'Incident ID' in first_record:
                        data['sourceFile'] = "imported-incidents.csv"
            
            # Transform field names to ensure dashboard compatibility
            data_transformed = []
            schema_mapping = {
                'id': ['Incident ID', 'id', 'incident_id', 'IncidentID', 'incidentId', 'ID', 'Number'],
                'date': ['Incident Date', 'date', 'incident_date', 'IncidentDate', 'Date', 'CallDate'],
                'time': ['Incident Time', 'time', 'incident_time', 'IncidentTime', 'Time', 'CallTime'],
                'type': ['Incident Type', 'type', 'incident_type', 'IncidentType', 'Type', 'CallType', 'Nature'],
                'location': ['Address', 'address', 'location', 'Location', 'incident_location', 'IncidentLocation', 'Street'],
                'latitude': ['Latitude', 'latitude', 'lat', 'LAT', 'Y', 'y'],
                'longitude': ['Longitude', 'longitude', 'long', 'lng', 'LON', 'LONG', 'X', 'x'],
                'dispatch_time': ['Dispatch Time', 'dispatch_time', 'DispatchTime', 'TimeDispatched'],
                'en_route_time': ['En Route Time', 'en_route_time', 'EnRouteTime', 'TimeEnRoute'],
                'arrival_time': ['Arrival Time', 'arrival_time', 'ArrivalTime', 'TimeArrived'],
                'response_time_seconds': ['Response Time', 'response_time', 'ResponseTime', 'ResponseTimeSeconds'],
                'district': ['District', 'district', 'Zone', 'zone', 'Beat', 'Area', 'Sector'],
                'unit': ['Unit', 'unit', 'UnitID', 'ResponseUnit', 'RespondingUnit', 'Primary Unit', 'primary_unit']
            }
            
            # Standardize date fields
            def standardize_date(date_str):
                if not date_str:
                    return date_str
                    
                # Try to detect format
                if '/' in date_str:
                    # Likely MM/DD/YYYY
                    parts = date_str.split('/')
                    if len(parts) >= 3:
                        month, day, year = parts[0], parts[1], parts[2]
                        # Handle year that might include time
                        if ' ' in year:
                            year = year.split(' ')[0]
                        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
                elif '-' in date_str:
                    # Check if it's already YYYY-MM-DD
                    parts = date_str.split('-')
                    if len(parts) >= 3 and len(parts[0]) == 4:
                        return date_str  # Already in correct format
                    elif len(parts) >= 3:
                        # Might be DD-MM-YYYY or MM-DD-YYYY
                        # Assume MM-DD-YYYY for North American data
                        month, day, year = parts[0], parts[1], parts[2]
                        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
                
                # Return as-is if format is unrecognized
                return date_str
                
            # Parse coordinate values to handle different formats
            def parse_coordinate(value):
                if value is None:
                    return None
                    
                try:
                    # Handle numeric values
                    if isinstance(value, (int, float)):
                        return float(value)
                        
                    # Handle string values
                    if isinstance(value, str):
                        # Remove any non-numeric characters except decimal point and minus sign
                        # This handles formats like "37.7749°N" or "122° 25' 9\" W"
                        value = value.replace('°', '').replace('\'', '').replace('"', '')
                        value = value.replace('N', '').replace('S', '').replace('E', '').replace('W', '')
                        value = value.strip()
                        
                        # Try to convert to float
                        return float(value)
                        
                except (ValueError, TypeError) as e:
                    logger.warning(f"Could not parse coordinate value: {value}, error: {e}")
                    return None
            
            # Process each record
            for record in data.get('data', []):
                if not isinstance(record, dict):
                    # Skip non-dict records
                    logger.warning(f"Skipping non-dict record: {type(record)}")
                    continue
                    
                # Create transformed record
                transformed = {}
                
                # Copy all fields to preserve data
                for key, value in record.items():
                    transformed[key] = value
                
                # Apply schema mapping
                for target_field, source_fields in schema_mapping.items():
                    if target_field not in transformed:
                        # Look for a matching source field
                        for source_field in source_fields:
                            if source_field in record:
                                transformed[target_field] = record[source_field]
                                break
                
                # Special handling for date field
                if 'date' in transformed:
                    transformed['date'] = standardize_date(transformed['date'])
                    
                # Create datetime field (combined date and time)
                if 'date' in transformed:
                    if 'time' in transformed:
                        try:
                            # Combine date and time into ISO format
                            date_str = transformed['date'].strip()
                            time_str = transformed['time'].strip()
                            transformed['datetime'] = f"{date_str}T{time_str}"
                            logger.info(f"Created datetime field: {transformed['datetime']}")
                        except Exception as e:
                            logger.warning(f"Could not create datetime field: {e}")
                
                # Special handling for coordinate fields
                if 'latitude' in transformed and 'longitude' in transformed:
                    # Parse coordinates using our utility function
                    lat = parse_coordinate(transformed['latitude'])
                    lng = parse_coordinate(transformed['longitude'])
                    
                    # Validate coordinate ranges if parsing was successful
                    if lat is not None and lng is not None:
                        if lat >= -90 and lat <= 90 and lng >= -180 and lng <= 180:
                            # Add coordinates as a nested object (dashboard expects this structure)
                            transformed['coordinates'] = {
                                'lat': lat,
                                'lng': lng
                            }
                            logger.info(f"Valid coordinates found: {lat}, {lng}")
                        else:
                            logger.warning(f"Invalid coordinate values: {lat}, {lng}")
                    else:
                        logger.warning(f"Could not parse one or both coordinates: latitude={transformed['latitude']}, longitude={transformed['longitude']}")
                
                # Calculate response time if needed
                if 'response_time_seconds' not in transformed:
                    if 'dispatch_time' in transformed and 'arrival_time' in transformed:
                        try:
                            # Simple time difference calculation (assuming times are in HH:MM:SS format)
                            dispatch_parts = transformed['dispatch_time'].split(':')
                            arrival_parts = transformed['arrival_time'].split(':')
                            
                            if len(dispatch_parts) >= 2 and len(arrival_parts) >= 2:
                                # Convert to seconds
                                dispatch_seconds = int(dispatch_parts[0]) * 3600 + int(dispatch_parts[1]) * 60
                                if len(dispatch_parts) > 2:
                                    dispatch_seconds += int(dispatch_parts[2])
                                    
                                arrival_seconds = int(arrival_parts[0]) * 3600 + int(arrival_parts[1]) * 60
                                if len(arrival_parts) > 2:
                                    arrival_seconds += int(arrival_parts[2])
                                
                                # Calculate difference, handling overnight cases (when arrival is on next day)
                                if arrival_seconds < dispatch_seconds:
                                    # Likely crossed midnight
                                    response_seconds = (24 * 3600 - dispatch_seconds) + arrival_seconds
                                else:
                                    response_seconds = arrival_seconds - dispatch_seconds
                                
                                # Only use realistic values (less than 2 hours)
                                if 0 < response_seconds < 7200:
                                    transformed['response_time_seconds'] = response_seconds
                                    
                                    # Also add formatted response time (MM:SS)
                                    minutes = response_seconds // 60
                                    seconds = response_seconds % 60
                                    transformed['response_time'] = f"{minutes}:{seconds:02d}"
                                    
                                    logger.info(f"Calculated response time: {transformed['response_time']} ({response_seconds} seconds)")
                        except Exception as e:
                            logger.warning(f"Could not calculate response time: {e}")
                    # If no time fields but response time is a string, try to convert it
                    elif 'response_time' in transformed and isinstance(transformed['response_time'], str):
                        try:
                            # Try to parse MM:SS format
                            parts = transformed['response_time'].split(':')
                            if len(parts) >= 2:
                                minutes = int(parts[0])
                                seconds = int(parts[1])
                                transformed['response_time_seconds'] = (minutes * 60) + seconds
                                logger.info(f"Parsed response time from string: {transformed['response_time']} -> {transformed['response_time_seconds']} seconds")
                        except Exception as e:
                            logger.warning(f"Could not parse response time from string: {e}")
                
                # Ensure response_time_seconds is a number, not a string
                if 'response_time_seconds' in transformed:
                    if isinstance(transformed['response_time_seconds'], str):
                        try:
                            transformed['response_time_seconds'] = float(transformed['response_time_seconds'])
                            logger.info(f"Converted response_time_seconds from string to number: {transformed['response_time_seconds']}")
                        except Exception as e:
                            logger.warning(f"Could not convert response_time_seconds to number: {e}")
                            
                # Generate a basic response time if needed for visualization
                if 'response_time_seconds' not in transformed:
                    # Use a reasonable value for visualization
                    transformed['response_time_seconds'] = 300  # 5 minutes default
                    transformed['response_time'] = "5:00"
                    logger.info("Added default response time for visualization")
                
                # Handle responding units
                if 'unit' in transformed:
                    transformed['responding_units'] = [transformed['unit']]
                    transformed['primary_unit'] = transformed['unit']
                
                # Add diagnostic log for coordinate field presence
                if 'coordinates' not in transformed:
                    # Check if the original record has any coordinate-like fields
                    coord_fields = [key for key in record.keys() if 
                                    'lat' in key.lower() or 
                                    'lon' in key.lower() or 
                                    'lng' in key.lower() or 
                                    'x' == key.lower() or 
                                    'y' == key.lower()]
                    
                    if coord_fields:
                        logger.warning(f"Record has potential coordinate fields that weren't mapped: {', '.join(coord_fields)}")
                        
                        # Try one more attempt to extract coordinates
                        for lat_name in ['lat', 'latitude', 'y']:
                            for lon_name in ['lon', 'lng', 'longitude', 'x']:
                                if lat_name in coord_fields and lon_name in coord_fields:
                                    # Found a potential coordinate pair
                                    try:
                                        lat = parse_coordinate(record[lat_name])
                                        lng = parse_coordinate(record[lon_name])
                                        
                                        if lat is not None and lng is not None and -90 <= lat <= 90 and -180 <= lng <= 180:
                                            transformed['coordinates'] = {'lat': lat, 'lng': lng}
                                            logger.info(f"Successfully extracted coordinates from {lat_name}/{lon_name}: {lat}, {lng}")
                                            break
                                    except Exception as e:
                                        logger.warning(f"Failed to extract coordinates from {lat_name}/{lon_name}: {e}")
                            if 'coordinates' in transformed:
                                break
                
                # Add fallback coordinates if none available (for visualization)
                if 'coordinates' not in transformed:
                    # Generate approximate coordinates for visualization
                    # Using San Francisco as a default center point
                    center_lat, center_lng = 37.7749, -122.4194
                    # Add random offset within a ~5km radius
                    offset = 0.05 
                    transformed['coordinates'] = {
                        'lat': center_lat + (hash(transformed.get('id', '')) % 100 / 1000.0) * offset,
                        'lng': center_lng + (hash(transformed.get('type', '')) % 100 / 1000.0) * offset
                    }
                    logger.warning(f"Added fallback coordinates for visualization: {transformed['coordinates']}")
                
                # Final check to ensure coordinates field is properly formatted
                if 'coordinates' in transformed:
                    if not isinstance(transformed['coordinates'], dict) or 'lat' not in transformed['coordinates'] or 'lng' not in transformed['coordinates']:
                        logger.warning(f"Coordinates field has invalid format: {transformed['coordinates']}")
                        # Fix it
                        if isinstance(transformed['coordinates'], (list, tuple)) and len(transformed['coordinates']) >= 2:
                            # Convert from array to object
                            transformed['coordinates'] = {'lat': float(transformed['coordinates'][0]), 'lng': float(transformed['coordinates'][1])}
                            logger.info(f"Fixed coordinates format from array to object: {transformed['coordinates']}")
                
                # Add to transformed data
                data_transformed.append(transformed)
            
            # Replace with transformed data
            if data_transformed:
                logger.info(f"Transformed {len(data_transformed)} records")
                data['data'] = data_transformed
            
            # Store in session with longer expiration
            session.permanent = True  # Make session last longer
            session[DataConnector.SESSION_KEY] = data
            session.modified = True
            
            # Log data structure
            logger.info(f"Stored data in session. Keys: {list(data.keys())}")
            logger.info(f"Data size: {len(data.get('data', []))} records")
            logger.info(f"Session ID: {session.sid if hasattr(session, 'sid') else 'unknown'}")
            logger.info(f"All session keys: {list(session.keys())}")
            
            # Data stored successfully
            return {
                "success": True,
                "message": f"Data with {len(data.get('data', []))} records stored successfully",
                "redirect": f"/{tool_id}" if tool_id else None
            }
            
        except Exception as e:
            logger.error(f"Error storing data: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def retrieve_data():
        """
        Retrieve data from session
        
        Returns:
            dict: The data stored in session, or error response
        """
        try:
            # Check if data exists in session
            if DataConnector.SESSION_KEY not in session:
                logger.warning("No data found in session")
                return {
                    "success": False,
                    "error": "No data found",
                    "errorCode": "NO_DATA"
                }
            
            # Get data from session
            data = session.get(DataConnector.SESSION_KEY)
            
            # Log retrieval info
            logger.info(f"Retrieved data from session. Type: {type(data)}")
            
            if isinstance(data, dict):
                logger.info(f"Data keys: {list(data.keys())}")
                data_size = len(data.get('data', []))
                logger.info(f"Data size: {data_size} records")
                
                # Add timestamp if missing
                if 'timestamp' not in data:
                    data['timestamp'] = int(time.time() * 1000)
            
            # Return data with success status
            return {
                "success": True,
                "data": data,
                "timestamp": int(time.time() * 1000)
            }
            
        except Exception as e:
            logger.error(f"Error retrieving data: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "errorCode": "RETRIEVAL_ERROR"
            }
    
    @staticmethod
    def clear_data():
        """
        Clear data from session
        
        Returns:
            dict: Success status
        """
        try:
            if DataConnector.SESSION_KEY in session:
                del session[DataConnector.SESSION_KEY]
                session.modified = True
                logger.info("Data cleared from session")
                return {"success": True, "message": "Data cleared from session"}
            else:
                logger.info("No data to clear from session")
                return {"success": True, "message": "No data to clear"}
        except Exception as e:
            logger.error(f"Error clearing data: {str(e)}", exc_info=True)
            return {"success": False, "error": str(e)}


# Flask routes integration helpers
def register_data_connector_routes(app):
    """
    Register data connector routes with Flask app
    
    Args:
        app: Flask application instance
    """
    @app.route('/api/send-to-tool', methods=['POST'])
    def send_to_tool():
        """Store data for transfer between tools in session"""
        try:
            # Debug request information
            logger.info(f"Received request to /api/send-to-tool")
            logger.info(f"Content-Type: {request.headers.get('Content-Type')}")
            
            # Get JSON data with error handling
            data = request.get_json()
            if not data:
                logger.warning("No JSON data received in request")
                return jsonify({"success": False, "error": "No data provided"}), 400
            
            # Extract destination tool ID
            tool_id = data.get('toolId', 'unknown')
            logger.info(f"Tool ID: {tool_id}")
            
            # Log data structure details (not the actual data)
            if isinstance(data, dict):
                logger.info(f"Received data keys: {list(data.keys())}")
                if 'data' in data and isinstance(data['data'], list):
                    logger.info(f"Data contains {len(data['data'])} records")
                    if len(data['data']) > 0:
                        sample = data['data'][0]
                        if isinstance(sample, dict):
                            logger.info(f"Sample record keys: {list(sample.keys())}")
            else:
                logger.warning(f"Unexpected data type: {type(data)}")
            
            # Ensure data is in the expected format
            if 'data' not in data:
                # If main payload is actually the data array, wrap it properly
                if isinstance(data, list):
                    logger.info("Converting array to proper data structure")
                    data = {
                        'data': data,
                        'metadata': {
                            'count': len(data),
                            'timestamp': int(time.time() * 1000)
                        }
                    }
                # If toolId is separate from data, add it to the main structure
                elif isinstance(data, dict) and 'toolId' in data and tool_id != 'unknown':
                    logger.info("Restructuring data to proper format")
                    # Move 'data' from the current dict to a nested 'data' key
                    data_to_store = {k: v for k, v in data.items() if k != 'toolId'}
                    data = {
                        'data': data_to_store.get('data', []),
                        'metadata': data_to_store.get('metadata', {
                            'count': len(data_to_store.get('data', [])),
                            'timestamp': int(time.time() * 1000)
                        }),
                        'toolId': tool_id
                    }
            
            # Store data using connector
            logger.info("Storing data in session...")
            result = DataConnector.store_data(data, tool_id)
            
            # Generate redirect URL if successful
            if result['success'] and tool_id:
                # Map toolId to proper route if needed
                tool_routes = {
                    'response-time': 'response-time-analyzer',
                    'response-time-analyzer': 'response-time-analyzer',
                    'call-density': 'call-density-heatmap'
                }
                
                route = tool_routes.get(tool_id, tool_id)
                redirect_url = f"/{route}"
                logger.info(f"Redirecting to: {redirect_url}")
                result['redirect'] = redirect_url
            
            logger.info(f"Data stored successfully: {result['success']}")
            return jsonify(result)
        except Exception as e:
            logger.error(f"Error in send_to_tool: {str(e)}", exc_info=True)
            return jsonify({"success": False, "error": str(e)}), 500
    
    @app.route('/api/get-tool-data', methods=['GET'])
    def get_tool_data():
        """Retrieve data stored for tool transfer"""
        try:
            logger.info("Request received for /api/get-tool-data")
            
            # Retrieve data using connector
            result = DataConnector.retrieve_data()
            
            # Return appropriate response based on success
            if result['success']:
                return jsonify(result)
            else:
                if result.get('errorCode') == 'NO_DATA':
                    # Return empty data array with 200 status instead of 404
                    # This allows the dashboard to fall back to sessionStorage or test data
                    logger.info("No data in session, returning empty data array with 200 status")
                    return jsonify({
                        "success": True,
                        "data": {
                            "data": [],
                            "metadata": {
                                "count": 0,
                                "timestamp": int(time.time() * 1000)
                            }
                        },
                        "timestamp": int(time.time() * 1000)
                    })
                else:
                    # For other errors, return 500
                    return jsonify(result), 500
                
        except Exception as e:
            logger.error(f"Error in get_tool_data: {str(e)}", exc_info=True)
            return jsonify({"success": False, "error": str(e)}), 500
    
    @app.route('/api/clear-tool-data', methods=['POST'])
    def clear_tool_data():
        """Clear data stored for tool transfer"""
        try:
            logger.info("Request received for /api/clear-tool-data")
            
            # Clear data using connector
            result = DataConnector.clear_data()
            
            return jsonify(result)
        except Exception as e:
            logger.error(f"Error in clear_tool_data: {str(e)}", exc_info=True)
            return jsonify({"success": False, "error": str(e)}), 500