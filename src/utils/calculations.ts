import { InvoiceItem, HSNSummaryRow, VASHISHT_FIRM_PROFILE } from '../types/invoice';

/**
 * Calculates line item values based on dimensions, units, rates, and buyer state
 */
export function calculateItemRow(
  item: Partial<InvoiceItem>,
  buyerStateCode: string = VASHISHT_FIRM_PROFILE.stateCode
): InvoiceItem {
  const isPlywood = !!item.isPlywood;
  const lengthFt = Number(item.lengthFt) || 0;
  const widthFt = Number(item.widthFt) || 0;
  const sheets = Number(item.sheets) || 0;
  const sqFtPerSheet = isPlywood && lengthFt > 0 && widthFt > 0 ? lengthFt * widthFt : 0;
  const totalSqFt = isPlywood ? sqFtPerSheet * sheets : 0;

  // Determine effective quantity
  let quantity = Number(item.quantity) || 0;
  const unit = item.unit || 'SQFT';

  if (isPlywood) {
    if (unit === 'SQFT') {
      quantity = totalSqFt > 0 ? totalSqFt : quantity;
    } else if (unit === 'PCS' || unit === 'NOS') {
      quantity = sheets > 0 ? sheets : quantity;
    }
  }

  const taxRate = Number(item.taxRate) || 18;
  const isTaxInclusive = !!item.isTaxInclusive;
  let rate = Number(item.rate) || 0;
  let rateInclusive = Number(item.rateInclusive) || 0;

  if (isTaxInclusive) {
    // Rate is entered inclusive of tax -> back-calculate taxable rate
    if (rateInclusive > 0) {
      rate = Number((rateInclusive / (1 + taxRate / 100)).toFixed(2));
    } else if (rate > 0) {
      rateInclusive = Number((rate * (1 + taxRate / 100)).toFixed(2));
    }
  } else {
    // Rate is taxable -> compute inclusive rate
    rateInclusive = Number((rate * (1 + taxRate / 100)).toFixed(2));
  }

  const taxableAmount = Number((quantity * rate).toFixed(2));

  // Smart GST State Logic:
  // Seller State = "02" (Himachal Pradesh)
  // Intra-state (02) -> CGST (taxRate/2) + SGST (taxRate/2)
  // Inter-state (!= 02) -> IGST (taxRate)
  const isIntraState = (buyerStateCode || '').trim() === VASHISHT_FIRM_PROFILE.stateCode;

  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;

  if (isIntraState) {
    cgstRate = taxRate / 2;
    sgstRate = taxRate / 2;
    cgstAmount = Number(((taxableAmount * cgstRate) / 100).toFixed(2));
    sgstAmount = Number(((taxableAmount * sgstRate) / 100).toFixed(2));
  } else {
    igstRate = taxRate;
    igstAmount = Number(((taxableAmount * igstRate) / 100).toFixed(2));
  }

  const totalAmount = Number((taxableAmount + cgstAmount + sgstAmount + igstAmount).toFixed(2));

  return {
    id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    description: item.description || '',
    hsn: item.hsn || '4412',
    isPlywood,
    lengthFt: isPlywood ? lengthFt : undefined,
    widthFt: isPlywood ? widthFt : undefined,
    sheets: isPlywood ? sheets : undefined,
    sqFtPerSheet: isPlywood ? sqFtPerSheet : undefined,
    totalSqFt: isPlywood ? totalSqFt : undefined,
    quantity,
    unit,
    rate,
    rateInclusive,
    isTaxInclusive,
    taxRate,
    taxableAmount,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    totalAmount,
  };
}

/**
 * Recalculates full invoice totals, taxes, round-off, and HSN analysis
 */
export function calculateInvoiceTotals(items: InvoiceItem[], buyerStateCode: string = VASHISHT_FIRM_PROFILE.stateCode) {
  let subtotalTaxable = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;
  let totalQuantity = 0;

  const recalculatedItems = items.map(item => {
    const calc = calculateItemRow(item, buyerStateCode);
    subtotalTaxable += calc.taxableAmount;
    cgstTotal += calc.cgstAmount;
    sgstTotal += calc.sgstAmount;
    igstTotal += calc.igstAmount;
    totalQuantity += calc.quantity;
    return calc;
  });

  subtotalTaxable = Number(subtotalTaxable.toFixed(2));
  cgstTotal = Number(cgstTotal.toFixed(2));
  sgstTotal = Number(sgstTotal.toFixed(2));
  igstTotal = Number(igstTotal.toFixed(2));
  const totalTax = Number((cgstTotal + sgstTotal + igstTotal).toFixed(2));

  const exactGrandTotal = subtotalTaxable + totalTax;
  const grandTotal = Math.round(exactGrandTotal);
  const roundOff = Number((grandTotal - exactGrandTotal).toFixed(2));

  // Build HSN summary table
  const hsnMap: { [hsn: string]: HSNSummaryRow } = {};
  recalculatedItems.forEach(item => {
    const hsnKey = item.hsn || '4412';
    if (!hsnMap[hsnKey]) {
      hsnMap[hsnKey] = {
        hsn: hsnKey,
        taxableValue: 0,
        cgstRate: item.cgstRate,
        cgstAmount: 0,
        sgstRate: item.sgstRate,
        sgstAmount: 0,
        igstRate: item.igstRate,
        igstAmount: 0,
        totalTax: 0,
      };
    }
    hsnMap[hsnKey].taxableValue = Number((hsnMap[hsnKey].taxableValue + item.taxableAmount).toFixed(2));
    hsnMap[hsnKey].cgstAmount = Number((hsnMap[hsnKey].cgstAmount + item.cgstAmount).toFixed(2));
    hsnMap[hsnKey].sgstAmount = Number((hsnMap[hsnKey].sgstAmount + item.sgstAmount).toFixed(2));
    hsnMap[hsnKey].igstAmount = Number((hsnMap[hsnKey].igstAmount + item.igstAmount).toFixed(2));
    hsnMap[hsnKey].totalTax = Number((hsnMap[hsnKey].cgstAmount + hsnMap[hsnKey].sgstAmount + hsnMap[hsnKey].igstAmount).toFixed(2));
  });

  const hsnSummary = Object.values(hsnMap);

  return {
    items: recalculatedItems,
    subtotalTaxable,
    cgstTotal,
    sgstTotal,
    igstTotal,
    totalTax,
    roundOff,
    grandTotal,
    totalQuantity,
    hsnSummary,
  };
}

/**
 * Formats a currency amount into Indian comma representation (e.g. 1,42,850.00)
 */
export function formatINR(val: number): string {
  if (isNaN(val)) return '0.00';
  const parts = val.toFixed(2).split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return res + '.' + parts[1];
}
