import {
  Invoice,
  BankDetails,
  DEFAULT_BANK_DETAILS,
  FirmProfile,
  VASHISHT_FIRM_PROFILE,
  CatalogProduct,
} from '../types/invoice';
import { calculateInvoiceTotals } from './calculations';
import { numberToWordsINR, taxAmountToWordsINR } from './numberToWords';

const DB_NAME = 'VashishtPlyHouseDB';
const DB_VERSION = 1;
const STORE_INVOICES = 'invoices';
const STORE_SETTINGS = 'settings';
const LOCAL_STORAGE_KEY = 'vph_invoices_backup';
const LOCAL_SETTINGS_KEY = 'vph_settings_backup';
const LOCAL_CATALOG_KEY = 'vph_product_catalog_v1';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_INVOICES)) {
        const store = db.createObjectStore(STORE_INVOICES, { keyPath: 'id' });
        store.createIndex('invoiceNo', 'invoiceNo', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveInvoiceToDB(invoice: Invoice): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_INVOICES, 'readwrite');
      const store = tx.objectStore(STORE_INVOICES);
      const req = store.put(invoice);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed, falling back to LocalStorage', err);
  }

  // Also maintain local storage mirror
  try {
    const existing = getInvoicesFromLocalStorage();
    const index = existing.findIndex(inv => inv.id === invoice.id);
    if (index >= 0) {
      existing[index] = invoice;
    } else {
      existing.unshift(invoice);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.warn('LocalStorage save error', e);
  }
}

