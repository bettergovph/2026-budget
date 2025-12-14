import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ReportFile {
  name: string;
  displayName: string;
  path: string;
}

const REPORT_FILES: ReportFile[] = [
  {
    name: 'dpwh',
    displayName: 'DPWH',
    path: '/citizens-report/[PBC] 2026 Budget Data Analysis - DPWH.csv'
  },
  {
    name: 'education',
    displayName: 'Education',
    path: '/citizens-report/[PBC] 2026 Budget Data Analysis - Educ.csv'
  },
  {
    name: 'hgab-vs-sgab',
    displayName: 'HGAB vs SGAB',
    path: '/citizens-report/[PBC] 2026 Budget Data Analysis - HGAB vs SGAB.csv'
  },
  {
    name: 'health',
    displayName: 'Health',
    path: '/citizens-report/[PBC] 2026 Budget Data Analysis - Health.csv'
  },
  {
    name: 'pork',
    displayName: 'Pork',
    path: '/citizens-report/[PBC] 2026 Budget Data Analysis - Pork.csv'
  },
  {
    name: 'sectoral',
    displayName: 'Sectoral',
    path: '/citizens-report/[PBC] 2026 Budget Data Analysis - Sectoral.csv'
  },
  {
    name: 'social-protection',
    displayName: 'Social Protection',
    path: '/citizens-report/[PBC] 2026 Budget Data Analysis - Social Protection.csv'
  },
  {
    name: 'ua-items',
    displayName: 'UA Items',
    path: '/citizens-report/[PBC] 2026 Budget Data Analysis - UA-Items.csv'
  }
];

export function CitizensReport() {
  const [activeTab, setActiveTab] = useState(REPORT_FILES[0].name);
  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const activeFile = useMemo(() =>
    REPORT_FILES.find(f => f.name === activeTab),
    [activeTab]
  );

  useEffect(() => {
    if (!activeFile || data[activeFile.name]) return;

    setLoading(prev => ({ ...prev, [activeFile.name]: true }));

    fetch(activeFile.path)
      .then(response => response.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(prev => ({ ...prev, [activeFile.name]: results.data }));
            setLoading(prev => ({ ...prev, [activeFile.name]: false }));
          },
        });
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
        setLoading(prev => ({ ...prev, [activeFile.name]: false }));
      });
  }, [activeFile, data]);

  const currentData = activeFile ? data[activeFile.name] : [];
  const isLoading = activeFile ? loading[activeFile.name] : false;

  const downloadCSV = () => {
    if (!activeFile || !currentData || currentData.length === 0) return;

    const csv = Papa.unparse(currentData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeFile.displayName.replace(/\s+/g, '_')}_Analysis.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract column headers from the first data row
  const columns = useMemo(() => {
    if (!currentData || currentData.length === 0) return [];
    return Object.keys(currentData[0]);
  }, [currentData]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Citizens' Budget Report</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Analysis reports from the People's Budget Coalition
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          {REPORT_FILES.map((file) => (
            <button
              key={file.name}
              onClick={() => setActiveTab(file.name)}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === file.name
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
            >
              {file.displayName}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">{activeFile?.displayName} Analysis</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                2026 Budget Data Analysis
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={downloadCSV}
              disabled={!currentData || currentData.length === 0}
              className="text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Download CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading data...</div>
            </div>
          ) : currentData && currentData.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col, idx) => (
                      <TableHead key={idx} className="text-xs sm:text-sm font-semibold">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((row, rowIdx) => (
                    <TableRow key={rowIdx} className="hover:bg-gray-50">
                      {columns.map((col, colIdx) => (
                        <TableCell
                          key={colIdx}
                          className={`text-[10px] sm:text-xs py-2 sm:py-3 ${colIdx === 0 ? 'font-medium' : 'font-mono'
                            }`}
                        >
                          {row[col]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">No data available</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
