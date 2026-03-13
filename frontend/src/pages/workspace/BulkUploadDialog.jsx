import React, { useState, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import { Upload, Download, Loader2, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/['"]/g, ''));
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
      current += char;
    }
    values.push(current.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  }).filter(row => Object.values(row).some(v => v));
}

function downloadTemplate(columns, filename) {
  const csv = columns.join(',') + '\n';
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkUploadDialog({ open, onOpenChange, title, columns, templateFilename, onUpload, onSuccess }) {
  const [rows, setRows] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCSV(ev.target.result);
        if (parsed.length === 0) {
          toast.error('No valid rows found in CSV');
          return;
        }
        setRows(parsed);
        toast.success(`${parsed.length} rows loaded from CSV`);
      } catch (err) {
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (rows.length === 0) return;
    setUploading(true);
    try {
      const res = await onUpload(rows);
      setResult(res);
      if (res.created > 0) {
        toast.success(`${res.created} records created successfully`);
        onSuccess?.();
      }
      if (res.skipped > 0) {
        toast.warning(`${res.skipped} rows skipped`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setRows([]);
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto" data-testid="bulk-upload-dialog">
        <DialogHeader>
          <DialogTitle>Bulk Upload - {title}</DialogTitle>
          <DialogDescription>Upload a CSV file to add multiple records at once.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download CSV template with required columns</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadTemplate(columns, templateFilename)}
              data-testid="download-template-btn"
            >
              <Download className="w-3 h-3 mr-1" /> Template
            </Button>
          </div>

          {/* File Upload */}
          <div
            className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-amber-400 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
            data-testid="csv-drop-zone"
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Click to select a CSV file</p>
            <p className="text-xs text-slate-400 mt-1">Columns: {columns.join(', ')}</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} data-testid="csv-file-input" />

          {/* Preview */}
          {rows.length > 0 && !result && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">{rows.length} rows to upload:</p>
              <div className="max-h-48 overflow-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">#</TableHead>
                      {columns.map(c => <TableHead key={c} className="text-xs">{c}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 10).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs text-slate-500">{i + 1}</TableCell>
                        {columns.map(c => <TableCell key={c} className="text-xs">{row[c] || '-'}</TableCell>)}
                      </TableRow>
                    ))}
                    {rows.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={columns.length + 1} className="text-xs text-center text-slate-400">
                          ... and {rows.length - 10} more rows
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">{result.created} created</span>
                </div>
                {result.skipped > 0 && (
                  <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">{result.skipped} skipped</span>
                  </div>
                )}
              </div>
              {result.errors?.length > 0 && (
                <div className="max-h-32 overflow-auto bg-red-50 rounded-lg p-3">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-600">{err}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Close</Button>
          {rows.length > 0 && !result && (
            <Button onClick={handleUpload} className="bg-amber-500 hover:bg-amber-600" disabled={uploading} data-testid="confirm-bulk-upload-btn">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload {rows.length} Records
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
