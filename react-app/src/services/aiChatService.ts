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
      enableAI: true, // Re-enabled with enhanced Fire EMS-specific backend prompts
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
COMPREHENSIVE DATA FORMATTER DOCUMENTATION:

PURPOSE & WORKFLOW:
- Transform raw CAD exports into standardized format for Fire EMS Tools analysis
- Complete workflow: Upload → Auto-Map → Manual Adjust → Validate → Export
- Supports all major CAD vendors: Tyler, Hexagon, Console One, TriTech

SUPPORTED FILE FORMATS:
- CSV (Comma Separated Values) - Primary format
- Excel (.xlsx, .xls) - Automatically converted
- TSV (Tab Separated) - Common CAD export format
- Text files with delimiters

KEY FEATURES:
- Smart Auto-Mapping: Detects field patterns from major CAD systems
- Manual Field Mapping: Drag-and-drop interface for precise control
- Live Preview: Real-time data validation and preview
- Data Quality Analysis: AI-powered 0-100% quality scoring
- Template Management: Save and reuse mappings for monthly workflows
- Export Integration: Direct export to all Fire EMS analysis tools

FIELD MAPPING PROCESS:
1. Upload: System analyzes CSV structure and field names
2. Auto-Detection: Recognizes common patterns (Tyler "ALARM_TIME", Console One "INC_DATE_TIME")
3. Target Fields Panel: Shows required/optional fields for selected analysis tool
4. Manual Mapping: Drag source fields to target fields or use dropdown selection
5. Validation: Real-time validation with red/green indicators
6. Live Preview: Bottom panel shows transformed data sample

COMMON FIELD MAPPING ISSUES:
- Split Date/Time: CAD exports often separate "Date" and "Time" - combine to datetime field
- Field Name Variations: "Call Time" vs "Incident Time" vs "Alarm Time" - all valid
- Required vs Optional: Red "Required" fields must be mapped, blue "Optional" enhance analysis
- Data Types: Ensure time fields map to TIME targets, not DATE targets
- Geographic Data: Address parsing for city/state, coordinate extraction from POINT data

CAD VENDOR SPECIFICS:
- Tyler Technologies: Mixed naming conventions, "ALARM_TIME", "INCIDENT_DATE"
- Console One: Underscore format, "INC_DATE_TIME", "PROBLEM_TYPE", "UNIT_ID"  
- Hexagon/Intergraph: PascalCase, "CallDateTime", "DispatchDateTime"
- TriTech/CentralSquare: Underscore case, "EventNum", "Call_Date_Time"

DATA QUALITY FEATURES:
- AI Analysis: Comprehensive quality scoring based on completeness, accuracy
- Tool Compatibility: Shows which analysis tools work best with current data
- Missing Field Detection: Identifies gaps in critical data
- Format Validation: Ensures data types match tool requirements
- Improvement Suggestions: AI recommendations for better data quality

EXPORT OPTIONS:
- Send to Response Time Analyzer: NFPA 1710 compliance analysis
- Send to Fire Map Pro: Geographic incident mapping and coverage analysis
- Send to Water Supply Coverage: Tank and hydrant coverage analysis
- Download Clean CSV: Standardized format for other systems
- Professional Reports: Integration with report generation tools

TROUBLESHOOTING COMMON ISSUES:
- "800+ minute response times": Usually indicates date-only field mapped to time field
- "No fields auto-mapped": Check field naming conventions, try manual mapping
- "Required fields missing": Ensure all red "Required" fields have source mappings
- "Data looks wrong in preview": Check field mapping accuracy, verify source data
- "Export fails": Validate all required fields are properly mapped

PROFESSIONAL USE CASES:
- Monthly CAD processing: Create templates for recurring workflows
- Multi-department sharing: Export templates for mutual aid departments
- Compliance reporting: Ensure data meets NFPA/NEMSIS standards
- Grant applications: Professional data packages for funding requests
      `,
      'response-time-analyzer': `
COMPREHENSIVE RESPONSE TIME ANALYZER DOCUMENTATION:

PURPOSE & NFPA 1710 STANDARDS:
- Professional NFPA 1710 compliance analysis and reporting
- Standards: ≤60 sec dispatch, ≤60 sec turnout, ≤240 sec travel, ≤300 sec total
- 90th percentile measurement (90% of calls must meet standards)
- Color-coded compliance: Green = compliant, Red = non-compliant

CORE CALCULATIONS:
- Dispatch Time: Call received → Units notified (Target: ≤60 seconds)
- Turnout Time: Units notified → En route (Target: ≤60 seconds)  
- Travel Time: En route → On scene (Target: ≤240 seconds)
- Total Response: Call received → On scene (Target: ≤300 seconds ALS)
- Scene Time: On scene → Clear/available (Operational metric)

