/**
 * Core TypeScript definitions for M/s Vashisht Ply House GST Billing System
 */

export interface FirmProfile {
  firmName: string;
  proprietor: string;
  gstin: string;
  pan: string;
  state: string;
  stateCode: string;
  address: string;
  landmark: string;
  phones: string[];
  email: string;
}

export const VASHISHT_FIRM_PROFILE: FirmProfile = {
  firmName: "M/s VASHISHT PLY HOUSE",
  proprietor: "Rohit Kumar",
  gstin: "02AZBPK0606J1ZY",
  pan: "AZBPK0606J",
  state: "Himachal Pradesh",
  stateCode: "02",
  address: "Khasra No. 1308, Khata No. 101/90, Hadbast No. 219, Near Railway Bridge, Badehar Upperla, Una (H.P.) - 174306",
  landmark: "Near Railway Bridge, Badehar Upperla, Una",
  phones: ["+91 98775 28053", "+91 98826 31777"],
  email: "rohitkumar87930@gmail.com",
};

export type UnitType =
  | 'SQFT'
  | 'PCS'
  | 'PKT'
  | 'KG'
  | 'LTR'
  | 'DRUM'
  | 'SET'
  | 'SETS'
  | 'TRIP'
  | 'SHEET'
  | 'BOX'
  | 'MTR'
  | 'KGS'
  | 'NOS'
  | 'RFT'
  | 'OTH';

export interface CatalogProduct {
  id: string;
  name: string;
  hsn: string;
  unit: UnitType;
  rate: number;
  isTaxInclusive: boolean;
  taxRate: number;
  category: string;
}

export interface PlywoodPreset {
  label: string;
  lengthFt: number;
  widthFt: number;
  sqFt: number;
}

export const PLYWOOD_PRESETS: PlywoodPreset[] = [
  { label: '8 × 4 (32 sq.ft)', lengthFt: 8, widthFt: 4, sqFt: 32 },
  { label: '7 × 4 (28 sq.ft)', lengthFt: 7, widthFt: 4, sqFt: 28 },
  { label: '6 × 4 (24 sq.ft)', lengthFt: 6, widthFt: 4, sqFt: 24 },
  { label: '7 × 3 (21 sq.ft)', lengthFt: 7, widthFt: 3, sqFt: 21 },
  { label: '6 × 3 (18 sq.ft)', lengthFt: 6, widthFt: 3, sqFt: 18 },
  { label: '8 × 3 (24 sq.ft)', lengthFt: 8, widthFt: 3, sqFt: 24 },
];

export interface HSNPreset {
  code: string;
  category: string;
  description: string;
  defaultTaxRate: number;
  defaultUnit: UnitType;
  isPlywood: boolean;
}

