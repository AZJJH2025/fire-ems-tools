"""
Dashboard routes for FireEMS.ai application.

This module defines routes for the various dashboards and data visualization tools:
- Response Time Analyzer
- Call Density Heatmap
- Station Overview
- Quick Stats
"""

from flask import Blueprint, render_template, request, jsonify, session, send_file
import os
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import io
import logging
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('dashboards', __name__, url_prefix='/api')

# Helper functions
def process_csv_data(file_stream, timestamp_cols=None):
    """Process CSV file data into pandas DataFrame"""
    try:
        df = pd.read_csv(file_stream)
        
        # Convert timestamp columns if provided
        if timestamp_cols:
            for col in timestamp_cols:
                if col in df.columns:
                    df[col] = pd.to_datetime(df[col], errors='coerce')
                    
        return df
    except Exception as e:
        logger.error(f"Error processing CSV data: {str(e)}")
        raise

def process_excel_data(file_stream, timestamp_cols=None):
    """Process Excel file data into pandas DataFrame"""
    try:
        df = pd.read_excel(file_stream)
        
        # Convert timestamp columns if provided
        if timestamp_cols:
            for col in timestamp_cols:
                if col in df.columns:
                    df[col] = pd.to_datetime(df[col], errors='coerce')
                    
        return df
    except Exception as e:
        logger.error(f"Error processing Excel data: {str(e)}")
        raise

def save_to_session(key, data):
    """Save DataFrame to session storage"""
    if isinstance(data, pd.DataFrame):
        session[key] = data.to_json(date_format='iso')
    else:
        session[key] = json.dumps(data)

def get_from_session(key, as_dataframe=True):
    """Get DataFrame from session storage"""
    if key not in session:
        return None
        
    if as_dataframe:
        return pd.read_json(session[key])
    else:
        return json.loads(session[key])

# Dashboard API routes
@bp.route('/dashboard/upload', methods=['POST'])
def dashboard_upload():
    """Handle file upload for dashboards"""
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
        timestamp_cols = request.form.get('timestamp_cols', '').split(',') if request.form.get('timestamp_cols') else None
        
        if file.filename.endswith('.csv'):
            df = process_csv_data(file, timestamp_cols)
        else:
            df = process_excel_data(file, timestamp_cols)
            
        # Basic validation
        if df.empty:
            return jsonify({"error": "File contains no data"}), 400
            
        # Store in session
        save_to_session('dashboard_data', df)
        
        # Return summary
        summary = {
            "rows": len(df),
            "columns": list(df.columns),
            "sample": df.head(5).to_dict(orient='records')
        }
        
        return jsonify({
            "success": True,
            "summary": summary
        })
    except Exception as e:
        logger.error(f"Error in dashboard_upload: {str(e)}")
        return jsonify({"error": str(e)}), 500

@bp.route('/dashboard/filter', methods=['POST'])
def dashboard_filter():
    """Filter dashboard data"""
    try:
        # Get data from session
        df = get_from_session('dashboard_data')
        if df is None:
            return jsonify({"error": "No data available. Please upload a file first."}), 400
            
        # Get filter parameters
        filters = request.json.get('filters', {})
        
        # Apply filters
        filtered_df = df.copy()
        for column, filter_value in filters.items():
            if column in filtered_df.columns:
                if isinstance(filter_value, list):
                    # List means we want values in this list
                    filtered_df = filtered_df[filtered_df[column].isin(filter_value)]
                elif isinstance(filter_value, dict):
                    # Dict means range or custom filter
                    if 'min' in filter_value and 'max' in filter_value:
                        # Range filter
                        filtered_df = filtered_df[(filtered_df[column] >= filter_value['min']) & 
                                                 (filtered_df[column] <= filter_value['max'])]
                    elif 'contains' in filter_value:
                        # Text contains filter
                        filtered_df = filtered_df[filtered_df[column].astype(str).str.contains(filter_value['contains'], case=False)]
                else:
                    # Direct value comparison
                    filtered_df = filtered_df[filtered_df[column] == filter_value]
                    
        # Save filtered data
        save_to_session('filtered_dashboard_data', filtered_df)
        
        # Return summary
        summary = {
            "rows": len(filtered_df),
            "filtered_from": len(df),
            "sample": filtered_df.head(5).to_dict(orient='records')
        }
        
        return jsonify({
            "success": True,
            "summary": summary
        })
    except Exception as e:
        logger.error(f"Error in dashboard_filter: {str(e)}")
        return jsonify({"error": str(e)}), 500