export async function getAllInvoices(): Promise<Invoice[]> {
  try {
    const db = await openDatabase();
    const invoices = await new Promise<Invoice[]>((resolve, reject) => {
      const tx = db.transaction(STORE_INVOICES, 'readonly');
      const store = tx.objectStore(STORE_INVOICES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (invoices && invoices.length > 0) {
      invoices.sort((a, b) => b.createdAt - a.createdAt);
      return invoices;
    }
  } catch (err) {
    console.warn('IndexedDB load failed, falling back to LocalStorage', err);
  }

  // Fallback to LocalStorage
  const local = getInvoicesFromLocalStorage();
  if (local.length > 0) {
    return local;
  }

  return [];
}

export function createNewBlankInvoice(existingInvoices: Invoice[] = [], prefix: string = 'VPH/26-27/'): Invoice {
  const nextNo = generateNextInvoiceNumber(existingInvoices, prefix);
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: `vph_inv_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    invoiceNo: nextNo,
    invoiceDate: today,
    transport: {
      deliveryNote: '',
      paymentMode: 'Immediate / Cash',
      referenceNo: '',
      referenceDate: today,
      otherReferences: '',
      buyersOrderNo: '',
      buyersOrderDate: '',
      dispatchDocNo: '',
      deliveryNoteDate: '',
      dispatchedThrough: 'Direct / Counter Sale',
      destination: 'Una, H.P.',
      vehicleNo: '',
    },
    buyer: {
      name: '',
      address: '',
      gstin: '',
      state: 'Himachal Pradesh',
      stateCode: '02',
      phone: '',
    },
    consignee: {
      name: '',
      address: '',
      gstin: '',
      state: 'Himachal Pradesh',
      stateCode: '02',
      phone: '',
      sameAsBuyer: true,
    },
    items: [],
    subtotalTaxable: 0,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    totalTax: 0,
    roundOff: 0,
    grandTotal: 0,
    totalQuantity: 0,
    amountInWords: 'INR Zero Only',
    taxInWords: 'INR Zero Only',
    bankDetails: DEFAULT_BANK_DETAILS,
    notes: '',
    terms: DEFAULT_SETTINGS.defaultTerms,
    status: 'UNPAID',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const all = await getAllInvoices();
  return all.find(inv => inv.id === id) || null;
}

export async function deleteInvoiceFromDB(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_INVOICES, 'readwrite');
      const store = tx.objectStore(STORE_INVOICES);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete failed', err);
  }

  const existing = getInvoicesFromLocalStorage().filter(inv => inv.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
}

function getInvoicesFromLocalStorage(): Invoice[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export interface AppSettings {
  firmProfile: FirmProfile;
  bankDetails: BankDetails;
  invoicePrefix: string;
  defaultTerms: string[];
  defaultPricingMode: 'INCLUSIVE' | 'EXCLUSIVE';
}

export const DEFAULT_SETTINGS: AppSettings = {
  firmProfile: VASHISHT_FIRM_PROFILE,
  bankDetails: DEFAULT_BANK_DETAILS,
  invoicePrefix: 'VPH/26-27/',
  defaultTerms: [
    'Goods once sold will not be taken back.',
    'Subject to Una (H.P.) jurisdiction only.',
  ],
  defaultPricingMode: 'INCLUSIVE',
};

export const DEFAULT_CATALOG_PRODUCTS: CatalogProduct[] = [
  // Fasteners & Nails (HSN 7317 / 7318)
  { id: 'prod_1', name: '3" Screw', hsn: '7318', unit: 'PKT', rate: 320.00, isTaxInclusive: true, taxRate: 18, category: 'Fasteners & Nails' },
  { id: 'prod_2', name: 'Screw 6x149', hsn: '7318', unit: 'PCS', rate: 220.00, isTaxInclusive: true, taxRate: 18, category: 'Fasteners & Nails' },
  { id: 'prod_3', name: 'Screw 6x32', hsn: '7318', unit: 'PCS', rate: 400.00, isTaxInclusive: true, taxRate: 18, category: 'Fasteners & Nails' },
  { id: 'prod_4', name: "Screw Self 1'", hsn: '7318', unit: 'PCS', rate: 350.00, isTaxInclusive: true, taxRate: 18, category: 'Fasteners & Nails' },
  { id: 'prod_5', name: '19 No 3/4" Nail', hsn: '7317', unit: 'KG', rate: 120.00, isTaxInclusive: true, taxRate: 18, category: 'Fasteners & Nails' },
  { id: 'prod_6', name: '17 No Nail 1½"', hsn: '7317', unit: 'KG', rate: 130.00, isTaxInclusive: true, taxRate: 18, category: 'Fasteners & Nails' },

  // Hardware & Hinges (HSN 8302)
  { id: 'prod_7', name: 'Hinges 0° Crank Onsys - Hettich', hsn: '8302', unit: 'SET', rate: 225.00, isTaxInclusive: true, taxRate: 18, category: 'Hardware & Hinges' },
  { id: 'prod_8', name: '15° Crank Onsys - Hettich', hsn: '8302', unit: 'SET', rate: 280.00, isTaxInclusive: true, taxRate: 18, category: 'Hardware & Hinges' },
  { id: 'prod_9', name: 'Push Catcher Premium', hsn: '8302', unit: 'PCS', rate: 300.00, isTaxInclusive: true, taxRate: 18, category: 'Hardware & Hinges' },
  { id: 'prod_10', name: 'L Button', hsn: '8302', unit: 'PCS', rate: 25.00, isTaxInclusive: true, taxRate: 18, category: 'Hardware & Hinges' },
  { id: 'prod_11', name: 'Kabja (Hinges) 1½" x 3/4" x 7\'', hsn: '8302', unit: 'PCS', rate: 250.00, isTaxInclusive: true, taxRate: 18, category: 'Hardware & Hinges' },
  { id: 'prod_12', name: 'Hinges Double Action', hsn: '8302', unit: 'PCS', rate: 650.00, isTaxInclusive: true, taxRate: 18, category: 'Hardware & Hinges' },
  { id: 'prod_13', name: 'Hinges 5x12', hsn: '8302', unit: 'PCS', rate: 80.00, isTaxInclusive: true, taxRate: 18, category: 'Hardware & Hinges' },

  // Plywood, Timber & Veneer (HSN 4412 / 4408 / 4409)
  { id: 'prod_14', name: '18mm Century MR Ply 8x4', hsn: '4412', unit: 'SQFT', rate: 110.00, isTaxInclusive: true, taxRate: 18, category: 'Plywood, Timber & Veneer' },
  { id: 'prod_15', name: '6mm Century MR Ply 8x4', hsn: '4412', unit: 'SQFT', rate: 52.00, isTaxInclusive: true, taxRate: 18, category: 'Plywood, Timber & Veneer' },
  { id: 'prod_16', name: 'Century Veneer Oak Q 8x4', hsn: '4408', unit: 'SQFT', rate: 120.00, isTaxInclusive: false, taxRate: 18, category: 'Plywood, Timber & Veneer' },
  { id: 'prod_17', name: 'Imported Timber Thermo Pine 140x42mm', hsn: '44092990', unit: 'PCS', rate: 2880.00, isTaxInclusive: false, taxRate: 18, category: 'Plywood, Timber & Veneer' },

  // Adhesives & Chemicals (HSN 3506)
  { id: 'prod_18', name: 'Fevicol Marine 20 Kg', hsn: '3506', unit: 'DRUM', rate: 6500.00, isTaxInclusive: true, taxRate: 18, category: 'Adhesives & Chemicals' },
  { id: 'prod_19', name: 'Hetax 1 Ltr', hsn: '3506', unit: 'LTR', rate: 550.00, isTaxInclusive: true, taxRate: 18, category: 'Adhesives & Chemicals' },

  // Laminates & Plastics (HSN 4823 / 3919 / 3920 / 3926)
  { id: 'prod_20', name: '.8mm Sunmica 8106 SF', hsn: '4823', unit: 'SHEET', rate: 850.00, isTaxInclusive: false, taxRate: 18, category: 'Laminates & Plastics' },
  { id: 'prod_21', name: '1mm Sunmica 3004', hsn: '4823', unit: 'SHEET', rate: 1350.00, isTaxInclusive: false, taxRate: 18, category: 'Laminates & Plastics' },
  { id: 'prod_22', name: 'Masking Tape', hsn: '3919', unit: 'PKT', rate: 150.00, isTaxInclusive: true, taxRate: 18, category: 'Laminates & Plastics' },
  { id: 'prod_23', name: 'PVC Tape 100 Smt', hsn: '3920', unit: 'PCS', rate: 550.00, isTaxInclusive: false, taxRate: 18, category: 'Laminates & Plastics' },
  { id: 'prod_24', name: 'Gitti PVC 6mm', hsn: '3926', unit: 'PKT', rate: 40.00, isTaxInclusive: true, taxRate: 18, category: 'Laminates & Plastics' },

  // Logistics & Services (HSN 996511)
  { id: 'prod_25', name: 'Cartage / Delivery Charges', hsn: '996511', unit: 'TRIP', rate: 1000.00, isTaxInclusive: false, taxRate: 18, category: 'Logistics & Services' },
  { id: 'prod_26', name: 'Freight Charges (Ex-Delhi)', hsn: '996511', unit: 'TRIP', rate: 8000.00, isTaxInclusive: false, taxRate: 18, category: 'Logistics & Services' },
];

export function getCatalogProducts(): CatalogProduct[] {
  try {
    const raw = localStorage.getItem(LOCAL_CATALOG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse catalog from localStorage', err);
  }
  // Initialize with defaults if empty
  try {
    localStorage.setItem(LOCAL_CATALOG_KEY, JSON.stringify(DEFAULT_CATALOG_PRODUCTS));
  } catch {}
  return DEFAULT_CATALOG_PRODUCTS;
}

export function saveCatalogProduct(product: CatalogProduct): CatalogProduct[] {
  const current = getCatalogProducts();
  const idx = current.findIndex((p) => p.id === product.id);
  let updated: CatalogProduct[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = product;
  } else {
    updated = [product, ...current];
  }
  localStorage.setItem(LOCAL_CATALOG_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteCatalogProduct(id: string): CatalogProduct[] {
  const current = getCatalogProducts();
  const updated = current.filter((p) => p.id !== id);
  localStorage.setItem(LOCAL_CATALOG_KEY, JSON.stringify(updated));
  return updated;
}

export function resetCatalogToDefaults(): CatalogProduct[] {
  localStorage.setItem(LOCAL_CATALOG_KEY, JSON.stringify(DEFAULT_CATALOG_PRODUCTS));
  return DEFAULT_CATALOG_PRODUCTS;
}

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.firmProfile) {
        parsed.firmProfile = VASHISHT_FIRM_PROFILE;
      }
      if (!parsed.bankDetails || parsed.bankDetails.bankName === 'State Bank of India') {
        parsed.bankDetails = DEFAULT_BANK_DETAILS;
      }
      if (!parsed.defaultTerms || parsed.defaultTerms.length > 2) {
        parsed.defaultTerms = DEFAULT_SETTINGS.defaultTerms;
      }
      if (!parsed.defaultPricingMode) {
        parsed.defaultPricingMode = 'INCLUSIVE';
      }
      return parsed;
    }
  } catch (e) {
    console.warn(e);
  }
  return DEFAULT_SETTINGS;
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
}

export function generateNextInvoiceNumber(existingInvoices: Invoice[], prefix: string = 'VPH/26-27/'): string {
  let highest = 0;
  existingInvoices.forEach(inv => {
    if (inv.invoiceNo && inv.invoiceNo.startsWith(prefix)) {
      const numPart = inv.invoiceNo.replace(prefix, '').trim();
      const n = parseInt(numPart, 10);
      // Only consider realistic sequential sequence (< 1000) for new business reset
      if (!isNaN(n) && n > highest && n < 1000) {
        highest = n;
      }
    }
  });
  const nextNum = highest + 1;
  return `${prefix}${nextNum.toString().padStart(3, '0')}`;
}

export function exportInvoicesToCSV(invoices: Invoice[]): void {
  const headers = [
    'Invoice No',
    'Invoice Date',
    'Buyer Name',
    'Buyer GSTIN',
    'Buyer State',
    'State Code',
    'Taxable Value',
    'CGST Amount',
    'SGST Amount',
    'IGST Amount',
    'Total Tax',
    'Round Off',
    'Grand Total',
    'Payment Status',
    'Vehicle No',
  ];

  const rows = invoices.map(inv => [
    `"${inv.invoiceNo}"`,
    `"${inv.invoiceDate}"`,
    `"${inv.buyer.name.replace(/"/g, '""')}"`,
    `"${inv.buyer.gstin || 'Unregistered'}"`,
    `"${inv.buyer.state}"`,
    `"${inv.buyer.stateCode}"`,
    inv.subtotalTaxable.toFixed(2),
    inv.cgstTotal.toFixed(2),
    inv.sgstTotal.toFixed(2),
    inv.igstTotal.toFixed(2),
    inv.totalTax.toFixed(2),
    inv.roundOff.toFixed(2),
    inv.grandTotal.toFixed(2),
    `"${inv.status}"`,
    `"${inv.transport.vehicleNo || ''}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Vashisht_Ply_House_Sales_Register_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function createSampleInvoice(): Invoice {
  const rawItems = [
    {
      id: 'item_sample_1',
      description: 'Century Club Commercial Plywood 19mm - 8x4 Sheet',
      hsn: '4412',
      isPlywood: true,
      lengthFt: 8,
      widthFt: 4,
      sheets: 15,
      quantity: 480, // 8 * 4 * 15 = 480 sq.ft
      unit: 'SQFT' as const,
      rate: 98.0,
      isTaxInclusive: false,
      taxRate: 18,
    },
    {
      id: 'item_sample_2',
      description: 'Greenply Flush Door 30mm Solid Core - 7x3 Sheet',
      hsn: '4418',
      isPlywood: true,
      lengthFt: 7,
      widthFt: 3,
      sheets: 6,
      quantity: 126, // 7 * 3 * 6 = 126 sq.ft
      unit: 'SQFT' as const,
      rate: 145.0,
      isTaxInclusive: false,
      taxRate: 18,
    },
    {
      id: 'item_sample_3',
      description: 'Merino 1mm High Gloss Sunmica Laminate - 8x4 Sheet',
      hsn: '4823',
      isPlywood: true,
      lengthFt: 8,
      widthFt: 4,
      sheets: 10,
      quantity: 320,
      unit: 'SQFT' as const,
      rate: 55.0,
      isTaxInclusive: false,
      taxRate: 18,
    },
    {
      id: 'item_sample_4',
      description: 'Fevicol Marine Waterproof Wood Adhesive (50 Kg Drum)',
      hsn: '3506',
      isPlywood: false,
      quantity: 2,
      unit: 'KGS' as const,
      rate: 8900.0,
      isTaxInclusive: false,
      taxRate: 18,
    },
    {
      id: 'item_sample_5',
      description: 'Hettich Soft-Close Auto Concealed Hinges (Full Overlay)',
      hsn: '8302',
      isPlywood: false,
      quantity: 48,
      unit: 'PCS' as const,
      rate: 165.0,
      isTaxInclusive: false,
      taxRate: 18,
    },
  ];

  // Buyer in Himachal Pradesh (State Code: 02) -> Intra-state
  const buyerStateCode = '02';
  const totals = calculateInvoiceTotals(rawItems as any, buyerStateCode);

  return {
    id: 'vph_inv_initial_sample',
    invoiceNo: 'VPH/26-27/001',
    invoiceDate: new Date().toISOString().slice(0, 10),
    transport: {
      deliveryNote: 'DN-8921',
      paymentMode: 'Bank Transfer / Immediate',
      referenceNo: 'PO-HP-2026/044',
      referenceDate: new Date().toISOString().slice(0, 10),
      dispatchDocNo: 'LR-45120',
      dispatchedThrough: 'Himachal Goods Carrier',
      destination: 'Mehatpur Industrial Area, Una',
      vehicleNo: 'HP-20-C-4589',
    },
    buyer: {
      name: 'Sharma Furniture & Interior Works',
      address: 'Shop No. 12-14, Main Market, Mehatpur, Tehsil Una, Distt. Una (H.P.) - 174315',
      gstin: '02AALFS8941K1Z2',
      state: 'Himachal Pradesh',
      stateCode: '02',
      phone: '+91 94180 54120',
    },
    consignee: {
      name: 'Sharma Furniture & Interior Works',
      address: 'Shop No. 12-14, Main Market, Mehatpur, Tehsil Una, Distt. Una (H.P.) - 174315',
      gstin: '02AALFS8941K1Z2',
      state: 'Himachal Pradesh',
      stateCode: '02',
      phone: '+91 94180 54120',
      sameAsBuyer: true,
    },
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
    bankDetails: DEFAULT_BANK_DETAILS,
    notes: 'Thank you for your business. Certified timber & plywood products.',
    terms: DEFAULT_SETTINGS.defaultTerms,
    status: 'PAID',
    createdAt: Date.now() - 3600000 * 24 * 2,
    updatedAt: Date.now(),
  };
}
