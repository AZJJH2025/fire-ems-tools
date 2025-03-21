from flask import Flask, request, jsonify, render_template
import pandas as pd
import os

app = Flask(__name__)

# Allowed file extensions
def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'csv', 'xls', 'xlsx'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        print("🚨 No file found in request!")
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        print("🚨 No file selected!")
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        try:
            # Read the file (either CSV or Excel)
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file)
            else:  # Excel file
                df = pd.read_excel(file)
            
            # Extract necessary details
            num_rows = len(df)
            columns = df.columns.tolist()
            rows = df.head(5).to_dict(orient='records')  # Convert first 5 rows to JSON

            # First reported date (Check if 'Reported' column exists)
            first_reported_date = None
            if 'Reported' in df.columns:
                first_reported_date = df['Reported'].dropna().min()
                if pd.notna(first_reported_date):
                    first_reported_date = first_reported_date.strftime('%Y-%m-%d')

            return jsonify({
                'message': 'File uploaded and analyzed successfully',
                'filename': file.filename,
                'num_rows': num_rows,
                'columns': columns,
                'rows': rows,  
                'first_reported_date': first_reported_date
            })
            
        except Exception as e:
            print(f"🚨 Error Processing File: {e}")
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'File type not allowed'}), 400

if __name__ == '__main__':
    app.run(debug=True)
