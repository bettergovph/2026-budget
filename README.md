# FY 2026 General Appropriations Bill Dashboard

An interactive budget visualization dashboard for the Philippine Government's FY 2026 General Appropriations Bill.

## Features

- **Interactive Charts**: Visualize budget data with multiple chart types (bar, line, area, pie)
- **Hierarchical Table**: Expandable/collapsible table view showing Department → Agency → Sub-Agency structure
- **Filtering**: Search and filter by department, agency, or level
- **Data Export**: Download filtered data as CSV
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **React** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **PapaParse** - CSV parsing and generation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build
```

## Data Source

Budget data sourced from:
- [Senate Budget Transparency Portal](https://budget-transparency-portal.senate.gov.ph/public/documents)
- Committee Report HBN 4058

## Project Structure

```
src/
├── components/
│   ├── Charts.tsx              # Main chart container
│   ├── DataTable.tsx           # Hierarchical table view
│   ├── charts/
│   │   ├── DepartmentCharts.tsx
│   │   ├── AgencyCharts.tsx
│   │   └── SummaryCharts.tsx
│   └── ui/                     # shadcn/ui components
├── types/
│   └── budget.ts               # TypeScript types
└── App.tsx                     # Main application
```

## License

Data is in the **public domain**.

Source code: [https://github.com/bettergovph/2026-budget](https://github.com/bettergovph/2026-budget)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ by [BetterGov.ph](https://bettergov.ph)
