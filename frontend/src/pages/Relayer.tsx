import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { formatDate, formatBalance } from '../utils/formatters';
import { mockRelayerData, mockTransactionHistory } from '../data/dashboardMockData';

export function Relayer() {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    data: '',
    signature: '',
    nonce: 0,
  });
  const [nonceAddress, setNonceAddress] = useState('');
  const [lookedUpNonce, setLookedUpNonce] = useState<number | undefined>(undefined);

  const { data: relayerData, loading: relayerLoading } = useApi(
    () => apiService.getRelayerStats().catch(() => mockRelayerData),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.relayTransaction(formData);
      alert('Transaction relayed successfully!');
      setFormData({ from: '', to: '', data: '', signature: '', nonce: 0 });
    } catch (err) {
      alert('Failed to relay transaction');
    }
  };

  const handleNonceLookup = async () => {
    try {
      const result = await apiService.getNonce(nonceAddress);
      setLookedUpNonce(result.nonce);
    } catch (err) {
      alert('Failed to get nonce');
    }
  };

  if (relayerLoading) {
    return <div className="text-center py-12">Loading relayer data...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Relayer Service</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {relayerData ? formatBalance(relayerData.balance) : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${relayerData?.operational ? 'text-success' : 'text-error'}`}>
              {relayerData?.operational ? 'Operational' : 'Offline'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {relayerData?.stats.totalTransactions || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Relay Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="from">From Address</Label>
              <Input
                id="from"
                type="text"
                value={formData.from}
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="to">To Address</Label>
              <Input
                id="to"
                type="text"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="data">Data</Label>
              <textarea
                id="data"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="signature">Signature</Label>
              <Input
                id="signature"
                type="text"
                value={formData.signature}
                onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                required
              />
            </div>
            <Button type="submit" variant="primary">Send Transaction</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nonce Lookup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="text"
                value={nonceAddress}
                onChange={(e) => setNonceAddress(e.target.value)}
                placeholder="Enter address"
                className="flex-1"
              />
              <Button onClick={handleNonceLookup}>Lookup</Button>
            </div>
            {lookedUpNonce !== undefined && (
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">Current Nonce</p>
                <p className="text-2xl font-bold">{lookedUpNonce}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTransactionHistory.map((tx) => (
              <div key={tx.id} className="border-b border-border pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="font-mono text-sm">{tx.hash.slice(0, 20)}...</p>
                    <div className="text-sm text-muted-foreground">
                      <p>From: {tx.from.slice(0, 10)}...</p>
                      <p>To: {tx.to.slice(0, 10)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-medium ${tx.status === 'success' ? 'text-success' : 'text-error'}`}>
                      {tx.status}
                    </span>
                    <p className="text-sm text-muted-foreground">{formatDate(tx.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}