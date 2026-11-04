import React, { useState } from 'react';
import {
  Invoice,
  InvoiceItem,
  INDIAN_STATES,
  HSN_PRESETS,
  VASHISHT_FIRM_PROFILE,
} from '../types/invoice';
import { calculateItemRow, formatINR } from '../utils/calculations';
import { Plus, Trash2, Building, Printer, PackageOpen, ChevronDown, ChevronUp, Truck } from 'lucide-react';

interface InvoiceEditorProps {
  invoice: Invoice;
  onChange: (updated: Invoice) => void;
  onOpenPrintModal?: () => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  invoice,
  onChange,
  onOpenPrintModal,
}) => {
  const [showTransportDetails, setShowTransportDetails] = useState(false);
  const isIntraState = (invoice.buyer.stateCode || '').trim() === VASHISHT_FIRM_PROFILE.stateCode;

  // Update top-level invoice property
  const updateInvoice = (fields: Partial<Invoice>) => {
    onChange({
      ...invoice,
      ...fields,
      updatedAt: Date.now(),
    });
  };

  // Update Buyer details
  const updateBuyer = (fields: Partial<typeof invoice.buyer>) => {
    const newBuyer = { ...invoice.buyer, ...fields };
    const consignee = invoice.consignee.sameAsBuyer
      ? { ...newBuyer, sameAsBuyer: true }
      : invoice.consignee;

    onChange({
      ...invoice,
      buyer: newBuyer,
      consignee,
      updatedAt: Date.now(),
    });
  };

  // Update Transport / Dispatch details
  const updateTransport = (fields: Partial<typeof invoice.transport>) => {
    onChange({
      ...invoice,
      transport: {
        ...(invoice.transport || {
          deliveryNote: '',
          paymentMode: '',
          referenceNo: '',
          referenceDate: '',
          dispatchDocNo: '',
          dispatchedThrough: '',
          destination: '',
          vehicleNo: '',
        }),
        ...fields,
      },
      updatedAt: Date.now(),
    });
  };

  // Add Item Row (Flat, clean, empty)
  const addItem = (defaultHsn: string = '4412', defaultTaxRate: number = 18) => {
    const newItemRaw: Partial<InvoiceItem> = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      description: '',
      hsn: defaultHsn,
      isPlywood: false,
      quantity: 1,
      unit: 'SQFT',
      rate: 0,
      rateInclusive: 0,
      isTaxInclusive: false,
      taxRate: defaultTaxRate,
    };

    const calculated = calculateItemRow(newItemRaw, invoice.buyer.stateCode);
    updateInvoice({
      items: [...invoice.items, calculated],
    });
  };

  // Delete Item Row (Can delete any row)
  const removeItem = (idx: number) => {
    const newItems = invoice.items.filter((_, i) => i !== idx);
    updateInvoice({ items: newItems });
  };

  // Update specific row property
  const updateItemRow = (idx: number, patch: Partial<InvoiceItem>) => {
    const target = { ...invoice.items[idx], ...patch };
    const calculated = calculateItemRow(target, invoice.buyer.stateCode);
    const newItems = [...invoice.items];
    newItems[idx] = calculated;
    updateInvoice({ items: newItems });
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* 1. CUSTOMER & BILLING GRID (Compact Floating Glass Card) */}
      <section className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 md:p-6 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Customer & Billing Details
              </h2>
              <p className="text-[11px] text-slate-400">Buyer address and tax territory regime</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-medium px-3 py-1 rounded-full border shadow-sm ${
                isIntraState
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30 shadow-emerald-950/40'
                  : 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30 shadow-indigo-950/40'
              }`}
            >
              {isIntraState
                ? 'Intra-State (HP 02) • CGST + SGST'
                : `Inter-State (${invoice.buyer.stateCode}) • IGST`}
            </span>
          </div>
        </div>

        {/* Compact Single Row Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3.5">
          {/* Invoice No (3 cols) */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>Invoice No.</span>
              <span className="text-[10px] text-amber-400 font-mono font-normal">Editable</span>
            </label>
            <input
              type="text"
              value={invoice.invoiceNo}
              onChange={(e) => updateInvoice({ invoiceNo: e.target.value })}
              placeholder="VPH/26-27/001"
              className="w-full min-h-[46px] bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-3.5 font-mono font-bold text-base text-amber-400 outline-none transition-all"
            />
          </div>

          {/* Invoice Date (2 cols) */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">
              Invoice Date
            </label>
            <input
              type="date"
              value={invoice.invoiceDate}
              onChange={(e) => updateInvoice({ invoiceDate: e.target.value })}
              className="w-full min-h-[46px] bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3 text-sm font-mono text-white outline-none transition-all cursor-pointer"
            />
          </div>

          {/* Buyer Name (4 cols) */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">
              Buyer / Customer Name <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              value={invoice.buyer.name}
              onChange={(e) => updateBuyer({ name: e.target.value })}
              placeholder="e.g. Ramesh Kumar / Sharma Furniture"
              className="w-full min-h-[46px] bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 text-base font-medium text-white placeholder-slate-500 outline-none transition-all"
              autoFocus
            />
          </div>

          {/* Mobile Number (3 cols) */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">
              Mobile (Optional)
            </label>
            <input
              type="tel"
              value={invoice.buyer.phone || ''}
              onChange={(e) => updateBuyer({ phone: e.target.value })}
              placeholder="+91..."
              className="w-full min-h-[46px] bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 text-base font-mono text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* Address / Destination (8 cols) */}
          <div className="md:col-span-8 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">
              Destination / Town Address
            </label>
            <input
              type="text"
              value={invoice.buyer.address}
              onChange={(e) => updateBuyer({ address: e.target.value })}
              placeholder="e.g. Near Bus Stand, Una (H.P.)"
              className="w-full min-h-[46px] bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 text-base text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* State Dropdown (4 cols) */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">
              Place of Supply (State) <span className="text-emerald-400">*</span>
            </label>
            <select
              value={invoice.buyer.stateCode}
              onChange={(e) => {
                const stateCode = e.target.value;
                const match = INDIAN_STATES.find((s) => s.code === stateCode);
                updateBuyer({
                  stateCode,
                  state: match ? match.name : 'Himachal Pradesh',
                });
              }}
              className="w-full min-h-[46px] bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3 text-sm font-medium text-white outline-none transition-all cursor-pointer"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.code} - {st.name} {st.code === '02' ? '(Himachal Pradesh)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customer GSTIN (Optional) */}
        <div className="mt-3.5 pt-3 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <span className="text-slate-400 whitespace-nowrap text-xs">Customer GSTIN (if registered):</span>
            <input
              type="text"
              value={invoice.buyer.gstin}
              onChange={(e) => {
                const gstin = e.target.value.toUpperCase();
                let stateCode = invoice.buyer.stateCode;
                let stateName = invoice.buyer.state;
                if (gstin.length >= 2) {
                  const detected = gstin.substring(0, 2);
                  const matched = INDIAN_STATES.find((s) => s.code === detected);
                  if (matched) {
                    stateCode = matched.code;
                    stateName = matched.name;
                  }
                }
                updateBuyer({ gstin, stateCode, state: stateName });
              }}
              placeholder="02AZBPK... (Optional)"
              className="bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono uppercase text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none flex-1"
            />
          </div>

          <div className="text-slate-500 text-[11px] flex items-center gap-2">
            <span>Seller: <strong className="text-slate-300">M/s VASHISHT PLY HOUSE</strong></span>
            <span>·</span>
            <span>GSTIN: <strong className="font-mono text-slate-300">02AZBPK0606J1ZY</strong></span>
          </div>
        </div>
      </section>

      {/* 🚚 TRANSPORT & DISPATCH DETAILS (Optional / Collapsible 3-Column Grid) */}
      <section className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-xl shadow-black/20 overflow-hidden transition-all duration-200">
        <button
          type="button"
          onClick={() => setShowTransportDetails((prev) => !prev)}
          className="w-full px-6 py-3.5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">
              🚚
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Transport & Dispatch Details
              </span>
              <span className="ml-2 text-[11px] text-slate-400 font-normal">
                (Optional / Click to {showTransportDetails ? 'Collapse' : 'Expand'})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {invoice.transport?.vehicleNo && (
              <span className="font-mono text-emerald-400 text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Veh: {invoice.transport.vehicleNo}
              </span>
            )}
            {invoice.transport?.destination && (
              <span className="text-slate-300 text-xs px-2 py-0.5 rounded bg-slate-800/80 border border-white/[0.06] hidden sm:inline-block">
                To: {invoice.transport.destination}
              </span>
            )}
            <span className="text-slate-400 text-xs flex items-center gap-1 ml-1 font-medium">
              {showTransportDetails ? (
                <>
                  Hide <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Expand <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </span>
          </div>
        </button>

        {showTransportDetails && (
          <div className="p-6 border-t border-white/[0.06] bg-[#0c1222]/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Delivery Note */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Delivery Note
                </label>
                <input
                  type="text"
                  value={invoice.transport?.deliveryNote || ''}
                  onChange={(e) => updateTransport({ deliveryNote: e.target.value })}
                  placeholder="e.g. DN-8921 / Delivery Challan"
                  className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none"
                />
              </div>

              {/* Mode / Terms of Payment */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Mode / Terms of Payment
                </label>
                <input
                  type="text"
                  list="payment-mode-options"
                  value={invoice.transport?.paymentMode || ''}
                  onChange={(e) => updateTransport({ paymentMode: e.target.value })}
                  placeholder="Immediate / Cash / UPI / Credit"
                  className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none"
                />
                <datalist id="payment-mode-options">
                  <option value="Immediate / Cash" />
                  <option value="UPI / Online" />
                  <option value="Bank Transfer / RTGS" />
                  <option value="Credit / 30 Days" />
                  <option value="Cheque / Draft" />
                </datalist>
              </div>

              {/* Reference No. & Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Reference No. & Date
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={invoice.transport?.referenceNo || ''}
                    onChange={(e) => updateTransport({ referenceNo: e.target.value })}
                    placeholder="Ref No."
                    className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 rounded-xl px-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none"
                  />
                  <input
                    type="date"
                    value={invoice.transport?.referenceDate || ''}
                    onChange={(e) => updateTransport({ referenceDate: e.target.value })}
                    className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Buyer's Order No. & Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Buyer's Order No. & Date
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={invoice.transport?.buyersOrderNo || ''}
                    onChange={(e) => updateTransport({ buyersOrderNo: e.target.value })}
                    placeholder="PO / Order No."
                    className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 rounded-xl px-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none"
                  />
                  <input
                    type="date"
                    value={invoice.transport?.buyersOrderDate || ''}
                    onChange={(e) => updateTransport({ buyersOrderDate: e.target.value })}
                    className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Dispatch Doc No. (Challan / Bilty / LR) */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Dispatch Doc No. (Challan / LR)
                </label>
                <input
                  type="text"
                  value={invoice.transport?.dispatchDocNo || ''}
                  onChange={(e) => updateTransport({ dispatchDocNo: e.target.value })}
                  placeholder="e.g. LR-45120 / Bilty No."
                  className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none"
                />
              </div>

              {/* Delivery Note Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Delivery Note Date
                </label>
                <input
                  type="date"
                  value={invoice.transport?.deliveryNoteDate || ''}
                  onChange={(e) => updateTransport({ deliveryNoteDate: e.target.value })}
                  className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 text-xs text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none cursor-pointer"
                />
              </div>

              {/* Dispatched through */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Dispatched through
                </label>
                <input
                  type="text"
                  value={invoice.transport?.dispatchedThrough || ''}
                  onChange={(e) => updateTransport({ dispatchedThrough: e.target.value })}
                  placeholder="e.g. Direct / Self / Mahalaxmi Transport"
                  className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none"
                />
              </div>

              {/* Motor Vehicle No. */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Motor Vehicle No.
                </label>
                <input
                  type="text"
                  value={invoice.transport?.vehicleNo || ''}
                  onChange={(e) => updateTransport({ vehicleNo: e.target.value.toUpperCase() })}
                  placeholder="e.g. HP-20-C-4589"
                  className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 text-sm font-mono uppercase text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none"
                />
              </div>

              {/* Destination */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Destination
                </label>
                <input
                  type="text"
                  value={invoice.transport?.destination || ''}
                  onChange={(e) => updateTransport({ destination: e.target.value })}
                  placeholder="e.g. Una, H.P."
                  className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. ITEMS & BILLING SECTION (Ultra-Minimal Header, Zero Redundant Pills) */}
      <section className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
        {/* Minimal Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              ITEMS & BILLING
            </h2>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800/80 text-emerald-400 border border-white/[0.06]">
              {invoice.items.length} {invoice.items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* Empty State vs. Populated Flat Table */}
        {invoice.items.length === 0 ? (
          <div className="py-16 px-4 text-center bg-slate-950/40 rounded-xl border border-dashed border-white/[0.08] m-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <PackageOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No items added to this bill yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Ready for fresh billing entry. Click below to add the first line item.
              </p>
            </div>
            <button
              type="button"
              onClick={() => addItem()}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add First Item</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-white/[0.06] text-slate-400 font-semibold uppercase text-xs tracking-wider">
                  <th className="py-3.5 px-3 w-12 text-center">#</th>
                  <th className="py-3.5 px-3 min-w-[280px]">Item Description</th>
                  <th className="py-3.5 px-3 w-36">HSN Code</th>
                  <th className="py-3.5 px-3 w-36 text-right">Qty / Sq.Ft</th>
                  <th className="py-3.5 px-3 w-40 text-right">Rate (₹)</th>
                  <th className="py-3.5 px-3 w-28 text-center">GST %</th>
                  <th className="py-3.5 px-4 w-44 text-right">Total (₹)</th>
                  <th className="py-3.5 px-3 w-16 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Row # */}
                    <td className="py-3 px-3 text-center text-slate-400 font-mono text-sm font-semibold">
                      {idx + 1}
                    </td>

                    {/* Item Description (Large Input) */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItemRow(idx, { description: e.target.value })}
                        placeholder="e.g. Commercial Plywood 19mm / Flush Door / Sunmica"
                        className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 text-base font-medium text-white placeholder-slate-500 outline-none transition-all"
                      />
                    </td>

                    {/* HSN Code (Native Dropdown) */}
                    <td className="py-3 px-3">
                      <select
                        value={item.hsn}
                        onChange={(e) => {
                          const hsn = e.target.value;
                          const match = HSN_PRESETS.find((h) => h.code === hsn);
                          updateItemRow(idx, {
                            hsn,
                            taxRate: match ? match.defaultTaxRate : item.taxRate,
                          });
                        }}
                        className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3 text-sm font-mono text-amber-400 font-medium outline-none cursor-pointer"
                      >
                        <option value="4412">4412 (Plywood)</option>
                        <option value="4418">4418 (Doors)</option>
                        <option value="4411">4411 (MDF/HDF)</option>
                        <option value="4410">4410 (Particle)</option>
                        <option value="8302">8302 (Hardware)</option>
                        <option value="3506">3506 (Adhesives)</option>
                        <option value="4823">4823 (Sunmica)</option>
                        <option value="3920">3920 (PVC Tape)</option>
                        <option value="9403">9403 (Furniture)</option>
                      </select>
                    </td>

                    {/* Qty / Sq.Ft (Big & Readable, min-h-[44px], text-base, text-right) */}
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) =>
                          updateItemRow(idx, { quantity: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="0"
                        className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 text-base font-mono font-semibold text-white text-right outline-none transition-all"
                      />
                    </td>

                    {/* Rate (₹) (Big & Readable, min-h-[44px], text-base, text-right) */}
                    <td className="py-3 px-3">
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-slate-500 text-sm font-mono pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.rate === 0 ? '' : item.rate}
                          onChange={(e) => updateItemRow(idx, { rate: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-7 pr-3.5 text-base font-mono font-semibold text-white text-right outline-none transition-all"
                        />
                      </div>
                    </td>

                    {/* GST % (Dropdown) */}
                    <td className="py-3 px-3 text-center">
                      <select
                        value={item.taxRate}
                        onChange={(e) => updateItemRow(idx, { taxRate: Number(e.target.value) })}
                        className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-2 text-sm font-mono font-semibold text-slate-200 text-center outline-none cursor-pointer"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </td>

                    {/* Total (₹) (Large, Bold Text-Base, Never Clipped) */}
                    <td className="py-3 px-4 text-right">
                      <div className="min-h-[44px] flex items-center justify-end font-mono font-bold text-base text-white">
                        ₹ {formatINR(item.totalAmount)}
                      </div>
                    </td>

                    {/* Delete Button (Can delete ANY row) */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="w-10 h-10 rounded-xl bg-slate-950/80 hover:bg-rose-950/60 border border-white/[0.06] hover:border-rose-500/50 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors mx-auto cursor-pointer"
                        title="Delete this row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Table Action Strip (Visible when items exist) */}
        {invoice.items.length > 0 && (
          <div className="p-4 bg-slate-950/60 border-t border-white/[0.06] flex items-center justify-between">
            <button
              type="button"
              onClick={() => addItem()}
              className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-white/[0.08] hover:border-emerald-500/40 text-slate-200 hover:text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>+ Add Item</span>
            </button>

            <span className="text-xs text-slate-400 font-mono">
              {invoice.items.length} {invoice.items.length === 1 ? 'Line Item' : 'Line Items'} in bill
            </span>
          </div>
        )}
      </section>

      {/* 3. BOTTOM GRAND TOTAL & FINAL ACTION (Floating Card) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Delivery Notes & Bank Info (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 md:p-6 space-y-4 shadow-xl shadow-black/20">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Invoice Remarks / Vehicle Details
            </label>
            <input
              type="text"
              value={invoice.notes}
              onChange={(e) => updateInvoice({ notes: e.target.value })}
              placeholder="e.g. Delivered by Vehicle HP-20-C-4589; 1st quality Gurjan ply."
              className="w-full min-h-[46px] bg-slate-950/70 border border-slate-800/90 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 text-sm text-slate-200 outline-none"
            />
          </div>

          <div className="p-4 bg-slate-950/60 border border-white/[0.06] rounded-xl text-xs space-y-1.5 text-slate-400">
            <div className="font-semibold text-slate-300">Company Bank Details on Printed Invoice:</div>
            <div className="font-mono text-slate-200">
              {invoice.bankDetails.bankName} · A/C: {invoice.bankDetails.accountNo} · IFSC: {invoice.bankDetails.ifsc}
            </div>
            <div className="text-xs text-emerald-400 font-mono">
              Branch: {invoice.bankDetails.branch}
            </div>
          </div>
        </div>

        {/* Right Side: Summary Breakdown, Grand Total, and Primary Print Action (6 cols) */}
        <div className="lg:col-span-6 space-y-3.5">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-xl shadow-black/20 space-y-3">
            <div className="space-y-2.5 text-sm">
              {/* Taxable Amount */}
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-medium">Taxable Value:</span>
                <span className="font-mono text-base font-semibold text-slate-100">
                  ₹ {formatINR(invoice.subtotalTaxable)}
                </span>
              </div>

              {/* Dynamic GST breakdown */}
              {isIntraState ? (
                <>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Central GST (CGST 9%):</span>
                    <span className="font-mono text-slate-200 font-medium">₹ {formatINR(invoice.cgstTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>State GST (SGST 9%):</span>
                    <span className="font-mono text-slate-200 font-medium">₹ {formatINR(invoice.sgstTotal)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center text-slate-400">
                  <span>Integrated GST (IGST 18%):</span>
                  <span className="font-mono text-slate-200 font-medium">₹ {formatINR(invoice.igstTotal)}</span>
                </div>
              )}

              {/* Round Off */}
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Round Off:</span>
                <span className="font-mono text-slate-400">
                  {invoice.roundOff >= 0
                    ? `(+) ₹ ${invoice.roundOff.toFixed(2)}`
                    : `(-) ₹ ${Math.abs(invoice.roundOff).toFixed(2)}`}
                </span>
              </div>

              {/* Grand Total (Vibrant Emerald Font) */}
              <div className="pt-3 border-t border-white/[0.06] flex justify-between items-baseline">
                <span className="text-base font-bold text-white uppercase tracking-wider">
                  Grand Total:
                </span>
                <span className="font-mono text-3xl font-extrabold text-emerald-400">
                  ₹ {formatINR(invoice.grandTotal)}
                </span>
              </div>

              {/* Amount in Words */}
              <div className="pt-2 text-xs text-slate-400 border-t border-white/[0.04]">
                <span className="font-semibold text-slate-300">Amount in Words: </span>
                <span className="font-medium text-emerald-300/90">{invoice.amountInWords}</span>
              </div>
            </div>
          </div>

          {/* Primary Action Button: [ 🖨️ Generate & Print A4 Tax Invoice ] */}
          {onOpenPrintModal && (
            <button
              type="button"
              onClick={onOpenPrintModal}
              className="w-full min-h-[54px] px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 active:scale-[0.99] text-slate-950 font-extrabold text-base rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer select-none"
            >
              <Printer className="w-5 h-5 text-slate-950" />
              <span>Generate & Print A4 Tax Invoice</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
