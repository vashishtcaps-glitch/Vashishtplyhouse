import React, { useState, useEffect, useMemo } from 'react';
import {
  Invoice,
  VASHISHT_FIRM_PROFILE,
  CatalogProduct,
} from './types/invoice';
import { calculateInvoiceTotals } from './utils/calculations';
import { numberToWordsINR, taxAmountToWordsINR } from './utils/numberToWords';
import {
  getAllInvoices,
  saveInvoiceToDB,
  deleteInvoiceFromDB,
  getAppSettings,
  saveAppSettings,
  generateNextInvoiceNumber,
  createNewBlankInvoice,
  AppSettings,
  DEFAULT_SETTINGS,
  getCatalogProducts,
} from './utils/storage';
import { VashishtLogo } from './components/VashishtLogo';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoicePrintA4 } from './components/InvoicePrintA4';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { InvoiceHistoryModal } from './components/InvoiceHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import {
  RotateCcw,
  FolderOpen,
  Settings as SettingsIcon,
  CheckCircle2,
  Calendar,
  Hash,
  Save,
} from 'lucide-react';

export default function App() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>(() => getCatalogProducts());

  // Initialize with FRESH and EMPTY invoice by default (Zero pre-loaded rows!)
  useEffect(() => {
    async function init() {
      const loadedSettings = await getAppSettings();
      setSettings(loadedSettings);

      const all = await getAllInvoices();
      setInvoices(all);

      setCatalogProducts(getCatalogProducts());

      // Start with completely fresh empty invoice (items: [])
      const freshInvoice = createNewBlankInvoice(all, loadedSettings.invoicePrefix);
      setCurrentInvoice(freshInvoice);
    }
    init();
  }, []);

  // Recalculate totals on any change
  const processedInvoice = useMemo(() => {
    if (!currentInvoice) return null;
    const totals = calculateInvoiceTotals(currentInvoice.items, currentInvoice.buyer.stateCode);
    return {
      ...currentInvoice,
      items: totals.items,
      subtotalTaxable: totals.subtotalTaxable,
      cgstTotal: totals.cgstTotal,
      sgstTotal: totals.sgstTotal,
      igstTotal: totals.igstTotal,
      totalTax: totals.totalTax,
      roundOff: totals.roundOff,
      grandTotal: totals.grandTotal,
      totalQuantity: totals.totalQuantity,
      amountInWords: numberToWordsINR(totals.grandTotal),
      taxInWords: taxAmountToWordsINR(totals.totalTax),
      hsnSummary: totals.hsnSummary,
    };
  }, [currentInvoice]);

  // Handle invoice modification
  const handleInvoiceChange = (updated: Invoice) => {
    setCurrentInvoice(updated);
  };

  // Save current invoice to database
  const handleSaveInvoice = async () => {
    if (!processedInvoice) return;
    await saveInvoiceToDB(processedInvoice);
    const updatedList = await getAllInvoices();
    setInvoices(updatedList);
    showToast(`Invoice ${processedInvoice.invoiceNo} saved to local archive.`);
  };

  // Clear Form / Reset to fresh empty bill
  const handleClearForm = () => {
    if (confirm('Clear form and start a fresh bill?')) {
      const freshInvoice = createNewBlankInvoice(invoices, settings.invoicePrefix);
      setCurrentInvoice(freshInvoice);
      showToast('Form cleared. Ready for fresh billing entry.');
    }
  };

  // Delete invoice from history
  const handleDeleteInvoice = async (id: string) => {
    await deleteInvoiceFromDB(id);
    const updated = await getAllInvoices();
    setInvoices(updated);
    showToast('Invoice deleted from local archive.');
  };

  // Duplicate invoice
  const handleDuplicateInvoice = (target: Invoice) => {
    const nextNo = generateNextInvoiceNumber(invoices, settings.invoicePrefix);
    const cloned: Invoice = {
      ...target,
      id: `vph_inv_${Date.now()}`,
      invoiceNo: nextNo,
      invoiceDate: new Date().toISOString().slice(0, 10),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCurrentInvoice(cloned);
    showToast(`Duplicated into invoice ${nextNo}`);
  };

  // Show transient toast
  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 3200);
  };

  // Save settings update
  const handleSaveSettings = async (updated: AppSettings) => {
    await saveAppSettings(updated);
    setSettings(updated);
    if (currentInvoice) {
      setCurrentInvoice({
        ...currentInvoice,
        bankDetails: updated.bankDetails,
        terms: updated.defaultTerms,
      });
    }
    showToast('Settings & bank configuration updated.');
  };

  if (!processedInvoice) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Vashisht Ply House POS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Ambient Radial Glow Mesh in Background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.07),rgba(255,255,255,0))]"></div>

      {/* 1. Minimalist Next-Gen Top Header */}
      <header className="no-print bg-slate-950/70 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-40 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm relative">
        {/* Left: Firm Title */}
        <div className="flex items-center gap-3.5">
          <VashishtLogo size={38} variant="color" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                Vashisht Ply House
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono font-medium">
                POS 2026
              </span>
            </div>
            <span className="text-[10.5px] text-slate-400">
              GST Billing · Una (H.P.) Code: 02
            </span>
          </div>
        </div>

        {/* Center: Live Invoice # & Date Picker */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-white/[0.08]">
            <Hash className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-400">Bill No:</span>
            <input
              type="text"
              value={processedInvoice.invoiceNo}
              onChange={(e) => setCurrentInvoice({ ...processedInvoice, invoiceNo: e.target.value })}
              className="bg-transparent font-mono font-bold text-amber-400 w-32 outline-none text-sm"
              placeholder="Invoice No"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-white/[0.08]">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={processedInvoice.invoiceDate}
              onChange={(e) => setCurrentInvoice({ ...processedInvoice, invoiceDate: e.target.value })}
              className="bg-transparent font-mono text-slate-200 outline-none text-sm cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Top Controls: [Archive], [Settings], [Clear Form], and [Save Record] */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-3 py-2 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/[0.08] cursor-pointer"
            title="Invoice Archive & Sales Register"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Archive</span>
            {invoices.length > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {invoices.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-white rounded-xl transition-colors border border-white/[0.08] cursor-pointer"
            title="Company Bank Details & Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearForm}
            className="px-3 py-2 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/[0.08] cursor-pointer"
            title="Clear all fields for fresh bill"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear Form</span>
          </button>

          <button
            onClick={handleSaveInvoice}
            className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-500/30 cursor-pointer shadow-sm shadow-emerald-950/30"
            title="Save invoice record to local storage"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save Record</span>
          </button>
        </div>
      </header>

      {/* 2. Full-Width Single-Screen POS Billing Workspace */}
      <main className="no-print flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <InvoiceEditor
            invoice={processedInvoice}
            onChange={handleInvoiceChange}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            catalogProducts={catalogProducts}
          />
        </div>
      </main>

      {/* 3. Sleek Floating Print Modal (The Official A4 Tally Invoice) */}
      <InvoicePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        invoice={processedInvoice}
        hsnSummary={processedInvoice.hsnSummary}
        onSave={handleSaveInvoice}
      />

      {/* Ancillary Modals */}
      <InvoiceHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        invoices={invoices}
        onSelectInvoice={(inv) => {
          setCurrentInvoice(inv);
          showToast(`Loaded invoice ${inv.invoiceNo}`);
        }}
        onDeleteInvoice={handleDeleteInvoice}
        onDuplicateInvoice={handleDuplicateInvoice}
        onPrintInvoice={(inv) => {
          setCurrentInvoice(inv);
          setIsPrintModalOpen(true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onCatalogChange={setCatalogProducts}
      />

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-emerald-500/50 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}
    </div>
  );
}
