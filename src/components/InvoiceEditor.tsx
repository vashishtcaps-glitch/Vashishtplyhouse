import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Invoice,
  InvoiceItem,
  INDIAN_STATES,
  HSN_PRESETS,
  PLYWOOD_PRESETS,
  VASHISHT_FIRM_PROFILE,
  CatalogProduct,
  UnitType,
} from '../types/invoice';
import { calculateItemRow, formatINR } from '../utils/calculations';
import { getCatalogProducts } from '../utils/storage';
import {
  Plus,
  Trash2,
  Building,
  Printer,
  PackageOpen,
  ChevronDown,
  ChevronUp,
  Truck,
  Calculator,
  Search,
  Sparkles,
  Tag,
  Check,
  X,
} from 'lucide-react';

interface InvoiceEditorProps {
  invoice: Invoice;
  onChange: (updated: Invoice) => void;
  onOpenPrintModal?: () => void;
  catalogProducts?: CatalogProduct[];
}

const UNIT_OPTIONS: UnitType[] = [
  'SQFT',
  'PCS',
  'PKT',
  'KG',
  'LTR',
  'DRUM',
  'SET',
  'SHEET',
  'TRIP',
  'BOX',
  'MTR',
  'NOS',
  'OTH',
];

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  invoice,
  onChange,
  onOpenPrintModal,
  catalogProducts: propCatalogProducts,
}) => {
  const [showTransportDetails, setShowTransportDetails] = useState(false);
  const [activeAutocompleteRow, setActiveAutocompleteRow] = useState<number | null>(null);
  const [activeDimensionCalcRow, setActiveDimensionCalcRow] = useState<number | null>(null);
  const [activeHsnDropdownRow, setActiveHsnDropdownRow] = useState<number | null>(null);
  const [hsnSearchQuery, setHsnSearchQuery] = useState('');
  const hsnSearchInputRef = useRef<HTMLInputElement>(null);
  const [internalCatalog, setInternalCatalog] = useState<CatalogProduct[]>([]);

  // Load catalog for live autocomplete
  useEffect(() => {
    setInternalCatalog(getCatalogProducts());
  }, []);

  const catalogProducts = propCatalogProducts || internalCatalog;

  // Auto-focus quick search input & refresh latest catalog when HSN dropdown opens
  useEffect(() => {
    if (activeHsnDropdownRow !== null) {
      setInternalCatalog(getCatalogProducts());
      setTimeout(() => {
        hsnSearchInputRef.current?.focus();
      }, 40);
    } else {
      setHsnSearchQuery('');
    }
  }, [activeHsnDropdownRow]);

  // Load ALL 26+ Master Catalog Products & Codes directly from Settings/Master Catalog
  const masterCatalogList = useMemo(() => {
    const list: {
      id: string;
      code: string;
      name: string;
      category: string;
      rate: number;
      taxRate: number;
      unit: UnitType;
      isPlywood: boolean;
      isTaxInclusive: boolean;
    }[] = [];

    const seenKeys = new Set<string>();

    // 1. Add all products from Master Catalog (all 26+ saved products!)
    catalogProducts.forEach((prod) => {
      const code = (prod.hsn || '').trim();
      if (!code) return;
      seenKeys.add(`${code}_${prod.name.toLowerCase()}`);
      list.push({
        id: prod.id,
        code,
        name: prod.name,
        category: prod.category || 'Master Catalog',
        rate: prod.rate || 0,
        taxRate: prod.taxRate || 18,
        unit: prod.unit || 'PCS',
        isPlywood: prod.unit === 'SQFT' || code === '4412',
        isTaxInclusive: !!prod.isTaxInclusive,
      });
    });

    // 2. Also ensure any standard HSN_PRESET codes not covered in catalog products are included
    HSN_PRESETS.forEach((preset) => {
      const key = `${preset.code}_${preset.category.toLowerCase()}`;
      if (!seenKeys.has(key)) {
        list.push({
          id: `preset_${preset.code}`,
          code: preset.code,
          name: preset.category,
          category: preset.category,
          rate: 0,
          taxRate: preset.defaultTaxRate,
          unit: preset.defaultUnit,
          isPlywood: preset.isPlywood,
          isTaxInclusive: true,
        });
      }
    });

    return list;
  }, [catalogProducts]);

  // Click outside to close dropdowns immediately
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.hsn-dropdown-container')) {
        setActiveHsnDropdownRow(null);
      }
      if (!target.closest('.description-autocomplete-container')) {
        setActiveAutocompleteRow(null);
      }
      if (!target.closest('.dimension-calc-container')) {
        setActiveDimensionCalcRow(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Intra-state detection (Seller State 02 HP)
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

  // Add Item Row (Defaults to GST Inclusive for counter MRP sales)
  const addItem = (defaultHsn: string = '', defaultTaxRate: number = 18) => {
    const newItemRaw: Partial<InvoiceItem> = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      description: '',
      hsn: defaultHsn,
      isPlywood: false,
      quantity: 1,
      unit: 'SQFT',
      rate: 0,
      rateInclusive: 0,
      isTaxInclusive: true, // Default to GST Inclusive for counter MRP sales
      taxRate: defaultTaxRate,
    };

    const calculated = calculateItemRow(newItemRaw, invoice.buyer.stateCode);
    updateInvoice({
      items: [...invoice.items, calculated],
    });
  };

  // Delete Item Row
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

  // Autocomplete matching items for the currently focused row
  const currentQuery =
    activeAutocompleteRow !== null
      ? (invoice.items[activeAutocompleteRow]?.description || '').trim().toLowerCase()
      : '';

  const matchedCatalogItems = useMemo(() => {
    if (!currentQuery || currentQuery.length < 1) return [];
    return catalogProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(currentQuery) ||
          (p.category || '').toLowerCase().includes(currentQuery) ||
          p.hsn.includes(currentQuery)
      )
      .slice(0, 5);
  }, [currentQuery, catalogProducts]);

  // Apply catalog preset to row
  const applyCatalogPreset = (idx: number, prod: CatalogProduct) => {
    const isPlywood = prod.unit === 'SQFT' || prod.hsn === '4412';
    updateItemRow(idx, {
      description: prod.name,
      hsn: prod.hsn,
      unit: prod.unit,
      isPlywood,
      rate: prod.isTaxInclusive ? 0 : prod.rate,
      rateInclusive: prod.isTaxInclusive ? prod.rate : 0,
      isTaxInclusive: prod.isTaxInclusive,
      taxRate: prod.taxRate,
    });
    setActiveAutocompleteRow(null);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* 1. CUSTOMER & BILLING GRID */}
      <section className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 md:p-6 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              CUSTOMER & BILLING DETAILS
            </h2>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">Section A</span>
          </div>

          {/* Dynamic Tax Regime Badge */}
          <div className="flex items-center gap-2">
            {isIntraState ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Intra-State (HP 02) • CGST (9%) + SGST (9%)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Inter-State (Code {invoice.buyer.stateCode || 'XX'}) • IGST (18%)</span>
              </div>
            )}
          </div>
        </div>

        {/* Compact Responsive Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Invoice Number (3 cols) */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">
              Invoice Number
            </label>
            <input
              type="text"
              value={invoice.invoiceNo}
              onChange={(e) => updateInvoice({ invoiceNo: e.target.value })}
              placeholder="VPH/26-27/001"
              className="w-full min-h-[46px] bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-3.5 font-mono font-bold text-base text-amber-400 outline-none transition-all"
            />
          </div>

          {/* Invoice Date (3 cols) */}
          <div className="md:col-span-3 space-y-1.5">
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

          {/* Mobile Number (2 cols) */}
          <div className="md:col-span-2 space-y-1.5">
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

          {/* Address / Destination (6 cols) */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">
              Destination / Town Address
            </label>
            <input
              type="text"
              value={invoice.buyer.address}
              onChange={(e) => updateBuyer({ address: e.target.value })}
              placeholder="e.g. Near Bus Stand, Una (H.P.)"
              className="w-full min-h-[46px] bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* State Dropdown (3 cols) */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">
              Place of Supply (State) <span className="text-emerald-400">*</span>
            </label>
            <select
              value={invoice.buyer.stateCode}
              onChange={(e) => {
                const stateCode = e.target.value;
                const found = INDIAN_STATES.find((s) => s.code === stateCode);
                updateBuyer({
                  stateCode,
                  state: found ? found.name : invoice.buyer.state,
                });
              }}
              className="w-full min-h-[46px] bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3 text-sm text-white outline-none transition-all cursor-pointer"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buyer GSTIN (3 cols) */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400">
              Buyer GSTIN (Optional)
            </label>
            <input
              type="text"
              value={invoice.buyer.gstin || ''}
              onChange={(e) => {
                const gstin = e.target.value.toUpperCase();
                let stateCode = invoice.buyer.stateCode;
                let stateName = invoice.buyer.state;
                if (gstin.length >= 2) {
                  const prefix = gstin.substring(0, 2);
                  const matched = INDIAN_STATES.find((s) => s.code === prefix);
                  if (matched) {
                    stateCode = matched.code;
                    stateName = matched.name;
                  }
                }
                updateBuyer({ gstin, stateCode, state: stateName });
              }}
              placeholder="02AZBPK... (Optional)"
              className="w-full min-h-[46px] bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3 text-sm font-mono uppercase text-slate-200 outline-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* 🚚 TRANSPORT & DISPATCH DETAILS (Collapsible) */}
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

      {/* 2. ITEMS & BILLING SECTION */}
      <section
        style={{ position: 'relative', zIndex: activeHsnDropdownRow !== null ? 40 : 20 }}
        className={`bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-xl shadow-black/20 overflow-visible relative ${
          activeHsnDropdownRow !== null ? 'z-40' : 'z-20'
        }`}
      >
        {/* Header */}
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

        {/* Empty State vs Table */}
        {invoice.items.length === 0 ? (
          <div className="py-16 px-4 text-center bg-slate-950/40 rounded-xl border border-dashed border-white/[0.08] m-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <PackageOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-200">
                No items added to this bill yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Click below to start billing. Instant autocomplete will suggest items from your catalog.
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
          <div className="overflow-visible" style={{ overflow: 'visible' }}>
            <table className="w-full text-left border-collapse" style={{ overflow: 'visible' }}>
              <thead>
                <tr className="bg-slate-950/60 border-b border-white/[0.06] text-slate-400 font-semibold uppercase text-xs tracking-wider">
                  <th className="py-3.5 px-3 w-10 text-center">#</th>
                  <th className="py-3.5 px-3 min-w-[260px]">Item Description</th>
                  <th className="py-3.5 px-3 w-36">HSN Code</th>
                  <th className="py-3.5 px-3 w-40 text-right">Qty & Unit</th>
                  <th className="py-3.5 px-3 w-28 text-center">Pricing Mode</th>
                  <th className="py-3.5 px-3 w-36 text-right">Rate (₹)</th>
                  <th className="py-3.5 px-3 w-24 text-center">GST %</th>
                  <th className="py-3.5 px-4 w-36 text-right">Total (₹)</th>
                  <th className="py-3.5 px-3 w-14 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {invoice.items.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      position: 'relative',
                      zIndex:
                        activeHsnDropdownRow === idx ||
                        activeAutocompleteRow === idx ||
                        activeDimensionCalcRow === idx
                          ? 40
                          : 'auto',
                    }}
                    className={`hover:bg-white/[0.02] transition-colors relative ${
                      activeHsnDropdownRow === idx ||
                      activeAutocompleteRow === idx ||
                      activeDimensionCalcRow === idx
                        ? 'z-40'
                        : 'z-0'
                    }`}
                  >
                    {/* Row # */}
                    <td className="py-3 px-3 text-center text-slate-400 font-mono text-sm font-semibold">
                      {idx + 1}
                    </td>

                    {/* Description with Live Autocomplete */}
                    <td className="py-3 px-3 relative description-autocomplete-container">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.description}
                          onFocus={() => setActiveAutocompleteRow(idx)}
                          onChange={(e) => {
                            setActiveAutocompleteRow(idx);
                            updateItemRow(idx, { description: e.target.value });
                          }}
                          placeholder="Type item name (e.g. Century Ply, 3 inch Screw, Fevicol)..."
                          className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 text-sm font-medium text-white placeholder-slate-500 outline-none transition-all"
                        />

                        {/* Autocomplete Popup */}
                        {activeAutocompleteRow === idx && matchedCatalogItems.length > 0 && (
                          <div className="absolute left-0 top-full mt-1.5 w-full min-w-[320px] bg-slate-900 border border-emerald-500/40 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800/80">
                            <div className="px-3 py-1.5 bg-slate-950 text-[10px] uppercase font-bold text-emerald-400 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" />
                                <span>Matching Catalog Products</span>
                              </span>
                              <span className="text-slate-500 font-normal">Click to Autofill</span>
                            </div>
                            {matchedCatalogItems.map((prod) => (
                              <button
                                key={prod.id}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  applyCatalogPreset(idx, prod);
                                }}
                                className="w-full p-2.5 text-left hover:bg-emerald-500/10 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                              >
                                <div>
                                  <div className="font-semibold text-slate-100 group-hover:text-emerald-300">
                                    {prod.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    HSN: <span className="text-amber-400">{prod.hsn}</span> · Unit: {prod.unit} · {prod.category}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono font-bold text-white">
                                    ₹ {formatINR(prod.rate)}
                                  </div>
                                  <span
                                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                                      prod.isTaxInclusive
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                    }`}
                                  >
                                    {prod.isTaxInclusive ? 'INCL' : 'EXCL'}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* HSN / SAC Code (Custom Sleek Dropdown & Direct Free-text) */}
                    <td className="py-3 px-3 relative hsn-dropdown-container">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.hsn}
                          onFocus={() => setActiveHsnDropdownRow(idx)}
                          onChange={(e) => {
                            const val = e.target.value;
                            const match = masterCatalogList.find((h) => h.code === val);
                            updateItemRow(idx, {
                              hsn: val,
                              taxRate: match ? match.taxRate : item.taxRate,
                            });
                          }}
                          placeholder="HSN / SAC"
                          className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-3 pr-8 text-sm font-mono text-amber-400 font-bold outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveHsnDropdownRow(activeHsnDropdownRow === idx ? null : idx);
                          }}
                          tabIndex={-1}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md cursor-pointer transition-colors"
                          title="View all HSN / SAC codes"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              activeHsnDropdownRow === idx ? 'rotate-180 text-emerald-400' : ''
                            }`}
                          />
                        </button>

                        {/* Custom HSN/SAC Dropdown Menu */}
                        {activeHsnDropdownRow === idx && (() => {
                          const shouldOpenUpward = invoice.items.length >= 3 && idx >= invoice.items.length - 1;
                          const q = hsnSearchQuery.trim().toLowerCase();
                          const filtered = q
                            ? masterCatalogList.filter((m) => {
                                const codeMatch = m.code.toLowerCase().includes(q);
                                const nameMatch = m.name.toLowerCase().includes(q);
                                const catMatch = m.category.toLowerCase().includes(q);
                                return codeMatch || nameMatch || catMatch;
                              })
                            : masterCatalogList;

                          return (
                            <div
                              className={`absolute left-0 ${
                                shouldOpenUpward ? 'bottom-full mb-1' : 'top-full mt-1'
                              } w-[360px] min-w-[340px] max-w-[360px] bg-slate-900/98 backdrop-blur-2xl border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
                              style={{
                                position: 'absolute',
                                zIndex: 9999,
                                width: '360px',
                                maxWidth: '360px',
                                boxShadow:
                                  '0 25px 45px -10px rgba(0, 0, 0, 0.95), 0 0 25px 0 rgba(16, 185, 129, 0.2)',
                              }}
                            >
                              {/* Dropdown Header with Dynamic Total Count & Search Bar */}
                              <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2.5">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                                  <span className="flex items-center gap-1.5 text-emerald-400">
                                    <Tag className="w-4 h-4" />
                                    <span className="tracking-wide uppercase">HSN / SAC Master Codes</span>
                                  </span>
                                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                                    All {masterCatalogList.length} Codes Available
                                  </span>
                                </div>

                                {/* Quick Search Bar */}
                                <div className="relative">
                                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  <input
                                    ref={hsnSearchInputRef}
                                    type="text"
                                    value={hsnSearchQuery}
                                    onChange={(e) => setHsnSearchQuery(e.target.value)}
                                    placeholder="Search HSN code, product, or category..."
                                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 rounded-xl pl-8 pr-7 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                                  />
                                  {hsnSearchQuery && (
                                    <button
                                      type="button"
                                      onClick={() => setHsnSearchQuery('')}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Scrollable List with Max Height 380px & Generous Padding */}
                              <div
                                className="overflow-y-auto max-h-[380px] divide-y divide-slate-800/70 custom-hsn-scrollbar"
                                style={{ maxHeight: '380px', overflowY: 'auto' }}
                              >
                                {filtered.length === 0 ? (
                                  <div className="p-6 text-center text-xs space-y-2">
                                    <p className="text-slate-400">
                                      No codes matching &ldquo;<span className="text-amber-400 font-mono">{hsnSearchQuery}</span>&rdquo;
                                    </p>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        updateItemRow(idx, { hsn: hsnSearchQuery.trim() });
                                        setActiveHsnDropdownRow(null);
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-semibold cursor-pointer transition-colors"
                                    >
                                      Use &ldquo;{hsnSearchQuery}&rdquo; as custom HSN
                                    </button>
                                  </div>
                                ) : (
                                  filtered.map((entry) => {
                                    const isSelected = (item.hsn || '').trim() === entry.code;
                                    return (
                                      <button
                                        key={entry.id}
                                        type="button"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          updateItemRow(idx, {
                                            hsn: entry.code,
                                            taxRate: entry.taxRate,
                                            description: !item.description.trim() ? entry.name : item.description,
                                            unit: !item.description.trim() ? entry.unit : item.unit,
                                            rate: !item.description.trim() && entry.rate > 0 ? entry.rate : item.rate,
                                            isPlywood: entry.isPlywood,
                                            isTaxInclusive: entry.isTaxInclusive,
                                          });
                                          setActiveHsnDropdownRow(null);
                                        }}
                                        className={`w-full px-3.5 py-2.5 text-left hover:bg-emerald-500/10 transition-colors flex items-start justify-between group cursor-pointer ${
                                          isSelected
                                            ? 'bg-emerald-500/15 border-l-4 border-emerald-400 pl-3'
                                            : ''
                                        }`}
                                      >
                                        <div className="pr-3 min-w-0 flex-1">
                                          {/* Code & Product Name */}
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-amber-400 text-sm tracking-wider group-hover:text-amber-300 shrink-0">
                                              {entry.code}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-100 group-hover:text-emerald-300 truncate">
                                              {entry.name}
                                            </span>
                                          </div>

                                          {/* Category & Unit */}
                                          <div className="text-[11px] text-slate-400 mt-1 font-medium flex items-center gap-2">
                                            <span className="text-slate-300 truncate">{entry.category}</span>
                                            <span>·</span>
                                            <span className="font-mono text-slate-400">{entry.unit}</span>
                                            {entry.rate > 0 && (
                                              <>
                                                <span>·</span>
                                                <span className="font-mono text-slate-300">₹ {formatINR(entry.rate)}</span>
                                              </>
                                            )}
                                          </div>
                                        </div>

                                        {/* Tax Badge & Selected Check */}
                                        <div className="text-right shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
                                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold">
                                            {entry.taxRate}% GST
                                          </span>
                                          {isSelected && (
                                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-mono">
                                              <Check className="w-3.5 h-3.5" />
                                              <span>Active</span>
                                            </span>
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </td>

                    {/* Qty & Unit with Sheet Calculator popover */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) =>
                            updateItemRow(idx, { quantity: parseFloat(e.target.value) || 0 })
                          }
                          placeholder="0"
                          className="w-20 min-h-[44px] bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-2.5 text-base font-mono font-semibold text-white text-right outline-none transition-all"
                        />

                        <select
                          value={item.unit}
                          onChange={(e) => updateItemRow(idx, { unit: e.target.value as UnitType })}
                          className="min-h-[44px] bg-slate-950/70 border border-slate-800 rounded-xl px-2 text-xs font-semibold text-slate-200 outline-none cursor-pointer"
                        >
                          {UNIT_OPTIONS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>

                        {/* Sheet Dimension Calculator Trigger (for SQFT) */}
                        {item.unit === 'SQFT' && (
                          <div className="relative dimension-calc-container">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveDimensionCalcRow(activeDimensionCalcRow === idx ? null : idx)
                              }
                              className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs transition-colors cursor-pointer"
                              title="Calculate Sq.Ft from Sheets (e.g. 6 Sheets x 32 Sq.Ft = 192 Sq.Ft)"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                            </button>

                            {/* Dimension Calc Popover */}
                            {activeDimensionCalcRow === idx && (
                              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-emerald-500/50 rounded-xl p-3 shadow-2xl z-50 space-y-2.5 text-xs animate-in fade-in duration-150">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                                  <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider">
                                    Sheet Sq.Ft Calculator
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setActiveDimensionCalcRow(null)}
                                    className="text-slate-400 hover:text-white"
                                  >
                                    ✕
                                  </button>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] text-slate-400 font-medium">
                                    Select Sheet Size:
                                  </label>
                                  <div className="grid grid-cols-3 gap-1">
                                    {PLYWOOD_PRESETS.map((p) => (
                                      <button
                                        key={p.label}
                                        type="button"
                                        onClick={() => {
                                          const sheets = item.sheets || 1;
                                          const totalSqFt = p.sqFt * sheets;
                                          updateItemRow(idx, {
                                            isPlywood: true,
                                            lengthFt: p.lengthFt,
                                            widthFt: p.widthFt,
                                            sheets,
                                            sqFtPerSheet: p.sqFt,
                                            totalSqFt,
                                            quantity: totalSqFt,
                                          });
                                        }}
                                        className="p-1 bg-slate-950 hover:bg-emerald-500/20 text-slate-300 hover:text-white text-[10px] font-mono rounded border border-slate-800 text-center transition-colors cursor-pointer"
                                      >
                                        {p.lengthFt}x{p.widthFt} ({p.sqFt})
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] text-slate-400 font-medium">
                                    Number of Sheets:
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.sheets || 1}
                                    onChange={(e) => {
                                      const sheets = Math.max(1, parseInt(e.target.value) || 1);
                                      const perSheet = item.sqFtPerSheet || 32;
                                      const totalSqFt = sheets * perSheet;
                                      updateItemRow(idx, {
                                        sheets,
                                        quantity: totalSqFt,
                                        totalSqFt,
                                      });
                                    }}
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-center text-white"
                                  />
                                </div>

                                <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20 text-center font-mono font-bold text-emerald-400 text-xs">
                                  Total: {item.quantity} SQFT
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setActiveDimensionCalcRow(null)}
                                  className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[11px]"
                                >
                                  Done
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Dual Pricing Mode Toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newInclusive = !item.isTaxInclusive;
                          if (newInclusive) {
                            const rateIncl = Number(
                              (item.rate * (1 + item.taxRate / 100)).toFixed(2)
                            );
                            updateItemRow(idx, {
                              isTaxInclusive: true,
                              rateInclusive: rateIncl,
                            });
                          } else {
                            updateItemRow(idx, { isTaxInclusive: false });
                          }
                        }}
                        className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                          item.isTaxInclusive
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/25'
                        }`}
                        title={
                          item.isTaxInclusive
                            ? 'Rate is GST Inclusive (Entered rate includes tax)'
                            : 'Rate is GST Exclusive (Tax is added on top)'
                        }
                      >
                        {item.isTaxInclusive ? 'INCL' : 'EXCL'}
                      </button>
                    </td>

                    {/* Rate Input (Adapts based on Incl vs Excl Mode) */}
                    <td className="py-3 px-3">
                      <div className="relative">
                        <span className="absolute left-2.5 top-3 text-slate-500 text-sm font-mono pointer-events-none">
                          ₹
                        </span>
                        {item.isTaxInclusive ? (
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={item.rateInclusive === 0 ? '' : item.rateInclusive}
                            onChange={(e) =>
                              updateItemRow(idx, {
                                rateInclusive: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="0.00"
                            className="w-full min-h-[44px] bg-slate-950/70 border border-emerald-500/40 hover:border-emerald-500/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-6 pr-2.5 text-base font-mono font-semibold text-white text-right outline-none transition-all"
                            title="GST Inclusive Rate"
                          />
                        ) : (
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={item.rate === 0 ? '' : item.rate}
                            onChange={(e) =>
                              updateItemRow(idx, { rate: parseFloat(e.target.value) || 0 })
                            }
                            placeholder="0.00"
                            className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-6 pr-2.5 text-base font-mono font-semibold text-white text-right outline-none transition-all"
                            title="Taxable Rate (GST Extra)"
                          />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono text-right mt-0.5">
                        {item.isTaxInclusive
                          ? `Base: ₹${item.rate.toFixed(2)}`
                          : `Incl: ₹${item.rateInclusive?.toFixed(2) || '0.00'}`}
                      </div>
                    </td>

                    {/* GST % (Dropdown) */}
                    <td className="py-3 px-3 text-center">
                      <select
                        value={item.taxRate}
                        onChange={(e) => updateItemRow(idx, { taxRate: Number(e.target.value) })}
                        className="w-full min-h-[44px] bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-1 text-sm font-mono font-semibold text-slate-200 text-center outline-none cursor-pointer"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </td>

                    {/* Total (₹) */}
                    <td className="py-3 px-4 text-right">
                      <div className="min-h-[44px] flex items-center justify-end font-mono font-bold text-base text-white">
                        ₹ {formatINR(item.totalAmount)}
                      </div>
                    </td>

                    {/* Delete Button */}
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

        {/* Bottom Action Strip */}
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



      {/* 3. BOTTOM GRAND TOTAL & FINAL ACTION */}
      <section
        style={{ position: 'relative', zIndex: 1 }}
        className="relative z-1 bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-xl shadow-black/20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Summary Metrics */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/60 border border-white/[0.06] rounded-xl p-3.5 space-y-1">
              <span className="text-slate-400 font-medium">Taxable Value</span>
              <div className="font-mono font-bold text-sm text-slate-100">
                ₹ {formatINR(invoice.subtotalTaxable)}
              </div>
            </div>

            {isIntraState ? (
              <>
                <div className="bg-slate-950/60 border border-white/[0.06] rounded-xl p-3.5 space-y-1">
                  <span className="text-slate-400 font-medium">CGST (9%)</span>
                  <div className="font-mono font-bold text-sm text-emerald-400">
                    ₹ {formatINR(invoice.cgstTotal)}
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-white/[0.06] rounded-xl p-3.5 space-y-1">
                  <span className="text-slate-400 font-medium">SGST (9%)</span>
                  <div className="font-mono font-bold text-sm text-emerald-400">
                    ₹ {formatINR(invoice.sgstTotal)}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-950/60 border border-white/[0.06] rounded-xl p-3.5 space-y-1 sm:col-span-2">
                <span className="text-slate-400 font-medium">Output IGST (18%)</span>
                <div className="font-mono font-bold text-sm text-cyan-400">
                  ₹ {formatINR(invoice.igstTotal)}
                </div>
              </div>
            )}

            <div className="bg-slate-950/60 border border-white/[0.06] rounded-xl p-3.5 space-y-1">
              <span className="text-slate-400 font-medium">Round Off</span>
              <div className="font-mono font-bold text-sm text-slate-300">
                {invoice.roundOff >= 0
                  ? `(+) ₹${invoice.roundOff.toFixed(2)}`
                  : `(-) ₹${Math.abs(invoice.roundOff).toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* Right: Grand Total & Primary CTA */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-950/70 to-indigo-950/40 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between shadow-lg shadow-black/40">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Grand Total (Net Payable)
                </span>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[280px]">
                  {invoice.amountInWords}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-extrabold text-2xl text-emerald-400">
                  ₹ {formatINR(invoice.grandTotal)}
                </div>
              </div>
            </div>

            {onOpenPrintModal && (
              <button
                type="button"
                onClick={onOpenPrintModal}
                className="w-full min-h-[52px] px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 hover:text-black font-extrabold text-base rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer active:scale-[0.99]"
              >
                <Printer className="w-5 h-5" />
                <span>🖨️ Generate & Print A4 Tax Invoice</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