REQUIRED DATA FIELDS:
- Incident ID: Unique identifier for each call
- Incident Date: Date of the emergency call
- Incident Time: Complete timestamp of call received
- Optional but valuable: Dispatch time, en route time, arrival time, clear time

GEOGRAPHIC ANALYSIS:
- Interactive incident map with color-coded response times
- Blue markers: Good performance (meeting NFPA standards)
- Red markers: Performance needs improvement
- Coverage area analysis with response time heatmaps
- Station coverage assessment and optimization recommendations

PROFESSIONAL REPORTING:
- Monthly Compliance Reports: Official NFPA 1710 compliance documentation
- Executive Summaries: High-level performance for city managers/councils
- Grant Application Data: Professional data packages for funding requests
- Annual Performance Reports: Comprehensive year-end analysis
- Custom Reports: Configurable sections and metrics

DATA QUALITY INTELLIGENCE:
- Smart data validation: Detects unrealistic times (800+ minutes)
- Missing data handling: Professional "N/A" display vs false calculations
- Date-only detection: Prevents incorrect calculations from incomplete timestamps
- Timezone handling: Proper local time parsing and conversion
- Quality scoring: Data completeness and accuracy assessment

COMMON ISSUES & SOLUTIONS:
- Unrealistic Response Times (800+ minutes):
  * Root cause: Date-only field mapped to incident_time instead of datetime
  * Solution: Re-map "Call Received Date/Time" to TIME field in Data Formatter
  * Prevention: Ensure datetime fields include time component
- Missing Time Data:
  * Symptom: Many incidents showing "N/A" for response times
  * Cause: Missing timestamp fields in source data
  * Solution: Work with CAD administrator to include complete time fields
- Negative Time Calculations:
  * Cause: Midnight rollover (clear time next day)
  * Solution: System automatically adjusts for 24-hour rollover

NFPA COMPLIANCE BENCHMARKS:
- Excellent Performance: 95%+ compliance across all metrics
- Good Performance: 85-94% compliance (industry average)
- Needs Improvement: 70-84% compliance (focus areas identified)
- Critical Issues: <70% compliance (significant operational changes needed)

PROFESSIONAL USE CASES:
- Monthly city council presentations: Professional compliance reporting
- Budget justification: Performance data supporting resource requests
- Operational improvement: Identify specific areas needing attention
- Regional comparisons: Benchmark against similar departments
- Grant applications: Professional performance documentation

INTEGRATION WITH OTHER TOOLS:
- Data Formatter: Clean, validated data for accurate calculations
- Fire Map Pro: Geographic context for response time analysis
- Professional Reports: Executive-ready compliance documentation
- Template Management: Consistent monthly analysis workflows
      `,
      'fire-map-pro': `
COMPREHENSIVE FIRE MAP PRO DOCUMENTATION:

PURPOSE & CAPABILITIES:
- Professional geographic incident analysis and fire department operations planning
- Interactive incident mapping with comprehensive coverage analysis
- Station location optimization and mutual aid coordination
- Professional map exports for presentations and strategic planning

CORE MAPPING FEATURES:
- Real-time incident plotting with custom markers and pop-ups
- Multiple base maps: Street, satellite, terrain, fire service specific
- Layer management: Incidents, stations, coverage areas, water supply
- Interactive analysis tools: Measure distances, calculate coverage areas
- Professional styling with department branding and legend customization

INCIDENT ANALYSIS:
- Color-coded incident mapping by type, severity, or response metrics
- Heat map generation for call density and geographic patterns
- Temporal analysis: Time-based incident pattern visualization
- Response area analysis: Coverage gaps and optimization opportunities
- Statistical overlays: Population density, risk assessment, resource allocation

COVERAGE ANALYSIS:
- Station coverage modeling with drive-time calculations
- ISO rating analysis: 4-minute and 8-minute response area mapping  
- Mutual aid visualization: Automatic aid and response agreements
- Resource deployment: Apparatus positioning and coverage optimization
- Water supply integration: Hydrant and tank coverage coordination

PROFESSIONAL OUTPUTS:
- High-resolution map exports (PDF, PNG, JPG) for presentations
- Executive summary maps for city council and budget presentations
- Strategic planning documents with coverage analysis and recommendations
- Grant application maps: Professional visuals supporting funding requests
- Training materials: Pre-incident planning and response area familiarization

DATA REQUIREMENTS:
- Geographic coordinates (latitude/longitude) or addresses for geocoding
- Incident data: ID, date/time, type, location for comprehensive analysis
- Station data: Locations, apparatus, staffing for coverage modeling
- Optional: Response times, unit assignments, water supply locations

