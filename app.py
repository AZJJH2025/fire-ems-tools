from flask import Flask, render_template, redirect, url_for, send_from_directory
import os

app = Flask(__name__)

# Home page route for the tool collection
@app.route("/")
def home():
    """Serve the home page with the tool collection."""
    return render_template("index.html")

# Dashboard route for the Fire/EMS tool
@app.route("/fire-ems-dashboard")
def fire_ems_dashboard():
    """Serve the Fire/EMS Dashboard tool."""
    return render_template("fire-ems-dashboard.html")

# Isochrone Map Generator
@app.route("/isochrone-map")
def isochrone_map():
    """Serve the Isochrone Map Generator tool"""
    return render_template("isochrone-map.html")

# Call Density Heatmap
@app.route('/call-density-heatmap')
def call_density_heatmap():
    """Serve the Call Density Heatmap tool"""
    return render_template('call-density-heatmap.html')

# Incident Logger routes
@app.route('/incident-logger')
def incident_logger():
    """Serve the Incident Logger tool"""
    return render_template('incident-logger.html')

# Simple test routes
@app.route('/simple-test')
def simple_test():
    """Serve a simple test page"""
    return send_from_directory('static', 'simple-test.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)), debug=True)