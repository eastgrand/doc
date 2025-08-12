import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Table } from 'lucide-react';
import { AnalysisResult } from '@/lib/analysis/types';

interface UnifiedDataTableProps {
  analysisResult: AnalysisResult;
  onExport: () => void;
}

export default function UnifiedDataTable({ analysisResult, onExport }: UnifiedDataTableProps) {
  const data = analysisResult?.data;
  // Prepare table data with only essential columns
  const tableData = useMemo(() => {
    if (!data?.records || data.records.length === 0) {
      return { headers: [], rows: [] };
    }

    // Create headers - only essential columns
    const headers = [
      'Area ID',
      'Area Name', 
      data.targetVariable || 'Score',
      'Rank'
    ];

    // Create rows from records - only essential data
    const rows = data.records.map((record, index) => {
      const row = [
        record.area_id || '',
        record.area_name || '',
        record.value?.toFixed(2) || '',
        (record.rank || index + 1).toString()
      ];
      return row;
    });

    return { headers, rows };
  }, [data]);

  const stats = useMemo(() => {
    if (!data?.statistics) return null;
    
    return [
      { label: 'Total Records', value: data.statistics.total },
      { label: 'Mean', value: data.statistics.mean?.toFixed(2) },
      { label: 'Median', value: data.statistics.median?.toFixed(2) },
      { label: 'Min', value: data.statistics.min?.toFixed(2) },
      { label: 'Max', value: data.statistics.max?.toFixed(2) },
      { label: 'Std Dev', value: data.statistics.stdDev?.toFixed(2) }
    ];
  }, [data?.statistics]);

  if (!data || !data.records || data.records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Table className="w-12 h-12 mb-4" />
        <p className="text-sm">No data available to display</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with export button */}
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h3 className="text-sm font-semibold">Data Table</h3>
          <p className="text-xs text-gray-600">
            {tableData.rows.length} records • {tableData.headers.length} columns
          </p>
        </div>
        <Button onClick={onExport} size="sm" variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics summary */}
      {stats && (
        <div className="p-4 bg-gray-50 border-b">
          <h4 className="text-xs font-semibold mb-2">Summary Statistics</h4>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-600">{stat.label}</div>
                <div className="text-xs font-mono">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {tableData.headers.map((header, index) => (
                <th key={index} className="px-3 py-2 text-left font-semibold text-gray-700 border-b">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 border-b">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 text-gray-900">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with record count */}
      <div className="p-2 border-t bg-gray-50 text-center">
        <span className="text-xs text-gray-600">
          Showing {tableData.rows.length} of {data.totalRecords || tableData.rows.length} records
        </span>
      </div>
    </div>
  );
}