INTEGRATION CAPABILITIES:
- Data Formatter: Automatic import of cleaned incident data
- Response Time Analyzer: Geographic context for response performance
- Water Supply Coverage: Integrated hydrant and tank analysis
- CAD System Integration: Real-time or batch import from major vendors

COMMON USE CASES:
- Monthly incident analysis: Geographic patterns and trends
- Station planning: Coverage gap analysis and optimization
- Mutual aid agreements: Response area coordination and documentation
- ISO rating preparation: Coverage area documentation for rating improvements
- Emergency planning: Pre-incident planning and resource deployment
- Community education: Professional maps for fire prevention and public information

TROUBLESHOOTING:
- "No incidents on map": Check coordinate data, verify latitude/longitude format
- "Map not loading": Verify internet connection for base map tiles
- "Coverage analysis incomplete": Ensure station location data is accurate
- "Export quality poor": Use high-resolution export settings for presentations
- "Performance slow": Consider data filtering for large incident datasets
      `,
      'water-supply-coverage': `
COMPREHENSIVE WATER SUPPLY COVERAGE DOCUMENTATION:

PURPOSE & FIRE PROTECTION ANALYSIS:
- Water supply analysis for fire suppression capabilities
- Tank and hydrant coverage modeling with drive-time calculations  
- PA 17 compliance reporting for Pennsylvania fire departments
- Infrastructure gap analysis and improvement recommendations

COVERAGE CALCULATIONS:
- Drive-time analysis: 4, 6, and 8-minute coverage areas from water sources
- Flow capacity modeling: GPM calculations for fire suppression requirements
- Tanker shuttle analysis: Rural water supply operations and efficiency
- Coverage gap identification: Areas lacking adequate water supply access

WATER SOURCE MANAGEMENT:
- Fire hydrant inventory and flow testing results
- Tank and cistern capacity tracking and accessibility
- Dry hydrant locations and seasonal availability
- Alternative water sources: Ponds, streams, swimming pools

PROFESSIONAL REPORTING:
- PA 17 Compliance Reports: Official Pennsylvania regulatory documentation
- Infrastructure assessments: Water supply adequacy and improvement needs
- Budget justification: Professional documentation for infrastructure investments
- Grant applications: Water supply deficiency documentation for funding

COMPLIANCE STANDARDS:
- Pennsylvania Act 17: Water supply requirements for fire protection
- NFPA standards: Water supply flow and pressure requirements
- ISO rating factors: Water supply contribution to community rating
- Regional standards: Local and state water supply requirements

INTEGRATION & ANALYSIS:
- Fire Map Pro: Comprehensive geographic water supply visualization
- Response Time Analyzer: Water supply impact on response effectiveness  
- Data Formatter: Clean import of hydrant and tank inventory data
- Professional reporting: Executive documentation and improvement plans
      `
    };

    return contexts[context || 'general'] || `
GENERAL FIRE EMS TOOLS COMPREHENSIVE KNOWLEDGE BASE:

COMPLETE ANALYTICS SUITE:
- Professional fire department analytics and reporting platform
- Designed specifically for small and volunteer fire departments
- Enterprise-grade tools with user-friendly interfaces
- Complete workflow: Data → Analysis → Professional Reports

CORE TOOLS:
1. Data Formatter: Universal CAD integration and data standardization
2. Response Time Analyzer: NFPA 1710 compliance and performance analysis
3. Fire Map Pro: Geographic incident analysis and coverage planning
4. Water Supply Coverage: Water source analysis and infrastructure planning

AI-POWERED FEATURES:
- Intelligent data quality analysis and scoring (0-100%)
- Smart field mapping suggestions based on CAD vendor patterns
- Automated compliance assessment and improvement recommendations
- Tool compatibility analysis and workflow optimization

PROFESSIONAL STANDARDS COMPLIANCE:
- NFPA 1710: Emergency services deployment and response time standards
- NEMSIS: National EMS Information System data standards
- ISO Fire Suppression Rating: Community fire protection assessment
- State regulations: PA 17 and other regional compliance requirements

TARGET USERS:
- Fire Chiefs: Strategic planning and compliance reporting
- Fire Department Analysts: Data processing and performance analysis  
- City Managers: Budget planning and resource allocation
- Grant Writers: Professional data packages for funding applications

