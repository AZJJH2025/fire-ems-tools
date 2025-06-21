import { ResponseTimeStatistics, IncidentRecord } from '@/types/analyzer';

/**
 * Professional Report Templates for Fire Departments
 * Creates executive-ready deliverables for city councils, grant applications, and annual reviews
 */

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'compliance' | 'performance' | 'grant' | 'executive';
  targetAudience: string[];
  sections: ReportSection[];
  metadata: ReportTemplateMetadata;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'statistics' | 'chart' | 'table' | 'recommendations' | 'narrative';
  content: string | object;
  required: boolean;
  order: number;
}

export interface ReportTemplateMetadata {
  version: string;
  lastUpdated: string;
  compatibleTools: string[];
  outputFormats: ('pdf' | 'word' | 'excel')[];
  estimatedPages: number;
  professionalLevel: 'executive' | 'technical' | 'public';
}

export interface ReportData {
  departmentInfo: DepartmentInfo;
  reportPeriod: ReportPeriod;
  responseTimeStats: ResponseTimeStatistics;
  incidentData: IncidentRecord[];
  complianceMetrics: ComplianceMetrics;
  customData?: Record<string, any>;
}

export interface DepartmentInfo {
  name: string;
  chief: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  jurisdiction: string;
  population: number;
  squareMiles: number;
  stations: number;
  apparatus: number;
  personnel: number;
}

export interface ReportPeriod {
  startDate: string;
  endDate: string;
  description: string; // e.g., "January 2025", "2024 Annual Report", "Q4 2024"
}

export interface ComplianceMetrics {
  nfpa1710: {
    dispatchCompliance: number;    // % of calls ≤60 seconds
    turnoutCompliance: number;     // % of calls ≤60 seconds  
    travelCompliance: number;      // % of calls ≤240 seconds
    totalResponseCompliance: number; // % of calls ≤300 seconds
    goal: number;                  // 90% for NFPA 1710
  };
  averageResponseTime: number;
  incidentVolume: {
    total: number;
    fire: number;
    ems: number;
    rescue: number;
    hazmat: number;
    other: number;
  };
  busyHours: string[];
  topIncidentTypes: Array<{ type: string; count: number; percentage: number }>;
}

/**
 * Monthly NFPA 1710 Compliance Report Template
 * Professional compliance documentation for regulatory requirements
 */
export const monthlyComplianceTemplate: ReportTemplate = {
  id: 'monthly_nfpa_1710_compliance',
  name: 'Monthly NFPA 1710 Compliance Report',
  description: 'Professional monthly compliance report documenting NFPA 1710 response time standards performance for regulatory review and city leadership.',
  category: 'compliance',
  targetAudience: ['Fire Chief', 'City Manager', 'Mayor', 'City Council', 'State Fire Marshal'],
  sections: [
    {
      id: 'executive_summary',
      title: 'Executive Summary',
      type: 'summary',
      content: `
## Executive Summary

The {{departmentName}} responded to {{totalIncidents}} emergency incidents during {{reportPeriod}}, achieving an overall NFPA 1710 compliance rate of {{overallCompliance}}%.

### Key Performance Highlights:
- **Dispatch Time Compliance**: {{dispatchCompliance}}% (Goal: 90% ≤60 seconds)
- **Turnout Time Compliance**: {{turnoutCompliance}}% (Goal: 90% ≤60 seconds)
- **Total Response Time Compliance**: {{totalResponseCompliance}}% (Goal: 90% ≤5 minutes)
- **Average Response Time**: {{averageResponseTime}} minutes

### Compliance Status:
{{#if compliant}}
✅ **COMPLIANT** - Department meets NFPA 1710 standards
{{else}}
⚠️ **NON-COMPLIANT** - Areas for improvement identified
{{/if}}

### Recommendations:
{{#each recommendations}}
- {{this}}
{{/each}}
      `,
      required: true,
      order: 1
    },
    {
      id: 'department_overview',
      title: 'Department Overview',
      type: 'narrative',
      content: `
## Department Overview

**{{departmentName}}** serves {{population}} residents across {{squareMiles}} square miles with {{stations}} fire stations, {{apparatus}} apparatus, and {{personnel}} personnel.

**Leadership**: {{chief}}, Fire Chief
**Jurisdiction**: {{jurisdiction}}
**Reporting Period**: {{reportPeriod}}

### Service Delivery Model:
The department operates under the NFPA 1710 standard for career fire departments, which establishes response time objectives for emergency incidents.
      `,
      required: true,
      order: 2
    },
    {
      id: 'nfpa_compliance_metrics',
      title: 'NFPA 1710 Compliance Metrics',
      type: 'statistics',
      content: {
        type: 'compliance_table',
        data: 'nfpa1710'
      },
      required: true,
      order: 3
    },
    {
      id: 'response_time_analysis',
      title: 'Response Time Analysis',
      type: 'chart',
      content: {
        type: 'response_time_histogram',
        data: 'responseTimeStats'
      },
      required: true,
      order: 4
    },
    {
      id: 'incident_volume_analysis',
      title: 'Incident Volume Analysis',
      type: 'table',
      content: {
        type: 'incident_breakdown',
        data: 'incidentVolume'
      },
      required: true,
      order: 5
    },
    {
      id: 'recommendations',
      title: 'Performance Recommendations',
      type: 'recommendations',
      content: `
## Performance Recommendations

Based on the analysis of {{reportPeriod}} response data, the following recommendations are provided:

### Operational Improvements:
{{#each operationalRecommendations}}
- {{this}}
{{/each}}

### Training Opportunities:
{{#each trainingRecommendations}}
- {{this}}
{{/each}}

### Resource Considerations:
{{#each resourceRecommendations}}
- {{this}}
{{/each}}

### Next Month's Focus:
{{nextMonthFocus}}
      `,
      required: true,
      order: 6
    }
  ],
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    compatibleTools: ['response-time-analyzer'],
    outputFormats: ['pdf', 'word'],
    estimatedPages: 8,
    professionalLevel: 'executive'
  }
};

