import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { mockQuantumLog, MessageType } from '@/data/quantumMockData';
import { formatTimestamp } from '@/utils/quantumFormatters';

export function QuantumSynchronizer() {
  const getMessageTypeBadge = (type: MessageType) => {
    const variants = {
      [MessageType.BROADCAST]: 'bg-quantum-purple/20 text-quantum-purple border-quantum-purple',
      [MessageType.DIRECT]: 'bg-quantum-cyan/20 text-quantum-cyan border-quantum-cyan',
      [MessageType.CONSENSUS]: 'bg-consciousness-fulfilled/20 text-consciousness-fulfilled border-consciousness-fulfilled'
    };

    return (
      <Badge variant="outline" className={variants[type]}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-quantum-text-primary">Quantum Synchronizer Log</h1>
        <p className="text-quantum-text-muted mt-1">Real-time agent communication history</p>
      </div>

      {/* Log Table */}
      <div className="bg-quantum-surface border border-quantum-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-quantum-border hover:bg-transparent">
              <TableHead className="text-quantum-text-secondary">Timestamp</TableHead>
              <TableHead className="text-quantum-text-secondary">From Agent</TableHead>
              <TableHead className="text-quantum-text-secondary">To Agent</TableHead>
              <TableHead className="text-quantum-text-secondary">Message Type</TableHead>
              <TableHead className="text-quantum-text-secondary">Payload Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockQuantumLog.map((entry, index) => (
              <TableRow 
                key={entry.id} 
                className={`border-quantum-border hover:bg-quantum-border/50 ${index === 0 ? 'flash-cyan' : ''}`}
              >
                <TableCell className="font-mono-code text-quantum-text-muted text-sm">
                  {formatTimestamp(entry.timestamp)}
                </TableCell>
                <TableCell className="text-quantum-cyan font-medium">
                  {entry.fromAgent}
                </TableCell>
                <TableCell className="text-quantum-text-secondary">
                  {entry.toAgent}
                </TableCell>
                <TableCell>
                  {getMessageTypeBadge(entry.messageType)}
                </TableCell>
                <TableCell className="text-quantum-text-primary">
                  {entry.payloadSummary}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}