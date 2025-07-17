"""
Main routes for Fire EMS Tools
All legacy template routes removed after cleanup - use React app at /app/* instead
"""

import logging
import os
import time
import psutil
from flask import Blueprint, redirect, jsonify
from database import db, User, Department

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('main', __name__)

@bp.route("/")
def index():
    """Home page route - serve React app directly"""
    from flask import current_app
    from routes.react_app import get_react_build_dir
    import os
    
    try:
        react_build_dir = get_react_build_dir()
        index_path = os.path.join(react_build_dir, 'index.html')
        
        if os.path.exists(index_path):
            # Read the HTML and fix asset paths
            with open(index_path, 'r') as f:
                html_content = f.read()
            
            # For root route, assets should be available at /app/assets/
            html_content = html_content.replace('src="/assets/', 'src="/app/assets/')
            html_content = html_content.replace('href="/assets/', 'href="/app/assets/')
            
            from flask import Response
            return Response(html_content, mimetype='text/html')
        else:
            # Fallback to redirect if React build not found
            return redirect('/app/')
    except Exception as e:
        # Fallback to redirect on any error
        return redirect('/app/')

@bp.route("/api/health")
def health_check():
    """Health check endpoint for monitoring and load balancers"""
    start_time = time.time()
    
    try:
        # Test database connectivity
        db_status = "healthy"
        db_response_time = None
        try:
            db_start = time.time()
            user_count = User.query.count()
            dept_count = Department.query.count()
            db_response_time = (time.time() - db_start) * 1000
        except Exception as e:
            db_status = f"unhealthy: {str(e)}"
            logger.error(f"Health check database error: {e}")
        
        # System metrics
        memory_usage = psutil.virtual_memory().percent
        cpu_usage = psutil.cpu_percent(interval=0.1)
        disk_usage = psutil.disk_usage('/').percent
        
        # Calculate total response time
        total_response_time = (time.time() - start_time) * 1000
        
        # Determine overall status
        status = "healthy"
        if db_status != "healthy" or memory_usage > 85 or cpu_usage > 90 or disk_usage > 95:
            status = "degraded"
        
        health_data = {
            "status": status,
            "timestamp": time.time(),
            "version": "production",
            "response_time_ms": round(total_response_time, 2),
            "database": {
                "status": db_status,
                "response_time_ms": round(db_response_time, 2) if db_response_time else None,
                "users": user_count if db_status == "healthy" else None,
                "departments": dept_count if db_status == "healthy" else None
            },
            "system": {
                "memory_usage_percent": memory_usage,
                "cpu_usage_percent": cpu_usage,
                "disk_usage_percent": disk_usage
            }
        }
        
        # Return appropriate HTTP status
        http_status = 200 if status == "healthy" else 503
        return jsonify(health_data), http_status
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "timestamp": time.time(),
            "error": "Health check failed"
        }), 503

@bp.route("/api/docs")
def api_documentation():
    """API documentation endpoint"""
    from flask import current_app
    
    try:
        # Get version from current environment
        version = "1.0.0"
        
        api_docs = {
            "openapi": "3.0.0",
            "info": {
                "title": "FireEMS.ai API",
                "version": version,
                "description": "Fire Emergency Management System API for data processing and analysis",
                "contact": {
                    "name": "FireEMS.ai Support",
                    "url": "https://fireems.ai"
                }
            },
            "servers": [
                {
                    "url": "/api",
                    "description": "API Server"
                }
            ],
            "paths": {
                "/health": {
                    "get": {
                        "summary": "Health Check",
                        "description": "Returns system health status and metrics",
                        "responses": {
                            "200": {
                                "description": "System is healthy",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "status": {"type": "string", "enum": ["healthy", "degraded", "unhealthy"]},
                                                "timestamp": {"type": "number"},
                                                "version": {"type": "string"},
                                                "response_time_ms": {"type": "number"},
                                                "database": {
                                                    "type": "object",
                                                    "properties": {
                                                        "status": {"type": "string"},
                                                        "response_time_ms": {"type": "number"},
                                                        "users": {"type": "integer"},
                                                        "departments": {"type": "integer"}
                                                    }
                                                },
                                                "system": {
                                                    "type": "object",
                                                    "properties": {
                                                        "memory_usage_percent": {"type": "number"},
                                                        "cpu_usage_percent": {"type": "number"},
                                                        "disk_usage_percent": {"type": "number"}
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            "503": {
                                "description": "System is unhealthy or degraded"
                            }
                        }
                    }
                },
                "/docs": {
                    "get": {
                        "summary": "API Documentation",
                        "description": "Returns OpenAPI specification for the API",
                        "responses": {
                            "200": {
                                "description": "API documentation",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/metrics": {
                    "get": {
                        "summary": "Performance Metrics",
                        "description": "Returns application performance metrics for monitoring",
                        "responses": {
                            "200": {
                                "description": "Performance metrics",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "bundle_sizes": {
                                                    "type": "object",
                                                    "properties": {
                                                        "main_bundle_kb": {"type": "number"},
                                                        "total_size_kb": {"type": "number"},
                                                        "chunk_count": {"type": "integer"}
                                                    }
                                                },
                                                "performance": {
                                                    "type": "object",
                                                    "properties": {
                                                        "avg_response_time_ms": {"type": "number"},
                                                        "request_count": {"type": "integer"},
                                                        "error_rate": {"type": "number"}
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "components": {
                "securitySchemes": {
                    "ApiKeyAuth": {
                        "type": "apiKey",
                        "in": "header",
                        "name": "X-API-Key",
                        "description": "API key for department authentication"
                    }
                }
            },
            "security": [
                {
                    "ApiKeyAuth": []
                }
            ]
        }
        
        return jsonify(api_docs), 200
        
    except Exception as e:
        logger.error(f"API documentation error: {e}")
        return jsonify({
            "error": "Failed to generate API documentation",
            "message": str(e)
        }), 500

@bp.route("/api/metrics")
def performance_metrics():
    """Performance metrics endpoint for monitoring"""
    import os
    import glob
    
    try:
        metrics = {
            "bundle_analysis": {
                "status": "available",
                "main_bundle_size_kb": 1331,  # From last build
                "largest_chunks": [
                    {"name": "ResponseTimeAnalyzerContainer", "size_kb": 522},
                    {"name": "xlsx", "size_kb": 430},
                    {"name": "AdminDashboard", "size_kb": 381}
                ],
                "optimization_status": "in_progress"
            },
            "system_performance": {
                "memory_usage_percent": psutil.virtual_memory().percent,
                "cpu_usage_percent": psutil.cpu_percent(interval=0.1),
                "disk_usage_percent": psutil.disk_usage('/').percent
            },
            "application_health": {
                "status": "operational",
                "uptime_hours": "monitoring",
                "active_sessions": "tracking_enabled"
            }
        }
        
        return jsonify(metrics), 200
        
    except Exception as e:
        logger.error(f"Performance metrics error: {e}")
        return jsonify({
            "error": "Failed to generate performance metrics",
            "message": str(e)
        }), 500

# All other legacy routes removed - templates deleted during cleanup
# Use the modern React app at:
# - /app/ (homepage)
# - /app/data-formatter 
# - /app/response-time-analyzer
# - /app/fire-map-pro