import { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from './Button';

interface ExportButtonProps {
  data: unknown;
  filename: string;
}

export function ExportButton({ data, filename }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportAsJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportAsCSV = () => {
    if (!Array.isArray(data)) return;
    
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map((row: Record<string, unknown>) => 
        headers.map(header => JSON.stringify(row[header] || '')).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 glass-card z-50 animate-scale-in">
            <button
              onClick={exportAsJSON}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-foreground">Export as JSON</span>
            </button>
            <button
              onClick={exportAsCSV}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span className="text-foreground">Export as CSV</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}