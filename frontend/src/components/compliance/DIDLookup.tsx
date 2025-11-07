import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';

interface DIDLookupProps {
  onLookup: (did: string) => void;
}

export function DIDLookup({ onLookup }: DIDLookupProps) {
  const [did, setDid] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (did) {
      onLookup(did);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>DID Lookup</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="did">Enter DID</Label>
            <Input
              id="did"
              placeholder="zxdid:zentix:0x..."
              value={did}
              onChange={(e) => setDid(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={!did} className="w-full">
            Verify DID
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}