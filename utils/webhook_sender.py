"""
Webhook sender module for Fire-EMS platform.
Handles webhook delivery with signing, retries, and error handling.
"""

import json
import hmac
import hashlib
import requests
import logging
import time
from datetime import datetime
from threading import Thread
from requests.exceptions import RequestException

logger = logging.getLogger(__name__)

class WebhookDeliveryError(Exception):
    """Exception raised when webhook delivery fails after all retries."""
    pass

def generate_signature(payload, secret):
    """
    Generate HMAC signature for webhook payload.
    
    Args:
        payload (dict): The webhook payload
        secret (str): The webhook secret
        
    Returns:
        str: The HMAC signature
    """
    payload_str = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        key=secret.encode(),
        msg=payload_str.encode(),
        digestmod=hashlib.sha256
    ).hexdigest()
    return signature

def create_webhook_payload(event_type, resource_type, resource_id, data, department_id):
    """
    Create a standardized webhook payload.
    
    Args:
        event_type (str): Type of event (created, updated, etc.)
        resource_type (str): Type of resource (incident, station, etc.)
        resource_id (int): ID of the resource
        data (dict): The resource data
        department_id (int): The department ID
        
    Returns:
        dict: The webhook payload
    """
    return {
        "event": f"{resource_type}.{event_type}",
        "timestamp": datetime.utcnow().isoformat(),
        "resource_type": resource_type,
        "resource_id": resource_id,
        "department_id": department_id,
        "data": data
    }

def send_webhook(url, payload, secret, max_retries=3, retry_delay=5):
    """
    Send webhook with retries.
    
    Args:
        url (str): The webhook URL
        payload (dict): The webhook payload
        secret (str): The webhook secret for signing
        max_retries (int): Maximum number of retry attempts
        retry_delay (int): Delay between retries in seconds
        
    Returns:
        bool: True if successful, False otherwise
        
    Raises:
        WebhookDeliveryError: If delivery fails after all retries
    """
    if not url:
        logger.error("Webhook URL is missing")
        raise WebhookDeliveryError("Webhook URL is missing")
    
    # Sign the payload
    signature = generate_signature(payload, secret)
    headers = {
        'Content-Type': 'application/json',
        'X-FireEMS-Signature': signature,
        'X-FireEMS-Event': payload.get('event')
    }
    
    # Try to send with retries
    for attempt in range(max_retries):
        try:
            logger.debug(f"Sending webhook to {url} (attempt {attempt+1}/{max_retries})")
            response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=10
            )
            
            # Check for success
            if 200 <= response.status_code < 300:
                logger.info(f"Webhook delivered successfully to {url}")
                return True
            
            logger.warning(f"Webhook delivery failed: HTTP {response.status_code} - {response.text}")
            
        except RequestException as e:
            logger.warning(f"Webhook delivery error: {str(e)}")
        
        # Don't sleep on the last attempt
        if attempt < max_retries - 1:
            time.sleep(retry_delay)
    
    error_msg = f"Webhook delivery failed after {max_retries} attempts"
    logger.error(error_msg)
    raise WebhookDeliveryError(error_msg)

def deliver_webhook_async(department, event_type, resource_type, resource_id, data):
    """
    Deliver webhook asynchronously in a separate thread.
    
    Args:
        department: The department model instance
        event_type (str): Type of event (created, updated, etc.)
        resource_type (str): Type of resource (incident, station, etc.)
        resource_id (int): ID of the resource
        data (dict): The resource data
    """
    # Check if webhooks are enabled and configured
    if not department.webhooks_enabled or not department.webhook_url:
        return
    
    # Check if this event type is enabled
    event_key = f"{resource_type}.{event_type}"
    if not department.webhook_events.get(event_key, False):
        logger.debug(f"Webhook for event {event_key} is not enabled for department {department.id}")
        return
    
    # Create payload
    payload = create_webhook_payload(
        event_type=event_type,
        resource_type=resource_type,
        resource_id=resource_id,
        data=data,
        department_id=department.id
    )
    
    # Start a thread to deliver the webhook
    Thread(
        target=_webhook_delivery_thread,
        args=(department, payload),
        daemon=True
    ).start()

def _webhook_delivery_thread(department, payload):
    """
    Thread function to handle webhook delivery and update department status.
    
    Args:
        department: The department model instance
        payload (dict): The webhook payload
    """
    from database import db
    
    try:
        # Deliver the webhook
        send_webhook(
            url=department.webhook_url,
            payload=payload,
            secret=department.webhook_secret
        )
        
        # Update last success
        department.update_webhook_success()
        db.session.commit()
        
    except WebhookDeliveryError as e:
        # Update last error
        department.update_webhook_error(str(e))
        db.session.commit()
        
    except Exception as e:
        # Catch any other exceptions to avoid crashing the thread
        logger.error(f"Unexpected error in webhook delivery thread: {str(e)}")
        try:
            department.update_webhook_error(f"Unexpected error: {str(e)}")
            db.session.commit()
        except:
            pass