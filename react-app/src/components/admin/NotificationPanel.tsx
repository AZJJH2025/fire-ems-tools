import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Badge,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  MarkEmailRead,
  Delete,
  MoreVert,
  CheckCircle,
  Warning,
  Info,
  Error,
  PersonAdd,
  Business,
  Security,
  Schedule,
  Launch
} from '@mui/icons-material';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  priority: string;
  data?: any;
}

interface NotificationStats {
  total_count: number;
  unread_count: number;
  read_count: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
}

const NotificationPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
    fetchStats();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        unread_only: filter === 'unread' ? 'true' : 'false',
        limit: '20'
      });
      
      const response = await fetch(`/notifications/api/notifications?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const result = await response.json();
      if (result.success) {
        setNotifications(result.notifications);
      } else {
        throw new Error(result.error || 'Failed to load notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error instanceof Error ? error.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/notifications/api/notifications/stats', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification stats');
      }

      const result = await response.json();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/notifications/api/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/notifications/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(`/notifications/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Update local state
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconProps = {
      fontSize: 'small' as const,
      color: priority === 'urgent' ? 'error' : priority === 'high' ? 'warning' : 'primary'
    };

    switch (type) {
      case 'approval_request':
        return <PersonAdd {...iconProps} />;
      case 'department_approved':
        return <Business {...iconProps} />;
      case 'user_approved':
        return <CheckCircle {...iconProps} />;
      case 'system_alert':
        return <Security {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'normal':
        return 'primary';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.open(notification.action_url, '_blank');
    } else {
      setSelectedNotification(notification);
      setDetailDialogOpen(true);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notification: Notification) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={stats?.unread_count || 0} color="error">
              <NotificationsActive color="primary" />
            </Badge>
            <Typography variant="h6">
              Notifications
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant={filter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilter('all')}
            >
              All ({stats?.total_count || 0})
            </Button>
            <Button
              size="small"
              variant={filter === 'unread' ? 'contained' : 'outlined'}
              onClick={() => setFilter('unread')}
            >
              Unread ({stats?.unread_count || 0})
            </Button>
            {stats && stats.unread_count > 0 && (
              <Tooltip title="Mark all as read">
                <IconButton size="small" onClick={markAllAsRead}>
                  <MarkEmailRead />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Notifications List */}
        {!loading && (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No notifications"
                  secondary={filter === 'unread' ? 'All caught up!' : 'You have no notifications yet.'}
                />
              </ListItem>
            ) : (
              notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      cursor: 'pointer',
                      bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': {
                        bgcolor: 'action.selected'
                      }
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: notification.is_read ? 'grey.300' : 'primary.main' }}>
                        {getNotificationIcon(notification.type, notification.priority)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: notification.is_read ? 'normal' : 'bold',
                              flexGrow: 1
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            size="small"
                            label={notification.priority}
                            color={getPriorityColor(notification.priority) as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(notification.created_at)}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {notification.action_url && (
                        <Tooltip title="Open link">
                          <IconButton size="small">
                            <Launch fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, notification)}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {selectedNotification && !selectedNotification.is_read && (
            <MenuItem
              onClick={() => {
                markAsRead(selectedNotification.id);
                handleMenuClose();
              }}
            >
              <MarkEmailRead sx={{ mr: 1 }} fontSize="small" />
              Mark as read
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              if (selectedNotification) {
                deleteNotification(selectedNotification.id);
              }
              handleMenuClose();
            }}
          >
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Delete
          </MenuItem>
        </Menu>

        {/* Detail Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          {selectedNotification && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getNotificationIcon(selectedNotification.type, selectedNotification.priority)}
                  {selectedNotification.title}
                </Box>
              </DialogTitle>
              <DialogContent>
                <Typography variant="body1" paragraph>
                  {selectedNotification.message}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    size="small"
                    label={selectedNotification.type.replace('_', ' ').toUpperCase()}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={selectedNotification.priority.toUpperCase()}
                    color={getPriorityColor(selectedNotification.priority) as any}
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  {new Date(selectedNotification.created_at).toLocaleString()}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailDialogOpen(false)}>
                  Close
                </Button>
                {selectedNotification.action_url && (
                  <Button
                    variant="contained"
                    startIcon={<Launch />}
                    onClick={() => {
                      window.open(selectedNotification.action_url, '_blank');
                      setDetailDialogOpen(false);
                    }}
                  >
                    Open Link
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;