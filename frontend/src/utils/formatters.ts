import { ReportStatus, ReportSeverity, NetworkHealthStatus } from '../types/enums';

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDID = (did: string): string => {
  if (did.length <= 20) return did;
  return `${did.slice(0, 10)}...${did.slice(-8)}`;
};

export const formatBalance = (balance: string): string => {
  const num = parseFloat(balance);
  return `${num.toFixed(4)} MATIC`;
};

export const formatComplianceScore = (score: number): string => {
  return `${score.toFixed(1)}%`;
};

export const formatStatusLabel = (status: ReportStatus): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const formatSeverityLabel = (severity: ReportSeverity): string => {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

export const formatHealthStatus = (status: NetworkHealthStatus): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatHash = (hash: string): string => {
  if (!hash) return '';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
};

export const formatGasUsed = (gas: number): string => {
  return gas.toLocaleString();
};