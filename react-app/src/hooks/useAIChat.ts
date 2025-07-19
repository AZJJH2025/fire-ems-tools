/**
 * AI Chat State Management Hook
 * 
 * Custom React hook for managing AI chat functionality across Fire EMS Tools
 * Provides centralized state management, error handling, and integration points
 * for the AI Chat Helper system throughout the application.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { aiChatService, ChatMessage, ChatResponse } from '../services/aiChatService';

interface UseAIChatOptions {
  context?: string;
  persistHistory?: boolean;
  maxHistoryLength?: number;
}

interface UseAIChatReturn {
  // Chat state
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Chat actions
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => void;
  retryLastMessage: () => Promise<void>;
  
  // UI state
  isOpen: boolean;
  isMinimized: boolean;
  toggleChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
  
  // Context management
  setContext: (context: string) => void;
  
  // Utilities
  hasMessages: boolean;
  lastMessage: ChatMessage | null;
}

const STORAGE_KEY = 'fireems-ai-chat-history';

export const useAIChat = (options: UseAIChatOptions = {}): UseAIChatReturn => {
  const {
    context = 'general',
    persistHistory = false,
    maxHistoryLength = 50
  } = options;

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentContext, setCurrentContext] = useState(context);
  
  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Refs for retry functionality
  const lastMessageRef = useRef<string | null>(null);
  
  // Load persisted chat history on mount
  useEffect(() => {
    if (persistHistory) {
      const stored = localStorage.getItem(`${STORAGE_KEY}-${currentContext}`);
      if (stored) {
        try {
          const parsedMessages = JSON.parse(stored) as ChatMessage[];
          setMessages(parsedMessages.slice(-maxHistoryLength));
        } catch (error) {
          console.warn('[useAIChat] Failed to load chat history:', error);
        }
      }
    }
  }, [persistHistory, currentContext, maxHistoryLength]);

  // Save chat history when messages change
  useEffect(() => {
    if (persistHistory && messages.length > 0) {
      try {
        localStorage.setItem(
          `${STORAGE_KEY}-${currentContext}`,
          JSON.stringify(messages.slice(-maxHistoryLength))
        );
      } catch (error) {
        console.warn('[useAIChat] Failed to save chat history:', error);
      }
    }
  }, [messages, persistHistory, currentContext, maxHistoryLength]);

  // Add welcome message when chat opens for first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: getWelcomeMessage(currentContext),
        timestamp: new Date().toISOString(),
        context: currentContext
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, currentContext]);

  const getWelcomeMessage = (context: string): string => {
    const contextMessages: Record<string, string> = {
      'data-formatter': 'Hello! I can help you with data formatting, field mapping, AI quality analysis, and CAD data imports. What would you like to know?',
      'response-time-analyzer': 'Hi! I can assist with NFPA 1710 compliance, response time analysis, and generating professional reports. How can I help?',
      'fire-map-pro': 'Welcome! I can help with incident mapping, geographic analysis, and coverage planning. What questions do you have?',
      'water-supply-coverage': 'Hello! I can assist with water supply analysis, tank and hydrant management, and coverage assessments. What can I help with?',
      'iso-credit-calculator': 'Hi! I can help with ISO rating calculations, improvement recommendations, and compliance documentation. What would you like to know?',
      'station-coverage-optimizer': 'Welcome! I can assist with station placement optimization, coverage analysis, and resource planning. How can I help?',
      'general': 'Hello! I\'m your Fire EMS Tools assistant. I can help with data analysis, tool usage, generating reports, and any questions about fire department operations. What would you like to know?'
    };
    return contextMessages[context] || contextMessages.general;
  };

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
      context: currentContext
    };

    // Add user message and update state
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    lastMessageRef.current = message.trim();

    try {
      const response: ChatResponse = await aiChatService.sendMessage(
        message.trim(),
        currentContext,
        messages
      );

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        context: currentContext
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Add suggestions if provided
      if (response.suggestions && response.suggestions.length > 0) {
        const suggestionsMessage: ChatMessage = {
          id: `suggestions-${Date.now()}`,
          role: 'assistant',
          content: `**Suggested questions:**\n${response.suggestions.map(s => `• ${s}`).join('\n')}`,
          timestamp: new Date().toISOString(),
          context: currentContext
        };
        setMessages(prev => [...prev, suggestionsMessage]);
      }

    } catch (error) {
      console.error('[useAIChat] Message failed:', error);
      setError('Unable to send message. Please try again.');
      
      // Add fallback message
      const fallbackMessage: ChatMessage = {
        id: `fallback-${Date.now()}`,
        role: 'assistant',
        content: 'I\'m having trouble responding right now. Please check our user guides for assistance, or try asking again in a moment.',
        timestamp: new Date().toISOString(),
        context: currentContext
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, currentContext]);

  const retryLastMessage = useCallback(async () => {
    if (lastMessageRef.current && !isLoading) {
      await sendMessage(lastMessageRef.current);
    }
  }, [sendMessage, isLoading]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
    lastMessageRef.current = null;
    
    if (persistHistory) {
      localStorage.removeItem(`${STORAGE_KEY}-${currentContext}`);
    }
  }, [persistHistory, currentContext]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  const minimizeChat = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximizeChat = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const setContext = useCallback((newContext: string) => {
    if (newContext !== currentContext) {
      setCurrentContext(newContext);
      // Optionally clear messages when context changes
      if (!persistHistory) {
        setMessages([]);
      }
    }
  }, [currentContext, persistHistory]);

  // Derived state
  const hasMessages = messages.length > 0;
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return {
    // Chat state
    messages,
    isLoading,
    error,
    
    // Chat actions
    sendMessage,
    clearHistory,
    retryLastMessage,
    
    // UI state
    isOpen,
    isMinimized,
    toggleChat,
    minimizeChat,
    maximizeChat,
    
    // Context management
    setContext,
    
    // Utilities
    hasMessages,
    lastMessage
  };
};

export default useAIChat;