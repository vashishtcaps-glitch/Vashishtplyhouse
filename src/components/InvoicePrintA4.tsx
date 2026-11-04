import React from 'react';
import { Invoice, VASHISHT_FIRM_PROFILE, HSNSummaryRow } from '../types/invoice';
import { formatINR } from '../utils/calculations';
import { VashishtLogo } from './VashishtLogo';

interface InvoicePrintA4Props {
  invoice: Invoice;
  hsnSummary: HSNSummaryRow[];
}

export const InvoicePrintA4: React.FC<InvoicePrintA4Props> = ({ invoice, hsnSummary }) => {
  const isIntraState = invoice.buyer.stateCode === VASHISHT_FIRM_PROFILE.stateCode;

  // Use verified Himachal Pradesh Gramin Bank details
  const bankName = invoice.bankDetails?.bankName || 'Himachal Pradesh Gramin Bank';
  const accountHolder = invoice.bankDetails?.accountHolder || 'M/s VASHISHT PLY HOUSE PROP ROHIT KUMAR';
  const accountNo = invoice.bankDetails?.accountNo || '886721000000390';
  const ifsc = invoice.bankDetails?.ifsc || 'PUNB0HPGB04';
  const branch = invoice.bankDetails?.branch || 'Badehar (Distt. Una, HP)';

  // Verified 2-line standard terms
  const terms = (invoice.terms && invoice.terms.length > 0)
    ? invoice.terms.slice(0, 2)
    : [
        'Goods once sold will not be taken back.',
        'Subject to Una (H.P.) jurisdiction only.',
      ];

  return (
    <div
      id="printable-invoice"
      className="bg-white text-black font-sans text-[11px] leading-tight select-text"
      style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '0',
        boxSizing: 'border-box',
        border: '1px solid #000000',
      }}
    >
      {/* Top Banner / Document Title */}
      <div className="border-b border-black text-center py-1 bg-neutral-100 flex items-center justify-between px-3">
        <span className="text-[10px] font-semibold tracking-wider">GST TAX INVOICE (ORIGINAL FOR RECIPIENT)</span>
        <span className="text-[10px] font-bold tracking-widest uppercase">TAX INVOICE</span>
        <span className="text-[9px] text-neutral-600">STATE CODE: 02</span>
      </div>

      {/* Header Section: 2-Column Grid */}
      <div className="grid grid-cols-12 border-b border-black">
        {/* Left Column: Seller Details (7 cols) */}
        <div className="col-span-7 border-r border-black p-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <VashishtLogo size={42} variant="color" />
              <div>
                <h1 className="text-[16px] font-black tracking-tight text-black leading-none uppercase">
                  {VASHISHT_FIRM_PROFILE.firmName}
                </h1>
                <p className="text-[9.5px] font-semibold text-neutral-800 tracking-wide mt-0.5">
                  Timber · Plywood · Flush Doors · Sunmica · Hardware
                </p>
              </div>
            </div>

            <div className="space-y-0.5 text-[10px] text-neutral-900 pr-1">
              <p>
                <span className="font-semibold">Address: </span>
                {VASHISHT_FIRM_PROFILE.address}
              </p>
              <p className="flex items-center gap-3">
                <span>
                  <span className="font-semibold">GSTIN/UIN: </span>
                  <span className="font-mono font-bold tracking-wider">{VASHISHT_FIRM_PROFILE.gstin}</span>
                </span>
                <span>
                  <span className="font-semibold">PAN: </span>
                  <span className="font-mono">{VASHISHT_FIRM_PROFILE.pan}</span>
                </span>
              </p>
              <p>
                <span className="font-semibold">State Name: </span>
                {VASHISHT_FIRM_PROFILE.state}, <span className="font-semibold">Code: </span>
                <span className="font-mono">{VASHISHT_FIRM_PROFILE.stateCode}</span>
              </p>
              <p>
                <span className="font-semibold">Contact: </span>
                {VASHISHT_FIRM_PROFILE.phones.join(', ')}
              </p>
              <p>
                <span className="font-semibold">Email: </span>
                <span className="font-mono">{VASHISHT_FIRM_PROFILE.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Invoice Metadata Grid (5 cols) */}
        <div className="col-span-5 text-[10px]">
          <div className="grid grid-cols-2 border-b border-black">
            <div className="p-1.5 border-r border-black">
              <div className="text-[8.5px] font-semibold text-neutral-600 uppercase">Invoice No.</div>
              <div className="font-bold text-[12px] font-mono">{invoice.invoiceNo}</div>
            </div>
            <div className="p-1.5">
              <div className="text-[8.5px] font-semibold text-neutral-600 uppercase">Dated</div>
              <div className="font-bold text-[11px] font-mono">{invoice.invoiceDate}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-black">
            <div className="p-1.5 border-r border-black">
              <div className="text-[8.5px] font-semibold text-neutral-600 uppercase">Delivery Note</div>
              <div className="font-mono">{invoice.transport?.deliveryNote || '—'}</div>
            </div>
            <div className="p-1.5">
              <div className="text-[8.5px] font-semibold text-neutral-600 uppercase">Mode/Terms of Payment</div>
              <div className="font-semibold">{invoice.transport?.paymentMode || '—'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-black">
            <div className="p-1.5 border-r border-black">
              <div className="text-[8.5px] font-semibold text-neutral-600 uppercase">Reference No. & Date</div>
              <div className="font-mono">
                {invoice.transport?.referenceNo
                  ? `${invoice.transport.referenceNo}${invoice.transport.referenceDate ? ` (${invoice.transport.referenceDate})` : ''}`
                  : '—'}
              </div>
            </div>
            <div className="p-1.5">
              <div className="text-[8.5px] font-semibold text-neutral-600 uppercase">Other References</div>
              <div>{invoice.transport?.otherReferences || '—'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-black">
            <div className="p-1.5 border-r border-black">
              <div className="text-[8.5px] font-semibold text-neutral-600 uppercase">Buyer's Order No.</div>
              <div className="font-mono">{invoice.transport?.buyersOrderNo || '—'}</div>
            </div>
            <div className="p-1.5">
              <div className="text-[8.5px] font-semibold text-neutral-600 uppercase">Dated</div>
              <div className="font-mono">{invoice.transport?.buyersOrderDate || '—'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-black">
            <div className="p-1.5 border-r border-black">
              <div className="text-[8.5px] font-semibold text-neutral-600 uppercase">Dispatch Doc No.</div>
              <div className="font-mono">{invoice.transport?.dispatchDocNo || '—'}</div>
            </div>
            <div className="p-1.5">
              <div className="text-[8.5px] font-semibold text-neutral-600 uppercase">Delivery Note Date</div>
              <div className="font-mono">{invoice.transport?.deliveryNoteDate || '—'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="p-1.5 border-r border-black">
              <div className="text-[8.5px] font-semibold text-neutral-600 uppercase">Dispatched through</div>
              <div>{invoice.transport?.dispatchedThrough || '—'}</div>
            </div>
            <div className="p-1.5">
              <div className="text-[8.5px] font-semibold text-neutral-600 uppercase">Destination & Vehicle No.</div>
              <div className="font-mono font-semibold">
                {invoice.transport?.destination || invoice.transport?.vehicleNo
                  ? `${invoice.transport?.destination || '—'}${invoice.transport?.vehicleNo ? ` / ${invoice.transport.vehicleNo}` : ''}`
                  : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buyer & Consignee Details (2-Column Grid) */}
      <div className="grid grid-cols-2 border-b border-black">
        {/* Consignee (Ship to) */}
        <div className="p-2 border-r border-black">
          <div className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-0.5">
            Consignee (Ship to)
          </div>
          <div className="font-bold text-[11.5px]">{invoice.consignee?.name || invoice.buyer?.name || 'Counter Customer'}</div>
          <div className="text-[10px] text-neutral-800 leading-snug whitespace-pre-line mt-0.5">
            {invoice.consignee?.address || invoice.buyer?.address || 'Una, Himachal Pradesh'}
          </div>
          <div className="mt-1 text-[10px] flex items-center gap-3">
            <span>
              <span className="font-semibold">GSTIN/UIN: </span>
              <span className="font-mono font-semibold">{invoice.consignee?.gstin || invoice.buyer?.gstin || 'Unregistered / B2C'}</span>
            </span>
          </div>
          <div className="text-[10px]">
            <span className="font-semibold">State Name: </span>
            {invoice.consignee?.state || invoice.buyer?.state || 'Himachal Pradesh'}, <span className="font-semibold">Code: </span>
            <span className="font-mono">{invoice.consignee?.stateCode || invoice.buyer?.stateCode || '02'}</span>
          </div>
        </div>

        {/* Buyer (Bill to) */}
        <div className="p-2">
          <div className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-0.5">
            Buyer (Bill to)
          </div>
          <div className="font-bold text-[11.5px]">{invoice.buyer?.name || 'Counter Customer'}</div>
          <div className="text-[10px] text-neutral-800 leading-snug whitespace-pre-line mt-0.5">
            {invoice.buyer?.address || 'Una, Himachal Pradesh'}
          </div>
          <div className="mt-1 text-[10px] flex items-center gap-3">
            <span>
              <span className="font-semibold">GSTIN/UIN: </span>
              <span className="font-mono font-semibold">{invoice.buyer?.gstin || 'Unregistered / B2C'}</span>
            </span>
          </div>
          <div className="text-[10px]">
            <span className="font-semibold">State Name: </span>
            {invoice.buyer?.state || 'Himachal Pradesh'}, <span className="font-semibold">Code: </span>
            <span className="font-mono">{invoice.buyer?.stateCode || '02'}</span>
          </div>
        </div>
      </div>

      {/* Itemized Table (Exact Columns) */}
      <table className="w-full border-collapse border-b border-black text-[10px]">
        <thead>
          <tr className="border-b border-black bg-neutral-100 text-center font-bold">
            <th className="border-r border-black py-1 px-1 w-[35px]">Sl No.</th>
            <th className="border-r border-black py-1 px-2 text-left">Description of Goods</th>
            <th className="border-r border-black py-1 px-1 w-[60px]">HSN/SAC</th>
            <th className="border-r border-black py-1 px-1 w-[70px]">Quantity</th>
            <th className="border-r border-black py-1 px-1 w-[80px]">Rate (Incl. Tax)</th>
            <th className="border-r border-black py-1 px-1 w-[70px]">Rate</th>
            <th className="border-r border-black py-1 px-1 w-[45px]">per</th>
            <th className="py-1 px-2 text-right w-[95px]">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={item.id} className="align-top border-b border-neutral-300">
              <td className="border-r border-black py-1.5 px-1 text-center font-mono">{idx + 1}</td>
              <td className="border-r border-black py-1.5 px-2">
                <div className="font-bold text-[10.5px] leading-tight text-black">{item.description}</div>
                {item.isPlywood && item.lengthFt && item.widthFt ? (
                  <div className="text-[9px] text-neutral-700 font-mono mt-0.5">
                    Size: {item.lengthFt}ft × {item.widthFt}ft ({item.sqFtPerSheet} sq.ft)
                    {item.sheets ? ` · Sheets: ${item.sheets} pcs` : ''}
                    {item.totalSqFt ? ` · Total Area: ${item.totalSqFt} sq.ft` : ''}
                  </div>
                ) : null}
              </td>
              <td className="border-r border-black py-1.5 px-1 text-center font-mono">{item.hsn}</td>
              <td className="border-r border-black py-1.5 px-1 text-right font-mono font-semibold">
                {item.quantity.toLocaleString('en-IN')} {item.unit}
              </td>
              <td className="border-r border-black py-1.5 px-1 text-right font-mono">
                {formatINR(item.rateInclusive || item.rate)}
              </td>
              <td className="border-r border-black py-1.5 px-1 text-right font-mono">{formatINR(item.rate)}</td>
              <td className="border-r border-black py-1.5 px-1 text-center font-semibold text-[9.5px]">
                {item.unit}
              </td>
              <td className="py-1.5 px-2 text-right font-mono font-bold">{formatINR(item.taxableAmount)}</td>
            </tr>
          ))}

          {/* Fill empty visual space to maintain balanced A4 height */}
          {Array.from({ length: Math.max(0, 7 - invoice.items.length) }).map((_, i) => (
            <tr key={`empty_${i}`} className="h-6">
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals & Tax Calculation Breakdown */}
      <div className="grid grid-cols-12 border-b border-black">
        {/* Left Side: Amount in Words & Notes (7 cols) */}
        <div className="col-span-7 border-r border-black p-2 flex flex-col justify-between">
          <div>
            <div className="text-[9px] font-semibold text-neutral-600 uppercase">Amount Chargeable (in words):</div>
            <div className="font-bold text-[11px] leading-snug mt-0.5 text-black">{invoice.amountInWords}</div>
          </div>
          {invoice.notes && (
            <div className="mt-2 text-[9.5px] text-neutral-700 italic border-t border-neutral-300 pt-1">
              <span className="font-semibold not-italic">Note: </span>
              {invoice.notes}
            </div>
          )}
        </div>

        {/* Right Side: Exact Subtotals & Tax Lines (5 cols) */}
        <div className="col-span-5 text-[10px]">
          {/* Subtotal (Taxable Value) */}
          <div className="flex justify-between items-center px-2 py-1 border-b border-neutral-300">
            <span className="font-semibold">Subtotal (Taxable Value):</span>
            <span className="font-mono font-bold">₹ {formatINR(invoice.subtotalTaxable)}</span>
          </div>

          {/* Dynamic GST rows */}
          {isIntraState ? (
            <>
              <div className="flex justify-between items-center px-2 py-1 border-b border-neutral-300">
                <span>Output CGST:</span>
                <span className="font-mono font-semibold">₹ {formatINR(invoice.cgstTotal)}</span>
              </div>
              <div className="flex justify-between items-center px-2 py-1 border-b border-neutral-300">
                <span>Output SGST:</span>
                <span className="font-mono font-semibold">₹ {formatINR(invoice.sgstTotal)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center px-2 py-1 border-b border-neutral-300">
              <span>Output IGST A/C:</span>
              <span className="font-mono font-semibold">₹ {formatINR(invoice.igstTotal)}</span>
            </div>
          )}

          {/* ROUND OFF */}
          <div className="flex justify-between items-center px-2 py-1 border-b border-neutral-300 text-neutral-700">
            <span>ROUND OFF:</span>
            <span className="font-mono">
              {invoice.roundOff >= 0 ? `(+) ₹ ${invoice.roundOff.toFixed(2)}` : `(-) ₹ ${Math.abs(invoice.roundOff).toFixed(2)}`}
            </span>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-center px-2 py-1.5 bg-neutral-100 font-bold text-[12px]">
            <span className="uppercase">Grand Total:</span>
            <span className="font-mono text-[13px]">₹ {formatINR(invoice.grandTotal)}</span>
          </div>

          {/* Total quantity summary */}
          <div className="flex justify-between items-center px-2 py-0.5 text-[9px] text-neutral-600 bg-neutral-50">
            <span>Total Units / Quantity:</span>
            <span className="font-mono font-semibold">{invoice.totalQuantity.toLocaleString('en-IN')} Units</span>
          </div>
        </div>
      </div>

      {/* Tax Analysis Breakdown Table (HSN / SAC Summary) */}
      <div className="border-b border-black p-2 avoid-break">
        <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
          Tax Analysis / HSN/SAC Breakdown
        </div>
        <table className="w-full border-collapse border border-black text-[9.5px]">
          <thead>
            <tr className="bg-neutral-100 border-b border-black font-bold text-center">
              <th className="border-r border-black p-1 w-[70px]">HSN/SAC</th>
              <th className="border-r border-black p-1 text-right">Taxable Value (₹)</th>
              {isIntraState ? (
                <>
                  <th className="border-r border-black p-1 text-right w-[60px]">Central Tax Rate</th>
                  <th className="border-r border-black p-1 text-right w-[80px]">Central Tax (₹)</th>
                  <th className="border-r border-black p-1 text-right w-[60px]">State Tax Rate</th>
                  <th className="border-r border-black p-1 text-right w-[80px]">State Tax (₹)</th>
                </>
              ) : (
                <>
                  <th className="border-r border-black p-1 text-right w-[80px]">Integrated Tax Rate</th>
                  <th className="border-r border-black p-1 text-right w-[110px]">Integrated Tax (₹)</th>
                </>
              )}
              <th className="p-1 text-right w-[95px]">Total Tax Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {hsnSummary.map(row => (
              <tr key={row.hsn} className="border-b border-neutral-300 font-mono">
                <td className="border-r border-black p-1 text-center font-bold">{row.hsn}</td>
                <td className="border-r border-black p-1 text-right">{formatINR(row.taxableValue)}</td>
                {isIntraState ? (
                  <>
                    <td className="border-r border-black p-1 text-right">{row.cgstRate}%</td>
                    <td className="border-r border-black p-1 text-right">{formatINR(row.cgstAmount)}</td>
                    <td className="border-r border-black p-1 text-right">{row.sgstRate}%</td>
                    <td className="border-r border-black p-1 text-right">{formatINR(row.sgstAmount)}</td>
                  </>
                ) : (
                  <>
                    <td className="border-r border-black p-1 text-right">{row.igstRate}%</td>
                    <td className="border-r border-black p-1 text-right">{formatINR(row.igstAmount)}</td>
                  </>
                )}
                <td className="p-1 text-right font-bold">{formatINR(row.totalTax)}</td>
              </tr>
            ))}
            <tr className="bg-neutral-100 font-bold font-mono">
              <td className="border-r border-black p-1 text-center">Total</td>
              <td className="border-r border-black p-1 text-right">{formatINR(invoice.subtotalTaxable)}</td>
              {isIntraState ? (
                <>
                  <td className="border-r border-black p-1 text-center">—</td>
                  <td className="border-r border-black p-1 text-right">{formatINR(invoice.cgstTotal)}</td>
                  <td className="border-r border-black p-1 text-center">—</td>
                  <td className="border-r border-black p-1 text-right">{formatINR(invoice.sgstTotal)}</td>
                </>
              ) : (
                <>
                  <td className="border-r border-black p-1 text-center">—</td>
                  <td className="border-r border-black p-1 text-right">{formatINR(invoice.igstTotal)}</td>
                </>
              )}
              <td className="p-1 text-right">{formatINR(invoice.totalTax)}</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-1 text-[9.5px]">
          <span className="font-semibold text-neutral-700">Tax Amount (in words): </span>
          <span className="font-bold text-black">{invoice.taxInWords}</span>
        </div>
      </div>

      {/* Bottom Section: Bank Details, Terms & Signatory (Decluttered, Spacious & No Dummy QR) */}
      <div className="grid grid-cols-12 avoid-break">
        {/* Bank Details Section (5 cols) - Spacious & Verified */}
        <div className="col-span-5 border-r border-black p-3 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-black border-b border-black pb-1 mb-2">
              Company's Bank Details
            </div>
            <div className="space-y-1.5 text-[10px] leading-relaxed text-black">
              <div>
                <span className="font-bold">A/C Name: </span>
                <span className="font-semibold uppercase">{accountHolder}</span>
              </div>
              <div>
                <span className="font-bold">Bank Name: </span>
                <span>{bankName}</span>
              </div>
              <div>
                <span className="font-bold">A/C No.: </span>
                <span className="font-mono font-bold tracking-wider text-[11px]">{accountNo}</span>
              </div>
              <div>
                <span className="font-bold">IFSC Code: </span>
                <span className="font-mono font-bold tracking-wider">{ifsc}</span>
              </div>
              <div>
                <span className="font-bold">Branch: </span>
                <span>{branch}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Declaration & Simplified Terms (4 cols) */}
        <div className="col-span-4 border-r border-black p-3 flex flex-col justify-between text-[9.5px]">
          <div>
            <div className="font-bold uppercase tracking-wider text-black border-b border-black pb-1 mb-1.5">
              Declaration
            </div>
            <p className="leading-snug text-neutral-800 text-[9.5px]">
              We declare that this invoice shows the actual price of the goods described and that all particulars
              are true and correct.
            </p>

            <div className="mt-3 font-bold uppercase tracking-wider text-black border-b border-neutral-300 pb-1 mb-1.5">
              Terms & Conditions
            </div>
            <ul className="list-disc list-inside space-y-1 text-[9.5px] text-neutral-800 leading-snug">
              {terms.map((t, idx) => (
                <li key={idx} className="font-medium">{t}</li>
              ))}
            </ul>
          </div>
          <div className="mt-3 text-[8.5px] text-neutral-500 italic">E. & O.E.</div>
        </div>

        {/* Authorized Signatory Box (3 cols) - Balanced & Clear */}
        <div className="col-span-3 p-3 flex flex-col justify-between text-right">
          <div>
            <div className="text-[10px] font-bold leading-tight">
              for <span className="uppercase">{VASHISHT_FIRM_PROFILE.firmName}</span>
            </div>
            <div className="text-[9px] text-neutral-700 mt-0.5">PROPRIETOR: {VASHISHT_FIRM_PROFILE.proprietor}</div>
          </div>

          <div className="my-4 flex justify-center">
            {/* Rubber Stamp Box Placeholder */}
            <div className="w-28 h-12 border border-dashed border-neutral-400 rounded flex flex-col items-center justify-center text-[8px] text-neutral-400 uppercase tracking-widest font-mono">
              <span>[ SEAL / STAMP ]</span>
            </div>
          </div>

          <div className="border-t border-black pt-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wide">Authorised Signatory</div>
          </div>
        </div>
      </div>

      {/* Computer Generated Notice Footer */}
      <div className="border-t border-black py-1.5 px-3 text-center text-[9px] text-neutral-700 bg-neutral-100 flex justify-between items-center">
        <span>Khasra No. 1308, Hadbast No. 219, Near Railway Bridge, Badehar Upperla, Una (H.P.) - 174306</span>
        <span className="font-semibold italic">This is a Computer Generated Tax Invoice</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
};
