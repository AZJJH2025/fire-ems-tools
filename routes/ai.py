"""
AI Routes for Fire EMS Tools
Provides API endpoints for AI-powered analysis with proper error handling
"""
import logging
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
import sys
import os

# Setup logger first
logger = logging.getLogger(__name__)

# Add services directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services'))

try:
    from ai_service import ai_service
    import_error = None
    logger.info("✅ AI service imported successfully")
except ImportError as e:
    import_error = str(e)
    logger.error(f"❌ AI service import failed: {e}")
    # Create a dummy service if import fails
    class DummyAIService:
        def is_enabled(self):
            return False
        def analyze_compliance(self, data, query=None):
            return {
                "success": False,
                "error": f"AI service import failed: {import_error}",
                "source": "import_error"
            }
        def get_service_status(self):
            return {
                "enabled": False, 
                "status": "import_failed",
                "error": import_error,
                "has_openai_in_requirements": "openai==1.97.0" in str(open("../requirements.txt", "r").read()) if os.path.exists("../requirements.txt") else "unknown"
            }
    
    ai_service = DummyAIService()
except Exception as e:
    import_error = str(e)
    logger.error(f"❌ AI service other error: {e}")
    # Create a dummy service if import fails
    class DummyAIService:
        def is_enabled(self):
            return False
        def analyze_compliance(self, data, query=None):
            return {
                "success": False,
                "error": f"AI service error: {import_error}",
                "source": "other_error"
            }
        def get_service_status(self):
            return {
                "enabled": False, 
                "status": "other_error",
                "error": import_error
            }
    
    ai_service = DummyAIService()

# Create blueprint
bp = Blueprint('ai', __name__, url_prefix='/ai')

@bp.route('/debug', methods=['GET'])
def ai_debug():
    """Debug endpoint - no auth required for troubleshooting"""
    import sys
    try:
        status = ai_service.get_service_status()
        
        # Test actual OpenAI API call to get real error
        openai_test_result = None
        openai_test_error = None
        
        if status.get('enabled') and status.get('has_api_key'):
            try:
                # Try a minimal API call to test connectivity
                test_result = ai_service.analyze_compliance(
                    "Test fire department with 100 incidents, average 5 minute response time",
                    "Brief test analysis"
                )
                openai_test_result = {
                    "success": test_result.get('success'),
                    "source": test_result.get('source'),
                    "model": test_result.get('model'),
                    "has_insight": bool(test_result.get('insight'))
                }
                if not test_result.get('success'):
                    openai_test_error = test_result.get('error', 'Unknown API error')
            except Exception as e:
                openai_test_error = f"OpenAI API test failed: {str(e)}"
        
        return jsonify({
            "success": True,
            "ai_service_status": status,
            "import_error": import_error,
            "python_path": sys.path[:5],  # First 5 entries
            "openai_api_key_configured": bool(os.getenv('OPENAI_API_KEY')),
            "services_dir_exists": os.path.exists(os.path.join(os.path.dirname(__file__), '..', 'services')),
            "ai_service_file_exists": os.path.exists(os.path.join(os.path.dirname(__file__), '..', 'services', 'ai_service.py')),
            "openai_test_result": openai_test_result,
            "openai_test_error": openai_test_error
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "import_error": import_error if 'import_error' in globals() else None
        }), 500

@bp.route('/status', methods=['GET'])
@login_required
def ai_status():
    """Get AI service status"""
    try:
        status = ai_service.get_service_status()
        return jsonify({
            "success": True,
            "status": status
        })
    except Exception as e:
        logger.error(f"Error getting AI status: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Failed to get AI status"
        }), 500

