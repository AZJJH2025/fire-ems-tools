"""
AI Routes for Fire EMS Tools
Provides API endpoints for AI-powered analysis with proper error handling
"""
import logging
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
import sys
import os

# Add services directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services'))

try:
    from ai_service import ai_service
except ImportError:
    # Create a dummy service if import fails
    class DummyAIService:
        def is_enabled(self):
            return False
        def analyze_compliance(self, data, query=None):
            return {
                "success": False,
                "error": "AI service not available",
                "source": "error"
            }
        def get_service_status(self):
            return {"enabled": False, "status": "service_not_available"}
    
    ai_service = DummyAIService()

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('ai', __name__, url_prefix='/ai')

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