/**
 * Annual Department Performance Report Template
 * Comprehensive year-end performance analysis for strategic planning
 */
export const annualPerformanceTemplate: ReportTemplate = {
  id: 'annual_department_performance',
  name: 'Annual Department Performance Report',
  description: 'Comprehensive annual report documenting department performance, trends, achievements, and strategic initiatives for city leadership and public transparency.',
  category: 'performance',
  targetAudience: ['City Council', 'Mayor', 'City Manager', 'Public', 'Media'],
  sections: [
    {
      id: 'message_from_chief',
      title: 'Message from the Fire Chief',
      type: 'narrative',
      content: `
## Message from Fire Chief {{chief}}

Dear Community Members and City Leadership,

I am pleased to present the {{year}} Annual Performance Report for the {{departmentName}}. This report highlights our commitment to protecting and serving our community with the highest standards of emergency response.

Throughout {{year}}, our dedicated team of {{personnel}} firefighters and emergency medical professionals responded to {{totalIncidents}} emergency calls, maintaining our mission of preserving life, property, and the environment.

### Year {{year}} Achievements:
{{#each achievements}}
- {{this}}
{{/each}}

### Looking Forward to {{nextYear}}:
{{#each futureInitiatives}}
- {{this}}
{{/each}}

We remain committed to continuous improvement and serving our community with excellence.

Respectfully,

**{{chief}}**  
Fire Chief, {{departmentName}}
      `,
      required: true,
      order: 1
    },
    {
      id: 'year_in_review',
      title: 'Year in Review',
      type: 'summary',
      content: `
## {{year}} Year in Review

### By the Numbers:
- **{{totalIncidents}}** Total Emergency Responses
- **{{averageResponseTime}}** Average Response Time
- **{{nfpaCompliance}}%** NFPA 1710 Compliance Rate
- **{{fireIncidents}}** Fire Incidents
- **{{emsIncidents}}** EMS Incidents
- **{{rescueIncidents}}** Rescue Incidents

### Major Incidents:
{{#each majorIncidents}}
- **{{date}}**: {{description}} - {{outcome}}
{{/each}}

### Community Impact:
- Lives Saved: {{livesSaved}}
- Property Saved: {{propertySaved}}
- Fire Loss: {{fireLoss}}
- EMS Transports: {{emsTransports}}
      `,
      required: true,
      order: 2
    },
    {
      id: 'performance_trends',
      title: 'Performance Trends',
      type: 'chart',
      content: {
        type: 'annual_trends',
        data: 'yearOverYear'
      },
      required: true,
      order: 3
    },
    {
      id: 'training_development',
      title: 'Training & Professional Development',
      type: 'narrative',
      content: `
## Training & Professional Development

### {{year}} Training Highlights:
{{#each trainingPrograms}}
- **{{name}}**: {{hours}} hours, {{participants}} personnel
{{/each}}

### Certifications Achieved:
{{#each certifications}}
- {{count}} personnel achieved {{certification}}
{{/each}}

### Continuing Education:
- Total Training Hours: {{totalTrainingHours}}
- Training Hours per Person: {{hoursPerPerson}}
- External Conference Attendance: {{conferenceAttendance}}
      `,
      required: true,
      order: 4
    },
    {
      id: 'community_outreach',
      title: 'Community Outreach & Education',
      type: 'narrative',
      content: `
## Community Outreach & Education

### Fire Prevention Programs:
{{#each preventionPrograms}}
- **{{name}}**: {{participants}} participants
{{/each}}

### School Programs:
- Fire Safety Education: {{schoolVisits}} schools reached
- Students Educated: {{studentsEducated}}

### Community Events:
{{#each communityEvents}}
- {{name}}: {{attendance}} attendees
{{/each}}

### Public Education Impact:
- Smoke Alarm Installations: {{smokeAlarms}}
- Home Safety Inspections: {{homeInspections}}
- CPR Training Provided: {{cprTraining}} citizens
      `,
      required: true,
      order: 5
    },
    {
      id: 'strategic_initiatives',
      title: 'Strategic Initiatives & Future Planning',
      type: 'narrative',
      content: `
## Strategic Initiatives & Future Planning

### {{year}} Initiative Outcomes:
{{#each completedInitiatives}}
- **{{name}}**: {{status}} - {{outcome}}
{{/each}}

### {{nextYear}} Strategic Priorities:
{{#each nextYearPriorities}}
1. **{{title}}**
   - Objective: {{objective}}
   - Timeline: {{timeline}}
   - Resources Required: {{resources}}
{{/each}}

### Long-term Vision ({{futureYear}}):
{{longTermVision}}

### Funding Requirements:
{{#each fundingNeeds}}
- {{item}}: \${{amount}} - {{justification}}
{{/each}}
      `,
      required: true,
      order: 6
    }
  ],
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    compatibleTools: ['response-time-analyzer', 'fire-map-pro'],
    outputFormats: ['pdf', 'word'],
    estimatedPages: 24,
    professionalLevel: 'executive'
  }
};

