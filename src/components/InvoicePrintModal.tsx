import React, { useState } from 'react';
import { Invoice, HSNSummaryRow } from '../types/invoice';
import { InvoicePrintA4 } from './InvoicePrintA4';
import { X, Printer, ZoomIn, ZoomOut, Check, Copy, Layers } from 'lucide-react';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  hsnSummary: HSNSummaryRow[];
  onSave?: () => void;
}

export type StatutoryCopyType = 'ORIGINAL FOR RECIPIENT' | 'DUPLICATE FOR TRANSPORTER' | 'TRIPLICATE FOR SUPPLIER';

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  invoice,
  hsnSummary,
  onSave,
}) => {
  const [zoom, setZoom] = useState<number>(95);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Statutory Copy Selection (Default: All 3 Copies pre-selected)
  const [includeOriginal, setIncludeOriginal] = useState(true);
  const [includeDuplicate, setIncludeDuplicate] = useState(true);
  const [includeTriplicate, setIncludeTriplicate] = useState(true);

  // Active preview tab on screen
  const [previewTab, setPreviewTab] = useState<'ORIGINAL' | 'DUPLICATE' | 'TRIPLICATE'>('ORIGINAL');

  if (!isOpen) return null;

  const isAllThreeChecked = includeOriginal && includeDuplicate && includeTriplicate;

  const handleToggleAll = () => {
    if (isAllThreeChecked) {
      // Keep only original
      setIncludeOriginal(true);
      setIncludeDuplicate(false);
      setIncludeTriplicate(false);
      setPreviewTab('ORIGINAL');
    } else {
      // Select all 3
      setIncludeOriginal(true);
      setIncludeDuplicate(true);
      setIncludeTriplicate(true);
    }
  };

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

  // Compile list of selected copies for print
  const selectedCopies: { key: string; title: StatutoryCopyType }[] = [];
  if (includeOriginal) {
    selectedCopies.push({ key: 'orig', title: 'ORIGINAL FOR RECIPIENT' });
  }
  if (includeDuplicate) {
    selectedCopies.push({ key: 'dup', title: 'DUPLICATE FOR TRANSPORTER' });
  }
  if (includeTriplicate) {
    selectedCopies.push({ key: 'trip', title: 'TRIPLICATE FOR SUPPLIER' });
  }
  // Fallback to at least original if user unchecked everything
  if (selectedCopies.length === 0) {
    selectedCopies.push({ key: 'orig', title: 'ORIGINAL FOR RECIPIENT' });
  }

  // Active copy title for on-screen preview
  const currentPreviewTitle: StatutoryCopyType =
    previewTab === 'ORIGINAL'
      ? 'ORIGINAL FOR RECIPIENT'
      : previewTab === 'DUPLICATE'
      ? 'DUPLICATE FOR TRANSPORTER'
      : 'TRIPLICATE FOR SUPPLIER';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md modal-backdrop print:bg-white print:p-0 print:m-0 print:static print:inset-auto">
      {/* Modal Toolbar (Hidden during print) */}
      <div className="no-print bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm">
        {/* Left: Invoice Title & Status */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>GST Tax Invoice Preview</span>
              <span className="font-mono text-amber-400 font-bold">{invoice.invoiceNo}</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Official Tally-Standard GST Tax Invoice · {selectedCopies.length} {selectedCopies.length === 1 ? 'Copy' : 'Copies'} Selected
            </p>
          </div>
        </div>

        {/* Center: Statutory Copy Selector Controls */}
        <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white font-medium select-none">
            <input
              type="checkbox"
              checked={isAllThreeChecked}
              onChange={handleToggleAll}
              className="accent-emerald-500 rounded cursor-pointer"
            />
            <span className="font-bold text-emerald-400">Complete 3-Copy Set</span>
          </label>

          <span className="text-slate-600">|</span>

          <label className="flex items-center gap-1 cursor-pointer text-slate-400 hover:text-slate-200 select-none">
            <input
              type="checkbox"
              checked={includeOriginal}
              onChange={(e) => {
                setIncludeOriginal(e.target.checked);
                if (e.target.checked) setPreviewTab('ORIGINAL');
              }}
              className="accent-emerald-500 rounded cursor-pointer"
            />
            <span>Original</span>
          </label>

          <label className="flex items-center gap-1 cursor-pointer text-slate-400 hover:text-slate-200 select-none">
            <input
              type="checkbox"
              checked={includeDuplicate}
              onChange={(e) => {
                setIncludeDuplicate(e.target.checked);
                if (e.target.checked) setPreviewTab('DUPLICATE');
              }}
              className="accent-emerald-500 rounded cursor-pointer"
            />
            <span>Duplicate</span>
          </label>

          <label className="flex items-center gap-1 cursor-pointer text-slate-400 hover:text-slate-200 select-none">
            <input
              type="checkbox"
              checked={includeTriplicate}
              onChange={(e) => {
                setIncludeTriplicate(e.target.checked);
                if (e.target.checked) setPreviewTab('TRIPLICATE');
              }}
              className="accent-emerald-500 rounded cursor-pointer"
            />
            <span>Triplicate</span>
          </label>
        </div>

        {/* Right: Actions & Print Button */}
        <div className="flex items-center gap-2">
          {/* Zoom Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setZoom((z) => Math.max(60, z - 10))}
              className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs text-slate-300 w-10 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(130, z + 10))}
              className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
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
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
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
            className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{selectedCopies.length === 3 ? 'Print 3 Copies / Save PDF' : `Print ${selectedCopies.length} ${selectedCopies.length === 1 ? 'Copy' : 'Copies'} / Save PDF`}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 cursor-pointer"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Screen Preview Copy Switcher Tab Bar (Hidden during print) */}
      <div className="no-print bg-slate-950/80 border-b border-slate-800 px-6 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] font-medium mr-1">Preview Sheet:</span>
          {includeOriginal && (
            <button
              onClick={() => setPreviewTab('ORIGINAL')}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                previewTab === 'ORIGINAL'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              1. Original (Buyer Copy)
            </button>
          )}
          {includeDuplicate && (
            <button
              onClick={() => setPreviewTab('DUPLICATE')}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                previewTab === 'DUPLICATE'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              2. Duplicate (Transporter Copy)
            </button>
          )}
          {includeTriplicate && (
            <button
              onClick={() => setPreviewTab('TRIPLICATE')}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                previewTab === 'TRIPLICATE'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              3. Triplicate (Supplier Copy)
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-400">
          Printing will output each selected copy on its own A4 sheet.
        </div>
      </div>

      {/* Modal Body: Scrollable Document View */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col items-center justify-start bg-neutral-900/95 print:bg-white print:p-0 print:m-0 print:overflow-visible print:block">
        {/* On-Screen View (Renders the active preview copy scaled) */}
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="no-print shadow-2xl my-2"
        >
          <InvoicePrintA4
            invoice={invoice}
            hsnSummary={hsnSummary}
            copyTitle={currentPreviewTitle}
          />
        </div>

        {/* Print Engine View (Visible only during window.print(), renders all selected copies with page breaks) */}
        <div className="print-only hidden print:block w-full">
          {selectedCopies.map((copy) => (
            <InvoicePrintA4
              key={copy.key}
              invoice={invoice}
              hsnSummary={hsnSummary}
              copyTitle={copy.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
