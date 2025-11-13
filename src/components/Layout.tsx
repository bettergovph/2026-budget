import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, Menu, X } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-w-screen min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Top Row: Logo, Navigation, and Download */}
          <div className="flex items-center justify-between gap-4 md:gap-12">
            {/* Left: Logo and Title */}
            <div className="flex items-center gap-3 sm:gap-6">
              <img
                src="https://bettergov.ph/logos/svg/BetterGov_Icon-Primary.svg"
                alt="BetterGov Logo"
                className="h-10 sm:h-12 w-auto"
              />
              <div>
                <h2 className="text-black font-bold text-sm sm:text-base lg:text-lg">FY 2026 GAB Dashboard</h2>
                <div className="text-xs text-gray-800">By BetterGov.ph</div>
              </div>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex flex-1 items-center gap-8 justify-between font-bold">
              <div className="flex gap-8">
                <Link
                  to="/"
                  className={`text-md font-bold transition-colors ${location.pathname === '/'
                    ? 'text-blue-600 underline'
                    : 'text-black hover:text-gray-900 hover:underline'
                    }`}
                >
                  Overview
                </Link>
                <Link
                  to="/table"
                  className={`text-md font-bold transition-colors ${location.pathname === '/table'
                    ? 'text-blue-600 underline'
                    : 'text-black hover:text-gray-900 hover:underline'
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
                  className="text-md font-medium text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                >
                  2025 Budget
                </a>
                <a
                  href="https://budget-transparency-portal.senate.gov.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-md font-medium text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                >
                  Senate Transparency
                </a>
              </div>
            </nav>

            {/* Right: Download and Hamburger */}
            <div className="flex items-center gap-2">
              {/* Download Button - Desktop */}
              <Button variant="outline" onClick={downloadCSV} className="hidden sm:flex text-xs sm:text-sm">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Download CSV
              </Button>

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-b border-gray-200">
              {/* Search Bar in Mobile Menu */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search departments, agencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {(searchTerm || levelFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setLevelFilter('');
                    }}
                    className="text-xs px-3 py-2 text-black hover:text-black/80 mt-2"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col gap-3">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium py-2 transition-colors ${location.pathname === '/'
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Overview
                </Link>
                <Link
                  to="/table"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium py-2 transition-colors ${location.pathname === '/table'
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Table View
                </Link>
                <a
                  href="https://budget.bettergov.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium text-gray-600 hover:text-gray-900 py-2"
                >
                  2025 Budget ↗
                </a>
                <a
                  href="https://budget-transparency-portal.senate.gov.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium text-gray-600 hover:text-gray-900 py-2"
                >
                  Senate Transparency ↗
                </a>
                <Button variant="outline" onClick={downloadCSV} className="mt-2 justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </nav>
            </div>
          )}

          {/* Desktop Filters */}
          <div className="hidden lg:flex flex-col gap-4 mt-4">
            {/* Search Bar */}
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
              {(searchTerm || levelFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setLevelFilter('');
                  }}
                  className="text-xs px-3 py-2 text-black hover:text-black/80 whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Level Filter Pills */}
            <div className="flex overflow-x-auto gap-2 pb-2 -mb-2 scrollbar-hide">
              <button
                onClick={() => setLevelFilter('')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${!levelFilter
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All Levels
              </button>
              {uniqueLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${levelFilter === level
                    ? 'bg-blue-600 text-white shadow-sm font-bold border border-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Level Filter Pills (always visible) */}
          <div className="lg:hidden mt-4">
            <div className="flex overflow-x-auto gap-2 pb-2 -mb-2 scrollbar-hide">
              <button
                onClick={() => setLevelFilter('')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${!levelFilter
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All Levels
              </button>
              {uniqueLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${levelFilter === level
                    ? 'bg-blue-600 text-white shadow-sm font-bold border border-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
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
