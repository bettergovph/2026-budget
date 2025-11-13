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
    // Group by unique key (Department Code + Agency Code) to handle duplicate agency names
    const uniqueAgencies = new Map<string, BudgetData>();
    agencies.forEach(agency => {
      const key = `${agency.Department_Code}-${agency.Agency_Code}`;
      uniqueAgencies.set(key, agency);
    });

    return Array.from(uniqueAgencies.values())
      .sort((a, b) => b.Senate - a.Senate)
      .map(a => {
        // Add department abbreviation to agency name for uniqueness
        const deptAbbrev = a.Department_Name.substring(0, 15);
        const displayName = `${a.Agency_Name} (${deptAbbrev})`;
        return {
          name: displayName.length > 50 ? displayName.substring(0, 50) + '...' : displayName,
          fullName: `${a.Agency_Name} - ${a.Department_Name}`,
          department: a.Department_Name,
          senate: a.Senate,
          house: a.House,
          net: a.Net,
        };
      });
  }, [data]);

  const topAgenciesByChange = useMemo(() => {
    const agencies = data.filter(d => d.Level === 'Agency' && d.Net !== 0);
    // Group by unique key (Department Code + Agency Code) to handle duplicate agency names
    const uniqueAgencies = new Map<string, BudgetData>();
    agencies.forEach(agency => {
      const key = `${agency.Department_Code}-${agency.Agency_Code}`;
      uniqueAgencies.set(key, agency);
    });

    return Array.from(uniqueAgencies.values())
      .sort((a, b) => Math.abs(b.Net) - Math.abs(a.Net))
      .slice(0, 50)
      .map(a => {
        // Add department abbreviation to agency name for uniqueness
        const deptAbbrev = a.Department_Name.substring(0, 15);
        const displayName = `${a.Agency_Name} (${deptAbbrev})`;
        return {
          name: displayName.length > 50 ? displayName.substring(0, 50) + '...' : displayName,
          fullName: `${a.Agency_Name} - ${a.Department_Name}`,
          department: a.Department_Name,
          net: a.Net,
          increase: a.Increase,
          decrease: Math.abs(a.Decrease),
        };
      });
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
    <div className="space-y-4 sm:space-y-6">
      {/* Agencies Overview */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">All Agencies by Budget ({agencyData.length} total)</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Agency appropriations across all departments</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <ResponsiveContainer width="100%" height={Math.max(400, agencyData.length * 20)}>
            <BarChart data={agencyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
              <XAxis type="number" tickFormatter={(value) => `₱${(value / 1000000).toFixed(0)}B`} tick={{ fontSize: 8 }} />
              <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 7 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="house" fill="#3b82f6" radius={[0, 4, 4, 0]} name="House" />
              <Bar dataKey="senate" fill="#6366f1" radius={[0, 4, 4, 0]} name="Senate" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Agency Changes */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            Agencies by Budget Change (Top 50 of {data.filter(d => d.Level === 'Agency' && d.Net !== 0).length})
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Top 50 agencies with largest budget changes</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <ResponsiveContainer width="100%" height={Math.max(400, topAgenciesByChange.length * 25)}>
            <BarChart data={topAgenciesByChange}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={Math.max(100, topAgenciesByChange.length * 3)} tick={{ fontSize: 7 }} />
              <YAxis tickFormatter={(value) => `₱${(value / 1000000).toFixed(0)}B`} tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="increase" fill="#10b981" radius={[4, 4, 0, 0]} name="Increase" />
              <Bar dataKey="decrease" fill="#ef4444" radius={[4, 4, 0, 0]} name="Decrease" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
