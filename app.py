from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import pandas as pd
from werkzeug.utils import secure_filename

# Flask Setup
app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

UPLOAD_FOLDER = "upload"
ALLOWED_EXTENSIONS = {"csv", "xls", "xlsx"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/api/upload", methods=["POST"])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        try:
            # Read file using pandas
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file)
            else:  
                df = pd.read_excel(file)

            # Extract number of rows and column names
            num_rows = len(df)
            columns = df.columns.tolist()

            # Convert DataFrame to list of dicts (row-wise)
            rows = df.to_dict(orient="records")

            # Extract first reported date (if exists)
            first_reported_date = None
            if 'Reported' in df.columns:
                first_reported_date = df['Reported'].dropna().min()
                if pd.notna(first_reported_date):
                    first_reported_date = first_reported_date.strftime('%Y-%m-%d')

            return jsonify({
                'message': 'File uploaded and analyzed successfully',
                'filename': file.filename,
                'rows': rows,  # Returning `rows` instead of `data`
                'columns': columns,
                'first_reported_date': first_reported_date
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
            
    return jsonify({'error': 'File type not allowed'}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
