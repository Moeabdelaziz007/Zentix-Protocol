import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';

interface TransactionRelayFormProps {
  onSubmit: (data: { from: string; to: string; data: string; signature: string; nonce: number }) => void;
}

export function TransactionRelayForm({ onSubmit }: TransactionRelayFormProps) {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    data: '',
    signature: '',
    nonce: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isValid = formData.from && formData.to && formData.data && formData.signature;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Relay</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="from">From Address</Label>
            <Input
              id="from"
              placeholder="0x..."
              value={formData.from}
              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="to">To Address</Label>
            <Input
              id="to"
              placeholder="0x..."
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              placeholder="0x..."
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="signature">Signature</Label>
            <Input
              id="signature"
              placeholder="0x..."
              value={formData.signature}
              onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="nonce">Nonce</Label>
            <Input
              id="nonce"
              type="number"
              value={formData.nonce}
              onChange={(e) => setFormData({ ...formData, nonce: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <Button type="submit" disabled={!isValid} className="w-full">
            Submit Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}