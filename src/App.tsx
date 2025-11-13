import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { BudgetData, ViewMode } from '@/types/budget';
import { Charts } from '@/components/Charts';
import { DataTable } from '@/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart3, Table2, TrendingUp, TrendingDown, Search, Filter, Download } from 'lucide-react';
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

  const downloadJSON = () => {
    const json = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `budget_data_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p className="text-muted-foreground">Loading budget data...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-w-screen min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Top Row: Logo, Navigation, and Download */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            {/* Left: Logo and Title */}
            <div className="flex items-center gap-3 sm:gap-6">
              <img src="https://bettergov.ph/logos/svg/BetterGov_Icon-Primary.svg" alt="BetterGov Logo" className="h-10 sm:h-12 w-auto" />
              <div>
                <h2 className="text-black font-bold text-base sm:text-lg">FY 2026 GAB Dashboard</h2>
                <div className="text-xs text-gray-800">By BetterGov.ph</div>
              </div>
            </div>

            {/* Center: Navigation Links */}
            <nav className="flex flex-1 items-center gap-6 justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`text-sm font-medium transition-colors bg-transparent bg-none border-none cursor-pointer p-0 ${viewMode === 'dashboard'
                    ? 'text-black font-extrabold border-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:underline'
                    }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`text-sm font-medium transition-colors bg-transparent bg-none border-none cursor-pointer p-0 ${viewMode === 'table'
                    ? 'text-black font-extrabold border-2'
                    : 'text-gray-600 hover:text-gray-900 hover:underline'
                    }`}
                >
                  Table View
                </button>
              </div>
              <div className='flex gap-6'>
                <a
                  href="https://budget.bettergov.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                >
                  2025 Budget
                </a>
                <a
                  href="https://budget-transparency-portal.senate.gov.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                >
                  Senate Transparency
                </a>
              </div>
            </nav>

            {/* Right: Download Button */}
            <div>
              <Button variant="outline" onClick={downloadCSV} className="text-xs sm:text-sm">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Download CSV
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mt-4">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="relative flex-1">
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
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm w-full sm:w-auto sm:min-w-[160px]"
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
                className="text-xs px-3 py-2 text-black hover:text-black/80 whitespace-nowrap self-start sm:self-center"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
          <p className="mt-3 text-xs">
            Data under <span className="font-semibold">public domain</span> • Source code: <a href="https://github.com/bettergovph/2026-budget" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">github.com/bettergovph/2026-budget</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
