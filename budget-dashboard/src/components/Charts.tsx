import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetData } from '@/types/budget';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Building2, LayoutDashboard } from 'lucide-react';

interface ChartsProps {
  data: BudgetData[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

export function Charts({ data }: ChartsProps) {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const summaryData = useMemo(() => {
    return data.filter(d => d.Level === 'Summary');
  }, [data]);

  const departmentData = useMemo(() => {
    const depts = data.filter(d => d.Level === 'Department');
    return depts
      .sort((a, b) => b.Senate - a.Senate)
      .slice(0, 15)
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

  const agencyData = useMemo(() => {
    const agencies = data.filter(d => d.Level === 'Agency');
    return agencies
      .sort((a, b) => b.Senate - a.Senate)
      .slice(0, 20)
      .map(a => ({
        name: a.Agency_Name.length > 25 ? a.Agency_Name.substring(0, 25) + '...' : a.Agency_Name,
        fullName: a.Agency_Name,
        department: a.Department_Name,
        senate: a.Senate,
        house: a.House,
        net: a.Net,
      }));
  }, [data]);

  const departmentAgencies = useMemo(() => {
    if (!selectedDept) return [];
    const dept = departmentData.find(d => d.code === selectedDept);
    if (!dept) return [];

    return data
      .filter(d => d.Level === 'Agency' && d.Department_Name === dept.fullName)
      .sort((a, b) => b.Senate - a.Senate)
      .slice(0, 10)
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
    const depts = data.filter(d => d.Level === 'Department');
    return depts
      .sort((a, b) => b.Senate - a.Senate)
      .slice(0, 8)
      .map(d => ({
        name: d.Department_Code || d.Department_Name.substring(0, 15),
        value: d.Senate,
        fullName: d.Department_Name,
      }));
  }, [data]);

  const budgetComparison = useMemo(() => {
    return summaryData.map(d => ({
      name: d.Department_Name.replace('_', ' '),
      House: d.House,
      Senate: d.Senate,
    }));
  }, [summaryData]);

  const topAgenciesByChange = useMemo(() => {
    const agencies = data.filter(d => d.Level === 'Agency' && d.Net !== 0);
    return agencies
      .sort((a, b) => Math.abs(b.Net) - Math.abs(a.Net))
      .slice(0, 10)
      .map(a => ({
        name: a.Agency_Name.length > 30 ? a.Agency_Name.substring(0, 30) + '...' : a.Agency_Name,
        fullName: a.Agency_Name,
        department: a.Department_Name,
        net: a.Net,
        increase: a.Increase,
        decrease: Math.abs(a.Decrease),
      }));
  }, [data]);

  const changeAnalysis = useMemo(() => {
    const depts = data.filter(d => d.Level === 'Department' && d.Net !== 0);
    return depts
      .sort((a, b) => Math.abs(b.Net) - Math.abs(a.Net))
      .slice(0, 10)
      .map(d => ({
        name: d.Department_Name.length > 25
          ? d.Department_Name.substring(0, 25) + '...'
          : d.Department_Name,
        increase: d.Increase,
        decrease: Math.abs(d.Decrease),
        net: d.Net,
      }));
  }, [data]);

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
    <div className="space-y-6 min-w-full">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Total Departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.filter(d => d.Level === 'Department').length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Total Agencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.filter(d => d.Level === 'Agency').length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Largest Department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate">
              {departmentData[0]?.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ₱{formatCurrency(departmentData[0]?.senate / 1000)}M
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Largest Agency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate">
              {agencyData[0]?.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ₱{formatCurrency(agencyData[0]?.senate / 1000)}M
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Overview Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              Budget Summary Overview
            </CardTitle>
            <CardDescription>House vs Senate appropriations comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={budgetComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(value) => `₱${(value / 1000000).toFixed(0)}B`} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="House" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Senate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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
            <ResponsiveContainer width="100%" height={350}>
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

      {/* Departments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Top 15 Departments by Budget
          </CardTitle>
          <CardDescription>Largest departmental appropriations - Click a bar to view agencies</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
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
              <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="house" fill="#10b981" radius={[0, 4, 4, 0]} name="House" />
              <Bar dataKey="senate" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Senate" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Selected Department Agencies */}
      {selectedDept && departmentAgencies.length > 0 && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Agencies in Selected Department
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
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={departmentAgencies}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} tick={{ fontSize: 10 }} />
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

      {/* Agencies Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top 20 Agencies by Budget</CardTitle>
            <CardDescription>Largest agency appropriations across all departments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={agencyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
                <XAxis type="number" tickFormatter={(value) => `₱${(value / 1000000).toFixed(0)}B`} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="senate" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top Agencies by Budget Change
            </CardTitle>
            <CardDescription>Agencies with largest net changes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={topAgenciesByChange}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={140} tick={{ fontSize: 10 }} />
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

      {/* Budget Changes Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Department Budget Changes
            </CardTitle>
            <CardDescription>Top 10 departments with largest changes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={changeAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} tick={{ fontSize: 10 }} />
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
            <CardDescription>Net budget changes across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={changeAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} tick={{ fontSize: 10 }} />
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
          <CardDescription>Line comparison of top 15 departments</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(value) => `₱${(value / 1000000).toFixed(0)}B`} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="house" stroke="#3b82f6" strokeWidth={3} name="House" dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="senate" stroke="#8b5cf6" strokeWidth={3} name="Senate" dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
