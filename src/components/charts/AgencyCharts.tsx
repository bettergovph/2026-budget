import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetData } from '@/types/budget';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface AgencyChartsProps {
  data: BudgetData[];
}

export function AgencyCharts({ data }: AgencyChartsProps) {
  const agencyData = useMemo(() => {
    const agencies = data.filter(d => d.Level === 'Agency');
    return agencies
      .sort((a, b) => b.Senate - a.Senate)
      .map(a => ({
        name: a.Agency_Name.length > 35 ? a.Agency_Name.substring(0, 35) + '...' : a.Agency_Name,
        fullName: a.Agency_Name,
        department: a.Department_Name,
        senate: a.Senate,
        house: a.House,
        net: a.Net,
      }));
  }, [data]);

  const topAgenciesByChange = useMemo(() => {
    const agencies = data.filter(d => d.Level === 'Agency' && d.Net !== 0);
    return agencies
      .sort((a, b) => Math.abs(b.Net) - Math.abs(a.Net))
      .slice(0, 50)
      .map(a => ({
        name: a.Agency_Name.length > 35 ? a.Agency_Name.substring(0, 35) + '...' : a.Agency_Name,
        fullName: a.Agency_Name,
        department: a.Department_Name,
        net: a.Net,
        increase: a.Increase,
        decrease: Math.abs(a.Decrease),
      }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
          <p className="font-semibold mb-1 text-sm">{payload[0]?.payload?.fullName || label}</p>
          <p className="text-xs text-gray-600 mb-2">{payload[0]?.payload?.department}</p>
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
      {/* Agencies Overview */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">All Agencies by Budget ({agencyData.length} total)</CardTitle>
          <CardDescription>Agency appropriations across all departments</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(500, agencyData.length * 25)}>
            <BarChart data={agencyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
              <XAxis type="number" tickFormatter={(value) => `₱${(value / 1000000).toFixed(0)}B`} tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={250} tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="house" fill="#3b82f6" radius={[0, 4, 4, 0]} name="House" />
              <Bar dataKey="senate" fill="#6366f1" radius={[0, 4, 4, 0]} name="Senate" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Agency Changes */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Agencies by Budget Change (Top 50 of {data.filter(d => d.Level === 'Agency' && d.Net !== 0).length})
          </CardTitle>
          <CardDescription>Top 50 agencies with largest budget changes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(500, topAgenciesByChange.length * 30)}>
            <BarChart data={topAgenciesByChange}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={Math.max(120, topAgenciesByChange.length * 4)} tick={{ fontSize: 9 }} />
              <YAxis tickFormatter={(value) => `₱${(value / 1000000).toFixed(0)}B`} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="increase" fill="#10b981" radius={[4, 4, 0, 0]} name="Increase" />
              <Bar dataKey="decrease" fill="#ef4444" radius={[4, 4, 0, 0]} name="Decrease" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
