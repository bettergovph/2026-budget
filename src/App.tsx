import { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Papa from 'papaparse';
import { BudgetData } from '@/types/budget';
import { Charts } from '@/components/Charts';
import { DataTable } from '@/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Layout } from '@/components/Layout';

function App() {
  const [data, setData] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('');

  useEffect(() => {
    fetch('/2026.csv')
      .then(response => response.text())
      .then(csv => {
        Papa.parse<BudgetData>(csv, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data);
            setLoading(false);
          },
        });
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
        setLoading(false);
      });
  }, []);

  const uniqueLevels = useMemo(() => {
    return Array.from(new Set(data.map(d => d.Level)));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesSearch =
        (row.Department_Name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (row.Agency_Name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (row.Sub_Agency_Name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesLevel = !levelFilter || row.Level === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [data, searchTerm, levelFilter]);

  const stats = useMemo(() => {
    // If we have the Summary level in filtered data, use it
    const summaryRow = filteredData.find(d => d.Level === 'Summary' && d.Department_Name === 'TOTAL_NEW_APPROPRIATIONS');

    // Otherwise, compute totals from filtered data
    if (!summaryRow) {
      // Determine the most granular level in the filtered data to avoid double-counting
      const levels = new Set(filteredData.map(d => d.Level).filter(l => l !== 'Summary'));

      // Priority: Sub-Agency > Agency > Department > Special Purpose Fund
      let targetLevel = null;
      if (levels.has('Sub-Agency')) targetLevel = 'Sub-Agency';
      else if (levels.has('Agency')) targetLevel = 'Agency';
      else if (levels.has('Department')) targetLevel = 'Department';
      else if (levels.has('Special Purpose Fund')) targetLevel = 'Special Purpose Fund';

      const totals = filteredData.reduce((acc, row) => {
        // Only sum the most granular level to avoid double-counting hierarchical data
        if (targetLevel && row.Level === targetLevel) {
          acc.totalHouse += row.House || 0;
          acc.totalSenate += row.Senate || 0;
          acc.totalIncrease += row.Increase || 0;
          acc.totalDecrease += row.Decrease || 0;
        }
        return acc;
      }, { totalHouse: 0, totalSenate: 0, totalIncrease: 0, totalDecrease: 0 });

      return {
        ...totals,
        departmentCount: filteredData.filter(d => d.Level === 'Department').length,
        agencyCount: filteredData.filter(d => d.Level === 'Agency').length,
      };
    }

    // Use summary row values
    return {
      totalHouse: summaryRow.House || 0,
      totalSenate: summaryRow.Senate || 0,
      totalIncrease: summaryRow.Increase || 0,
      totalDecrease: summaryRow.Decrease || 0,
      departmentCount: filteredData.filter(d => d.Level === 'Department').length,
      agencyCount: filteredData.filter(d => d.Level === 'Agency').length,
    };
  }, [filteredData]);

  const downloadCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `budget_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const DashboardView = () => (
    <>
      {(searchTerm || levelFilter) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Filtered:</strong> Showing {filteredData.length} of {data.length} entries
            {searchTerm && ` matching "${searchTerm}"`}
            {levelFilter && ` • Level: ${levelFilter}`}
          </p>
        </div>
      )}

      {/* Grand Totals Row */}
      <div className="max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
        <Card className="border-blue-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs text-blue-700 font-semibold uppercase tracking-wide">Grand Total - House</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-900">₱{formatCurrency((stats.totalHouse * 1000) + 227769207000)}</div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-blue-700 font-medium">House + Automatic</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs text-blue-700 font-semibold uppercase tracking-wide">Grand Total - Senate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-900">₱{formatCurrency((stats.totalSenate * 1000) + 227769207000)}</div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-blue-700 font-medium">Senate + Automatic</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-4">

        <Card className="border-gray-100 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Senate Appropriations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₱{formatCurrency(stats.totalSenate * 1000)}</div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-blue-600 font-medium">+0.0%</span>
              <span className="text-gray-500 ml-2">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total House Appropriations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₱{formatCurrency(stats.totalHouse * 1000)}</div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-blue-600 font-medium">+0.0%</span>
              <span className="text-gray-500 ml-2">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Increases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              ₱{formatCurrency(stats.totalIncrease * 1000)}
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">Positive</span>
              <span className="text-gray-500 ml-2">budget increase</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Decreases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <TrendingDown className="w-6 h-6" />
              ₱{formatCurrency(Math.abs(stats.totalDecrease) * 1000)}
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-red-600 font-medium">Negative</span>
              <span className="text-gray-500 ml-2">budget decrease</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs text-gray-500 font-medium uppercase tracking-wide">Automatic Appropriations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₱{formatCurrency(2277692070000)}</div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600 font-medium">Fixed</span>
              <span className="text-gray-500 ml-2">appropriation</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Charts data={filteredData} />
    </>
  );

  const TableViewPage = () => (
    <>
      {(searchTerm || levelFilter) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Filtered:</strong> Showing {filteredData.length} of {data.length} entries
            {searchTerm && ` matching "${searchTerm}"`}
            {levelFilter && ` • Level: ${levelFilter}`}
          </p>
        </div>
      )}

      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle>Budget Data Table</CardTitle>
          <CardDescription>
            Complete budget data with filtering and sorting capabilities. All amounts in thousand pesos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={filteredData} />
        </CardContent>
      </Card>
    </>
  );

  return (
    <Router>
      <Layout
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
        uniqueLevels={uniqueLevels}
        downloadCSV={downloadCSV}
      >
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/table" element={<TableViewPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
