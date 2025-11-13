import { useMemo } from 'react';
import { BudgetData } from '@/types/budget';
import { DepartmentCharts } from './charts/DepartmentCharts';
import { AgencyCharts } from './charts/AgencyCharts';
import { SummaryCharts } from './charts/SummaryCharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface ChartsProps {
  data: BudgetData[];
}

export function Charts({ data }: ChartsProps) {
  // Determine which level of data we're looking at
  const dataLevel = useMemo(() => {
    const levels = new Set(data.map(d => d.Level));

    // If only one level, show specialized view
    if (levels.size === 1) {
      return Array.from(levels)[0];
    }

    // If multiple levels but no Summary, determine primary level
    if (!levels.has('Summary')) {
      if (levels.has('Department')) return 'Department';
      if (levels.has('Agency')) return 'Agency';
      if (levels.has('Sub-Agency')) return 'Sub-Agency';
    }

    return 'Mixed';
  }, [data]);

  const stats = useMemo(() => {
    const departments = data.filter(d => d.Level === 'Department');
    const agencies = data.filter(d => d.Level === 'Agency');
    const subAgencies = data.filter(d => d.Level === 'Sub-Agency');

    return {
      departmentCount: departments.length,
      agencyCount: agencies.length,
      subAgencyCount: subAgencies.length,
      totalRecords: data.length,
    };
  }, [data]);

  // Show specialized charts based on data level
  if (dataLevel === 'Summary') {
    return <SummaryCharts data={data} />;
  }

  if (dataLevel === 'Department') {
    return <DepartmentCharts data={data} />;
  }

  if (dataLevel === 'Agency') {
    return <AgencyCharts data={data} />;
  }

  if (dataLevel === 'Sub-Agency') {
    // For sub-agencies, show simple listing
    const subAgencyData = data.map(d => ({
      name: d.Sub_Agency_Name.length > 40 ? d.Sub_Agency_Name.substring(0, 40) + '...' : d.Sub_Agency_Name,
      fullName: d.Sub_Agency_Name,
      agency: d.Agency_Name,
      senate: d.Senate,
      house: d.House,
    })).sort((a, b) => b.senate - a.senate);

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
            <p className="font-semibold mb-1 text-sm">{payload[0]?.payload?.fullName || label}</p>
            <p className="text-xs text-gray-600 mb-2">{payload[0]?.payload?.agency}</p>
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
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>All Sub-Agencies ({subAgencyData.length} total)</CardTitle>
            <CardDescription>Sub-agency budget allocations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(500, subAgencyData.length * 25)}>
              <BarChart data={subAgencyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
                <XAxis type="number" tickFormatter={(value) => `₱${(value / 1000000).toFixed(0)}B`} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={280} tick={{ fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="house" fill="#3b82f6" radius={[0, 4, 4, 0]} name="House" />
                <Bar dataKey="senate" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Senate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mixed view - show key metrics and use department charts as default
  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.departmentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Agencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.agencyCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Sub-Agencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.subAgencyCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Total Records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRecords}</div>
          </CardContent>
        </Card>
      </div>

      {/* Show Department Charts by default for mixed data */}
      <DepartmentCharts data={data} />

      {stats.agencyCount > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Agency-Level Analysis</h2>
          <AgencyCharts data={data} />
        </div>
      )}
    </div>
  );
}
