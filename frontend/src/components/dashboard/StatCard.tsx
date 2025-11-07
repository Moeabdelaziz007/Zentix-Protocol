import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  children?: ReactNode;
}

export function StatCard({ title, value, subtitle, children }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-primary">{value}</div>
        {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
        {children}
      </CardContent>
    </Card>
  );
}