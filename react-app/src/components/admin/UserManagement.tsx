import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Edit,
  Delete,
  MoreVert,
  Add,
  Refresh,
  PersonAdd,
  Block,
  CheckCircle
} from '@mui/icons-material';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  department_id: number;
  department_name: string | null;
}

interface UserManagementProps {
  userRole: string | null;
}

interface EditUserDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userId: number, userData: Partial<User>) => void;
  userRole: string | null;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ 
  open, 
  user, 
  onClose, 
  onSave, 
  userRole 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    is_active: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
        is_active: user.is_active ?? true
      });
    }
  }, [user]);

  const handleSave = () => {
    if (user) {
      onSave(user.id, formData);
    }
  };

  const handleChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSwitchChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Edit User: {user?.email}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            fullWidth
            value={formData.name}
            onChange={handleChange('name')}
          />
          
          <TextField
            label="Email"
            fullWidth
            value={formData.email}
            onChange={handleChange('email')}
            type="email"
          />

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={handleChange('role')}
              label="Role"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              {userRole === 'super_admin' && (
                <MenuItem value="super_admin">Super Admin</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={handleSwitchChange('is_active')}
              />
            }
            label="Active User"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UserManagement: React.FC<UserManagementProps> = ({ userRole }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/admin/api/users', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();
      if (result.success) {
        setUsers(result.users);
      } else {
        throw new Error(result.error || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (userId: number, userData: Partial<User>) => {
    try {
      const response = await fetch(`/admin/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, ...userData }
            : user
        ));
        setEditDialog({ open: false, user: null });
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error instanceof Error ? error.message : 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/admin/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();
      if (result.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'manager':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchUsers}
          >
            Refresh
          </Button>
          {userRole === 'super_admin' && (
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => {/* TODO: Implement add user */}}
            >
              Add User
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {user.department_name || 'No Department'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.role.replace('_', ' ').toUpperCase()}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.is_active ? 'Active' : 'Inactive'}
                    color={user.is_active ? 'success' : 'default'}
                    size="small"
                    icon={user.is_active ? <CheckCircle /> : <Block />}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(user.created_at)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(user.last_login)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuClick(e, user)}>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedUser) {
            setEditDialog({ open: true, user: selectedUser });
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedUser) {
            handleDeleteUser(selectedUser.id);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialog.open}
        user={editDialog.user}
        onClose={() => setEditDialog({ open: false, user: null })}
        onSave={handleEditUser}
        userRole={userRole}
      />
    </Box>
  );
};

export default UserManagement;