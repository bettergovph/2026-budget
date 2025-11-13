import { useState, useMemo } from 'react';
import { BudgetData } from '@/types/budget';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [sortKey, setSortKey] = useState<SortKey>('Department_Name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const uniqueLevels = useMemo(() => {
    return Array.from(new Set(data.map(d => d.Level)));
  }, [data]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(row => {
      const matchesSearch =
        row.Department_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.Agency_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.Sub_Agency_Name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel = !levelFilter || row.Level === levelFilter;

      return matchesSearch && matchesLevel;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, levelFilter, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(filteredAndSortedData);
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

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
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
              <TableHead className="cursor-pointer" onClick={() => handleSort('Level')}>
                <div className="flex items-center gap-1">Level <SortIcon column="Level" /></div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('Department_Name')}>
                <div className="flex items-center gap-1">Department <SortIcon column="Department_Name" /></div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('Agency_Name')}>
                <div className="flex items-center gap-1">Agency <SortIcon column="Agency_Name" /></div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('House')}>
                <div className="flex items-center justify-end gap-1">House <SortIcon column="House" /></div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('Increase')}>
                <div className="flex items-center justify-end gap-1">Increase <SortIcon column="Increase" /></div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('Decrease')}>
                <div className="flex items-center justify-end gap-1">Decrease <SortIcon column="Decrease" /></div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('Net')}>
                <div className="flex items-center justify-end gap-1">Net <SortIcon column="Net" /></div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('Senate')}>
                <div className="flex items-center justify-end gap-1">Senate <SortIcon column="Senate" /></div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedData.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{row.Level}</TableCell>
                  <TableCell>{row.Department_Name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.Agency_Name || '-'}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(row.House)}</TableCell>
                  <TableCell className="text-right font-mono text-green-600">{formatCurrency(row.Increase)}</TableCell>
                  <TableCell className="text-right font-mono text-red-600">{formatCurrency(row.Decrease)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(row.Net)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(row.Senate)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedData.length} of {data.length} entries
      </div>
    </div>
  );
}