export const HSN_PRESETS: HSNPreset[] = [
  {
    code: '44092990',
    category: 'Imported Timber',
    description: 'Imported Timber / Thermo Pine',
    defaultTaxRate: 18,
    defaultUnit: 'SQFT',
    isPlywood: true,
  },
  {
    code: '4412',
    category: 'Plywood & Blockboard',
    description: 'Plywood / Blockboard / Flush Core (Commercial/Marine)',
    defaultTaxRate: 18,
    defaultUnit: 'SQFT',
    isPlywood: true,
  },
  {
    code: '4408',
    category: 'Veneer Sheets',
    description: 'Veneer Sheets / Wood Veneers',
    defaultTaxRate: 18,
    defaultUnit: 'SQFT',
    isPlywood: true,
  },
  {
    code: '4418',
    category: 'Flush Doors',
    description: 'Flush Doors / Builders\' Joinery & Carpentry',
    defaultTaxRate: 18,
    defaultUnit: 'SQFT',
    isPlywood: true,
  },
  {
    code: '4411',
    category: 'MDF & HDF Board',
    description: 'MDF / HDF Fiberboard / Pre-laminated Boards',
    defaultTaxRate: 18,
    defaultUnit: 'SQFT',
    isPlywood: true,
  },
  {
    code: '4410',
    category: 'Particle Board',
    description: 'Particle Board / Bagasse Board',
    defaultTaxRate: 18,
    defaultUnit: 'SQFT',
    isPlywood: true,
  },
  {
    code: '8302',
    category: 'Hardware & Fittings',
    description: 'Hinges, Hardware, Fittings, Door Closers',
    defaultTaxRate: 18,
    defaultUnit: 'PCS',
    isPlywood: false,
  },
  {
    code: '7318',
    category: 'Screws & Fasteners',
    description: 'Screws, Bolts, Nuts',
    defaultTaxRate: 18,
    defaultUnit: 'PKT',
    isPlywood: false,
  },
  {
    code: '7317',
    category: 'Nails & Pins',
    description: 'Nails, Pins, Wire Nails',
    defaultTaxRate: 18,
    defaultUnit: 'KG',
    isPlywood: false,
  },
  {
    code: '3506',
    category: 'Adhesives',
    description: 'Adhesives, Fevicol Marine, Hetax',
    defaultTaxRate: 18,
    defaultUnit: 'KG',
    isPlywood: false,
  },
  {
    code: '4823',
    category: 'Decorative Laminates (Sunmica)',
    description: 'Sunmica / Decorative Laminates',
    defaultTaxRate: 18,
    defaultUnit: 'SHEET',
    isPlywood: true,
  },
  {
    code: '3920',
    category: 'PVC Tape / Plastic Films',
    description: 'PVC Tape / Plastic Films',
    defaultTaxRate: 18,
    defaultUnit: 'MTR',
    isPlywood: false,
  },
  {
    code: '3926',
    category: 'PVC Gitti / Plastic Articles',
    description: 'PVC Gitti / Plastic Articles',
    defaultTaxRate: 18,
    defaultUnit: 'PKT',
    isPlywood: false,
  },
  {
    code: '3919',
    category: 'Masking Tape / Tapes',
    description: 'Masking Tape / Self-Adhesive Tapes',
    defaultTaxRate: 18,
    defaultUnit: 'PCS',
    isPlywood: false,
  },
  {
    code: '996511',
    category: 'Transportation Services',
    description: 'Freight / Cartage / Transportation Services',
    defaultTaxRate: 18,
    defaultUnit: 'TRIP',
    isPlywood: false,
  },
];

export interface InvoiceItem {
  id: string;
  description: string;
  hsn: string;
  // Plywood Dimension Calculator fields
  isPlywood: boolean;
  lengthFt?: number;
  widthFt?: number;
  sheets?: number;
  sqFtPerSheet?: number;
  totalSqFt?: number;
  // Standard Quantity fields
  quantity: number;
  unit: UnitType;
  // Rates & Taxes
  rate: number; // Taxable rate per unit
  rateInclusive?: number; // Rate inclusive of tax
  isTaxInclusive: boolean;
  taxRate: number; // 5, 12, 18, 28
  // Computed values
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
}

export interface PartyDetails {
  name: string;
  address: string;
  gstin: string;
  state: string;
  stateCode: string;
  phone?: string;
}

export interface TransportDetails {
  deliveryNote: string;
  paymentMode: string;
  referenceNo: string;
  referenceDate: string;
  otherReferences?: string;
  buyersOrderNo?: string;
  buyersOrderDate?: string;
  dispatchDocNo: string;
  deliveryNoteDate?: string;
  dispatchedThrough: string;
  destination: string;
  vehicleNo: string;
}

export interface BankDetails {
  bankName: string;
  accountNo: string;
  branch: string;
  ifsc: string;
  upiId: string;
  accountHolder: string;
}

export const DEFAULT_BANK_DETAILS: BankDetails = {
  bankName: "Himachal Pradesh Gramin Bank",
  accountNo: "886721000000390",
  branch: "Badehar (Distt. Una, HP)",
  ifsc: "PUNB0HPGB04",
  upiId: "",
  accountHolder: "M/s VASHISHT PLY HOUSE PROP ROHIT KUMAR",
};

export interface HSNSummaryRow {
  hsn: string;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  transport: TransportDetails;
  buyer: PartyDetails;
  consignee: PartyDetails & { sameAsBuyer: boolean };
  items: InvoiceItem[];
  subtotalTaxable: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  totalQuantity: number;
  amountInWords: string;
  taxInWords: string;
  bankDetails: BankDetails;
  notes: string;
  terms: string[];
  status: 'PAID' | 'UNPAID' | 'PARTIAL';
  createdAt: number;
  updatedAt: number;
}

export interface IndianState {
  code: string;
  name: string;
}

export const INDIAN_STATES: IndianState[] = [
  { code: '01', name: 'Jammu and Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman and Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh' },
  { code: '97', name: 'Other Territory' },
];