/**
 * Grant Application Data Package Template
 * Professional data package for federal and state grant applications
 */
export const grantApplicationTemplate: ReportTemplate = {
  id: 'grant_application_package',
  name: 'Grant Application Data Package',
  description: 'Comprehensive data package for federal and state grant applications including FEMA AFG, SAFER, and state funding programs.',
  category: 'grant',
  targetAudience: ['Grant Reviewers', 'FEMA', 'State Agencies', 'Foundation Officers'],
  sections: [
    {
      id: 'executive_summary',
      title: 'Project Executive Summary',
      type: 'summary',
      content: `
## Project Executive Summary

**Applicant**: {{departmentName}}
**Grant Program**: {{grantProgram}}
**Request Amount**: \${{requestAmount}}
**Project Title**: {{projectTitle}}

### Community Profile:
The {{departmentName}} serves {{population}} residents across {{squareMiles}} square miles in {{jurisdiction}}. Our department operates {{stations}} fire stations with {{apparatus}} apparatus and {{personnel}} personnel.

### Project Need:
{{projectNeed}}

### Performance Data Supporting Need:
- Current Response Time: {{currentResponseTime}} minutes
- NFPA 1710 Compliance: {{nfpaCompliance}}%
- Annual Incident Volume: {{totalIncidents}} calls
- Service Gap: {{serviceGap}}

### Expected Outcomes:
{{#each expectedOutcomes}}
- {{this}}
{{/each}}

### Return on Investment:
This investment will improve emergency response capability for {{beneficiaries}} residents, reducing response times by {{timeReduction}} and improving NFPA compliance to {{targetCompliance}}%.
      `,
      required: true,
      order: 1
    },
    {
      id: 'needs_assessment',
      title: 'Needs Assessment & Data Analysis',
      type: 'statistics',
      content: {
        type: 'comprehensive_needs_analysis',
        data: 'grantNeedsAnalysis'
      },
      required: true,
      order: 2
    },
    {
      id: 'performance_metrics',
      title: 'Current Performance Metrics',
      type: 'table',
      content: {
        type: 'grant_performance_table',
        data: 'currentPerformance'
      },
      required: true,
      order: 3
    },
    {
      id: 'cost_benefit_analysis',
      title: 'Cost-Benefit Analysis',
      type: 'narrative',
      content: `
## Cost-Benefit Analysis

### Project Costs:
{{#each projectCosts}}
- {{item}}: \${{cost}} - {{justification}}
{{/each}}

**Total Project Cost**: \${{totalCost}}
**Grant Request**: \${{grantRequest}}
**Local Match**: \${{localMatch}} ({{matchPercentage}}%)

### Quantified Benefits:
- **Lives Saved Annually**: {{livesSaved}}
- **Property Protection**: \${{propertyProtection}}
- **Reduced Fire Loss**: \${{reducedLoss}}
- **Improved Response Time**: {{timeImprovement}} minutes
- **Additional Coverage**: {{additionalCoverage}} residents

### Cost per Beneficiary:
\${{costPerBeneficiary}} per resident served

### Return on Investment:
For every \$1 invested, the community receives \${{roi}} in benefits through improved emergency response capability and reduced losses.
      `,
      required: true,
      order: 4
    },
    {
      id: 'implementation_plan',
      title: 'Implementation Plan & Timeline',
      type: 'narrative',
      content: `
## Implementation Plan & Timeline

### Project Timeline:
{{#each timeline}}
- **{{phase}}** ({{duration}}): {{activities}}
{{/each}}

### Key Milestones:
{{#each milestones}}
- {{date}}: {{milestone}}
{{/each}}

### Risk Management:
{{#each risks}}
- **Risk**: {{risk}}
- **Mitigation**: {{mitigation}}
- **Probability**: {{probability}}
{{/each}}

### Performance Metrics:
{{#each performanceMetrics}}
- {{metric}}: Current {{current}} → Target {{target}}
{{/each}}

### Sustainability Plan:
{{sustainabilityPlan}}
      `,
      required: true,
      order: 5
    }
  ],
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    compatibleTools: ['response-time-analyzer', 'fire-map-pro'],
    outputFormats: ['pdf', 'word', 'excel'],
    estimatedPages: 16,
    professionalLevel: 'technical'
  }
};

