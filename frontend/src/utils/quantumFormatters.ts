import { format } from 'date-fns';

export const formatTimestamp = (date: Date): string => {
  return format(date, 'yyyy-MM-dd HH:mm:ss');
};

export const formatChainId = (chainId: number, chainName: string): string => {
  return `${chainId} - ${chainName}`;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatAgentCount = (count: number): string => {
  return count.toString();
};