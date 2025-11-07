import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SystemHealth {
  status: string;
  metrics: {
    timestamp: string;
    operations_total: number;
    operations_per_second: number;
    avg_response_time_ms: number;
    error_rate_percent: number;
    memory_usage_mb: number;
  };
  healer_stats: {
    total_healings: number;
    successful_healings: number;
  };
}

interface Opportunity {
  id: string;
  pair: string;
  profit_percent: number;
  execution_steps: string[];
  risk_level: 'low' | 'medium' | 'high';
}

interface WorkflowStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
}

interface Workflow {
  id: string;
  topic: string;
  enhancedTopic?: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  steps: WorkflowStep[];
}

function App() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatorStatus, setCreatorStatus] = useState('');
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [workflowInterval, setWorkflowInterval] = useState<NodeJS.Timeout | null>(null);

  // PHASE 1: Auto-refresh health metrics every 3 seconds
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await axios.get('/api/pilot/system-health');
        setHealth(res.data.data);
      } catch (err) {
        console.error('Health fetch error:', err);
      }
    };
    
    fetchHealth();
    const interval = setInterval(fetchHealth, 3000);
    return () => clearInterval(interval);
  }, []);

  // PHASE 2: Fetch Atlas opportunities
  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/pilot/atlas/opportunities');
      setOpportunities(res.data.data.opportunities);
    } catch (err) {
      console.error('Atlas fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // PHASE 3: Generate video with real API integration
  const generateVideo = async () => {
    if (!topic.trim()) return;
    
    try {
      setLoading(true);
      setCreatorStatus('🔄 Initializing video creation...');
      
      const res = await axios.post('/api/pilot/creator/generate', { topic });
      
      if (res.data.success) {
        // Start polling for workflow status
        const workflowId = res.data.data.workflow_id;
        startWorkflowPolling(workflowId);
      } else {
        setCreatorStatus('❌ Failed to start video creation');
        setLoading(false);
      }
    } catch (err) {
      setCreatorStatus('❌ Generation failed: ' + (err as any).message);
      setLoading(false);
    }
  };

  // Start polling for workflow status
  const startWorkflowPolling = (workflowId: string) => {
    // Clear any existing interval
    if (workflowInterval) {
      clearInterval(workflowInterval);
    }
    
    // Set up new interval
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/api/pilot/creator/status/${workflowId}`);
        if (res.data.success) {
          const workflow = res.data.data;
          setCurrentWorkflow(workflow);
          
          // Display enhanced topic when available
          if (workflow.enhancedTopic && workflow.steps[0]?.status === 'completed') {
            setCreatorStatus(`✨ Great idea! Creating video: "${workflow.enhancedTopic}"\n🔄 Progress: ${workflow.progress}%`);
          } else {
            setCreatorStatus(`🔄 Processing: ${workflow.progress}% complete`);
          }
          
          // If workflow is completed or failed, stop polling
          if (workflow.status === 'completed' || workflow.status === 'failed') {
            clearInterval(interval);
            setWorkflowInterval(null);
            setLoading(false);
            
            if (workflow.status === 'completed') {
              setCreatorStatus(`✅ Video "${workflow.enhancedTopic}" created successfully!`);
            } else {
              setCreatorStatus('❌ Video creation failed');
            }
            
            // Clear status message after 5 seconds
            setTimeout(() => setCreatorStatus(''), 5000);
          }
        }
      } catch (err) {
        console.error('Workflow status error:', err);
        clearInterval(interval);
        setWorkflowInterval(null);
        setCreatorStatus('❌ Failed to get workflow status');
        setLoading(false);
      }
    }, 1000);
    
    setWorkflowInterval(interval);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500';
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (workflowInterval) {
        clearInterval(workflowInterval);
      }
    };
  }, [workflowInterval]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">
            🚀 Amrikyy-Zentix Pilot Test
          </h1>
          <p className="text-xl text-purple-200">
            MVP Integration Dashboard - Live Demo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* PHASE 1: System Health Widget */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">📊 System Health Monitor</h2>
              {health && (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(health.status)}`}>
                  {health.status.toUpperCase()}
                </span>
              )}
            </div>
            
            {health ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard label="Operations" value={health.metrics.operations_total} />
                  <MetricCard label="Ops/Sec" value={health.metrics.operations_per_second.toFixed(2)} />
                  <MetricCard label="Error Rate" value={`${health.metrics.error_rate_percent.toFixed(2)}%`} />
                  <MetricCard label="Memory" value={`${health.metrics.memory_usage_mb.toFixed(1)}MB`} />
                  <MetricCard label="Response" value={`${health.metrics.avg_response_time_ms.toFixed(0)}ms`} />
                  <MetricCard label="Healings" value={health.healer_stats.total_healings} />
                </div>
                <div className="text-xs text-purple-200 text-right">
                  Updated: {new Date(health.metrics.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="text-white/50">Loading metrics...</div>
            )}
          </div>

          {/* PHASE 2: Atlas Finance Widget */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">💰 Atlas Finance</h2>
            
            <button
              onClick={fetchOpportunities}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all mb-4"
            >
              {loading ? '⏳ Loading...' : '🔄 Update Opportunities'}
            </button>

            <div className="space-y-3">
              {opportunities.length === 0 ? (
                <div className="text-white/50 text-center py-4">
                  Click &quot;Update Opportunities&quot; to fetch data
                </div>
              ) : (
                opportunities.map(opp => (
                  <div key={opp.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-white/70 font-mono">{opp.pair}</div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getRiskColor(opp.risk_level)}`}>
                        {opp.risk_level.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      +{opp.profit_percent.toFixed(2)}% Profit
                    </div>
                    <div className="text-xs text-white/60">
                      {opp.execution_steps.length} steps
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* PHASE 3: Mini Creator Studio */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">🎬 Mini Creator Studio</h2>
          
          <div className="max-w-2xl mx-auto">
            <label className="block text-white font-semibold mb-3">Video Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'Interesting facts about space exploration'"
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/40 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              disabled={loading}
            />
            
            <button
              onClick={generateVideo}
              disabled={loading || !topic.trim()}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? '🔄 Creating Video...' : '🚀 Create Video'}
            </button>

            {creatorStatus && (
              <div className="mt-6 p-4 bg-white/10 rounded-xl text-center text-white font-semibold">
                {creatorStatus}
              </div>
            )}
            
            {/* Workflow progress visualization */}
            {currentWorkflow && (
              <div className="mt-6 p-4 bg-white/5 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">Progress</span>
                  <span className="text-purple-200">{currentWorkflow.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full" 
                    style={{ width: `${currentWorkflow.progress}%` }}
                  ></div>
                </div>
                
                <div className="mt-4 space-y-2">
                  {currentWorkflow.steps.map((step, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className={`w-4 h-4 rounded-full mr-2 ${
                        step.status === 'completed' ? 'bg-green-500' :
                        step.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-600'
                      }`}></div>
                      <span className="text-white capitalize">
                        {step.name.replace('_', ' ')} - {step.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-purple-200/60 text-sm">
          <p>✨ Powered by Zentix Protocol + Amrikyy AIOS Architecture</p>
        </div>
      </div>
    </div>
  );
}

const MetricCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
    <div className="text-xs text-purple-200 mb-1">{label}</div>
    <div className="text-lg font-bold text-white">{value}</div>
  </div>
);

export default App;