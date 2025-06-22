"""
Notification routes for Fire EMS Tools
Provides API endpoints for admin notification management
"""

import logging
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from database import db, Notification, User
from datetime import datetime

# Setup logger
logger = logging.getLogger(__name__)

# Create blueprint
bp = Blueprint('notifications', __name__, url_prefix='/notifications')

def require_admin(f):
    """Decorator to require admin or super_admin role"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentication required'}), 401
        if not (current_user.is_admin() or current_user.is_super_admin()):
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@bp.route('/api/notifications', methods=['GET'])
@login_required
@require_admin
def get_notifications():
    """Get notifications for current admin user"""
    try:
        # Get query parameters
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        # Build query for current user's notifications
        query = Notification.query.filter_by(user_id=current_user.id)
        
        # Filter by read status if requested
        if unread_only:
            query = query.filter_by(is_read=False)
        
        # Order by created_at desc and paginate
        notifications = query.order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()
        
        # Get counts
        total_count = Notification.query.filter_by(user_id=current_user.id).count()
        unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
        
        notifications_data = [notification.to_dict() for notification in notifications]
        
        return jsonify({
            'success': True,
            'notifications': notifications_data,
            'total_count': total_count,
            'unread_count': unread_count,
            'has_more': (offset + limit) < total_count
        })
        
    except Exception as e:
        logger.error(f"Error fetching notifications: {str(e)}")
        return jsonify({'error': 'Failed to fetch notifications'}), 500

@bp.route('/api/notifications/<int:notification_id>/read', methods=['POST'])
@login_required
@require_admin
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        notification = Notification.query.get(notification_id)
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        # Verify the notification belongs to the current user
        if notification.user_id != current_user.id:
            return jsonify({'error': 'Permission denied'}), 403
        
        notification.is_read = True
        db.session.commit()
        
        logger.info(f"Notification {notification_id} marked as read by user {current_user.email}")
        
        return jsonify({
            'success': True,
            'message': 'Notification marked as read',
            'notification': notification.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error marking notification as read: {str(e)}")
        return jsonify({'error': 'Failed to mark notification as read'}), 500

@bp.route('/api/notifications/mark-all-read', methods=['POST'])
@login_required
@require_admin
def mark_all_notifications_read():
    """Mark all notifications as read for current user"""
    try:
        updated_count = Notification.query.filter_by(
            user_id=current_user.id,
            is_read=False
        ).update({'is_read': True})
        
        db.session.commit()
        
        logger.info(f"Marked {updated_count} notifications as read for user {current_user.email}")
        
        return jsonify({
            'success': True,
            'message': f'Marked {updated_count} notifications as read',
            'updated_count': updated_count
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error marking all notifications as read: {str(e)}")
        return jsonify({'error': 'Failed to mark notifications as read'}), 500

@bp.route('/api/notifications/<int:notification_id>', methods=['DELETE'])
@login_required
@require_admin
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        notification = Notification.query.get(notification_id)
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        # Verify the notification belongs to the current user
        if notification.user_id != current_user.id:
            return jsonify({'error': 'Permission denied'}), 403
        
        notification_title = notification.title
        db.session.delete(notification)
        db.session.commit()
        
        logger.info(f"Notification '{notification_title}' deleted by user {current_user.email}")
        
        return jsonify({
            'success': True,
            'message': 'Notification deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting notification: {str(e)}")
        return jsonify({'error': 'Failed to delete notification'}), 500

@bp.route('/api/notifications/test', methods=['POST'])
@login_required
@require_admin
def create_test_notification():
    """Create a test notification (for development/testing)"""
    try:
        data = request.get_json()
        
        notification = Notification.create_notification(
            user_id=current_user.id,
            notification_type=data.get('type', 'system_alert'),
            title=data.get('title', 'Test Notification'),
            message=data.get('message', 'This is a test notification created from the API.'),
            action_url=data.get('action_url'),
            priority=data.get('priority', 'normal'),
            data=data.get('data', {})
        )
        
        db.session.commit()
        
        logger.info(f"Test notification created for user {current_user.email}")
        
        return jsonify({
            'success': True,
            'message': 'Test notification created successfully',
            'notification': notification.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating test notification: {str(e)}")
        return jsonify({'error': 'Failed to create test notification'}), 500

@bp.route('/api/notifications/stats', methods=['GET'])
@login_required
@require_admin
def get_notification_stats():
    """Get notification statistics for current user"""
    try:
        total_count = Notification.query.filter_by(user_id=current_user.id).count()
        unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
        
        # Count by type
        type_stats = {}
        notifications_by_type = db.session.query(
            Notification.type,
            db.func.count(Notification.id).label('count')
        ).filter_by(user_id=current_user.id).group_by(Notification.type).all()
        
        for notification_type, count in notifications_by_type:
            type_stats[notification_type] = count
        
        # Count by priority
        priority_stats = {}
        notifications_by_priority = db.session.query(
            Notification.priority,
            db.func.count(Notification.id).label('count')
        ).filter_by(user_id=current_user.id).group_by(Notification.priority).all()
        
        for priority, count in notifications_by_priority:
            priority_stats[priority] = count
        
        return jsonify({
            'success': True,
            'stats': {
                'total_count': total_count,
                'unread_count': unread_count,
                'read_count': total_count - unread_count,
                'by_type': type_stats,
                'by_priority': priority_stats
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching notification stats: {str(e)}")
        return jsonify({'error': 'Failed to fetch notification statistics'}), 500