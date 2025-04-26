from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Minimal Flask App</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                background-color: #f0f0f0;
            }
            h1 { color: #4a89dc; }
            .container {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 600px;
                margin: 0 auto;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello from Minimal Flask App!</h1>
            <p>If you can see this page with styling (blue heading, white box with shadow on a light gray background), 
            then the minimal Flask app is working correctly.</p>
            <p>Time to check for issues with the main application.</p>
        </div>
    </body>
    </html>
    """

if __name__ == '__main__':
    print("Starting minimal Flask app on http://localhost:3333")
    app.run(host='0.0.0.0', port=3333, debug=True)