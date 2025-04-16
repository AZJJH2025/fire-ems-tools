"""
Tool-specific routes for FireEMS.ai application.

This module defines routes for the specialized tools:
- Call Volume Forecaster
- FireMapPro
- Data Formatter
"""

from flask import Blueprint, render_template, request, jsonify, session, send_file
import os
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import io
import logging
import traceback
from werkzeug.utils import secure_filename
import random
import uuid

logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('tools', __name__, url_prefix='/tools-api')

# Helper functions
def get_from_session(key, as_dataframe=True):
    """Get data from session storage"""
    if key not in session:
        return None
        
    if as_dataframe and 'pandas' in session[key]:
        return pd.read_json(session[key])
    else:
        return json.loads(session[key])

def save_to_session(key, data):
    """Save data to session storage"""
    if isinstance(data, pd.DataFrame):
        session[key] = data.to_json(date_format='iso', orient='split')
    else:
        session[key] = json.dumps(data)

# Call Volume Forecaster routes
@bp.route('/call-volume-forecaster/upload', methods=['POST'])
def call_volume_forecaster_upload():
    """Handle file upload for Call Volume Forecaster"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        # Check file type
        allowed_extensions = {'csv', 'xlsx', 'xls'}
        if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            return jsonify({"error": "File type not allowed"}), 400
            
        # Process file data
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)
            
        # Basic validation
        if df.empty:
            return jsonify({"error": "File contains no data"}), 400
            
        # Try to identify date column
        date_cols = [col for col in df.columns if 'date' in col.lower() or 'time' in col.lower()]
        
        if not date_cols:
            return jsonify({"error": "Could not identify date column in data"}), 400
            
        date_col = date_cols[0]
        
        # Convert to datetime
        df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
        
        # Basic cleaning
        df = df.dropna(subset=[date_col])
        
        # Calculate data quality
        data_quality = calculate_data_quality(df, date_col)
        
        # Store in session
        save_to_session('cvf_data', {
            'data': df.to_json(date_format='iso', orient='split'),
            'date_column': date_col,
            'pandas': True
        })
        
        # Return summary and quality metrics
        summary = {
            "rows": len(df),
            "date_range": [df[date_col].min().isoformat(), df[date_col].max().isoformat()],
            "time_span_days": (df[date_col].max() - df[date_col].min()).days,
            "columns": list(df.columns)
        }
        
        return jsonify({
            "success": True,
            "summary": summary,
            "data_quality": data_quality,
            "suggested_parameters": suggest_forecast_parameters(df, date_col)
        })
    except Exception as e:
        logger.error(f"Error in call_volume_forecaster_upload: {str(e)}")
        return jsonify({"error": str(e)}), 500

def calculate_data_quality(df, date_col):
    """Calculate data quality metrics for forecast data"""
    quality = {}
    
    # Check date range
    date_range = df[date_col].max() - df[date_col].min()
    quality['time_span_days'] = date_range.days
    quality['time_span_sufficient'] = date_range.days >= 60  # Need at least 60 days for forecasting
    
    # Check data density
    df['date_only'] = df[date_col].dt.date
    daily_counts = df.groupby('date_only').size()
    quality['total_days'] = len(daily_counts)
    quality['missing_days'] = date_range.days - len(daily_counts)
    quality['data_density'] = len(daily_counts) / date_range.days if date_range.days > 0 else 0
    quality['density_sufficient'] = quality['data_density'] >= 0.7  # At least 70% of days have data
    
    # Check for seasonal patterns
    if date_range.days >= 365:
        quality['has_full_year'] = True
        # TODO: More sophisticated seasonal analysis could be added here
    else:
        quality['has_full_year'] = False
    
    # Overall quality score (0-100)
    quality_score = 0
    if quality['time_span_sufficient']:
        quality_score += 40
    else:
        quality_score += 40 * (min(quality['time_span_days'], 60) / 60)
        
    if quality['density_sufficient']:
        quality_score += 40
    else:
        quality_score += 40 * quality['data_density']
        
    if quality['has_full_year']:
        quality_score += 20
    else:
        quality_score += 20 * (min(quality['time_span_days'], 365) / 365)
    
    quality['overall_score'] = int(quality_score)
    
    return quality

def suggest_forecast_parameters(df, date_col):
    """Suggest forecast parameters based on data characteristics"""
    # Determine forecast horizon based on data span
    date_range = df[date_col].max() - df[date_col].min()
    
    if date_range.days >= 365 * 2:
        # Long history - can forecast further out
        horizon_days = 90
    elif date_range.days >= 365:
        # One year of data
        horizon_days = 60
    else:
        # Limited history
        horizon_days = 30
    
    # Determine seasonality parameters
    has_yearly_seasonality = date_range.days >= 365
    has_weekly_seasonality = date_range.days >= 21
    
    # Determine forecast interval
    if len(df) > 1000:
        # Lots of data, daily forecast makes sense
        interval = 'day'
    elif len(df) > 100:
        # Medium amount of data, weekly makes sense
        interval = 'week'
    else:
        # Limited data, monthly forecast
        interval = 'month'
    
    return {
        "horizon_days": horizon_days,
        "interval": interval,
        "yearly_seasonality": has_yearly_seasonality,
        "weekly_seasonality": has_weekly_seasonality
    }

@bp.route('/call-volume-forecaster/forecast', methods=['POST'])
def call_volume_forecaster_generate():
    """Generate forecast for Call Volume Forecaster"""
    try:
        # Get data from session
        cvf_data = get_from_session('cvf_data', False)
        if cvf_data is None:
            return jsonify({"error": "No data available. Please upload data first."}), 400
            
        # Get parameters
        params = request.json
        horizon_days = params.get('horizon_days', 30)
        interval = params.get('interval', 'day')
        include_yearly_seasonality = params.get('yearly_seasonality', False)
        include_weekly_seasonality = params.get('weekly_seasonality', True)
        
        # Generate forecast
        df = pd.read_json(cvf_data['data'], orient='split')
        date_col = cvf_data['date_column']
        
        # Generate sample forecast data
        forecast = generate_sample_forecast_data(
            df, 
            date_col, 
            horizon_days, 
            interval,
            include_yearly_seasonality,
            include_weekly_seasonality
        )
        
        # Store forecast in session
        save_to_session('cvf_forecast', forecast)
        
        return jsonify({
            "success": True,
            "forecast": forecast
        })
    except Exception as e:
        logger.error(f"Error in call_volume_forecaster_generate: {str(e)}")
        return jsonify({"error": str(e)}), 500

def generate_sample_forecast_data(df, date_col, horizon_days, interval, yearly_seasonality, weekly_seasonality):
    """Generate sample forecast data
    
    Note: This is a placeholder that generates realistic-looking but synthetic forecast data
    In a real implementation, this would use statistical models or machine learning
    """
    # Get the historical data ready
    df = df.copy()
    df['date_only'] = df[date_col].dt.date
    historical = df.groupby('date_only').size().reset_index()
    historical.columns = ['date', 'value']
    
    # Last date in the data
    last_date = historical['date'].max()
    
    # Generate forecast dates
    if interval == 'day':
        dates = [last_date + timedelta(days=i+1) for i in range(horizon_days)]
    elif interval == 'week':
        num_weeks = horizon_days // 7
        dates = [last_date + timedelta(days=(i+1)*7) for i in range(num_weeks)]
    elif interval == 'month':
        num_months = horizon_days // 30
        dates = []
        current_date = last_date
        for i in range(num_months):
            # Add roughly a month
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year+1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month+1)
            dates.append(current_date)
    else:
        dates = [last_date + timedelta(days=i+1) for i in range(horizon_days)]
    
    # Calculate statistics for generating realistic forecasts
    mean_value = historical['value'].mean()
    std_value = historical['value'].std()
    
    # Generate forecast values
    base_values = []
    for i in range(len(dates)):
        # Base value with some random noise
        base = np.random.normal(mean_value, std_value * 0.2)
        
        # Add trend (increasing slightly over time)
        trend_factor = 1 + (i / len(dates)) * 0.05  # 5% increase over the horizon
        
        # Add weekly seasonality if enabled
        weekly_factor = 1.0
        if weekly_seasonality:
            # Weekend effect (higher on weekends)
            if dates[i].weekday() >= 5:  # 5=Saturday, 6=Sunday
                weekly_factor = 1.2
            elif dates[i].weekday() == 0:  # Monday
                weekly_factor = 0.9
        
        # Add yearly seasonality if enabled
        yearly_factor = 1.0
        if yearly_seasonality:
            # Summer effect (higher in summer)
            month = dates[i].month
            if 6 <= month <= 8:  # Summer
                yearly_factor = 1.15
            elif 11 <= month <= 12 or month == 1:  # Winter
                yearly_factor = 1.1  # Winter holidays
        
        # Combine all factors
        value = base * trend_factor * weekly_factor * yearly_factor
        base_values.append(max(0, value))  # Ensure non-negative
    
    # Create forecast dataframe
    forecast = pd.DataFrame({
        'date': dates,
        'value': base_values
    })
    
    # Add prediction intervals (upper and lower bounds)
    forecast['lower_bound'] = forecast['value'] * 0.8
    forecast['upper_bound'] = forecast['value'] * 1.2
    
    # Convert to records for JSON serialization
    forecast_records = forecast.to_dict(orient='records')
    
    # Add historical data
    historical_records = historical.to_dict(orient='records')
    
    # Create the result
    result = {
        'historical': historical_records,
        'forecast': forecast_records,
        'start_date': dates[0].isoformat(),
        'end_date': dates[-1].isoformat(),
        'mean': float(mean_value),
        'std': float(std_value),
        'horizon_days': horizon_days,
        'interval': interval
    }
    
    return result

@bp.route('/call-volume-forecaster/export', methods=['POST'])
def call_volume_forecaster_export():
    """Export forecast data"""
    try:
        # Get forecast from session
        forecast = get_from_session('cvf_forecast', False)
        if forecast is None:
            return jsonify({"error": "No forecast available. Please generate a forecast first."}), 400
            
        # Get export format
        export_format = request.json.get('format', 'csv')
        
        # Create DataFrame with all data
        historical_df = pd.DataFrame(forecast['historical'])
        historical_df['type'] = 'historical'
        
        forecast_df = pd.DataFrame(forecast['forecast'])
        forecast_df['type'] = 'forecast'
        
        # Combine
        combined_df = pd.concat([historical_df, forecast_df], ignore_index=True)
        
        # Export based on format
        if export_format == 'csv':
            output = io.StringIO()
            combined_df.to_csv(output, index=False)
            
            return jsonify({
                "success": True,
                "data": output.getvalue(),
                "filename": "call_volume_forecast.csv"
            })
        elif export_format == 'json':
            return jsonify({
                "success": True,
                "data": combined_df.to_dict(orient='records'),
                "filename": "call_volume_forecast.json"
            })
        elif export_format == 'excel':
            output = io.BytesIO()
            combined_df.to_excel(output, index=False)
            output.seek(0)
            
            # Convert to base64 for download
            import base64
            encoded = base64.b64encode(output.read()).decode('utf-8')
            
            return jsonify({
                "success": True,
                "data": encoded,
                "filename": "call_volume_forecast.xlsx",
                "encoding": "base64"
            })
        else:
            return jsonify({"error": f"Unsupported export format: {export_format}"}), 400
    except Exception as e:
        logger.error(f"Error in call_volume_forecaster_export: {str(e)}")
        return jsonify({"error": str(e)}), 500

# FireMapPro routes
@bp.route('/fire-map-pro/maps', methods=['GET'])
def fire_map_pro_maps():
    """Get all maps for FireMapPro"""
    try:
        # In a real implementation, this would query the database
        # Here we'll return sample data
        maps = [
            {
                "id": 1,
                "name": "Downtown Response Plan",
                "description": "Response plan for downtown area",
                "created": datetime.now().isoformat(),
                "modified": datetime.now().isoformat()
            },
            {
                "id": 2,
                "name": "Wildland Fire Risk Map",
                "description": "Wildland urban interface risk assessment",
                "created": (datetime.now() - timedelta(days=5)).isoformat(),
                "modified": (datetime.now() - timedelta(days=2)).isoformat()
            },
            {
                "id": 3,
                "name": "Evacuation Zones",
                "description": "Community evacuation planning zones",
                "created": (datetime.now() - timedelta(days=10)).isoformat(),
                "modified": (datetime.now() - timedelta(days=10)).isoformat()
            }
        ]
        
        return jsonify({
            "success": True,
            "maps": maps
        })
    except Exception as e:
        logger.error(f"Error in fire_map_pro_maps: {str(e)}")
        return jsonify({"error": str(e)}), 500

@bp.route('/fire-map-pro/maps/<int:map_id>', methods=['GET'])
def fire_map_pro_map(map_id):
    """Get a specific map for FireMapPro"""
    try:
        # In a real implementation, this would query the database
        # Here we'll return sample data based on the ID
        sample_maps = {
            1: {
                "id": 1,
                "name": "Downtown Response Plan",
                "description": "Response plan for downtown area",
                "center": {"latitude": 33.4484, "longitude": -112.0740},
                "zoom": 13,
                "features": [
                    {
                        "id": "f1",
                        "type": "marker",
                        "latitude": 33.4484,
                        "longitude": -112.0740,
                        "title": "Fire Station 1",
                        "description": "Main headquarters"
                    },
                    {
                        "id": "f2",
                        "type": "polygon",
                        "coordinates": [
                            [33.4484, -112.0740],
                            [33.4584, -112.0840],
                            [33.4684, -112.0640],
                            [33.4484, -112.0740]
                        ],
                        "title": "Response Area 1",
                        "description": "Primary response zone"
                    }
                ],
                "layers": [
                    {
                        "id": "l1",
                        "name": "Fire Stations",
                        "visible": True,
                        "features": ["f1"]
                    },
                    {
                        "id": "l2",
                        "name": "Response Areas",
                        "visible": True,
                        "features": ["f2"]
                    }
                ]
            },
            2: {
                "id": 2,
                "name": "Wildland Fire Risk Map",
                "description": "Wildland urban interface risk assessment",
                "center": {"latitude": 33.5484, "longitude": -112.1740},
                "zoom": 12,
                "features": [
                    {
                        "id": "f1",
                        "type": "polygon",
                        "coordinates": [
                            [33.5484, -112.1740],
                            [33.5584, -112.1840],
                            [33.5684, -112.1640],
                            [33.5484, -112.1740]
                        ],
                        "title": "High Risk Zone",
                        "description": "Wildland urban interface with high risk"
                    }
                ],
                "layers": [
                    {
                        "id": "l1",
                        "name": "Risk Zones",
                        "visible": True,
                        "features": ["f1"]
                    }
                ]
            },
            3: {
                "id": 3,
                "name": "Evacuation Zones",
                "description": "Community evacuation planning zones",
                "center": {"latitude": 33.6484, "longitude": -112.2740},
                "zoom": 11,
                "features": [
                    {
                        "id": "f1",
                        "type": "polygon",
                        "coordinates": [
                            [33.6484, -112.2740],
                            [33.6584, -112.2840],
                            [33.6684, -112.2640],
                            [33.6484, -112.2740]
                        ],
                        "title": "Zone A",
                        "description": "Primary evacuation zone"
                    },
                    {
                        "id": "f2",
                        "type": "polyline",
                        "coordinates": [
                            [33.6484, -112.2740],
                            [33.6584, -112.2840],
                            [33.6684, -112.2640]
                        ],
                        "title": "Evacuation Route 1",
                        "description": "Main evacuation route"
                    }
                ],
                "layers": [
                    {
                        "id": "l1",
                        "name": "Zones",
                        "visible": True,
                        "features": ["f1"]
                    },
                    {
                        "id": "l2",
                        "name": "Routes",
                        "visible": True,
                        "features": ["f2"]
                    }
                ]
            }
        }
        
        if map_id not in sample_maps:
            return jsonify({"error": "Map not found"}), 404
            
        return jsonify({
            "success": True,
            "map": sample_maps[map_id]
        })
    except Exception as e:
        logger.error(f"Error in fire_map_pro_map: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Data Formatter routes
@bp.route('/data-formatter/upload', methods=['POST'])
def data_formatter_upload():
    """Handle file upload for Data Formatter"""
    try:
        # Log request details for debugging
        logger.debug("===== DATA FORMATTER UPLOAD ENDPOINT IN TOOLS.PY CALLED =====")
        logger.debug(f"Request method: {request.method}, content type: {request.content_type}")
        
        if 'file' not in request.files:
            logger.error("No file provided in request")
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            logger.error("No file selected")
            return jsonify({"error": "No file selected"}), 400
            
        # Check file type
        allowed_extensions = {'csv', 'xlsx', 'xls', 'json', 'xml'}
        if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            logger.error(f"File type not allowed: {file.filename}")
            return jsonify({"error": f"File type not allowed. Must be one of: {', '.join(allowed_extensions)}"}), 400
            
        # Create a unique filename
        import uuid
        from werkzeug.utils import secure_filename
        
        filename = secure_filename(file.filename)
        file_id = str(uuid.uuid4())
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{file_id}.{file_extension}"
        
        # Helper function to get files path
        def get_files_path():
            uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            return uploads_dir
        
        # Create upload directory if it doesn't exist
        upload_dir = get_files_path()
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save the file
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        logger.info(f"File saved to: {file_path}")
        
        # Process file to get data
        try:
            # Load source data based on file type
            if file_extension == 'csv':
                df = pd.read_csv(file_path)
                logger.info(f"CSV file loaded, shape: {df.shape}")
            elif file_extension in ['xlsx', 'xls']:
                df = pd.read_excel(file_path)
                logger.info(f"Excel file loaded, shape: {df.shape}")
            elif file_extension == 'json':
                df = pd.read_json(file_path)
                logger.info(f"JSON file loaded, shape: {df.shape}")
            elif file_extension == 'xml':
                df = pd.read_xml(file_path)
                logger.info(f"XML file loaded, shape: {df.shape}")
            else:
                logger.error(f"Unsupported file type: {file_extension}")
                return jsonify({"error": f"Unsupported file type: {file_extension}"}), 400
                
            # Basic validation
            if df.empty:
                logger.error("File contains no data")
                return jsonify({"error": "File contains no data"}), 400
                
            # Detect data source type
            system_type = detect_system_type(df)
            
            # Check for important data features
            has_geo = has_geo_coordinates(df)
            has_timestamps = has_timestamps(df)
            
            # Suggest compatible tools
            compatible_tools = suggest_tools(df, system_type, has_geo, has_timestamps)
            
            # Store in session for backward compatibility
            save_to_session('formatter_data', {
                'data': df.to_json(date_format='iso', orient='split'),
                'system_type': system_type,
                'has_geo': has_geo,
                'has_timestamps': has_timestamps,
                'compatible_tools': compatible_tools,
                'pandas': True,
                'fileId': file_id,
                'filename': filename
            })
            
            # Get columns and sample data
            columns = list(df.columns)
            rows = len(df)
            # Convert DataFrame to list of dicts for response
            data = df.head(50).to_dict('records')
            
            # Try to detect first reported date for display
            first_reported_date = None
            date_fields = ['Reported', 'Incident Date', 'Date', 'incident_date', 'datetime']
            for field in date_fields:
                if field in df.columns:
                    try:
                        date_values = df[field].dropna()
                        if len(date_values) > 0:
                            # Try to parse as date
                            first_date = pd.to_datetime(date_values.iloc[0])
                            if pd.notna(first_date):
                                first_reported_date = first_date.strftime('%Y-%m-%d')
                                break
                    except Exception as e:
                        logger.warning(f"Error parsing date field {field}: {str(e)}")
            
            # Log success
            logger.info(f"File processed successfully. Columns: {columns}")
            
            # Prepare the response
            return jsonify({
                "success": True,
                "fileId": file_id,
                "filename": filename,
                "fileType": file_extension,
                "columns": columns,
                "rows": rows,
                "data": data,
                "first_reported_date": first_reported_date,
                "system_type": system_type,
                "has_geo_coordinates": has_geo,
                "has_timestamps": has_timestamps,
                "compatible_tools": compatible_tools
            })
            
        except Exception as e:
            logger.error(f"Error processing file: {str(e)}")
            logger.error(f"Error details: {traceback.format_exc()}")
            # Return error with file info
            return jsonify({
                "error": f"File uploaded but could not be processed: {str(e)}",
                "fileId": file_id,
                "filename": filename,
                "fileType": file_extension
            }), 500
            
    except Exception as e:
        logger.error(f"Error in data_formatter_upload: {str(e)}")
        logger.error(f"Error details: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

def detect_system_type(df):
    """Detect the type of system the data came from"""
    columns = [col.lower() for col in df.columns]
    
    # FireRMS specific columns
    if 'incident_number' in columns and ('alarm_date' in columns or 'alarm_time' in columns):
        return 'FireRMS'
        
    # ESO specific columns
    if 'pcr_number' in columns or 'incident_pcr' in columns:
        return 'ESO'
        
    # ImageTrend specific columns
    if 'incident_id' in columns and 'agency_id' in columns:
        return 'ImageTrend'
        
    # Zoll specific columns
    if 'incident_key' in columns and ('dispatch_date' in columns or 'dispatch_time' in columns):
        return 'Zoll'
        
    # Motorola CAD specific columns
    if 'cad_number' in columns or ('call_type' in columns and 'call_date' in columns):
        return 'MotorolaCAD'
        
    # Generic CAD data
    if 'call_number' in columns or 'call_id' in columns or 'dispatch_time' in columns:
        return 'GenericCAD'
        
    # Otherwise we can't determine the system type
    return 'Unknown'

def has_geo_coordinates(df):
    """Check if the data has geographic coordinates"""
    columns = [col.lower() for col in df.columns]
    
    # Look for common coordinate column patterns
    lat_patterns = ['lat', 'latitude', 'y_coord']
    lon_patterns = ['lon', 'lng', 'long', 'longitude', 'x_coord']
    
    has_lat = any(pattern in ''.join(columns) for pattern in lat_patterns)
    has_lon = any(pattern in ''.join(columns) for pattern in lon_patterns)
    
    return has_lat and has_lon

def has_timestamps(df):
    """Check if the data has timestamp information"""
    columns = [col.lower() for col in df.columns]
    
    # Look for common timestamp column patterns
    timestamp_patterns = ['date', 'time', 'timestamp', 'alarm', 'dispatch', 'arrival', 'clear']
    
    return any(pattern in ''.join(columns) for pattern in timestamp_patterns)

def suggest_tools(df, system_type, has_geo, has_timestamps):
    """Suggest compatible tools based on data characteristics"""
    compatible_tools = []
    
    # Response Time Analyzer needs timestamps
    if has_timestamps:
        compatible_tools.append({
            "id": "response_time_analyzer",
            "name": "Response Time Analyzer",
            "compatibility": "high" if system_type != 'Unknown' else "medium"
        })
    
    # Call Density Heatmap needs geo coordinates
    if has_geo:
        compatible_tools.append({
            "id": "call_density_heatmap",
            "name": "Call Density Heatmap",
            "compatibility": "high"
        })
    
    # Station Overview can work with various data but needs timestamps
    if has_timestamps:
        compatible_tools.append({
            "id": "station_overview",
            "name": "Station Overview",
            "compatibility": "high" if system_type != 'Unknown' and 'station' in ''.join([col.lower() for col in df.columns]) else "medium"
        })
    
    # Coverage Gap Finder needs geo coordinates
    if has_geo:
        compatible_tools.append({
            "id": "coverage_gap_finder",
            "name": "Coverage Gap Finder",
            "compatibility": "high"
        })
        
    # Quick Stats can work with any data
    compatible_tools.append({
        "id": "quick_stats",
        "name": "Quick Stats",
        "compatibility": "medium" if system_type == 'Unknown' else "high"
    })
    
    # Incident Logger needs incident data
    if system_type in ['FireRMS', 'ESO', 'ImageTrend', 'GenericCAD', 'MotorolaCAD']:
        compatible_tools.append({
            "id": "incident_logger",
            "name": "Incident Logger",
            "compatibility": "high"
        })
    
    # Call Volume Forecaster needs timestamps for time series analysis
    if has_timestamps:
        compatible_tools.append({
            "id": "call_volume_forecaster",
            "name": "Call Volume Forecaster",
            "compatibility": "high" if len(df) > 100 else "medium"
        })
    
    return compatible_tools

@bp.route('/data-formatter/transform', methods=['POST'])
def data_formatter_transform():
    """Transform data for a specific tool"""
    try:
        # Log request details for debugging
        logger.debug("===== DATA FORMATTER TRANSFORM ENDPOINT IN TOOLS.PY CALLED =====")
        logger.debug(f"Request method: {request.method}, content type: {request.content_type}")
        logger.debug(f"Request headers: {dict(request.headers)}")
        raw_data = request.get_data().decode('utf-8', errors='replace')
        logger.debug(f"Raw request data: {raw_data[:1000]}...")  # Log first 1000 chars to avoid huge logs
        
        # Get parameters
        params = request.get_json()
        logger.debug(f"Parsed JSON data: {json.dumps(params)[:1000]}...")
        
        # Extract file ID - this is what the frontend sends instead of expecting session data
        file_id = params.get('fileId')
        if not file_id:
            logger.error("Missing required parameter: fileId")
            return jsonify({"error": "Missing required parameter: fileId"}), 400
            
        # Get mappings in the format the frontend sends
        mappings = params.get('mappings', {})
        if not mappings:
            logger.error("Missing required parameter: mappings")
            return jsonify({"error": "Missing required parameter: mappings"}), 400
            
        # Extract processing metadata (contains split rules)
        processing_metadata = params.get('processingMetadata', {})
        logger.debug(f"Processing metadata: {json.dumps(processing_metadata)}")
        
        # Extract split rules if available
        split_rules = {}
        if processing_metadata and '_splitRules' in processing_metadata:
            split_rules = processing_metadata.get('_splitRules', {})
            logger.info(f"Split rules found in processing metadata: {json.dumps(split_rules)}")
        
        # Get target tool - using targetTool if provided, falling back to "tool"
        target_tool = params.get('targetTool') or params.get('tool')
        if not target_tool:
            logger.error("Missing required parameter: targetTool or tool")
            return jsonify({"error": "Target tool must be specified"}), 400
            
        # Try to find the file based on fileId
        # First, try to find the file in uploads directory
        import os
        from werkzeug.utils import secure_filename
        
        # Helper function to get files path
        def get_files_path():
            uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            return uploads_dir
            
        # Try to find the file in uploads directory
        file_found = False
        file_path = None
        file_extension = None
        uploads_dir = get_files_path()
        
        for ext in ['csv', 'xlsx', 'xls', 'json', 'xml']:
            temp_path = os.path.join(uploads_dir, f"{file_id}.{ext}")
            if os.path.exists(temp_path):
                file_path = temp_path
                file_extension = ext
                file_found = True
                logger.info(f"Found file: {file_path}")
                break
                
        # Convert mappings to the format expected by transform_data_for_tool
        field_mappings = {}
        for target_field, mapping_info in mappings.items():
            # Handle different mapping formats (string or object with sourceId)
            if isinstance(mapping_info, str):
                field_mappings[target_field] = mapping_info
            elif isinstance(mapping_info, dict) and 'sourceField' in mapping_info:
                field_mappings[target_field] = mapping_info['sourceField']
            elif isinstance(mapping_info, dict) and 'sourceId' in mapping_info:
                field_mappings[target_field] = mapping_info['sourceId']
                
        logger.debug(f"Converted field mappings: {json.dumps(field_mappings)}")
        
        # Check if we found the file
        if file_found:
            # Load the file based on extension
            try:
                if file_extension == 'csv':
                    df = pd.read_csv(file_path)
                    logger.info(f"Loaded CSV file: {file_path}, shape: {df.shape}")
                elif file_extension in ['xlsx', 'xls']:
                    df = pd.read_excel(file_path)
                    logger.info(f"Loaded Excel file: {file_path}, shape: {df.shape}")
                elif file_extension == 'json':
                    df = pd.read_json(file_path)
                    logger.info(f"Loaded JSON file: {file_path}, shape: {df.shape}")
                else:
                    logger.error(f"Unsupported file type: {file_extension}")
                    return jsonify({"error": f"Unsupported file type: {file_extension}"}), 400
                
                # Detect system type
                system_type = detect_system_type(df)
            except Exception as e:
                logger.error(f"Error loading file {file_path}: {str(e)}")
                return jsonify({"error": f"Error loading file: {str(e)}"}), 500
        else:
            # Try to get it from session as fallback
            formatter_data = get_from_session('formatter_data', False)
            
            # Check if we have data from session
            if formatter_data:
                # Get the data from session
                df = pd.read_json(formatter_data['data'], orient='split')
                system_type = formatter_data.get('system_type', 'Unknown')
                logger.info(f"Using data from session, shape: {df.shape}")
            else:
                # Could not find the file
                logger.error(f"No data found for fileId: {file_id}")
                return jsonify({"error": f"No data found for fileId: {file_id}. Please upload data first."}), 400
        
        # Transform data for the target tool
        transformed_data = transform_data_for_tool(df, target_tool, field_mappings, system_type)
        
        # Apply split rules manually if provided
        if split_rules and transformed_data and 'data' in transformed_data:
            logger.info("Applying split rules to transformed data")
            
            # Apply each split rule to the transformed data
            for target_field, rule in split_rules.items():
                # Verify rule has required fields
                if not rule or not isinstance(rule, dict):
                    logger.warning(f"Skipping invalid split rule for {target_field}: {rule}")
                    continue
                    
                source_field = rule.get('sourceField')
                delimiter = rule.get('delimiter')
                part_index = rule.get('partIndex')
                
                if not source_field or delimiter is None or part_index is None:
                    logger.warning(f"Skipping incomplete split rule for {target_field}: {rule}")
                    continue
                
                # Apply the split rule to each record in the transformed data
                logger.info(f"Applying split rule for {target_field}: {source_field} with delimiter '{delimiter}' and part index {part_index}")
                
                for record in transformed_data['data']:
                    if source_field in record:
                        try:
                            source_value = record[source_field]
                            if source_value and isinstance(source_value, str):
                                parts = source_value.split(delimiter)
                                part_index_value = part_index if part_index != -1 else len(parts) - 1
                                
                                if 0 <= part_index_value < len(parts):
                                    record[target_field] = parts[part_index_value].strip()
                                    logger.debug(f"Split rule applied: {source_value} -> {record[target_field]}")
                        except Exception as e:
                            logger.error(f"Error applying split rule: {str(e)}")
        
        # Store transformed data in session
        save_to_session('transformed_data', transformed_data)
        
        # Return the transformed data in the expected format
        return jsonify({
            "success": True,
            "transformed_data": {
                "rows": len(transformed_data['data']),
                "columns": transformed_data['columns'],
                "sample": transformed_data['data'][:5]
            }
        })
    except Exception as e:
        logger.error(f"Error in data_formatter_transform: {str(e)}")
        return jsonify({"error": str(e)}), 500

def transform_data_for_tool(df, target_tool, field_mappings, system_type):
    """Transform data for a specific tool"""
    # Apply field mappings
    transformed_df = df.copy()
    
    # Rename columns according to mappings
    for target_field, source_field in field_mappings.items():
        if source_field in df.columns:
            transformed_df[target_field] = df[source_field]
    
    # Perform tool-specific transformations
    if target_tool == 'response_time_analyzer':
        return transform_for_response_time_analyzer(transformed_df, field_mappings, system_type)
    elif target_tool == 'call_density_heatmap':
        return transform_for_call_density_heatmap(transformed_df, field_mappings, system_type)
    elif target_tool == 'station_overview':
        return transform_for_station_overview(transformed_df, field_mappings, system_type)
    elif target_tool == 'coverage_gap_finder':
        return transform_for_coverage_gap_finder(transformed_df, field_mappings, system_type)
    elif target_tool == 'quick_stats':
        return transform_for_quick_stats(transformed_df, field_mappings, system_type)
    elif target_tool == 'incident_logger':
        return transform_for_incident_logger(transformed_df, field_mappings, system_type)
    elif target_tool == 'call_volume_forecaster':
        return transform_for_call_volume_forecaster(transformed_df, field_mappings, system_type)
    else:
        # Generic transformation - just return the transformed data
        return {
            "data": transformed_df.to_dict(orient='records'),
            "columns": list(transformed_df.columns)
        }

def transform_for_response_time_analyzer(df, field_mappings, system_type):
    """Transform data for Response Time Analyzer"""
    # Ensure required fields exist or are mapped
    required_fields = ['incident_id', 'incident_date', 'dispatch_time', 'arrival_time']
    
    # Generate simplified data for the response time analyzer
    data = []
    for _, row in df.iterrows():
        # Create a record with all fields converted to the expected format
        record = {}
        
        # Try to get incident ID
        if 'incident_id' in df.columns:
            record['incident_id'] = row['incident_id']
        elif 'incident_number' in df.columns:
            record['incident_id'] = row['incident_number']
        else:
            # Generate a fake ID
            record['incident_id'] = f"INC-{random.randint(10000, 99999)}"
        
        # Try to get dates and times
        for time_field in ['dispatch_time', 'arrival_time', 'clear_time']:
            if time_field in df.columns:
                record[time_field] = row[time_field]
        
        # Add the record
        data.append(record)
    
    return {
        "data": data,
        "columns": ['incident_id', 'dispatch_time', 'arrival_time', 'clear_time']
    }

def transform_for_call_density_heatmap(df, field_mappings, system_type):
    """Transform data for Call Density Heatmap"""
    # Prepare data for the call density heatmap
    lat_col = None
    lon_col = None
    
    # Find latitude and longitude columns
    for col in df.columns:
        col_lower = col.lower()
        if 'lat' in col_lower or 'y_coord' in col_lower:
            lat_col = col
        elif 'lon' in col_lower or 'long' in col_lower or 'x_coord' in col_lower:
            lon_col = col
    
    if not lat_col or not lon_col:
        # Fallback to mappings
        if 'latitude' in field_mappings:
            lat_col = field_mappings['latitude']
        if 'longitude' in field_mappings:
            lon_col = field_mappings['longitude']
    
    # Generate heatmap data
    data = []
    for _, row in df.iterrows():
        if lat_col and lon_col and pd.notna(row[lat_col]) and pd.notna(row[lon_col]):
            try:
                lat = float(row[lat_col])
                lon = float(row[lon_col])
                
                # Validate coordinates
                if -90 <= lat <= 90 and -180 <= lon <= 180:
                    data.append({
                        'lat': lat,
                        'lng': lon,
                        'weight': 1  # Default weight
                    })
            except (ValueError, TypeError):
                # Skip invalid coordinates
                pass
    
    return {
        "data": data,
        "columns": ['lat', 'lng', 'weight']
    }

def transform_for_station_overview(df, field_mappings, system_type):
    """Transform data for Station Overview"""
    # Simplify for this implementation
    data = df.to_dict(orient='records')
    return {
        "data": data,
        "columns": list(df.columns)
    }

def transform_for_coverage_gap_finder(df, field_mappings, system_type):
    """Transform data for Coverage Gap Finder"""
    # Similar to call density, but with different format
    lat_col = None
    lon_col = None
    
    # Find latitude and longitude columns
    for col in df.columns:
        col_lower = col.lower()
        if 'lat' in col_lower or 'y_coord' in col_lower:
            lat_col = col
        elif 'lon' in col_lower or 'long' in col_lower or 'x_coord' in col_lower:
            lon_col = col
    
    if not lat_col or not lon_col:
        # Fallback to mappings
        if 'latitude' in field_mappings:
            lat_col = field_mappings['latitude']
        if 'longitude' in field_mappings:
            lon_col = field_mappings['longitude']
    
    # Generate coverage gap finder data
    data = []
    for _, row in df.iterrows():
        if lat_col and lon_col and pd.notna(row[lat_col]) and pd.notna(row[lon_col]):
            try:
                lat = float(row[lat_col])
                lon = float(row[lon_col])
                
                # Validate coordinates
                if -90 <= lat <= 90 and -180 <= lon <= 180:
                    point = {
                        'latitude': lat,
                        'longitude': lon
                    }
                    
                    # Add additional fields if available
                    if 'incident_type' in df.columns:
                        point['type'] = row['incident_type']
                    elif 'call_type' in df.columns:
                        point['type'] = row['call_type']
                    
                    if 'incident_date' in df.columns:
                        point['date'] = row['incident_date']
                    elif 'call_date' in df.columns:
                        point['date'] = row['call_date']
                    
                    data.append(point)
            except (ValueError, TypeError):
                # Skip invalid coordinates
                pass
    
    return {
        "data": data,
        "columns": ['latitude', 'longitude', 'type', 'date']
    }

def transform_for_quick_stats(df, field_mappings, system_type):
    """Transform data for Quick Stats"""
    # Simplify for this implementation
    data = df.to_dict(orient='records')
    return {
        "data": data,
        "columns": list(df.columns)
    }

def transform_for_incident_logger(df, field_mappings, system_type):
    """Transform data for Incident Logger"""
    # Simplify for this implementation
    data = df.to_dict(orient='records')
    return {
        "data": data,
        "columns": list(df.columns)
    }

def transform_for_call_volume_forecaster(df, field_mappings, system_type):
    """Transform data for Call Volume Forecaster"""
    # Find date column
    date_col = None
    for col in df.columns:
        col_lower = col.lower()
        if 'date' in col_lower or 'time' in col_lower:
            date_col = col
            break
    
    if not date_col:
        # Fallback to mappings
        if 'date' in field_mappings:
            date_col = field_mappings['date']
    
    # Prepare data for call volume forecaster
    if date_col:
        # Convert to datetime if not already
        if not pd.api.types.is_datetime64_any_dtype(df[date_col]):
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
        
        # Create date-only column
        df['date_only'] = df[date_col].dt.date
        
        # Count incidents by date
        daily_counts = df.groupby('date_only').size().reset_index()
        daily_counts.columns = ['date', 'count']
        
        data = daily_counts.to_dict(orient='records')
    else:
        # No date column found, return empty data
        data = []
    
    return {
        "data": data,
        "columns": ['date', 'count']
    }

@bp.route('/data-formatter/download', methods=['POST'])
def data_formatter_download():
    """Download transformed data"""
    try:
        # Get transformed data from session
        transformed_data = get_from_session('transformed_data', False)
        if transformed_data is None:
            return jsonify({"error": "No transformed data available. Please transform data first."}), 400
            
        # Get export format
        export_format = request.json.get('format', 'csv')
        
        # Create DataFrame
        data = transformed_data['data']
        columns = transformed_data['columns']
        
        df = pd.DataFrame(data, columns=columns)
        
        # Export based on format
        if export_format == 'csv':
            output = io.StringIO()
            df.to_csv(output, index=False)
            
            return jsonify({
                "success": True,
                "data": output.getvalue(),
                "filename": "formatted_data.csv"
            })
        elif export_format == 'json':
            return jsonify({
                "success": True,
                "data": df.to_dict(orient='records'),
                "filename": "formatted_data.json"
            })
        elif export_format == 'excel':
            output = io.BytesIO()
            df.to_excel(output, index=False)
            output.seek(0)
            
            # Convert to base64 for download
            import base64
            encoded = base64.b64encode(output.read()).decode('utf-8')
            
            return jsonify({
                "success": True,
                "data": encoded,
                "filename": "formatted_data.xlsx",
                "encoding": "base64"
            })
        else:
            return jsonify({"error": f"Unsupported export format: {export_format}"}), 400
    except Exception as e:
        logger.error(f"Error in data_formatter_download: {str(e)}")
        return jsonify({"error": str(e)}), 500

@bp.route('/data-formatter/send-to-tool', methods=['POST'])
def data_formatter_send_to_tool():
    """Send transformed data to a tool"""
    try:
        # Get transformed data from session
        transformed_data = get_from_session('transformed_data', False)
        if transformed_data is None:
            return jsonify({"error": "No transformed data available. Please transform data first."}), 400
            
        # Get target tool
        target_tool = request.json.get('tool')
        
        if not target_tool:
            return jsonify({"error": "Target tool must be specified"}), 400
            
        # Store transformed data in session with the appropriate key for the target tool
        if target_tool == 'response_time_analyzer':
            session_key = 'dashboard_data'
        elif target_tool == 'call_density_heatmap':
            session_key = 'call_density_data'
        elif target_tool == 'station_overview':
            session_key = 'station_overview_data'
        elif target_tool == 'coverage_gap_finder':
            session_key = 'coverage_gap_data'
        elif target_tool == 'quick_stats':
            session_key = 'quick_stats_data'
        elif target_tool == 'incident_logger':
            session_key = 'incident_logger_data'
        elif target_tool == 'call_volume_forecaster':
            session_key = 'cvf_data'
        else:
            return jsonify({"error": f"Unsupported tool: {target_tool}"}), 400
            
        # Create DataFrame
        data = transformed_data['data']
        columns = transformed_data['columns']
        
        df = pd.DataFrame(data, columns=columns)
        
        # Store in session
        save_to_session(session_key, df)
        
        # Determine redirect URL
        if target_tool == 'response_time_analyzer':
            redirect_url = '/fire-ems-dashboard'
        elif target_tool == 'call_density_heatmap':
            redirect_url = '/call-density-heatmap'
        elif target_tool == 'station_overview':
            redirect_url = '/station-overview'
        elif target_tool == 'coverage_gap_finder':
            redirect_url = '/coverage-gap-finder'
        elif target_tool == 'quick_stats':
            redirect_url = '/quick-stats'
        elif target_tool == 'incident_logger':
            redirect_url = '/incident-logger'
        elif target_tool == 'call_volume_forecaster':
            redirect_url = '/call-volume-forecaster'
        else:
            redirect_url = '/'
        
        return jsonify({
            "success": True,
            "redirect": redirect_url
        })
    except Exception as e:
        logger.error(f"Error in data_formatter_send_to_tool: {str(e)}")
        return jsonify({"error": str(e)}), 500