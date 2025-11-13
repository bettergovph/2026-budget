#!/usr/bin/env python3
"""
Script to convert 2026.json budget data to CSV format
Flattens the hierarchical structure into a table
"""

import json
import csv
import sys

def flatten_json_to_rows(data):
    """
    Convert hierarchical JSON budget data to flat rows for CSV
    """
    rows = []
    
    # Get the main report data
    report = data.get('COMMITTEE_REPORT_HBN_4058', {})
    
    # Add summary section
    summary = report.get('summary', {})
    for key, values in summary.items():
        rows.append({
            'Level': 'Summary',
            'Department_Code': '',
            'Department_Name': key,
            'Agency_Code': '',
            'Agency_Name': '',
            'Sub_Agency_Code': '',
            'Sub_Agency_Name': '',
            'House': values.get('house', 0),
            'Increase': values.get('increase', 0),
            'Decrease': values.get('decrease', 0),
            'Net': values.get('net', 0),
            'Senate': values.get('senate', 0)
        })
    
    # Process departments
    departments = report.get('DEPARTMENTS', [])
    for dept in departments:
        dept_code = dept.get('code', '')
        dept_name = dept.get('name', '')
        
        # Add department row
        rows.append({
            'Level': 'Department',
            'Department_Code': dept_code,
            'Department_Name': dept_name,
            'Agency_Code': '',
            'Agency_Name': '',
            'Sub_Agency_Code': '',
            'Sub_Agency_Name': '',
            'House': dept.get('house', 0),
            'Increase': dept.get('increase', 0),
            'Decrease': dept.get('decrease', 0),
            'Net': dept.get('net', 0),
            'Senate': dept.get('senate', 0)
        })
        
        # Process agencies within department
        agencies = dept.get('agencies', [])
        for agency in agencies:
            agency_code = agency.get('code', '')
            agency_name = agency.get('name', '')
            
            # Add agency row
            rows.append({
                'Level': 'Agency',
                'Department_Code': dept_code,
                'Department_Name': dept_name,
                'Agency_Code': agency_code,
                'Agency_Name': agency_name,
                'Sub_Agency_Code': '',
                'Sub_Agency_Name': '',
                'House': agency.get('house', 0),
                'Increase': agency.get('increase', 0),
                'Decrease': agency.get('decrease', 0),
                'Net': agency.get('net', 0),
                'Senate': agency.get('senate', 0)
            })
            
            # Process sub-agencies if they exist
            sub_agencies = agency.get('sub_agencies', [])
            for sub_agency in sub_agencies:
                sub_agency_code = sub_agency.get('code', '')
                sub_agency_name = sub_agency.get('name', '')
                
                rows.append({
                    'Level': 'Sub-Agency',
                    'Department_Code': dept_code,
                    'Department_Name': dept_name,
                    'Agency_Code': agency_code,
                    'Agency_Name': agency_name,
                    'Sub_Agency_Code': sub_agency_code,
                    'Sub_Agency_Name': sub_agency_name,
                    'House': sub_agency.get('house', 0),
                    'Increase': sub_agency.get('increase', 0),
                    'Decrease': sub_agency.get('decrease', 0),
                    'Net': sub_agency.get('net', 0),
                    'Senate': sub_agency.get('senate', 0)
                })
    
    # Process Special Purpose Funds if they exist
    spf = report.get('SPECIAL_PURPOSE_FUNDS', [])
    for fund in spf:
        fund_code = fund.get('code', '')
        fund_name = fund.get('name', '')
        
        rows.append({
            'Level': 'Special Purpose Fund',
            'Department_Code': fund_code,
            'Department_Name': fund_name,
            'Agency_Code': '',
            'Agency_Name': '',
            'Sub_Agency_Code': '',
            'Sub_Agency_Name': '',
            'House': fund.get('house', 0),
            'Increase': fund.get('increase', 0),
            'Decrease': fund.get('decrease', 0),
            'Net': fund.get('net', 0),
            'Senate': fund.get('senate', 0)
        })
        
        # Process agencies within special purpose funds
        for agency in fund.get('agencies', []):
            agency_code = agency.get('code', '')
            agency_name = agency.get('name', '')
            
            rows.append({
                'Level': 'SPF Agency',
                'Department_Code': fund_code,
                'Department_Name': fund_name,
                'Agency_Code': agency_code,
                'Agency_Name': agency_name,
                'Sub_Agency_Code': '',
                'Sub_Agency_Name': '',
                'House': agency.get('house', 0),
                'Increase': agency.get('increase', 0),
                'Decrease': agency.get('decrease', 0),
                'Net': agency.get('net', 0),
                'Senate': agency.get('senate', 0)
            })
    
    return rows

def main():
    input_file = '2026.json'
    output_file = '2026.csv'
    
    # Allow command line arguments
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    
    print(f"Reading from: {input_file}")
    
    # Read JSON file
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in '{input_file}': {e}")
        sys.exit(1)
    
    # Convert to rows
    rows = flatten_json_to_rows(data)
    
    print(f"Converted {len(rows)} rows")
    
    # Write to CSV
    if rows:
        fieldnames = [
            'Level',
            'Department_Code',
            'Department_Name',
            'Agency_Code',
            'Agency_Name',
            'Sub_Agency_Code',
            'Sub_Agency_Name',
            'House',
            'Increase',
            'Decrease',
            'Net',
            'Senate'
        ]
        
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        
        print(f"Successfully wrote to: {output_file}")
        print(f"\nNote: All amounts are in {data.get('COMMITTEE_REPORT_HBN_4058', {}).get('unit', 'Thousand Pesos')}")
    else:
        print("Warning: No data to write")

if __name__ == '__main__':
    main()