@bp.route('/api/analyze', methods=['POST'])
@login_required
def analyze_data():
    """
    Analyze CAD data with AI
    
    Expected JSON payload:
    {
        "data_summary": "Response time data: avg 5.2 minutes, 150 incidents last month...",
        "query": "Show NFPA 1710 compliance gaps" (optional)
    }
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                "success": False,
                "error": "Request must be JSON"
            }), 400
        
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('data_summary'):
            return jsonify({
                "success": False,
                "error": "data_summary is required"
            }), 400
        
        data_summary = data['data_summary']
        query = data.get('query')
        
        # Validate data_summary length
        if len(data_summary) > 10000:  # 10KB limit
            return jsonify({
                "success": False,
                "error": "data_summary too large (max 10KB)"
            }), 400
        
        # Log the request (without sensitive data)
        logger.info(f"AI analysis requested by user {current_user.id} ({current_user.email})")
        logger.debug(f"Data summary length: {len(data_summary)} characters")
        
        # Perform analysis
        result = ai_service.analyze_compliance(data_summary, query)
        
        # Add user context to response
        result['user'] = {
            'id': current_user.id,
            'department': current_user.department.name if current_user.department else None
        }
        
        # Log the result
        logger.info(f"AI analysis completed. Source: {result.get('source', 'unknown')}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in AI analysis: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Analysis failed",
            "details": str(e) if os.getenv('FLASK_ENV') == 'development' else None
        }), 500

@bp.route('/api/compliance-check', methods=['POST'])
@login_required
def compliance_check():
    """
    Quick compliance check with predefined analysis
    
    Expected JSON payload:
    {
        "incident_count": 150,
        "avg_response_time": 5.2,
        "dispatch_time_90th": 45,
        "turnout_time_90th": 70,
        "total_response_90th": 480
    }
    """
    try:
        if not request.is_json:
            return jsonify({
                "success": False,
                "error": "Request must be JSON"
            }), 400
        
        data = request.get_json()
        
        # Build summary from structured data
        summary_parts = []
        
        if 'incident_count' in data:
            summary_parts.append(f"Total incidents: {data['incident_count']}")
        
        if 'avg_response_time' in data:
            summary_parts.append(f"Average response time: {data['avg_response_time']} minutes")
        
        if 'dispatch_time_90th' in data:
            summary_parts.append(f"90th percentile dispatch time: {data['dispatch_time_90th']} seconds")
        
        if 'turnout_time_90th' in data:
            summary_parts.append(f"90th percentile turnout time: {data['turnout_time_90th']} seconds")
        
        if 'total_response_90th' in data:
            summary_parts.append(f"90th percentile total response: {data['total_response_90th']} seconds")
        
        if not summary_parts:
            return jsonify({
                "success": False,
                "error": "No valid metrics provided"
            }), 400
        
        data_summary = "Fire department performance metrics: " + ", ".join(summary_parts)
        
        # Perform compliance-focused analysis
        result = ai_service.analyze_compliance(
            data_summary, 
            "Analyze NFPA 1710 compliance and provide specific recommendations"
        )
        
        # Add structured compliance scoring if using fallback
        if result.get('source') == 'fallback':
            result['compliance_score'] = _calculate_compliance_score(data)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in compliance check: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Compliance check failed"
        }), 500

def _calculate_compliance_score(metrics: dict) -> dict:
    """
    Calculate basic NFPA 1710 compliance score from metrics
    This is a fallback function when AI is not available
    """
    score = 100
    issues = []
    
    # Check dispatch time (should be ≤60 seconds)
    if 'dispatch_time_90th' in metrics:
        if metrics['dispatch_time_90th'] > 60:
            score -= 20
            issues.append("Dispatch time exceeds 60 seconds")
    
    # Check turnout time (should be ≤80 seconds)
    if 'turnout_time_90th' in metrics:
        if metrics['turnout_time_90th'] > 80:
            score -= 20
            issues.append("Turnout time exceeds 80 seconds")
    
    # Check total response (should be ≤480 seconds for urban/suburban)
    if 'total_response_90th' in metrics:
        if metrics['total_response_90th'] > 480:
            score -= 30
            issues.append("Total response time exceeds 8 minutes")
    
    return {
        "score": max(0, score),
        "issues": issues,
        "compliant": score >= 80
    }

@bp.route('/api/chat', methods=['POST'])
@login_required
def ai_chat():
    """
    AI Chat endpoint for Fire EMS Tools assistant
    
    Expected JSON payload:
    {
        "message": "How do I improve field mapping?",
        "context": "data-formatter" (optional),
        "documentation_context": "Data Formatter Guide Context...",
        "conversation_history": "Recent conversation...",
        "system_prompt": "You are a helpful assistant..."
    }
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                "success": False,
                "error": "Request must be JSON"
            }), 400
        
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('message'):
            return jsonify({
                "success": False,
                "error": "message is required"
            }), 400
        
        user_message = data['message'].strip()
        context = data.get('context', 'general')
        documentation_context = data.get('documentation_context', '')
        conversation_history = data.get('conversation_history', '')
        system_prompt = data.get('system_prompt', '')
        
        # Validate message length
        if len(user_message) > 1000:  # 1KB limit for chat messages
            return jsonify({
                "success": False,
                "error": "Message too long (max 1KB)"
            }), 400
        
        # Build enhanced query for AI service
        enhanced_query = f"""Context: {context}
System Prompt: {system_prompt}

Documentation Context:
{documentation_context}

Conversation History:
{conversation_history}

User Question: {user_message}

Please provide a helpful response based on the context and documentation."""
        
        # Log the request (without sensitive data)
        logger.info(f"AI chat requested by user {current_user.id} ({current_user.email}) for context: {context}")
        logger.debug(f"Chat message length: {len(user_message)} characters")
        
        # Use existing analyze_compliance method with chat-specific query
        result = ai_service.analyze_compliance(enhanced_query, user_message)
        
        # Transform result for chat response format
        chat_response = {
            "success": result.get('success', False),
            "response": result.get('insight', 'I apologize, but I\'m having trouble responding right now. Please check our user guides for detailed assistance.'),
            "suggestions": _extract_suggestions_from_insight(result.get('insight', '')),
            "documentation_links": _extract_doc_links_for_context(context),
            "user": {
                'id': current_user.id,
                'department': current_user.department.name if current_user.department else None
            },
            "source": result.get('source', 'unknown')
        }
        
        # Log the result
        logger.info(f"AI chat completed. Source: {result.get('source', 'unknown')}")
        
        return jsonify(chat_response)
        
    except Exception as e:
        logger.error(f"Error in AI chat: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Chat failed",
            "response": "I'm having trouble responding right now. Please check our user guides for assistance, or try asking again in a moment.",
            "details": str(e) if os.getenv('FLASK_ENV') == 'development' else None
        }), 500

