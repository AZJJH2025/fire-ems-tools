import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Business,
  Person
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`approvals-tabpanel-${index}`}
      aria-labelledby={`approvals-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface DepartmentRequest {
  id: number;
  department_name: string;
  department_type: string;
  department_code: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_title: string;
  service_area_description: string;
  population_served: number;
  number_of_stations: number;
  justification: string;
  status: string;
  requested_at: string;
  reviewed_at?: string;
  review_notes?: string;
}

interface UserRequest {
  id: number;
  department_id: number;
  department_name: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  requested_role: string;
  verification_info: string;
  employee_id: string;
  years_of_service: number;
  current_position: string;
  status: string;
  requested_at: string;
  reviewed_at?: string;
  review_notes?: string;
}

const PendingApprovals: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [departmentRequests, setDepartmentRequests] = useState<DepartmentRequest[]>([]);
  const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    type: 'department' | 'user';
    action: 'approve' | 'deny';
    request: DepartmentRequest | UserRequest | null;
  }>({
    open: false,
    type: 'department',
    action: 'approve',
    request: null
  });
  
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch department requests
      const deptResponse = await fetch('/admin/api/department-requests?status=pending', {
        credentials: 'include'
      });

      if (!deptResponse.ok) {
        throw new Error('Failed to fetch department requests');
      }

      const deptData = await deptResponse.json();

      // Fetch user requests
      const userResponse = await fetch('/admin/api/user-requests?status=pending', {
        credentials: 'include'
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user requests');
      }

      const userData = await userResponse.json();

      setDepartmentRequests(deptData.requests || []);
      setUserRequests(userData.requests || []);

    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const openReviewDialog = (
    type: 'department' | 'user',
    action: 'approve' | 'deny',
    request: DepartmentRequest | UserRequest
  ) => {
    setReviewDialog({
      open: true,
      type,
      action,
      request
    });
    setReviewNotes('');
  };

  const closeReviewDialog = () => {
    setReviewDialog({
      open: false,
      type: 'department',
      action: 'approve',
      request: null
    });
    setReviewNotes('');
  };

  const handleReviewSubmit = async () => {
    if (!reviewDialog.request) return;

    const { type, action, request } = reviewDialog;
    const endpoint = type === 'department' 
      ? `/admin/api/department-requests/${request.id}/${action}`
      : `/admin/api/user-requests/${request.id}/${action}`;

    try {
      setSubmitting(true);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          review_notes: reviewNotes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} request`);
      }

      // Refresh the requests list
      await fetchPendingRequests();
      
      closeReviewDialog();

    } catch (error) {
      console.error(`Error ${reviewDialog.action}ing request:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${action} request`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Pending Approvals
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve new department and user registration requests
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Business color="primary" />
                <Box>
                  <Typography variant="h4">{departmentRequests.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Department Requests
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Person color="primary" />
                <Box>
                  <Typography variant="h4">{userRequests.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    User Requests
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="approval tabs">
          <Tab 
            icon={<Business />} 
            label={`Department Requests (${departmentRequests.length})`} 
          />
          <Tab 
            icon={<Person />} 
            label={`User Requests (${userRequests.length})`} 
          />
        </Tabs>
      </Paper>

      {/* Department Requests Tab */}
      <TabPanel value={currentTab} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Department</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Population</TableCell>
                <TableCell>Stations</TableCell>
                <TableCell>Requested</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departmentRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No pending department requests
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                departmentRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {request.department_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.department_code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.contact_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.contact_email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.department_type} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {request.population_served?.toLocaleString() || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {request.number_of_stations || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(request.requested_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<CheckCircle />}
                          color="success"
                          onClick={() => openReviewDialog('department', 'approve', request)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Cancel />}
                          color="error"
                          onClick={() => openReviewDialog('department', 'deny', request)}
                        >
                          Deny
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* User Requests Tab */}
      <TabPanel value={currentTab} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Requested Role</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Requested</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No pending user requests
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                userRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {request.user_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.user_email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.department_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.requested_role} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.years_of_service ? `${request.years_of_service} years` : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.current_position || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(request.requested_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<CheckCircle />}
                          color="success"
                          onClick={() => openReviewDialog('user', 'approve', request)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Cancel />}
                          color="error"
                          onClick={() => openReviewDialog('user', 'deny', request)}
                        >
                          Deny
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Review Dialog */}
      <Dialog 
        open={reviewDialog.open} 
        onClose={closeReviewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {reviewDialog.action === 'approve' ? 'Approve' : 'Deny'} {' '}
          {reviewDialog.type === 'department' ? 'Department' : 'User'} Request
        </DialogTitle>
        <DialogContent>
          {reviewDialog.request && (
            <Box sx={{ pt: 1 }}>
              {/* Request Details */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Request Details
                </Typography>
                {reviewDialog.type === 'department' ? (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Department Name</Typography>
                      <Typography variant="body1">{(reviewDialog.request as DepartmentRequest).department_name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Type</Typography>
                      <Typography variant="body1">{(reviewDialog.request as DepartmentRequest).department_type}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Contact Name</Typography>
                      <Typography variant="body1">{(reviewDialog.request as DepartmentRequest).contact_name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Contact Email</Typography>
                      <Typography variant="body1">{(reviewDialog.request as DepartmentRequest).contact_email}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="text.secondary">Justification</Typography>
                      <Typography variant="body1">{(reviewDialog.request as DepartmentRequest).justification || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">User Name</Typography>
                      <Typography variant="body1">{(reviewDialog.request as UserRequest).user_name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{(reviewDialog.request as UserRequest).user_email}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Department</Typography>
                      <Typography variant="body1">{(reviewDialog.request as UserRequest).department_name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">Requested Role</Typography>
                      <Typography variant="body1">{(reviewDialog.request as UserRequest).requested_role}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="text.secondary">Verification Info</Typography>
                      <Typography variant="body1">{(reviewDialog.request as UserRequest).verification_info || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Review Notes */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Review Notes {reviewDialog.action === 'deny' && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    reviewDialog.action === 'approve' 
                      ? 'Optional notes about the approval...' 
                      : 'Please provide a reason for denial...'
                  }
                  required={reviewDialog.action === 'deny'}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReviewDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleReviewSubmit}
            disabled={submitting || (reviewDialog.action === 'deny' && !reviewNotes.trim())}
            color={reviewDialog.action === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {submitting ? (
              <CircularProgress size={20} />
            ) : (
              `${reviewDialog.action === 'approve' ? 'Approve' : 'Deny'} Request`
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingApprovals;