import { useState, useMemo } from 'react';
import { BudgetData } from '@/types/budget';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Papa from 'papaparse';

interface DataTableProps {
  data: BudgetData[];
}

type SortKey = keyof BudgetData;
type SortDirection = 'asc' | 'desc';

export function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  const uniqueLevels = useMemo(() => {
    return Array.from(new Set(data.map(d => d.Level)));
  }, [data]);

  // Build hierarchical structure
  const hierarchicalData = useMemo(() => {
    const filtered = data.filter(row => {
      const matchesSearch =
        row.Department_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.Agency_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.Sub_Agency_Name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = !levelFilter || row.Level === levelFilter;
      return matchesSearch && matchesLevel;
    });

    // Group by department, then agency
    const structure: {
      summary: BudgetData[];
      departments: Map<string, {
        dept: BudgetData;
        agencies: Map<string, {
          agency: BudgetData;
          subAgencies: BudgetData[];
        }>;
      }>;
    } = {
      summary: [],
      departments: new Map(),
    };

    filtered.forEach(row => {
      if (row.Level === 'Summary') {
        structure.summary.push(row);
      } else if (row.Level === 'Department' || row.Level === 'Special Purpose Fund') {
        // Handle both Department and Special Purpose Fund as top-level entries
        if (!structure.departments.has(row.Department_Code)) {
          structure.departments.set(row.Department_Code, {
            dept: row,
            agencies: new Map(),
          });
        }
      } else if (row.Level === 'Agency') {
        // Ensure department exists
        if (!structure.departments.has(row.Department_Code)) {
          // Create a placeholder department if it doesn't exist
          const placeholderDept: BudgetData = {
            ...row,
            Level: 'Department',
            Agency_Code: '',
            Agency_Name: '',
            Sub_Agency_Code: '',
            Sub_Agency_Name: '',
          };
          structure.departments.set(row.Department_Code, {
            dept: placeholderDept,
            agencies: new Map(),
          });
        }
        const deptData = structure.departments.get(row.Department_Code)!;
        if (!deptData.agencies.has(row.Agency_Code)) {
          deptData.agencies.set(row.Agency_Code, {
            agency: row,
            subAgencies: [],
          });
        }
      } else if (row.Level === 'Sub-Agency') {
        // Ensure department exists
        if (!structure.departments.has(row.Department_Code)) {
          const placeholderDept: BudgetData = {
            ...row,
            Level: 'Department',
            Agency_Code: '',
            Agency_Name: '',
            Sub_Agency_Code: '',
            Sub_Agency_Name: '',
          };
          structure.departments.set(row.Department_Code, {
            dept: placeholderDept,
            agencies: new Map(),
          });
        }
        const deptData = structure.departments.get(row.Department_Code)!;
        // Ensure agency exists
        if (!deptData.agencies.has(row.Agency_Code)) {
          const placeholderAgency: BudgetData = {
            ...row,
            Level: 'Agency',
            Sub_Agency_Code: '',
            Sub_Agency_Name: '',
          };
          deptData.agencies.set(row.Agency_Code, {
            agency: placeholderAgency,
            subAgencies: [],
          });
        }
        const agencyData = deptData.agencies.get(row.Agency_Code)!;
        agencyData.subAgencies.push(row);
      }
    });

    return structure;
  }, [data, searchTerm, levelFilter]);

  const downloadCSV = () => {
    const csv = Papa.unparse(data.filter(row => {
      const matchesSearch =
        row.Department_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.Agency_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.Sub_Agency_Name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = !levelFilter || row.Level === levelFilter;
      return matchesSearch && matchesLevel;
    }));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'budget_data_filtered.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search departments, agencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Levels</option>
            {uniqueLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <Button onClick={downloadCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Department / Agency / Sub-Agency</TableHead>
              <TableHead className="text-right">House</TableHead>
              <TableHead className="text-right">Increase</TableHead>
              <TableHead className="text-right">Decrease</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead className="text-right">Senate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Summary Rows */}
            {hierarchicalData.summary.map((row, idx) => (
              <TableRow key={`summary-${idx}`} className="bg-blue-50 font-semibold">
                <TableCell></TableCell>
                <TableCell className="font-bold">{row.Department_Name.replace(/_/g, ' ')}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(row.House)}</TableCell>
                <TableCell className="text-right font-mono text-green-600">{formatCurrency(row.Increase)}</TableCell>
                <TableCell className="text-right font-mono text-red-600">{formatCurrency(row.Decrease)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(row.Net)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(row.Senate)}</TableCell>
              </TableRow>
            ))}

            {/* Department Rows */}
            {Array.from(hierarchicalData.departments.entries()).map(([deptCode, deptData]) => {
              const hasAgencies = deptData.agencies.size > 0;
              const isExpanded = expandedRows.has(`dept-${deptCode}`);

              return (
                <>
                  <TableRow
                    key={`dept-${deptCode}`}
                    className="bg-gray-50 hover:bg-gray-100 cursor-pointer font-medium"
                    onClick={() => hasAgencies && toggleRow(`dept-${deptCode}`)}
                  >
                    <TableCell>
                      {hasAgencies && (
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''
                            }`}
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">{deptData.dept.Department_Name}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(deptData.dept.House)}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">{formatCurrency(deptData.dept.Increase)}</TableCell>
                    <TableCell className="text-right font-mono text-red-600">{formatCurrency(deptData.dept.Decrease)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(deptData.dept.Net)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(deptData.dept.Senate)}</TableCell>
                  </TableRow>

                  {/* Agency Rows (shown when department is expanded) */}
                  {isExpanded && Array.from(deptData.agencies.entries()).map(([agencyCode, agencyData]) => {
                    const hasSubAgencies = agencyData.subAgencies.length > 0;
                    const isAgencyExpanded = expandedRows.has(`agency-${deptCode}-${agencyCode}`);

                    return (
                      <>
                        <TableRow
                          key={`agency-${deptCode}-${agencyCode}`}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => hasSubAgencies && toggleRow(`agency-${deptCode}-${agencyCode}`)}
                        >
                          <TableCell className="pl-8">
                            {hasSubAgencies && (
                              <ChevronRight
                                className={`w-4 h-4 transition-transform ${isAgencyExpanded ? 'rotate-90' : ''
                                  }`}
                              />
                            )}
                          </TableCell>
                          <TableCell className="pl-6">{agencyData.agency.Agency_Name}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{formatCurrency(agencyData.agency.House)}</TableCell>
                          <TableCell className="text-right font-mono text-sm text-green-600">{formatCurrency(agencyData.agency.Increase)}</TableCell>
                          <TableCell className="text-right font-mono text-sm text-red-600">{formatCurrency(agencyData.agency.Decrease)}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{formatCurrency(agencyData.agency.Net)}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{formatCurrency(agencyData.agency.Senate)}</TableCell>
                        </TableRow>

                        {/* Sub-Agency Rows (shown when agency is expanded) */}
                        {isAgencyExpanded && agencyData.subAgencies.map((subAgency, idx) => (
                          <TableRow key={`sub-${deptCode}-${agencyCode}-${idx}`} className="hover:bg-gray-50">
                            <TableCell></TableCell>
                            <TableCell className="pl-12 text-sm text-gray-600">{subAgency.Sub_Agency_Name}</TableCell>
                            <TableCell className="text-right font-mono text-sm">{formatCurrency(subAgency.House)}</TableCell>
                            <TableCell className="text-right font-mono text-sm text-green-600">{formatCurrency(subAgency.Increase)}</TableCell>
                            <TableCell className="text-right font-mono text-sm text-red-600">{formatCurrency(subAgency.Decrease)}</TableCell>
                            <TableCell className="text-right font-mono text-sm">{formatCurrency(subAgency.Net)}</TableCell>
                            <TableCell className="text-right font-mono text-sm">{formatCurrency(subAgency.Senate)}</TableCell>
                          </TableRow>
                        ))}
                      </>
                    );
                  })}
                </>
              );
            })}

            {hierarchicalData.summary.length === 0 && hierarchicalData.departments.size === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {hierarchicalData.summary.length + hierarchicalData.departments.size} top-level entries
      </div>
    </div>
  );
}
