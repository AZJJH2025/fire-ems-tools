# Tool routes for the FireEMS tools
# This file should be imported in the Flask app.py or tools.py file

def register_tool_routes(app):
    """
    Registers routes for tool integration in the Flask app
    
    Args:
        app: The Flask application object
    """
    from flask import request, jsonify, session, redirect

    @app.route('/tools-api/send-to-tool', methods=['POST'])
    def send_to_tool():
        """API endpoint to send data from one tool to another"""
        try:
            data = request.json
            if not data or 'toolId' not in data or 'data' not in data:
                return jsonify({'status': 'error', 'message': 'Invalid data format'}), 400
            
            # Store the data in the session
            session['tool_data'] = {
                'toolId': data['toolId'],
                'data': data['data'],
                'sourceFile': data.get('sourceFile'),
                'timestamp': data.get('timestamp', 0)
            }
            
            # Return success
            return jsonify({
                'status': 'success',
                'message': f'Data sent to {data["toolId"]} successfully',
                'redirect': f'/{data["toolId"]}'
            })
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
    
    @app.route('/tools-api/data-formatter/send-to-tool', methods=['POST'])
    def data_formatter_send_to_tool():
        """Legacy endpoint for sending data from the data formatter to other tools"""
        try:
            data = request.json
            if not data or 'toolId' not in data or 'data' not in data:
                return jsonify({'status': 'error', 'message': 'Invalid data format'}), 400
            
            # Map tool IDs to routes
            tool_routes = {
                'response-time-analyzer': '/response-time-analyzer',
                'call-density-heatmap': '/call-density-heatmap',
                'incident-dashboard': '/incident-dashboard',
                'trend-analyzer': '/trend-analyzer'
            }
            
            # Store the data in the session
            session['tool_data'] = {
                'toolId': data['toolId'],
                'data': data['data'],
                'sourceFile': data.get('sourceFile'),
                'timestamp': data.get('timestamp', 0)
            }
            
            # Get the route for the tool
            tool_route = tool_routes.get(data['toolId'])
            if not tool_route:
                return jsonify({'status': 'error', 'message': f'Unknown tool: {data["toolId"]}'}), 400
            
            # Return success with redirection info
            return jsonify({
                'status': 'success',
                'message': f'Data sent to {data["toolId"]} successfully',
                'redirect': tool_route
            })
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
    
    @app.route('/tools-api/get-tool-data', methods=['GET'])
    def get_tool_data():
        """API endpoint to get data sent to a tool"""
        tool_id = request.args.get('toolId')
        if not tool_id:
            return jsonify({'status': 'error', 'message': 'Tool ID is required'}), 400
        
        # Get the data from the session
        tool_data = session.get('tool_data')
        if not tool_data or tool_data.get('toolId') != tool_id:
            return jsonify({'status': 'error', 'message': 'No data available for this tool'}), 404
        
        return jsonify({
            'status': 'success',
            'data': tool_data
        })