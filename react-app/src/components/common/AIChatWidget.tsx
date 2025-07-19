/**
 * AI Chat Widget
 * 
 * Enterprise-safe floating chat interface for Fire EMS Tools user assistance
 * Features:
 * - Optional display (can be hidden without affecting any other functionality)
 * - Never blocks user workflow
 * - Comprehensive error handling with graceful fallbacks
 * - Professional Material-UI interface
 * - Context-aware help based on current tool
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  Chip,
  CircularProgress,
  Fade,
  Zoom,
  Collapse,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Help as HelpIcon,
  Psychology as AIIcon,
  MenuBook as DocsIcon
} from '@mui/icons-material';

import { aiChatService, ChatMessage } from '../../services/aiChatService';

interface AIChatWidgetProps {
  context?: string; // Current tool context (data-formatter, response-time-analyzer, etc.)
  position?: 'bottom-right' | 'bottom-left';
  className?: string;
}

const AIChatWidget: React.FC<AIChatWidgetProps> = ({
  context,
  position = 'bottom-right',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleToggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      // Add welcome message on first open
      if (messages.length === 0) {
        addWelcomeMessage();
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: `Hi! I'm your Fire EMS Tools assistant. I can help you with ${getContextDescription(context)}. What would you like to know?`,
      timestamp: new Date().toISOString(),
      context
    };
    setMessages([welcomeMessage]);
  };

  const getContextDescription = (context?: string): string => {
    const descriptions: Record<string, string> = {
      'data-formatter': 'data formatting, field mapping, AI quality analysis, and CAD imports',
      'response-time-analyzer': 'NFPA 1710 compliance, response time analysis, and professional reporting',
      'fire-map-pro': 'incident mapping, geographic analysis, and coverage planning',
      'water-supply-coverage': 'water supply analysis, tank and hydrant management',
      'iso-credit-calculator': 'ISO rating calculations and improvement recommendations',
      'station-coverage-optimizer': 'station placement optimization and coverage analysis'
    };
    return descriptions[context || ''] || 'using Fire EMS Tools, data analysis, and generating professional reports';
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date().toISOString(),
      context
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Get AI response with conversation context
      const response = await aiChatService.sendMessage(
        userMessage.content,
        context,
        messages
      );

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        context
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Add suggestions if provided
      if (response.suggestions && response.suggestions.length > 0) {
        const suggestionsMessage: ChatMessage = {
          id: `suggestions-${Date.now()}`,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          context
        };

        setMessages(prev => [...prev, suggestionsMessage]);
      }

      console.log('[AIChatWidget] Message sent successfully:', response);

    } catch (error) {
      console.error('[AIChatWidget] Failed to send message:', error);
      setError('Unable to get response. Please try again.');
      
      // Add fallback message
      const fallbackMessage: ChatMessage = {
        id: `fallback-${Date.now()}`,
        role: 'assistant',
        content: 'I\'m having trouble responding right now. Please check our user guides for detailed assistance, or try asking again in a moment.',
        timestamp: new Date().toISOString(),
        context
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const positionStyles = {
    'bottom-right': {
      bottom: 24,
      right: 24,
    },
    'bottom-left': {
      bottom: 24,
      left: 24,
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Zoom in={true}>
          <Paper
            elevation={6}
            sx={{
              position: 'fixed',
              ...positionStyles[position],
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#1976d2',
              color: 'white',
              cursor: 'pointer',
              zIndex: 1300,
              '&:hover': {
                bgcolor: '#1565c0',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={handleToggleChat}
            className={className}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AIIcon sx={{ fontSize: 20 }} />
              <HelpIcon sx={{ fontSize: 16 }} />
            </Box>
          </Paper>
        </Zoom>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Fade in={isOpen}>
          <Paper
            elevation={8}
            sx={{
              position: 'fixed',
              ...positionStyles[position],
              width: { xs: '90vw', sm: 400 },
              height: isMinimized ? 60 : { xs: '70vh', sm: 500 },
              maxHeight: '90vh',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              zIndex: 1300,
              overflow: 'hidden',
              border: '1px solid rgba(0, 0, 0, 0.12)'
            }}
            className={className}
          >
            {/* Chat Header */}
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: '#1976d2', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: isMinimized ? 'pointer' : 'default'
              }}
              onClick={isMinimized ? handleMinimize : undefined}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AIIcon sx={{ fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  Fire EMS Assistant
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={handleMinimize}
                  sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  <Box sx={{ fontSize: 14 }}>−</Box>
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleToggleChat}
                  sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>

            <Collapse in={!isMinimized}>
              {/* Messages Area */}
              <Box 
                sx={{ 
                  flexGrow: 1,
                  overflowY: 'auto',
                  p: 1,
                  bgcolor: '#fafafa',
                  minHeight: 300
                }}
              >
                <List dense>
                  {messages.map((message) => (
                    <ListItem 
                      key={message.id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                        px: 1,
                        py: 0.5
                      }}
                    >
                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          maxWidth: '85%',
                          bgcolor: message.role === 'user' ? '#1976d2' : 'white',
                          color: message.role === 'user' ? 'white' : 'text.primary',
                          borderRadius: 2,
                          wordBreak: 'break-word'
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                          {message.content}
                        </Typography>
                      </Paper>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ mt: 0.5, fontSize: '0.7rem' }}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </Typography>
                    </ListItem>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <ListItem sx={{ justifyContent: 'flex-start', px: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2" color="text.secondary">
                          Thinking...
                        </Typography>
                      </Box>
                    </ListItem>
                  )}

                  {/* Error message */}
                  {error && (
                    <ListItem sx={{ px: 1 }}>
                      <Paper
                        elevation={1}
                        sx={{ p: 1.5, bgcolor: '#ffebee', maxWidth: '85%' }}
                      >
                        <Typography variant="body2" color="error">
                          {error}
                        </Typography>
                      </Paper>
                    </ListItem>
                  )}
                </List>
                <div ref={messagesEndRef} />
              </Box>

              <Divider />

              {/* Input Area */}
              <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    ref={inputRef}
                    fullWidth
                    size="small"
                    placeholder="Ask me anything about Fire EMS Tools..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    multiline
                    maxRows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      }
                    }}
                  />
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                    sx={{
                      bgcolor: '#1976d2',
                      color: 'white',
                      '&:hover': { bgcolor: '#1565c0' },
                      '&:disabled': { bgcolor: '#e0e0e0' },
                      mb: 0.1
                    }}
                  >
                    <SendIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                {/* Context indicator */}
                {context && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      icon={<DocsIcon sx={{ fontSize: 12 }} />}
                      label={`Help for ${context.replace('-', ' ')}`}
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>
        </Fade>
      )}
    </>
  );
};

export default AIChatWidget;