WORKFLOW INTEGRATION:
- Monthly CAD processing: Template-based recurring analysis
- Professional reporting: City council presentations and compliance documentation
- Cross-department sharing: Mutual aid and regional coordination
- Continuous improvement: Performance tracking and optimization recommendations
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
   * Get tool-specific context for enhanced AI responses
   */
  private getToolSpecificContext(context?: string): string {
    switch (context) {
      case 'data-formatter':
        return `
TOOL-SPECIFIC KNOWLEDGE (Data Formatter):
- Primary purpose: Transform raw CAD exports into standardized format for analysis
- Supports all major CAD vendors: Tyler, Hexagon/Intergraph, Console One, TriTech/CentralSquare
- Auto-mapping detects common field patterns and suggests mappings
- Required fields: Incident ID, Date/Time for basic functionality
- Optional fields enhance analysis: Geographic data, incident types, response times
- Common issues: Split date/time fields, field name variations, data quality problems
- Output: Clean, standardized data ready for Response Time Analyzer, Fire Map Pro, etc.`;
      
      case 'response-time-analyzer':
        return `
TOOL-SPECIFIC KNOWLEDGE (Response Time Analyzer):
- Primary purpose: NFPA 1710 compliance analysis and professional reporting
- NFPA 1710 Standards: ≤60 sec dispatch, ≤60 sec turnout, ≤240 sec travel, ≤300 sec total
- Calculates: Dispatch time, turnout time, travel time, total response time
- Geographic mapping: Color-coded incident maps showing response performance
- Professional reports: City council presentations, grant applications, compliance documentation
- Common issues: Unrealistic times (800+ minutes) usually indicate field mapping problems`;

      case 'fire-map-pro':
        return `
TOOL-SPECIFIC KNOWLEDGE (Fire Map Pro):
- Primary purpose: Geographic incident analysis and coverage planning
- Interactive mapping with incident plotting and analysis
- Coverage analysis: Station locations, response areas, mutual aid
- Professional map exports for presentations and planning
- Requires: Latitude/longitude coordinates or addresses for geocoding`;

      case 'water-supply-coverage':
        return `
TOOL-SPECIFIC KNOWLEDGE (Water Supply Coverage):
- Primary purpose: Water supply analysis for fire suppression
- Tank and hydrant coverage analysis with drive-time calculations
- PA 17 compliance reporting for Pennsylvania departments
- Coverage gap identification and recommendations
- Professional exports for infrastructure planning`;

      default:
        return `
GENERAL FIRE EMS TOOLS KNOWLEDGE:
- Complete analytics suite for fire departments of all sizes
- Tools work together: Data Formatter → Analysis Tools → Professional Reports
- Designed for small/volunteer departments with limited IT resources
- Professional outputs suitable for city councils, grant applications, compliance`;
    }
  }

  /**
   * Build system prompt for AI responses
   */
  private buildSystemPrompt(context?: string): string {
    const toolSpecificContext = this.getToolSpecificContext(context);
    
    return `You are the Fire EMS Tools AI Assistant, a specialized expert system designed specifically for fire departments, EMS agencies, and emergency services professionals.

CORE EXPERTISE:
- Fire/EMS data analysis, CAD system integration, NFPA 1710 compliance
- Response time analysis, geographic mapping, water supply coverage
- Professional reporting for city councils, grant applications, regulatory compliance
- Field mapping from major CAD vendors (Tyler, Hexagon, Console One, TriTech)

CURRENT CONTEXT: ${context || 'general help'}
${toolSpecificContext}

RESPONSE GUIDELINES:
1. **Be Comprehensive**: Provide detailed, step-by-step instructions when asked "how to" questions
2. **Fire/EMS Focused**: Always relate answers to fire department operations and needs
3. **Professional Standards**: Reference NFPA 1710, NEMSIS standards, and compliance requirements
4. **Practical Solutions**: Give actionable guidance that fire chiefs and analysts can immediately use
5. **Tool Integration**: Explain how different Fire EMS Tools work together for complete analysis workflows

COMMON USER NEEDS:
- Monthly CAD data processing workflows
- NFPA 1710 compliance analysis and reporting
- Field mapping for various CAD systems
- Professional report generation for city leadership
- Geographic analysis for station coverage and response optimization
- Data quality improvement and validation

EXAMPLE RESPONSE STYLE:
When users ask "How do I use this tool?", provide a complete 5-step workflow with:
- **STEP 1: Upload/Import** - Specific file formats, CAD system support
- **STEP 2: Field Mapping** - Auto-detection, manual mapping, validation
- **STEP 3: Data Processing** - Analysis, calculations, quality checks  
- **STEP 4: Review Results** - Interpretation, compliance assessment
- **STEP 5: Export/Report** - Professional outputs, sharing options

Always include relevant emojis (📁 📊 🔍 ⚙️ 🚀) and format responses with clear headers and bullet points for easy scanning.

Remember: You're assisting fire department professionals who need reliable, detailed guidance for critical emergency services operations.`;
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