def _extract_suggestions_from_insight(insight: str) -> list:
    """Extract suggested follow-up questions from AI insight"""
    if not insight:
        return []
    
    # Simple extraction of questions from AI response
    suggestions = []
    lines = insight.split('\n')
    
    for line in lines:
        line = line.strip()
        if line.endswith('?') and len(line) < 100:
            suggestions.append(line)
        elif 'suggest' in line.lower() or 'recommend' in line.lower():
            # Extract suggestion text
            if ':' in line:
                suggestion_text = line.split(':', 1)[1].strip()
                if suggestion_text and len(suggestion_text) < 100:
                    suggestions.append(suggestion_text)
    
    # Limit to 3 suggestions
    return suggestions[:3]

def _extract_doc_links_for_context(context: str) -> list:
    """Generate relevant documentation links based on context"""
    doc_links = {
        'data-formatter': [
            {
                "title": "Data Formatter User Guide",
                "url": "/docs/users/DATA_FORMATTER.md",
                "section": "Complete Guide"
            }
        ],
        'response-time-analyzer': [
            {
                "title": "Response Time Analyzer Guide",
                "url": "/docs/users/RESPONSE_TIME_ANALYZER.md",
                "section": "NFPA 1710 Analysis"
            }
        ],
        'fire-map-pro': [
            {
                "title": "Fire Map Pro User Guide",
                "url": "/docs/users/FIRE_MAP_PRO.md",
                "section": "Mapping and Analysis"
            }
        ],
        'water-supply-coverage': [
            {
                "title": "Water Supply Coverage Guide",
                "url": "/docs/users/WATER_SUPPLY_COVERAGE.md",
                "section": "Tank and Hydrant Analysis"
            }
        ],
        'iso-credit-calculator': [
            {
                "title": "ISO Credit Calculator Guide",
                "url": "/docs/users/ISO_CREDIT_CALCULATOR.md",
                "section": "ISO Rating Improvement"
            }
        ],
        'station-coverage-optimizer': [
            {
                "title": "Station Coverage Optimizer Guide",
                "url": "/docs/users/STATION_COVERAGE_OPTIMIZER.md",
                "section": "Station Placement Analysis"
            }
        ]
    }
    
    return doc_links.get(context, [
        {
            "title": "Documentation Hub",
            "url": "/docs/users/DOCUMENTATION_HUB.md",
            "section": "All User Guides"
        }
    ])

# Error handlers for this blueprint
@bp.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit errors"""
    return jsonify({
        "success": False,
        "error": "Rate limit exceeded. Please try again later."
    }), 429

@bp.errorhandler(500)
def internal_error(e):
    """Handle internal server errors"""
    logger.error(f"Internal error in AI blueprint: {str(e)}")
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500