@bp.route('/dashboard/analyze', methods=['POST'])
def dashboard_analyze():
    """Analyze dashboard data"""
    try:
        # Get data from session (use filtered if available)
        df = get_from_session('filtered_dashboard_data')
        if df is None:
            df = get_from_session('dashboard_data')
            
        if df is None:
            return jsonify({"error": "No data available. Please upload a file first."}), 400
            
        # Get analysis parameters
        analysis_type = request.json.get('analysis_type')
        params = request.json.get('params', {})
        
        if analysis_type == 'summary_stats':
            # Basic summary statistics
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            result = {
                "count": df.count().to_dict(),
                "mean": df[numeric_cols].mean().to_dict(),
                "median": df[numeric_cols].median().to_dict(),
                "min": df[numeric_cols].min().to_dict(),
                "max": df[numeric_cols].max().to_dict(),
                "std": df[numeric_cols].std().to_dict()
            }
        elif analysis_type == 'time_series':
            # Time series analysis
            time_col = params.get('time_column')
            value_col = params.get('value_column')
            
            if not time_col or not value_col:
                return jsonify({"error": "Time and value columns are required"}), 400
                
            if time_col not in df.columns or value_col not in df.columns:
                return jsonify({"error": "Specified columns not found in data"}), 400
                
            # Convert to datetime if needed
            if not pd.api.types.is_datetime64_any_dtype(df[time_col]):
                df[time_col] = pd.to_datetime(df[time_col], errors='coerce')
                
            # Group by time period
            period = params.get('period', 'day')
            if period == 'day':
                grouped = df.groupby(df[time_col].dt.date)[value_col].agg(['count', 'mean'])
            elif period == 'week':
                grouped = df.groupby(pd.Grouper(key=time_col, freq='W'))[value_col].agg(['count', 'mean'])
            elif period == 'month':
                grouped = df.groupby(pd.Grouper(key=time_col, freq='M'))[value_col].agg(['count', 'mean'])
            else:
                grouped = df.groupby(df[time_col].dt.date)[value_col].agg(['count', 'mean'])
                
            result = {
                "time_series": grouped.reset_index().to_dict(orient='records')
            }
        elif analysis_type == 'distribution':
            # Distribution analysis
            column = params.get('column')
            
            if not column:
                return jsonify({"error": "Column is required"}), 400
                
            if column not in df.columns:
                return jsonify({"error": f"Column '{column}' not found in data"}), 400
                
            # Check if numeric
            if pd.api.types.is_numeric_dtype(df[column]):
                # Numeric column - calculate histogram
                hist, bins = np.histogram(df[column].dropna(), bins=10)
                result = {
                    "type": "numeric",
                    "histogram": hist.tolist(),
                    "bins": bins.tolist(),
                    "mean": df[column].mean(),
                    "median": df[column].median()
                }
            else:
                # Categorical column - calculate value counts
                counts = df[column].value_counts().to_dict()
                result = {
                    "type": "categorical",
                    "counts": counts,
                    "unique_values": len(counts)
                }
        else:
            return jsonify({"error": f"Unknown analysis type: {analysis_type}"}), 400
            
        return jsonify({
            "success": True,
            "result": result
        })
    except Exception as e:
        logger.error(f"Error in dashboard_analyze: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Additional routes for specific dashboards
@bp.route('/call-density/process', methods=['POST'])
def call_density_process():
    """Process data for call density heatmap"""
    try:
        # Get data from session
        df = get_from_session('dashboard_data')
        if df is None:
            return jsonify({"error": "No data available. Please upload a file first."}), 400
            
        # Get parameters
        lat_col = request.json.get('lat_column')
        lon_col = request.json.get('lon_column')
        weight_col = request.json.get('weight_column')
        
        if not lat_col or not lon_col:
            return jsonify({"error": "Latitude and longitude columns are required"}), 400
            
        if lat_col not in df.columns or lon_col not in df.columns:
            return jsonify({"error": "Specified columns not found in data"}), 400
            
        # Extract coordinates
        coordinates = df[[lat_col, lon_col]].copy()
        coordinates.columns = ['lat', 'lng']
        
        # Add weight if specified
        if weight_col and weight_col in df.columns:
            coordinates['weight'] = df[weight_col]
        else:
            coordinates['weight'] = 1
            
        # Clean data
        coordinates = coordinates.dropna()
        
        # Store in session
        save_to_session('call_density_data', coordinates)
        
        return jsonify({
            "success": True,
            "points": len(coordinates),
            "center": {
                "lat": coordinates['lat'].mean(),
                "lng": coordinates['lng'].mean()
            },
            "sample": coordinates.head(5).to_dict(orient='records')
        })
    except Exception as e:
        logger.error(f"Error in call_density_process: {str(e)}")
        return jsonify({"error": str(e)}), 500

@bp.route('/call-density/heatmap', methods=['GET'])
def call_density_heatmap_data():
    """Get heatmap data for call density"""
    try:
        # Get data from session
        coordinates = get_from_session('call_density_data')
        if coordinates is None:
            return jsonify({"error": "No data available. Please process data first."}), 400
            
        # Limit number of points for performance
        max_points = min(10000, len(coordinates))
        if len(coordinates) > max_points:
            coordinates = coordinates.sample(max_points)
            
        # Format for heatmap
        heatmap_data = coordinates.to_dict(orient='records')
        
        return jsonify({
            "success": True,
            "data": heatmap_data
        })
    except Exception as e:
        logger.error(f"Error in call_density_heatmap_data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@bp.route('/quick-stats/upload', methods=['POST'])
def quick_stats_upload():
    """Handle file upload for Quick Stats dashboard"""
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
            df = process_csv_data(file)
        else:
            df = process_excel_data(file)
            
        # Basic validation
        if df.empty:
            return jsonify({"error": "File contains no data"}), 400
            
        # Store in session
        save_to_session('quick_stats_data', df)
        
        # Generate metrics
        metrics = calculate_quick_stats(df)
        
        # Return summary and metrics
        summary = {
            "rows": len(df),
            "columns": list(df.columns),
            "sample": df.head(5).to_dict(orient='records')
        }
        
        return jsonify({
            "success": True,
            "summary": summary,
            "metrics": metrics
        })
    except Exception as e:
        logger.error(f"Error in quick_stats_upload: {str(e)}")
        return jsonify({"error": str(e)}), 500

def calculate_quick_stats(df):
    """Calculate quick stats metrics from DataFrame"""
    try:
        metrics = {}
        
        # Detect incident date column
        date_cols = [col for col in df.columns if 'date' in col.lower() or 'time' in col.lower()]
        if date_cols:
            date_col = date_cols[0]
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            
            # Calculate time-based metrics
            metrics['total_incidents'] = len(df)
            
            # Filter to last 30 days
            thirty_days_ago = datetime.now() - timedelta(days=30)
            recent_df = df[df[date_col] >= thirty_days_ago]
            metrics['incidents_last_30_days'] = len(recent_df)
            
            # Calculate daily average
            metrics['avg_daily_incidents'] = round(len(recent_df) / 30, 2)
            
            # Busiest day
            if not recent_df.empty:
                recent_df['day'] = recent_df[date_col].dt.date
                day_counts = recent_df.groupby('day').size()
                busiest_day = day_counts.idxmax()
                metrics['busiest_day'] = busiest_day.strftime('%Y-%m-%d')
                metrics['busiest_day_count'] = int(day_counts.max())
        
        # Detect incident type column
        type_cols = [col for col in df.columns if 'type' in col.lower() or 'category' in col.lower() or 'nature' in col.lower()]
        if type_cols:
            type_col = type_cols[0]
            
            # Calculate type-based metrics
            type_counts = df[type_col].value_counts()
            if not type_counts.empty:
                metrics['most_common_type'] = type_counts.index[0]
                metrics['most_common_type_count'] = int(type_counts.iloc[0])
                metrics['incident_types'] = type_counts.to_dict()
        
        # Detect location column
        location_cols = [col for col in df.columns if 'location' in col.lower() or 'address' in col.lower()]
        if location_cols:
            location_col = location_cols[0]
            
            # Calculate location-based metrics
            location_counts = df[location_col].value_counts()
            if not location_counts.empty:
                metrics['most_common_location'] = location_counts.index[0]
                metrics['most_common_location_count'] = int(location_counts.iloc[0])
        
        # Detect unit column
        unit_cols = [col for col in df.columns if 'unit' in col.lower() or 'resource' in col.lower() or 'apparatus' in col.lower()]
        if unit_cols:
            unit_col = unit_cols[0]
            
            # Calculate unit-based metrics
            if df[unit_col].dtype == object:  # String-like data
                # This may be a comma-separated list
                if any(df[unit_col].str.contains(',', na=False)):
                    # Split and count
                    all_units = []
                    for units in df[unit_col].dropna():
                        all_units.extend([u.strip() for u in units.split(',')])
                    
                    unit_counts = pd.Series(all_units).value_counts()
                else:
                    unit_counts = df[unit_col].value_counts()
                    
                if not unit_counts.empty:
                    metrics['most_active_unit'] = unit_counts.index[0]
                    metrics['most_active_unit_count'] = int(unit_counts.iloc[0])
        
        return metrics
    except Exception as e:
        logger.error(f"Error calculating quick stats: {str(e)}")
        return {"error": str(e)}

@bp.route('/quick-stats/sample', methods=['GET'])
def quick_stats_sample():
    """Generate sample data for Quick Stats dashboard"""
    try:
        # Create a sample dataset
        num_incidents = 500
        
        # Generate dates over the last 60 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=60)
        dates = [start_date + timedelta(days=x) for x in np.random.rand(num_incidents) * 60]
        
        # Generate incident types
        incident_types = [
            'Medical Emergency', 'Structure Fire', 'Traffic Accident', 'Hazardous Materials',
            'Rescue', 'Public Service', 'False Alarm', 'Mutual Aid', 'Brush Fire'
        ]
        type_weights = [0.55, 0.05, 0.15, 0.03, 0.05, 0.08, 0.05, 0.02, 0.02]  # Realistic weights
        types = np.random.choice(incident_types, num_incidents, p=type_weights)
        
        # Generate locations
        locations = [
            'Main St & 1st Ave', '2nd St & Oak Ave', 'Cedar Rd', 'Pine St', 'Elm St & 5th Ave',
            'Washington Blvd', 'Lincoln Ave', 'Jefferson St', 'Highland Dr', 'Lakeview Rd'
        ]
        locations = np.random.choice(locations, num_incidents)
        
        # Generate units
        units = ['E1', 'E2', 'E3', 'L1', 'M1', 'M2', 'B1', 'R1', 'HM1']
        
        # Some incidents have multiple units
        def assign_units():
            num_units = np.random.choice([1, 2, 3, 4], p=[0.5, 0.3, 0.15, 0.05])
            return ', '.join(np.random.choice(units, num_units, replace=False))
        
        assigned_units = [assign_units() for _ in range(num_incidents)]
        
        # Generate priority
        priorities = [1, 2, 3]
        priority_weights = [0.2, 0.5, 0.3]
        priorities = np.random.choice(priorities, num_incidents, p=priority_weights)
        
        # Generate response times (in minutes)
        response_times = np.random.gamma(shape=2.0, scale=2.5, size=num_incidents)
        
        # Create DataFrame
        df = pd.DataFrame({
            'incident_number': [f'INC-{2023}-{i+1:05d}' for i in range(num_incidents)],
            'incident_date': dates,
            'incident_type': types,
            'location': locations,
            'units': assigned_units,
            'priority': priorities,
            'response_time': response_times
        })
        
        # Sort by date
        df = df.sort_values('incident_date')
        
        # Store in session
        save_to_session('quick_stats_data', df)
        
        # Generate metrics
        metrics = calculate_quick_stats(df)
        
        # Return sample data and metrics
        return jsonify({
            "success": True,
            "sample": df.head(10).to_dict(orient='records'),
            "metrics": metrics
        })
    except Exception as e:
        logger.error(f"Error in quick_stats_sample: {str(e)}")
        return jsonify({"error": str(e)}), 500