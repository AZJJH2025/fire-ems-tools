/**
 * AI Chat Service
 * 
 * Enterprise-grade AI-powered chat helper for Fire EMS Tools user assistance
 * Provides intelligent responses to user questions about tool usage and features
 * 
 * Safety Features:
 * - Never blocks or interrupts existing functionality
 * - Complete fallback when AI unavailable  
 * - Comprehensive error handling and timeout protection
 * - Optional/non-blocking operation
 * - No data persistence - stateless chat interactions
 */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: string; // Current tool context (data-formatter, response-time-analyzer, etc.)
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
  documentationLinks?: {
    title: string;
    url: string;
    section?: string;
  }[];
  success: boolean;
  error?: string;
}

interface AIChatServiceConfig {
  enableAI: boolean;
  includeDocumentationLinks: boolean;
  timeoutMs: number;
  maxConversationHistory: number;
}

export class AIChatService {
  private static instance: AIChatService;
  private config: AIChatServiceConfig;

  private constructor() {
    this.config = {
      enableAI: true, // Can be disabled for stability
      includeDocumentationLinks: true,
      timeoutMs: 10000, // 10 second timeout
      maxConversationHistory: 10 // Keep last 10 messages for context
    };
  }

  public static getInstance(): AIChatService {
    if (!AIChatService.instance) {
      AIChatService.instance = new AIChatService();
    }
    return AIChatService.instance;
  }

  /**
   * Send chat message with comprehensive safety measures
   * Always returns a response - never throws or blocks
   */
  public async sendMessage(
    userMessage: string,
    context?: string,
    conversationHistory?: ChatMessage[]
  ): Promise<ChatResponse> {
    try {
      // Basic response (always works, no AI required)
      const basicResponse = this.generateBasicResponse(userMessage, context);

      // Enhanced AI response (optional, with fallback)
      if (this.config.enableAI) {
        try {
          const aiResponse = await this.performAIChat(userMessage, context, conversationHistory);
          return {
            ...aiResponse,
            success: true
          };
        } catch (aiError) {
          console.warn('[AIChatService] AI chat failed, using basic response:', aiError);
          // Return basic response without AI enhancement
          return {
            ...basicResponse,
            success: true
          };
        }
      }

      return {
        ...basicResponse,
        success: true
      };

    } catch (error) {
      console.error('[AIChatService] Chat failed, returning safe fallback:', error);
      
      // Ultra-safe fallback - never fails
      return this.createSafeFallbackResponse();
    }
  }

  /**
   * Basic rule-based responses - always works, no AI dependencies
   */
  private generateBasicResponse(userMessage: string, context?: string): ChatResponse {
    const lowerMessage = userMessage.toLowerCase();
    
    // Context-aware responses based on current tool
    if (context === 'data-formatter') {
      if (lowerMessage.includes('field mapping') || lowerMessage.includes('mapping')) {
        return {
          message: "For field mapping help, you can drag source fields to target fields, or use auto-mapping suggestions. Check the Data Formatter guide for detailed instructions.",
          documentationLinks: [{
            title: "Data Formatter - Field Mapping Guide",
            url: "/docs/users/DATA_FORMATTER.md",
            section: "Field Mapping Workflows"
          }],
          suggestions: [
            "How do I auto-map fields?",
            "What if my field names don't match?",
            "How do I save a template?"
          ],
          success: true
        };
      }
      
      if (lowerMessage.includes('ai') || lowerMessage.includes('quality')) {
        return {
          message: "The AI Data Quality panel analyzes your data and provides a 0-100% quality score with recommendations. Find it in the 'Preview & Validate' step under the 'AI Data Quality' tab.",
          documentationLinks: [{
            title: "Data Formatter - AI Data Quality Analysis",
            url: "/docs/users/DATA_FORMATTER.md",
            section: "AI Data Quality Analysis"
          }],
          suggestions: [
            "What does the quality score mean?",
            "How do I improve data quality?",
            "What are tool compatibility scores?"
          ],
          success: true
        };
      }
    }
    
    if (context === 'response-time-analyzer') {
      if (lowerMessage.includes('nfpa') || lowerMessage.includes('compliance')) {
        return {
          message: "NFPA 1710 compliance analysis shows your department's performance against national standards: ≤60 sec dispatch, ≤60 sec turnout, ≤240 sec travel time.",
          documentationLinks: [{
            title: "Response Time Analyzer - NFPA 1710 Guide",
            url: "/docs/users/RESPONSE_TIME_ANALYZER.md",
            section: "NFPA 1710 Compliance"
          }],
          suggestions: [
            "How do I generate compliance reports?",
            "What are realistic response times?",
            "How do I improve compliance scores?"
          ],
          success: true
        };
      }
    }
    
    // General help responses
    if (lowerMessage.includes('help') || lowerMessage.includes('guide')) {
      return {
        message: "I can help you with any Fire EMS Tools questions! Ask me about field mapping, data quality, generating reports, or using any of our analysis tools.",
        documentationLinks: [{
          title: "Complete User Documentation",
          url: "/docs/users/DOCUMENTATION_HUB.md"
        }],
        suggestions: [
          "How do I import CAD data?",
          "How do I generate NFPA reports?",
          "What does the AI analysis do?"
        ],
        success: true
      };
    }

    // Default response
    return {
      message: "I'm here to help with Fire EMS Tools! You can ask me about importing data, field mapping, generating reports, or using any of our analysis features. What would you like to know?",
      suggestions: [
        "How do I get started with Data Formatter?",
        "How do I generate compliance reports?",
        "What AI features are available?"
      ],
      success: true
    };
  }

