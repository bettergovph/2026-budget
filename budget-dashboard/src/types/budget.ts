export interface BudgetData {
  Level: string;
  Department_Code: string;
  Department_Name: string;
  Agency_Code: string;
  Agency_Name: string;
  Sub_Agency_Code: string;
  Sub_Agency_Name: string;
  House: number;
  Increase: number;
  Decrease: number;
  Net: number;
  Senate: number;
}

export type ViewMode = 'dashboard' | 'table';
export type ChartType = 'overview' | 'departments' | 'comparison' | 'trends';
