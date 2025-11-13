import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetData } from '@/types/budget';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Building2, TrendingDown } from 'lucide-react';

interface DepartmentChartsProps {
  data: BudgetData[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

export function DepartmentCharts({ data }: DepartmentChartsProps) {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const departmentData = useMemo(() => {
    const depts = data.filter(d => d.Level === 'Department');
    return depts
      .sort((a, b) => b.Senate - a.Senate)
      .map(d => ({
        name: d.Department_Name.length > 30
          ? d.Department_Name.substring(0, 30) + '...'
          : d.Department_Name,
        fullName: d.Department_Name,
        code: d.Department_Code,
        house: d.House,
        senate: d.Senate,
        net: d.Net,
        increase: d.Increase,
        decrease: Math.abs(d.Decrease),
      }));
  }, [data]);

  const departmentAgencies = useMemo(() => {
    if (!selectedDept) return [];
    const dept = departmentData.find(d => d.code === selectedDept);
    if (!dept) return [];

    return data
      .filter(d => d.Level === 'Agency' && d.Department_Name === dept.fullName)
      .sort((a, b) => b.Senate - a.Senate)
      .map(a => ({
        name: a.Agency_Name.length > 30 ? a.Agency_Name.substring(0, 30) + '...' : a.Agency_Name,
        fullName: a.Agency_Name,
        senate: a.Senate,
        house: a.House,
        increase: a.Increase,
        decrease: Math.abs(a.Decrease),
      }));
  }, [data, selectedDept, departmentData]);

  const budgetDistribution = useMemo(() => {
    return departmentData
      .slice(0, 8)
      .map(d => ({
        name: d.code || d.name.substring(0, 15),
        value: d.senate,
        fullName: d.fullName,
      }));
  }, [departmentData]);

  const changeAnalysis = useMemo(() => {
    return departmentData
      .filter(d => d.net !== 0)
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
      .map(d => ({
        name: d.name,
        fullName: d.fullName,
        increase: d.increase,
        decrease: d.decrease,
        net: d.net,
      }));
  }, [departmentData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
          <p className="font-semibold mb-2 text-sm">{payload[0]?.payload?.fullName || label}</p>
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

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Overview Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              All Departments by Budget ({departmentData.length} total)
            </CardTitle>
            <CardDescription>Click a bar to view agencies within that department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(400, departmentData.length * 35)}>
              <BarChart
                data={departmentData}
                layout="vertical"
                onClick={(data: any) => {
                  if (data && data.activePayload) {
                    setSelectedDept(data.activePayload[0].payload.code);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
                <XAxis type="number" tickFormatter={(value) => `₱${(value / 1000000).toFixed(0)}B`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="house" fill="#10b981" radius={[0, 4, 4, 0]} name="House" />
                <Bar dataKey="senate" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Senate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget Distribution</CardTitle>
            <CardDescription>Top 8 departments by allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={budgetDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {budgetDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Selected Department Agencies */}
      {selectedDept && departmentAgencies.length > 0 && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Agencies in Selected Department ({departmentAgencies.length} total)
              <button
                onClick={() => setSelectedDept(null)}
                className="ml-auto text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Clear Selection
              </button>
            </CardTitle>
            <CardDescription>
              {departmentData.find(d => d.code === selectedDept)?.fullName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(350, departmentAgencies.length * 40)}>
              <BarChart data={departmentAgencies}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={Math.max(100, departmentAgencies.length * 5)} tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(value) => `₱${(value / 1000000).toFixed(0)}B`} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="house" fill="#3b82f6" radius={[4, 4, 0, 0]} name="House" />
                <Bar dataKey="senate" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Senate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Budget Changes Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Department Budget Changes ({changeAnalysis.length} with changes)
            </CardTitle>
            <CardDescription>All departments with budget changes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(400, changeAnalysis.length * 35)}>
              <BarChart data={changeAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={Math.max(100, changeAnalysis.length * 5)} tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(value) => `₱${(value / 1000000).toFixed(0)}B`} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="increase" fill="#10b981" radius={[4, 4, 0, 0]} name="Increase" />
                <Bar dataKey="decrease" fill="#ef4444" radius={[4, 4, 0, 0]} name="Decrease" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Net Change Trend</CardTitle>
            <CardDescription>Net budget changes across all departments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(400, changeAnalysis.length * 35)}>
              <AreaChart data={changeAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={Math.max(100, changeAnalysis.length * 5)} tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(value) => `₱${(value / 1000000).toFixed(0)}B`} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="net" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} name="Net Change" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comparative Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">House vs Senate Allocation Comparison</CardTitle>
          <CardDescription>Line comparison of all {departmentData.length} departments</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(400, departmentData.length * 25)}>
            <LineChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={Math.max(100, departmentData.length * 5)} tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(value) => `₱${(value / 1000000).toFixed(0)}B`} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="house" stroke="#3b82f6" strokeWidth={2} name="House" dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="senate" stroke="#8b5cf6" strokeWidth={2} name="Senate" dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
