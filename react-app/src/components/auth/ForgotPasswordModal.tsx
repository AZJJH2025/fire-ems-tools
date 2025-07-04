import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Close, Email } from '@mui/icons-material';

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  open,
  onClose
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/auth/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setEmailSent(true);
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('An error occurred while sending the reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setMessage(null);
      setError(null);
      setEmailSent(false);
      onClose();
    }
  };

  const handleReturnToLogin = () => {
    handleClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <Email color="primary" />
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          Reset Password
        </Typography>
        <IconButton 
          onClick={handleClose} 
          disabled={loading}
          size="small"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {!emailSent ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
                sx={{ mb: 2 }}
                helperText="Enter the email address associated with your account"
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {message && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Email sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Check Your Email
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              We've sent password reset instructions to <strong>{email}</strong>
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Didn't receive the email? Check your spam folder or try again.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {!emailSent ? (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !email.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <Email />}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleReturnToLogin} variant="contained" fullWidth>
              Return to Login
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordModal;