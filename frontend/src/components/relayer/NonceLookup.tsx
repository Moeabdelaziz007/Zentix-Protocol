import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';

interface NonceLookupProps {
  onLookup: (address: string) => void;
  nonce?: number;
}

export function NonceLookup({ onLookup, nonce }: NonceLookupProps) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address) {
      onLookup(address);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nonce Lookup</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={!address} className="w-full">
            Lookup Nonce
          </Button>
          {nonce !== undefined && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Current Nonce</p>
              <p className="text-2xl font-bold">{nonce}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}