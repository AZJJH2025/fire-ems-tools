import { useState, useCallback } from 'react';

export interface AIServiceStatus {
  enabled: boolean;
  has_api_key: boolean;
  model: string;
  max_tokens: number;
  status: 'ready' | 'error' | 'disabled';
}

export interface AIAnalysisResult {
  success: boolean;
  insight?: string;
  source: 'ai' | 'fallback';
  model?: string;
  timestamp: string;
  sanitized?: boolean;
  error?: string;
  user?: {
    id: number;
    department: string;
  };
}

export interface ComplianceMetrics {
  incident_count?: number;
  avg_response_time?: number;
  dispatch_time_90th?: number;
  turnout_time_90th?: number;
  total_response_90th?: number;
}

export const useAIService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async (): Promise<AIServiceStatus | null> => {
    try {
      setError(null);
      const response = await fetch('/ai/debug', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.ai_service_status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('AI Status Error:', errorMessage);
      return null;
    }
  }, []);

  const analyzeData = useCallback(async (
    dataSummary: string,
    query?: string
  ): Promise<AIAnalysisResult | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/ai/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          data_summary: dataSummary,
          query: query || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      console.error('AI Analysis Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const checkCompliance = useCallback(async (
    metrics: ComplianceMetrics
  ): Promise<AIAnalysisResult | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/ai/api/compliance-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(metrics)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Compliance check failed';
      setError(errorMessage);
      console.error('AI Compliance Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateInsights = useCallback(async (
    responseTimeData: any[]
  ): Promise<AIAnalysisResult | null> => {
    if (!responseTimeData || responseTimeData.length === 0) {
      return {
        success: false,
        error: 'No response time data provided',
        source: 'fallback',
        timestamp: new Date().toISOString()
      };
    }

    // Calculate summary statistics
    const totalIncidents = responseTimeData.length;
    const avgResponseTime = responseTimeData.reduce((sum, incident) => {
      const responseTime = incident.totalResponseTime || 0;
      return sum + responseTime;
    }, 0) / totalIncidents;

    const dispatchTimes = responseTimeData
      .map(i => i.dispatchTime || 0)
      .filter(t => t > 0)
      .sort((a, b) => a - b);
    
    const turnoutTimes = responseTimeData
      .map(i => i.turnoutTime || 0)
      .filter(t => t > 0)
      .sort((a, b) => a - b);

    const dispatch90th = dispatchTimes.length > 0 
      ? dispatchTimes[Math.floor(dispatchTimes.length * 0.9)] 
      : 0;
    
    const turnout90th = turnoutTimes.length > 0 
      ? turnoutTimes[Math.floor(turnoutTimes.length * 0.9)] 
      : 0;

    const dataSummary = `Fire department response time analysis: ${totalIncidents} incidents, ` +
      `average response time ${(avgResponseTime / 60).toFixed(1)} minutes, ` +
      `90th percentile dispatch time ${dispatch90th} seconds, ` +
      `90th percentile turnout time ${turnout90th} seconds.`;

    return analyzeData(dataSummary, 'Provide NFPA 1710 compliance analysis and improvement recommendations.');
  }, [analyzeData]);

  return {
    loading,
    error,
    checkStatus,
    analyzeData,
    checkCompliance,
    generateInsights
  };
};

export default useAIService;