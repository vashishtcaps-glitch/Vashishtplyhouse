import React, { useState } from 'react';
import { Invoice } from '../types/invoice';
import { formatINR } from '../utils/calculations';
import { exportInvoicesToCSV } from '../utils/storage';
import { X, Search, Download, Trash2, Printer, ExternalLink, Copy, CheckCircle, Clock } from 'lucide-react';

interface InvoiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onPrintInvoice: (invoice: Invoice) => void;
}

export const InvoiceHistoryModal: React.FC<InvoiceHistoryModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onSelectInvoice,
  onDeleteInvoice,
  onDuplicateInvoice,
  onPrintInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'PARTIAL'>('ALL');

  if (!isOpen) return null;

  // Filter logic
  const filtered = invoices.filter((inv) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      inv.invoiceNo.toLowerCase().includes(q) ||
      inv.buyer.name.toLowerCase().includes(q) ||
      (inv.buyer.gstin || '').toLowerCase().includes(q) ||
      (inv.transport.vehicleNo || '').toLowerCase().includes(q) ||
      inv.invoiceDate.includes(q);

    const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Calculate aggregates
  const totalTurnover = invoices.reduce((acc, cur) => acc + cur.grandTotal, 0);
  const totalTaxCollected = invoices.reduce((acc, cur) => acc + cur.totalTax, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Invoice Archive & Sales Register</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                {invoices.length} Invoices Saved
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Locally persisted records in browser IndexedDB with instant search, reload & CSV export
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportInvoicesToCSV(invoices)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Sales Register (CSV)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Aggregate Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6 py-3 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400">Total Billed Turnover:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">₹ {formatINR(totalTurnover)}</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400">Total GST Collected:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">₹ {formatINR(totalTaxCollected)}</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400">Records in Database:</span>
            <span className="font-mono font-bold text-slate-200 text-sm">{invoices.length} Bills</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Invoice #, Customer name, GSTIN, Vehicle #..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            {(['ALL', 'PAID', 'UNPAID', 'PARTIAL'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices List / Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              <p className="text-sm font-medium text-slate-400">No invoices found matching criteria.</p>
              <p className="mt-1">Try refining search parameters or save your current invoice to history.</p>
            </div>
          ) : (
            filtered.map((inv) => (
              <div
                key={inv.id}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 transition-colors text-xs"
              >
                {/* Left: Inv No, Date, Status */}
                <div className="space-y-1 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-100 text-sm">{inv.invoiceNo}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">{inv.invoiceDate}</div>
                </div>

                {/* Middle: Customer & State */}
                <div className="flex-1 min-w-[200px]">
                  <div className="font-semibold text-slate-200 text-xs">{inv.buyer.name}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-sm">
                    {inv.buyer.address || 'Una, H.P.'}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>GSTIN: {inv.buyer.gstin || 'B2C'}</span>
                    <span>·</span>
                    <span>State: {inv.buyer.stateCode} ({inv.buyer.state})</span>
                    {inv.transport.vehicleNo && (
                      <>
                        <span>·</span>
                        <span className="font-mono">Veh: {inv.transport.vehicleNo}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Amounts & Financials */}
                <div className="text-right min-w-[120px]">
                  <div className="text-[10px] text-slate-400">Grand Total</div>
                  <div className="font-mono font-bold text-amber-400 text-sm">
                    ₹ {formatINR(inv.grandTotal)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    GST: ₹ {formatINR(inv.totalTax)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
                  <button
                    onClick={() => {
                      onSelectInvoice(inv);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Load invoice into workspace editor"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Load</span>
                  </button>

                  <button
                    onClick={() => onPrintInvoice(inv)}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Print invoice"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDuplicateInvoice(inv)}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Duplicate into a new invoice"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete invoice ${inv.invoiceNo}?`)) {
                        onDeleteInvoice(inv.id);
                      }
                    }}
                    className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Delete invoice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Data stored offline in browser cache. No internet connection required.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
