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
          console.log('🤖 [DEBUG] Attempting backend AI chat with message:', userMessage.substring(0, 50) + '...');
          console.log('🤖 [DEBUG] Context:', context);
          const aiResponse = await this.performAIChat(userMessage, context, conversationHistory);
          console.log('🤖 [DEBUG] Backend AI succeeded, response length:', aiResponse.message.length);
          return {
            ...aiResponse,
            success: true
          };
        } catch (aiError) {
          console.warn('🤖 [DEBUG] AI chat failed, using basic response:', aiError);
          console.log('🤖 [DEBUG] Basic response preview:', basicResponse.message.substring(0, 100) + '...');
          // Return basic response without AI enhancement
          return {
            ...basicResponse,
            success: true
          };
        }
      }

      console.log('🤖 [DEBUG] AI disabled, using basic response:', basicResponse.message.substring(0, 100) + '...');

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
    console.log('🤖 [DEBUG] generateBasicResponse called with:', { userMessage: userMessage.substring(0, 50) + '...', context, lowerMessage: lowerMessage.substring(0, 50) + '...' });
    
    // Context-aware responses based on current tool
    if (context === 'data-formatter') {
      
      // Step-by-step usage guide
      if (lowerMessage.includes('step') || lowerMessage.includes('how to use') || lowerMessage.includes('guide') || lowerMessage.includes('start')) {
        console.log('🤖 [DEBUG] Matched step-by-step guide condition for data-formatter');
        return {
          message: `**Complete Data Formatter Workflow:**

**STEP 1: Upload CAD Data** 📁
• Click "Browse Files" or drag & drop your CAD export file
• Supports CSV, Excel (.xlsx), and other formats
• Common files: Monthly incident reports, CAD exports from Tyler/Hexagon/TriTech systems

**STEP 2: Review Auto-Mapping** 🔍  
• System automatically detects field patterns (Console One, Tyler CAD, etc.)
• Green checkmarks = successfully mapped fields
• Red warnings = conflicts or missing required fields
• Review the "Target Fields Panel" on the right side

**STEP 3: Fix Field Mapping Issues** ⚙️
• **Manual Mapping**: Drag source fields (left) to target fields (right)
• **Key Fields**: Make sure "Call Received Date/Time" maps to a TIME field (not date)
• **Required Fields**: All red "Required" fields must be mapped
• **Live Preview**: Check bottom panel to verify data looks correct

**STEP 4: Run AI Quality Analysis** 🤖
• Expand "AI Data Quality Panel" to get 0-100% quality score
• Review tool compatibility (which analysis tools will work best)
• Address any quality recommendations

**STEP 5: Export & Use Data** 🚀
• Click "Export" tab → "Send to Tool" 
• Choose: Response Time Analyzer, Fire Map Pro, etc.
• Data transfers automatically with proper formatting

**Quick Tip**: For monthly CAD exports, save successful mappings as templates to reuse next month!`,
          documentationLinks: [{
            title: "Complete Data Formatter Guide",
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
      
      // Field mapping specific help
      if (lowerMessage.includes('field mapping') || lowerMessage.includes('mapping') || lowerMessage.includes('auto-map')) {
        return {
          message: `**Field Mapping Help:**

**🔄 Auto-Mapping**
• System detects common CAD field patterns automatically
• Works with Tyler, Console One, Hexagon, TriTech CAD systems
• Green checkmarks = successful auto-mapping
• Review suggestions in right panel

**📋 Manual Mapping**  
• **Drag & Drop**: Drag source field → target field
• **Dropdown Selection**: Click target field dropdown → choose source
• **Key Rule**: Date/Time fields should map to TIME targets (not date-only)

**⚠️ Common Issues & Solutions**
• **"Call Received Date/Time" → "Incident Time"** (not "Incident Date")  
• **"Unit ID" → "Responding Unit"**
• **"Location" → "Address"** (or Latitude/Longitude if coordinates)
• **Red "Required" fields MUST be mapped** for tools to work

**💡 Pro Tips**
• Use Live Preview (bottom panel) to verify mappings look correct
• Save successful mappings as templates for monthly reuse
• Check Target Fields Panel for mapping status`,
          documentationLinks: [{
            title: "Field Mapping Detailed Guide", 
            url: "/docs/users/DATA_FORMATTER.md",
            section: "Field Mapping"
          }],
          suggestions: [
            "What if my field names are different?",
            "How do I fix mapping conflicts?", 
            "Can I save my mapping as a template?"
          ],
          success: true
        };
      }
      
      if (lowerMessage.includes('ai') || lowerMessage.includes('quality')) {
        return {
          message: `**AI Data Quality Analysis:**

**📊 Quality Score (0-100%)**
• **90-100%**: Excellent - All tools will work perfectly
• **70-89%**: Good - Most analysis will work well  
• **50-69%**: Fair - Some limitations, check recommendations
• **Below 50%**: Needs improvement for reliable analysis

**🎯 Tool Compatibility Matrix**
• **Response Time Analyzer**: Needs incident times and IDs
• **Fire Map Pro**: Requires location data (addresses or coordinates)
• **Water Supply Coverage**: Needs geographic coordinates
• **PDF Reports**: Works with any successfully formatted data

**🚀 Improvement Recommendations**
• System suggests specific field mappings to improve quality
• Identifies missing critical fields for your target analysis
• Recommends data cleanup for better results

**💡 How to Use**
1. Complete field mapping first
2. Expand "AI Data Quality" panel  
3. Review quality score and recommendations
4. Make suggested improvements
5. Re-run analysis to see improved score`,
          documentationLinks: [{
            title: "AI Data Quality Analysis Guide",
            url: "/docs/users/AI_FEATURES_GUIDE.md", 
            section: "Data Quality Scoring"
          }],
          suggestions: [
            "How can I improve my quality score?",
            "What does tool compatibility mean?",
            "Which fields are most important?"
          ],
          success: true
        };
      }
    }
    
    if (context === 'response-time-analyzer') {
      
      // Step-by-step usage guide for Response Time Analyzer
      if (lowerMessage.includes('step') || lowerMessage.includes('how to use') || lowerMessage.includes('guide') || lowerMessage.includes('start')) {
        return {
          message: `**Response Time Analyzer Workflow:**

**STEP 1: Import Data from Data Formatter** 📊
• Use "Send to Tool" from Data Formatter export tab
• OR upload pre-formatted incident data with time stamps
• Required: Incident ID, dates, and response time data

**STEP 2: Review Data Quality** 🔍
• Check incident summary statistics
• Verify response time calculations look realistic (not 800+ minutes)
• Look for "N/A" values indicating data quality issues

**STEP 3: Analyze NFPA 1710 Compliance** ⏱️
• **Dispatch Time**: Should be ≤60 seconds (call to dispatch)
• **Turnout Time**: Should be ≤60 seconds (dispatch to en route) 
• **Travel Time**: Should be ≤240 seconds (en route to on scene)
• **Total Response**: Should be ≤300 seconds for ALS calls

**STEP 4: View Geographic Analysis** 🗺️
• Check incident map with color-coded response times
• Blue = Good performance, Red = Needs improvement
• Identify geographic patterns and problem areas

**STEP 5: Generate Professional Reports** 📋
• Click "Professional Reports" for city council presentations
• Choose from compliance reports, annual summaries, grant applications
• Download PDF reports with department branding

**Pro Tip**: If you see unrealistic times (800+ minutes), check that "Call Received Date/Time" was mapped to a TIME field in Data Formatter, not a date-only field.`,
          documentationLinks: [{
            title: "Complete Response Time Analyzer Guide",
            url: "/docs/users/RESPONSE_TIME_ANALYZER.md",
            section: "Complete Workflow"
          }],
          suggestions: [
            "Why are my response times unrealistic?",
            "How do I improve NFPA compliance?",
            "How do I generate reports for city council?"
          ],
          success: true
        };
      }
      
      if (lowerMessage.includes('nfpa') || lowerMessage.includes('compliance')) {
        return {
          message: `**NFPA 1710 Compliance Standards:**

**📏 Performance Standards**
• **Dispatch Time**: ≤60 seconds (call received → units dispatched)
• **Turnout Time**: ≤60 seconds (dispatched → en route)  
• **Travel Time**: ≤240 seconds (en route → on scene)
• **Total Response**: ≤300 seconds (5 minutes total for ALS)

**📊 How Compliance is Calculated**
• **90th Percentile Standard**: 90% of calls must meet time targets
• Example: If 90% of dispatch times are ≤60 seconds = COMPLIANT
• Color coding: Green = Compliant, Red = Non-Compliant

**🎯 Realistic Benchmarks for Small Departments**
• **Dispatch**: 30-45 seconds (excellent), 45-60 seconds (good)
• **Turnout**: 60-90 seconds (volunteers may need more time)
• **Travel**: Varies by geographic coverage area

**📈 Common Improvement Strategies**
• **Dispatch**: Better call processing, pre-alerting systems
• **Turnout**: Station alerting upgrades, gear pre-positioning  
• **Travel**: Strategic station placement, traffic signal preemption

**🚨 Data Quality Issues to Check**
• Times >20 minutes usually indicate field mapping errors
• "N/A" values show missing timestamp data
• Negative times indicate midnight rollover issues`,
          documentationLinks: [{
            title: "NFPA 1710 Compliance Guide",
            url: "/docs/users/RESPONSE_TIME_ANALYZER.md",
            section: "NFPA 1710 Standards"
          }],
          suggestions: [
            "How do I generate compliance reports?",
            "What are realistic response times for small departments?",
            "How do I fix unrealistic response time calculations?"
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