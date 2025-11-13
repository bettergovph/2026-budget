import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetData } from '@/types/budget';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { LayoutDashboard } from 'lucide-react';

interface SummaryChartsProps {
  data: BudgetData[];
}

export function SummaryCharts({ data }: SummaryChartsProps) {
  const summaryData = useMemo(() => {
    return data.filter(d => d.Level === 'Summary');
  }, [data]);

  const budgetComparison = useMemo(() => {
    return summaryData.map(d => ({
      name: d.Department_Name.replace(/_/g, ' ').replace('TOTAL NEW APPROPRIATIONS', 'TOTAL'),
      House: d.House,
      Senate: d.Senate,
    }));
  }, [summaryData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
          <p className="font-semibold mb-2 text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-xs font-medium">
              {entry.name}: ₱{formatCurrency(entry.value)} (thousands)
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            Budget Summary Overview
          </CardTitle>
          <CardDescription>House vs Senate appropriations comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={budgetComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(value) => `₱${(value / 1000000).toFixed(0)}B`} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="House" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Senate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
