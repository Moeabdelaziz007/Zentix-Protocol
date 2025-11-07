import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ComplianceChartProps {
  data: Array<{ date: string; score: number }>;
}

export function ComplianceChart({ data }: ComplianceChartProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
          <XAxis 
            dataKey="date" 
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            domain={[90, 100]}
            stroke="var(--muted-foreground)"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--card-foreground)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Compliance Score']}
            cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '5 5' }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--primary)"
            strokeWidth={3}
            fill="url(#colorScore)"
            dot={{ fill: 'var(--primary)', r: 5, strokeWidth: 2, stroke: 'var(--card)' }}
            activeDot={{ r: 7, strokeWidth: 3, stroke: 'var(--card)', fill: 'var(--accent)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}