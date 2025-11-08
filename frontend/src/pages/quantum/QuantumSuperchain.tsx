import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { mockSuperchainTransactions, TransactionStatus } from '@/data/quantumMockData';
import { formatTimestamp, formatChainId } from '@/utils/quantumFormatters';

export function QuantumSuperchain() {
  const getStatusBadge = (status: TransactionStatus) => {
    const variants = {
      [TransactionStatus.COMMITTED]: 'bg-consciousness-fulfilled/20 text-consciousness-fulfilled border-consciousness-fulfilled glow-consciousness-fulfilled',
      [TransactionStatus.PENDING]: 'bg-consciousness-curious/20 text-consciousness-curious border-consciousness-curious',
      [TransactionStatus.FAILED]: 'bg-error/20 text-error border-error'
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-quantum-text-primary">Sovereign Commitments</h1>
        <p className="text-quantum-text-muted mt-1">Blockchain decisions and transactions</p>
      </div>

      {/* Transactions Table */}
      <div className="bg-quantum-surface border border-quantum-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-quantum-border hover:bg-transparent">
              <TableHead className="text-quantum-text-secondary">Timestamp</TableHead>
              <TableHead className="text-quantum-text-secondary">Chain ID</TableHead>
              <TableHead className="text-quantum-text-secondary">Project Name</TableHead>
              <TableHead className="text-quantum-text-secondary">Collaborators</TableHead>
              <TableHead className="text-quantum-text-secondary">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSuperchainTransactions.map((tx) => (
              <TableRow key={tx.id} className="border-quantum-border hover:bg-quantum-border/50">
                <TableCell className="font-mono-code text-quantum-text-muted text-sm">
                  {formatTimestamp(tx.timestamp)}
                </TableCell>
                <TableCell className="text-quantum-purple font-medium">
                  {formatChainId(tx.chainId, tx.chainName)}
                </TableCell>
                <TableCell className="text-quantum-text-primary font-medium">
                  {tx.projectName}
                </TableCell>
                <TableCell className="text-quantum-text-secondary text-sm">
                  {tx.collaborators.join(', ')}
                </TableCell>
                <TableCell>
                  {getStatusBadge(tx.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}