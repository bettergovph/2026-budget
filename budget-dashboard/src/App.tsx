import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { BudgetData, ViewMode } from '@/types/budget';
import { Charts } from '@/components/Charts';
import { DataTable } from '@/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart3, Table2, TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

function App() {
  const [data, setData] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
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
        row.Department_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.Agency_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.Sub_Agency_Name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel = !levelFilter || row.Level === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [data, searchTerm, levelFilter]);

  const stats = {
    totalHouse: filteredData.find(d => d.Level === 'Summary' && d.Department_Name === 'TOTAL_NEW_APPROPRIATIONS')?.House || 0,
    totalSenate: filteredData.find(d => d.Level === 'Summary' && d.Department_Name === 'TOTAL_NEW_APPROPRIATIONS')?.Senate || 0,
    totalIncrease: filteredData.find(d => d.Level === 'Summary' && d.Department_Name === 'TOTAL_NEW_APPROPRIATIONS')?.Increase || 0,
    totalDecrease: filteredData.find(d => d.Level === 'Summary' && d.Department_Name === 'TOTAL_NEW_APPROPRIATIONS')?.Decrease || 0,
    departmentCount: filteredData.filter(d => d.Level === 'Department').length,
    agencyCount: filteredData.filter(d => d.Level === 'Agency').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading budget data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-screen min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-full px-8 py-6">
          <div className="flex items-center justify-start mb-4 gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">FY 2026 GAB Dashboard</h1>
              {/* <p className="text-sm text-gray-600 mt-1">
                General Appropriations Bill - Committee Report Analysis
              </p> */}
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant={viewMode === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setViewMode('dashboard')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                onClick={() => setViewMode('table')}
              >
                <Table2 className="w-4 h-4 mr-2" />
                Table View
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-start justify-start sm:items-center">
            <div className="flex items-center gap-2 min-w-[400px]">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search departments, agencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-w-[160px]"
            >
              <option value="">All Levels</option>
              {uniqueLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {(searchTerm || levelFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setLevelFilter('');
                }}
                className="text-xs bg-none px-3 py-2 text-black hover:text-black/80 whitespace-nowrap"
                style={{ background: 'none' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full px-8 py-8">
        {/* Filter Info */}
        {(searchTerm || levelFilter) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Filtered:</strong> Showing {filteredData.length} of {data.length} entries
              {searchTerm && ` matching "${searchTerm}"`}
              {levelFilter && ` • Level: ${levelFilter}`}
            </p>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="border-gray-100 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Senate Appropriations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">₱{formatCurrency(stats.totalSenate * 1000)}</div>
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
              <div className="text-3xl font-bold text-gray-900">₱{formatCurrency(stats.totalHouse * 1000)}</div>
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
              <div className="text-3xl font-bold text-green-600 flex items-center gap-2">
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
              <div className="text-3xl font-bold text-red-600 flex items-center gap-2">
                <TrendingDown className="w-6 h-6" />
                ₱{formatCurrency(Math.abs(stats.totalDecrease) * 1000)}
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-red-600 font-medium">Negative</span>
                <span className="text-gray-500 ml-2">budget decrease</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'dashboard' ? (
          <Charts data={filteredData} />
        ) : (
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
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-6 bg-white">
        <div className="max-w-full px-6 text-center text-sm text-gray-600">
          <p>FY 2026 General Appropriations Bill - All amounts in Thousand Pesos</p>
          <p className="mt-1">Data Source: Committee Report HBN 4058</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
