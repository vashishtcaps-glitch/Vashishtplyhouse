import React, { useState } from 'react';
import { Invoice, HSNSummaryRow } from '../types/invoice';
import { InvoicePrintA4 } from './InvoicePrintA4';
import { X, Printer, ZoomIn, ZoomOut, Download, Check } from 'lucide-react';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  hsnSummary: HSNSummaryRow[];
  onSave?: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  invoice,
  hsnSummary,
  onSave,
}) => {
  const [zoom, setZoom] = useState<number>(95);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAndPrint = () => {
    if (onSave) {
      onSave();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md modal-backdrop print:bg-white print:p-0 print:m-0 print:static print:inset-auto">
      {/* Modal Toolbar (Hidden during print) */}
      <div className="no-print bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between gap-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Invoice Preview</span>
              <span className="font-mono text-amber-400 font-bold">{invoice.invoiceNo}</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Official Tally-Standard GST Tax Invoice · Standard A4
            </p>
          </div>
        </div>

        {/* Center / Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Zoom Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setZoom((z) => Math.max(60, z - 10))}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs text-slate-300 w-10 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(130, z + 10))}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {onSave && (
            <button
              onClick={() => {
                onSave();
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2000);
              }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Saved</span>
                </>
              ) : (
                <span>Save Record</span>
              )}
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal Body: Scrollable Document View */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start bg-neutral-900/95 print:bg-white print:p-0 print:m-0 print:overflow-visible print:block">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="shadow-2xl my-2 print:shadow-none print:m-0 print:p-0 print:transform-none"
        >
          <InvoicePrintA4 invoice={invoice} hsnSummary={hsnSummary} />
        </div>
      </div>
    </div>
  );
};
