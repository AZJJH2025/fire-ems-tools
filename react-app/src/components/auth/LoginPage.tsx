import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Link,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  LocalFireDepartment,
  Email,
  Lock,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import ChangePasswordModal from './ChangePasswordModal';
import ForgotPasswordModal from './ForgotPasswordModal';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check for signup success message
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('signup') === 'success') {
      setShowSuccessMessage(true);
    }
  }, [location]);

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.email.trim()) {
      newErrors.push('Email is required');
    } else if (!formData.email.includes('@')) {
      newErrors.push('Valid email is required');
    }

    if (!formData.password) {
      newErrors.push('Password is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const response = await fetch('/auth/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          remember: false
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Login successful:', result.user);
        
        // Check if user has temporary password and needs to change it
        if (result.user.has_temp_password) {
          setCurrentUser(result.user);
          setShowPasswordChange(true);
          return; // Don't navigate yet
        }
        
        // Redirect to the intended page or default based on user role
        const from = location.state?.from?.pathname || '/';
        
        if (result.user.role === 'super_admin' || result.user.role === 'admin') {
          // For admin users, redirect to admin page or their intended destination
          navigate(from === '/' ? '/admin' : from);
        } else {
          // For regular users, redirect to intended page or homepage
          navigate(from);
        }
      } else {
        setErrors([result.message || 'Login failed']);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors(['An error occurred during login. Please try again.']);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handlePasswordChangeSuccess = () => {
    // Password changed successfully, now navigate to appropriate page
    // Redirect to the intended page or default based on user role
    const from = location.state?.from?.pathname || '/';
    
    if (currentUser.role === 'super_admin' || currentUser.role === 'admin') {
      // For admin users, redirect to admin page or their intended destination
      navigate(from === '/' ? '/admin' : from);
    } else {
      // For regular users, redirect to intended page or homepage
      navigate(from);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Hero Background */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #1e88e5 100%)',
          minHeight: '40vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <LocalFireDepartment sx={{ fontSize: 60, mr: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                FireEMS.AI
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ opacity: 0.9 }}>
              Welcome back to your fire department analytics suite
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Login Form */}
      <Container maxWidth="sm" sx={{ mt: -8, position: 'relative', zIndex: 1 }}>
        <Paper sx={{ p: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1565c0' }}>
              Sign In
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Access your department's analytics and reporting tools
            </Typography>
          </Box>

          {showSuccessMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Account created successfully! Please sign in with your credentials.
            </Alert>
          )}

          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Box>
                {errors.map((error, index) => (
                  <Typography key={index} variant="body2">• {error}</Typography>
                ))}
              </Box>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="chief@department.gov"
                required
                InputProps={{
                  startAdornment: (
                    <Email sx={{ color: '#757575', mr: 1 }} />
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <Lock sx={{ color: '#757575', mr: 1 }} />
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                mb: 2,
                bgcolor: '#1565c0',
                '&:hover': {
                  bgcolor: '#1976d2'
                }
              }}
            >
              Sign In
            </Button>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Link
                component="button"
                type="button"
                onClick={handleForgotPassword}
                sx={{ color: '#1565c0', textDecoration: 'none', fontSize: '0.95rem' }}
              >
                Forgot your password?
              </Link>
            </Box>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                New to FireEMS.AI?
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => navigate('/signup')}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderColor: '#1565c0',
                color: '#1565c0',
                '&:hover': {
                  borderColor: '#1976d2',
                  bgcolor: 'rgba(21, 101, 192, 0.04)'
                }
              }}
            >
              Create New Account
            </Button>
          </form>

          {/* Demo Access (temporary) */}
          <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
              <strong>Demo Access:</strong> While in development, you can access tools directly from the homepage.
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={() => navigate('/')}
              sx={{ display: 'block', mx: 'auto', color: '#1565c0' }}
            >
              Return to Homepage
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Bottom Section */}
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Need help? Contact our support team at{' '}
          <Link href="mailto:support@fireems.ai" sx={{ color: '#1565c0' }}>
            support@fireems.ai
          </Link>
        </Typography>
      </Box>

      {/* Password Change Modal */}
      <ChangePasswordModal
        open={showPasswordChange}
        onClose={() => {}} // Don't allow closing for temporary passwords
        onSuccess={handlePasswordChangeSuccess}
        isTemporary={true}
        userName={currentUser?.name || ''}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </Box>
  );
};

export default LoginPage;