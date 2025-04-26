from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/')
def index():
    return send_from_directory('static', 'pure-html-test.html')

if __name__ == "__main__":
    print("Starting simple static file server on http://localhost:9000")
    app.run(host="0.0.0.0", port=9000, debug=True)