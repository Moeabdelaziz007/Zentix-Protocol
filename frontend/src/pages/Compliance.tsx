import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Progress } from '../components/ui/Progress';
import { ComplianceChart } from '@/components/charts/ComplianceChart';
import { formatDate, formatComplianceScore } from '../utils/formatters';
import { mockComplianceData, mockAuditData } from '../data/dashboardMockData';

export function Compliance() {
  const [did, setDid] = useState('zxdid:zentix:0x1A2B3C4D5E6F7G8H9I0J');
  const [searchDid, setSearchDid] = useState(did);

  const { data, loading } = useApi(
    () => apiService.getComplianceScore(did).catch(() => mockComplianceData),
    [did]
  );

  const complianceChartData = [
    { date: '2025-01-14', score: 97.2 },
    { date: '2025-01-15', score: 96.8 },
    { date: '2025-01-16', score: 98.1 },
    { date: '2025-01-17', score: 97.5 },
    { date: '2025-01-18', score: 95.5 },
    { date: '2025-01-19', score: 96.0 },
    { date: '2025-01-20', score: 95.5 },
  ];

  const handleSearch = () => {
    setDid(searchDid);
  };

  const handleExport = async () => {
    try {
      const auditData = await apiService.exportAudit(did).catch(() => mockAuditData);
      const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-${did}.json`;
      a.click();
    } catch (err) {
      alert('Failed to export audit');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading compliance data...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Compliance & Audit</h1>

      <Card className="animate-slide-in-up">
        <CardHeader>
          <CardTitle>DID Lookup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="text"
              value={searchDid}
              onChange={(e) => setSearchDid(e.target.value)}
              placeholder="Enter DID"
              className="flex-1"
            />
            <Button onClick={handleSearch}>Search</Button>
            <Button onClick={handleExport} variant="secondary">Export Audit</Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            <Card className="hover:shadow-lg">
              <CardHeader>
                <CardTitle>Compliance Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-success">
                    {formatComplianceScore(data.complianceScore)}
                  </div>
                  <Progress value={data.complianceScore} className="h-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg">
              <CardHeader>
                <CardTitle>Violations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-warning">{data.violations}</div>
                <p className="text-sm text-muted-foreground mt-2">Total violations recorded</p>
              </CardContent>
            </Card>
          </div>

          <Card className="animate-slide-in-up hover:shadow-lg" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle>Compliance Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="transition-all duration-300 hover:scale-[1.01]">
                <ComplianceChart data={complianceChartData} />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-in-up hover:shadow-lg" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle>Recent Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentViolations.map((violation, index) => (
                  <div 
                    key={violation.id} 
                    className="border-b border-border pb-4 last:border-0 transition-all duration-200 hover:bg-muted/30 hover:px-2 hover:-mx-2 rounded"
                    style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium">{violation.type}</p>
                        <p className="text-sm text-muted-foreground">{violation.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium capitalize text-warning">
                          {violation.severity}
                        </span>
                        <p className="text-sm text-muted-foreground">{formatDate(violation.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}