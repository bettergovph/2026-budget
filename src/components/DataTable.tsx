import { useState, useMemo } from 'react';
import { BudgetData } from '@/types/budget';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DataTableProps {
  data: BudgetData[];
  oldData: BudgetData[];
}

type SortKey = 'Senate' | 'House' | 'Increase' | 'Decrease' | 'Net';
type SortDirection = 'asc' | 'desc';

export function DataTable({ data, oldData }: DataTableProps) {
  // Helper function to normalize codes by removing periods for consistent matching
  const normalizeCode = (code: string): string => {
    return (code || '').replace(/\./g, '');
  };

  // Create a map of old data for quick lookups
  const oldDataMap = useMemo(() => {
    const map = new Map<string, BudgetData>();
    oldData.forEach(row => {
      const key = `${row.Level}-${normalizeCode(row.Department_Code)}-${normalizeCode(row.Agency_Code)}-${normalizeCode(row.Sub_Agency_Code)}`;
      map.set(key, row);
    });
    return map;
  }, [oldData]);

  const getOldValue = (row: BudgetData, field: 'Senate' | 'House' | 'Increase' | 'Decrease' | 'Net'): number | null => {
    const key = `${row.Level}-${normalizeCode(row.Department_Code)}-${normalizeCode(row.Agency_Code)}-${normalizeCode(row.Sub_Agency_Code)}`;
    const oldRow = oldDataMap.get(key);
    return oldRow ? oldRow[field] : null;
  };

  // Component to render a cell with current value and old value below
  const ValueCell = ({ row, field, className = '', isBold = false }: { 
    row: BudgetData; 
    field: 'Senate' | 'House' | 'Increase' | 'Decrease' | 'Net';
    className?: string;
    isBold?: boolean;
  }) => {
    const currentValue = row[field] * 1000;
    const oldValue = getOldValue(row, field);
    const hasChanged = oldValue !== null && oldValue !== row[field];
    
    return (
      <TableCell className={`text-right font-mono py-2 sm:py-4 ${className}`}>
        <div className={`text-xs sm:text-sm ${isBold ? 'font-bold' : ''}`}>
          {formatCurrency(currentValue)}
        </div>
        {oldValue !== null && (
          <div className={`text-[9px] sm:text-[10px] mt-0.5 ${
            hasChanged ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {hasChanged && (
              <span className="mr-1">
                {currentValue > (oldValue * 1000) ? '↑' : currentValue < (oldValue * 1000) ? '↓' : '='}
              </span>
            )}
            {formatCurrency(oldValue * 1000)}
          </div>
        )}
      </TableCell>
    );
  };

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-30" />;
    }
    return sortDirection === 'asc' ?
      <ArrowUp className="w-3 h-3 ml-1 inline" /> :
      <ArrowDown className="w-3 h-3 ml-1 inline" />;
  };

  const toggleRow = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  // Build hierarchical structure with sorting
  const hierarchicalData = useMemo(() => {
    // Data is already filtered globally, so just build the structure
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

    data.forEach(row => {
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

    // Sort departments if sortKey is set
    if (sortKey) {
      const sortedDepts = Array.from(structure.departments.entries()).sort((a, b) => {
        const aVal = a[1].dept[sortKey] || 0;
        const bVal = b[1].dept[sortKey] || 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });
      structure.departments = new Map(sortedDepts);
    }

    return structure;
  }, [data, sortKey, sortDirection]);

  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 sm:w-12"></TableHead>
              <TableHead className="text-xs sm:text-sm">Department / Agency / Sub-Agency</TableHead>
              <TableHead
                className="text-right bg-blue-50 cursor-pointer hover:bg-blue-100 text-xs sm:text-sm"
                onClick={() => handleSort('Senate')}
              >
                Senate <SortIcon columnKey="Senate" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-gray-50 text-xs sm:text-sm"
                onClick={() => handleSort('House')}
              >
                House <SortIcon columnKey="House" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-gray-50 text-xs sm:text-sm"
                onClick={() => handleSort('Increase')}
              >
                Increased by Senate <SortIcon columnKey="Increase" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-gray-50 text-xs sm:text-sm"
                onClick={() => handleSort('Decrease')}
              >
                Decreased by Senate <SortIcon columnKey="Decrease" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-gray-50 text-xs sm:text-sm"
                onClick={() => handleSort('Net')}
              >
                Net <SortIcon columnKey="Net" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Summary Rows */}
            {hierarchicalData.summary.map((row, idx) => (
              <TableRow key={`summary-${idx}`} className="bg-blue-50 font-semibold">
                <TableCell></TableCell>
                <TableCell className="font-bold text-xs sm:text-sm">{row.Department_Name.replace(/_/g, ' ')}</TableCell>
                <ValueCell row={row} field="Senate" className="bg-blue-100" isBold={true} />
                <ValueCell row={row} field="House" />
                <ValueCell row={row} field="Increase" className="text-green-600" />
                <ValueCell row={row} field="Decrease" className="text-red-600" />
                <ValueCell row={row} field="Net" />
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
                    <TableCell className="py-2 sm:py-4">
                      {hasAgencies && (
                        <ChevronRight
                          className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isExpanded ? 'rotate-90' : ''
                            }`}
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-xs sm:text-sm py-2 sm:py-4">{deptData.dept.Department_Name}</TableCell>
                    <ValueCell row={deptData.dept} field="Senate" className="bg-blue-50" isBold={true} />
                    <ValueCell row={deptData.dept} field="House" />
                    <ValueCell row={deptData.dept} field="Increase" className="text-green-600" />
                    <ValueCell row={deptData.dept} field="Decrease" className="text-red-600" />
                    <ValueCell row={deptData.dept} field="Net" />
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
                          <TableCell className="pl-4 sm:pl-8 py-2 sm:py-4">
                            {hasSubAgencies && (
                              <ChevronRight
                                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isAgencyExpanded ? 'rotate-90' : ''
                                  }`}
                              />
                            )}
                          </TableCell>
                          <TableCell className="pl-4 sm:pl-6 text-xs sm:text-sm py-2 sm:py-4">{agencyData.agency.Agency_Name}</TableCell>
                          <ValueCell row={agencyData.agency} field="Senate" className="bg-blue-50" />
                          <ValueCell row={agencyData.agency} field="House" />
                          <ValueCell row={agencyData.agency} field="Increase" className="text-green-600" />
                          <ValueCell row={agencyData.agency} field="Decrease" className="text-red-600" />
                          <ValueCell row={agencyData.agency} field="Net" />
                        </TableRow>

                        {/* Sub-Agency Rows (shown when agency is expanded) */}
                        {isAgencyExpanded && agencyData.subAgencies.map((subAgency, idx) => (
                          <TableRow key={`sub-${deptCode}-${agencyCode}-${idx}`} className="hover:bg-gray-50">
                            <TableCell></TableCell>
                            <TableCell className="pl-8 sm:pl-12 text-[10px] sm:text-sm text-gray-600 py-2 sm:py-4">{subAgency.Sub_Agency_Name}</TableCell>
                            <ValueCell row={subAgency} field="Senate" className="bg-blue-50" />
                            <ValueCell row={subAgency} field="House" />
                            <ValueCell row={subAgency} field="Increase" className="text-green-600" />
                            <ValueCell row={subAgency} field="Decrease" className="text-red-600" />
                            <ValueCell row={subAgency} field="Net" />
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

      <div className="text-xs sm:text-sm text-muted-foreground">
        Showing {hierarchicalData.summary.length + hierarchicalData.departments.size} top-level entries. All amounts in pesos.
        {sortKey && <span className="ml-2">• Sorted by {sortKey} ({sortDirection})</span>}
      </div>
    </div>
  );
}
