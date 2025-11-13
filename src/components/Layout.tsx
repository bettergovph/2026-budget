import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  levelFilter: string;
  setLevelFilter: (value: string) => void;
  uniqueLevels: string[];
  downloadCSV: () => void;
}

export function Layout({
  children,
  searchTerm,
  setSearchTerm,
  levelFilter,
  setLevelFilter,
  uniqueLevels,
  downloadCSV,
}: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-w-screen min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Top Row: Logo, Navigation, and Download */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            {/* Left: Logo and Title */}
            <div className="flex items-center gap-3 sm:gap-6">
              <img
                src="https://bettergov.ph/logos/svg/BetterGov_Icon-Primary.svg"
                alt="BetterGov Logo"
                className="h-10 sm:h-12 w-auto"
              />
              <div>
                <h2 className="text-black font-bold text-base sm:text-lg">FY 2026 GAB Dashboard</h2>
                <div className="text-xs text-gray-800">By BetterGov.ph</div>
              </div>
            </div>

            {/* Center: Navigation Links */}
            <nav className="flex flex-1 items-center gap-6 justify-between">
              <div className="flex gap-6">
                <Link
                  to="/"
                  className={`text-sm font-medium transition-colors ${location.pathname === '/'
                      ? 'text-blue-600 underline'
                      : 'text-gray-600 hover:text-gray-900 hover:underline'
                    }`}
                >
                  Overview
                </Link>
                <Link
                  to="/table"
                  className={`text-sm font-medium transition-colors ${location.pathname === '/table'
                      ? 'text-blue-600 underline'
                      : 'text-gray-600 hover:text-gray-900 hover:underline'
                    }`}
                >
                  Table View
                </Link>
              </div>
              <div className="flex gap-6">
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
              {uniqueLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
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
      <main className="max-w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-6 bg-white">
        <div className="max-w-full px-6 text-center text-sm text-gray-600">
          <p>FY 2026 General Appropriations Bill - All amounts in Thousand Pesos</p>
          <p className="mt-1">Data Source: Committee Report HBN 4058</p>
          <p className="mt-3 text-xs">
            Data under <span className="font-semibold">public domain</span> • Source code:{' '}
            <a
              href="https://github.com/bettergovph/2026-budget"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              github.com/bettergovph/2026-budget
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