/**
 * City Council Executive Summary Template
 * Concise executive briefing for city leadership meetings
 */
export const cityCouncilSummaryTemplate: ReportTemplate = {
  id: 'city_council_executive_summary',
  name: 'City Council Executive Summary',
  description: 'Concise executive briefing for city council meetings highlighting key performance metrics and departmental needs.',
  category: 'executive',
  targetAudience: ['City Council', 'Mayor', 'City Manager', 'Budget Director'],
  sections: [
    {
      id: 'performance_dashboard',
      title: 'Performance Dashboard',
      type: 'summary',
      content: `
# Fire Department Performance Summary
**{{reportPeriod}}** | **{{departmentName}}**

## Key Metrics

| Metric | Current | Goal | Status |
|--------|---------|------|--------|
| **Response Time** | {{averageResponseTime}} min | ≤5 min | {{responseStatus}} |
| **NFPA Compliance** | {{nfpaCompliance}}% | 90% | {{complianceStatus}} |
| **Total Incidents** | {{totalIncidents}} | - | {{trendIndicator}} |
| **Budget Utilization** | {{budgetUtilization}}% | <100% | {{budgetStatus}} |

## Performance Highlights
{{#each highlights}}
- {{this}}
{{/each}}

## Areas of Concern
{{#each concerns}}
- {{this}}
{{/each}}
      `,
      required: true,
      order: 1
    },
    {
      id: 'budget_impact',
      title: 'Budget Impact & Resource Needs',
      type: 'narrative',
      content: `
## Budget Impact & Resource Needs

### Current Budget Performance:
- **Personnel Costs**: {{personnelCosts}}% of budget
- **Equipment/Maintenance**: {{equipmentCosts}}% of budget
- **Operations**: {{operationsCosts}}% of budget
- **Training**: {{trainingCosts}}% of budget

### Immediate Needs ({{currentFY}}):
{{#each immediateNeeds}}
- **{{item}}**: \${{cost}} - {{urgency}}
{{/each}}

### Future Budget Considerations ({{nextFY}}):
{{#each futureBudgetItems}}
- {{item}}: \${{estimatedCost}}
{{/each}}

### Cost Avoidance:
Through effective emergency response, the department prevented an estimated \${{costAvoidance}} in fire losses during {{reportPeriod}}.
      `,
      required: true,
      order: 2
    },
    {
      id: 'council_recommendations',
      title: 'Recommendations for Council Action',
      type: 'recommendations',
      content: `
## Recommendations for Council Action

### Immediate Actions Required:
{{#each immediateActions}}
1. **{{action}}**
   - **Rationale**: {{rationale}}
   - **Cost**: {{cost}}
   - **Timeline**: {{timeline}}
   - **Impact**: {{impact}}
{{/each}}

### Future Considerations:
{{#each futureConsiderations}}
- {{consideration}}
{{/each}}

### Policy Implications:
{{#each policyImplications}}
- {{implication}}
{{/each}}

### Community Benefit:
{{communityBenefit}}
      `,
      required: true,
      order: 3
    }
  ],
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    compatibleTools: ['response-time-analyzer'],
    outputFormats: ['pdf', 'word'],
    estimatedPages: 4,
    professionalLevel: 'executive'
  }
};

/**
 * All available report templates
 */
export const reportTemplates: ReportTemplate[] = [
  monthlyComplianceTemplate,
  annualPerformanceTemplate,
  grantApplicationTemplate,
  cityCouncilSummaryTemplate
];

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: string): ReportTemplate[] => {
  return reportTemplates.filter(template => template.category === category);
};

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): ReportTemplate | undefined => {
  return reportTemplates.find(template => template.id === id);
};

/**
 * Get templates compatible with specific tool
 */
export const getTemplatesForTool = (toolId: string): ReportTemplate[] => {
  return reportTemplates.filter(template => 
    template.metadata.compatibleTools.includes(toolId)
  );
};