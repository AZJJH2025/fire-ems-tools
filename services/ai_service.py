"""
AI Service Layer for Fire EMS Tools
Provides lightweight AI capabilities with proper error handling and fallbacks
"""
import logging
import os
from typing import Dict, Any, Optional, List
import json
import time
from datetime import datetime

logger = logging.getLogger(__name__)

class AIService:
    """
    Lightweight AI service for Fire EMS Tools
    Handles OpenAI API calls with proper error handling and fallbacks
    """
    
    def __init__(self):
        self.enabled = False
        self.client = None
        self.model = "gpt-4o-mini"  # Cost-effective model
        self.max_tokens = 300
        self.temperature = 0.7
        self.rate_limit_delay = 1.0  # Seconds between API calls
        self.last_api_call = 0
        
        # Initialize OpenAI client if API key is available
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize OpenAI client with proper error handling"""
        try:
            api_key = os.getenv('OPENAI_API_KEY')
            
            if not api_key:
                logger.info("OpenAI API key not found. AI features will be disabled.")
                return
            
            # Only import OpenAI if we have an API key
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=api_key)
                self.enabled = True
                logger.info("✅ AI Service initialized successfully")
            except ImportError:
                logger.warning("OpenAI package not installed. AI features disabled.")
                logger.info("To enable AI features, run: pip install openai")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {str(e)}")
                
        except Exception as e:
            logger.error(f"Error initializing AI service: {str(e)}")
    
    def is_enabled(self) -> bool:
        """Check if AI service is enabled and ready"""
        return self.enabled and self.client is not None
    
    def _rate_limit_check(self):
        """Simple rate limiting to avoid API abuse"""
        current_time = time.time()
        if current_time - self.last_api_call < self.rate_limit_delay:
            time.sleep(self.rate_limit_delay)
        self.last_api_call = time.time()
    
    def _sanitize_data(self, data: str) -> str:
        """
        Sanitize CAD data for privacy before sending to AI
        Remove sensitive information while preserving analytical value
        """
        # Basic sanitization - remove potential PII
        sanitized = data
        
        # Remove potential phone numbers
        import re
        sanitized = re.sub(r'\b\d{3}-\d{3}-\d{4}\b', '[PHONE]', sanitized)
        sanitized = re.sub(r'\b\d{10}\b', '[PHONE]', sanitized)
        
        # Remove potential addresses (basic pattern)
        sanitized = re.sub(r'\b\d+\s+\w+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Way|Circle|Cir|Court|Ct|Place|Pl)\b', 
                          '[ADDRESS]', sanitized, flags=re.IGNORECASE)
        
        # Truncate if too long to control costs
        max_length = 2000
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length] + "... [truncated]"
        
        return sanitized
    
    def analyze_compliance(self, data_summary: str, query: str = None) -> Dict[str, Any]:
        """
        Analyze CAD data for NFPA 1710 compliance and insights
        
        Args:
            data_summary: Summary of CAD data
            query: Optional specific query from user
            
        Returns:
            Dictionary with analysis results and metadata
        """
        if not self.is_enabled():
            return self._fallback_compliance_analysis(data_summary)
        
        try:
            # Rate limiting
            self._rate_limit_check()
            
            # Sanitize data
            sanitized_data = self._sanitize_data(data_summary)
            
            # Build query
            if query:
                user_message = f"CAD data summary: {sanitized_data}\n\nSpecific query: {query}"
            else:
                user_message = f"CAD data summary: {sanitized_data}\n\nPlease analyze for NFPA 1710 compliance gaps and improvement opportunities."
            
            # Make API call
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": """You are a fire department compliance expert specializing in NFPA 1710 standards. 
                        Focus on:
                        - Response time performance (dispatch <60s, turnout <80s, total <8min)
                        - Staffing adequacy and deployment
                        - Coverage gaps and improvement opportunities
                        - ISO rating considerations
                        
                        Provide specific, actionable recommendations. Keep responses concise and professional."""
                    },
                    {
                        "role": "user", 
                        "content": user_message
                    }
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            # Extract response
            insight = response.choices[0].message.content
            
            # Log usage for monitoring
            logger.info(f"AI analysis completed. Tokens used: ~{len(user_message) + len(insight)}")
            
            return {
                "success": True,
                "insight": insight,
                "source": "ai",
                "model": self.model,
                "timestamp": datetime.utcnow().isoformat(),
                "sanitized": True
            }
            
        except Exception as e:
            logger.error(f"AI analysis failed: {str(e)}")
            # Fall back to rule-based analysis
            return self._fallback_compliance_analysis(data_summary)
    
    def _fallback_compliance_analysis(self, data_summary: str) -> Dict[str, Any]:
        """
        Rule-based fallback analysis when AI is unavailable
        Provides basic insights without external API calls
        """
        logger.info("Using fallback compliance analysis")
        
        # Basic pattern matching for common compliance issues
        insights = []
        
        # Check for response time mentions
        if "response time" in data_summary.lower():
            insights.append("• Review response time data for NFPA 1710 compliance")
        
        # Check for incident volume
        if any(word in data_summary.lower() for word in ["incident", "call", "emergency"]):
            insights.append("• Analyze incident patterns for resource deployment optimization")
        
        # Check for geographic data
        if any(word in data_summary.lower() for word in ["station", "location", "address"]):
            insights.append("• Consider coverage analysis for service area optimization")
        
        # Default insights if nothing specific found
        if not insights:
            insights = [
                "• Review data for NFPA 1710 compliance gaps",
                "• Analyze response time performance trends",
                "• Consider staffing adequacy assessment"
            ]
        
        fallback_insight = "**Automated Analysis** (AI unavailable):\n\n" + "\n".join(insights)
        fallback_insight += "\n\n*For detailed AI-powered insights, ensure OpenAI API key is configured.*"
        
        return {
            "success": True,
            "insight": fallback_insight,
            "source": "fallback",
            "model": "rule-based",
            "timestamp": datetime.utcnow().isoformat(),
            "sanitized": False
        }
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get current service status for monitoring"""
        return {
            "enabled": self.enabled,
            "model": self.model if self.enabled else None,
            "max_tokens": self.max_tokens,
            "has_api_key": bool(os.getenv('OPENAI_API_KEY')),
            "status": "ready" if self.enabled else "disabled"
        }

# Global service instance
ai_service = AIService()