  /**
   * AI-enhanced chat with documentation context
   */
  private async performAIChat(
    userMessage: string,
    context?: string,
    conversationHistory?: ChatMessage[]
  ): Promise<ChatResponse> {
    
    // Create context for AI with documentation knowledge
    const documentationContext = this.buildDocumentationContext(context);
    const conversationContext = this.buildConversationContext(conversationHistory);
    
    // Call AI service with timeout protection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch('/ai/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({
          message: userMessage,
          context: context,
          documentation_context: documentationContext,
          conversation_history: conversationContext,
          system_prompt: this.buildSystemPrompt(context)
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI chat service returned ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.response) {
        return {
          message: result.response,
          suggestions: result.suggestions || [],
          documentationLinks: result.documentation_links || [],
          success: true
        };
      } else {
        throw new Error('AI chat service returned invalid response');
      }

    } catch (error) {
      clearTimeout(timeoutId);
      throw error; // Re-throw for caller to handle
    }
  }

  /**
   * Build documentation context for AI responses
   */
  private buildDocumentationContext(context?: string): string {
    const contexts: Record<string, string> = {
      'data-formatter': `
Data Formatter Guide Context:
- Purpose: Transform CAD exports into standardized format
- Key Features: Field mapping, AI quality analysis, template management
- Workflow: Upload → Map Fields → Validate → Export
- AI Features: Data quality scoring (0-100%), tool compatibility, recommendations
- Common Issues: Field mapping conflicts, data format problems, missing required fields
      `,
      'response-time-analyzer': `
Response Time Analyzer Guide Context:
- Purpose: NFPA 1710 compliance analysis and professional reporting
- Key Standards: ≤60 sec dispatch, ≤60 sec turnout, ≤240 sec travel
- Features: Compliance analysis, executive reports, AI insights
- Reports: Monthly compliance, executive summaries, grant application data
- Common Issues: Unrealistic times (check field mapping), missing timestamp data
      `,
      'fire-map-pro': `
Fire Map Pro Guide Context:
- Purpose: Geographic analysis and incident mapping
- Features: Interactive maps, coverage analysis, professional exports
- Requirements: Latitude/longitude coordinates or address data
- Outputs: Professional maps, coverage reports, geographic analysis
      `
    };

    return contexts[context || 'general'] || `
General Fire EMS Tools Context:
- Professional analytics suite for fire departments
- Tools: Data Formatter, Response Time Analyzer, Fire Map Pro
- AI Features: Data quality analysis, intelligent recommendations
- Focus: NFPA compliance, professional reporting, data standardization
    `;
  }

  /**
   * Build conversation context from message history
   */
  private buildConversationContext(conversationHistory?: ChatMessage[]): string {
    if (!conversationHistory || conversationHistory.length === 0) {
      return "This is the start of a new conversation.";
    }

    const recentMessages = conversationHistory
      .slice(-this.config.maxConversationHistory)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    return `Recent conversation:\n${recentMessages}`;
  }

  /**
   * Build system prompt for AI responses
   */
  private buildSystemPrompt(context?: string): string {
    return `You are a helpful assistant for Fire EMS Tools, a professional analytics suite for fire departments.

Your role:
- Help users with tool usage, data import, analysis, and reporting
- Provide specific, actionable answers based on our documentation
- Focus on fire department workflows and NFPA compliance
- Be concise but comprehensive - aim for 2-3 sentences with specific steps

Current context: ${context || 'general help'}

Guidelines:
- Always be helpful and professional
- Reference specific features and steps when possible
- If you don't know something specific, direct users to documentation
- Focus on practical solutions for fire department operations
- Mention AI features when relevant (data quality analysis, recommendations)

Remember: You're helping fire department professionals who need clear, actionable guidance.`;
  }

  /**
   * Ultra-safe fallback response - never fails
   */
  private createSafeFallbackResponse(): ChatResponse {
    return {
      message: "I'm here to help with Fire EMS Tools! Please check our user guides for detailed assistance, or try asking a specific question about data formatting, analysis, or reporting.",
      suggestions: [
        "How do I import data?",
        "How do I generate reports?",
        "Where can I find user guides?"
      ],
      documentationLinks: [{
        title: "User Documentation Hub",
        url: "/docs/users/DOCUMENTATION_HUB.md"
      }],
      success: true
    };
  }

  /**
   * Configuration methods for enterprise customization
   */
  public setConfig(config: Partial<AIChatServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): AIChatServiceConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const aiChatService = AIChatService.getInstance();

export type { ChatMessage, ChatResponse };