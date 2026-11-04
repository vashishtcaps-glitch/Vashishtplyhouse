import React, { useState } from 'react';
import { X, Layers, Calculator, HelpCircle } from 'lucide-react';

interface PlywoodCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCalculation?: (length: number, width: number, sheets: number, ratePerSqFt: number) => void;
}

export const PlywoodCheatSheetModal: React.FC<PlywoodCheatSheetModalProps> = ({
  isOpen,
  onClose,
  onApplyCalculation,
}) => {
  const [calcLength, setCalcLength] = useState(8);
  const [calcWidth, setCalcWidth] = useState(4);
  const [calcSheets, setCalcSheets] = useState(10);
  const [ratePerSqFt, setRatePerSqFt] = useState(95);

  if (!isOpen) return null;

  const sqFtPerSheet = calcLength * calcWidth;
  const totalSqFt = sqFtPerSheet * calcSheets;
  const costPerSheet = sqFtPerSheet * ratePerSqFt;
  const totalCost = totalSqFt * ratePerSqFt;

  const standardSizes = [
    { size: '8 ft × 4 ft', area: '32 sq.ft', use: 'Standard Commercial & Marine Plywood, Sunmica, MDF' },
    { size: '7 ft × 4 ft', area: '28 sq.ft', use: 'Medium Height Wardrobe Shutters, Paneling' },
    { size: '6 ft × 4 ft', area: '24 sq.ft', use: 'Compact Furniture, Box Liners, Kitchen Under-counter' },
    { size: '7 ft × 3 ft', area: '21 sq.ft', use: 'Standard Room Flush Doors, Bathroom Doors' },
    { size: '6 ft × 3 ft', area: '18 sq.ft', use: 'Small Flush Doors, Window Pelmets, Duct Covers' },
    { size: '8 ft × 3 ft', area: '24 sq.ft', use: 'Tall Narrow Flush Doors, Column Boxing' },
  ];

  const standardThicknesses = [
    { mm: '4 mm / 6 mm', ply: '3-Ply', use: 'Plywood backing, wardrobe rear panels, drawer bottoms' },
    { mm: '9 mm', ply: '5-Ply', use: 'Light shelves, partition backing, wall paneling' },
    { mm: '12 mm', ply: '7-Ply', use: 'Drawer sides, bed storage boxes, moderate shelves' },
    { mm: '16 mm / 19 mm', ply: '9/11-Ply', use: 'Primary cabinet carcase, wardrobe doors, bed frames' },
    { mm: '25 mm', ply: 'Blockboard', use: 'Heavy book racks, long unsupported shelving, flush doors' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">Plywood Trade Reference & Area Math</h2>
              <p className="text-xs text-slate-400">Standard sheet dimensions, commercial formulas, and conversion charts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Interactive Converter */}
          <div className="bg-slate-950/80 border border-amber-900/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
              <Calculator className="w-4 h-4" />
              <span>Instant Counter Calculator</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Length (ft)</label>
                <input
                  type="number"
                  value={calcLength}
                  onChange={(e) => setCalcLength(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Width (ft)</label>
                <input
                  type="number"
                  value={calcWidth}
                  onChange={(e) => setCalcWidth(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Sheets Count</label>
                <input
                  type="number"
                  value={calcSheets}
                  onChange={(e) => setCalcSheets(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Rate / Sq.Ft (₹)</label>
                <input
                  type="number"
                  value={ratePerSqFt}
                  onChange={(e) => setRatePerSqFt(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono text-center font-bold"
                />
              </div>
            </div>

            {/* Result Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center font-mono">
              <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Sq.Ft / Sheet</div>
                <div className="font-bold text-slate-100 text-sm">{sqFtPerSheet} sq.ft</div>
              </div>
              <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Total Area</div>
                <div className="font-bold text-amber-400 text-sm">{totalSqFt} sq.ft</div>
              </div>
              <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Cost / Sheet</div>
                <div className="font-bold text-slate-100 text-sm">₹ {costPerSheet.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">Total Value</div>
                <div className="font-bold text-emerald-400 text-sm">₹ {totalCost.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          {/* Standard Dimensions Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 uppercase tracking-wide text-[11px]">
              Standard Timber & Plywood Dimensions
            </h3>
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-950 font-semibold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Size (Feet)</th>
                    <th className="py-2 px-3">Area per Sheet</th>
                    <th className="py-2 px-3">Primary Application</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {standardSizes.map((row) => (
                    <tr key={row.size} className="hover:bg-slate-800/40 font-mono">
                      <td className="py-2 px-3 font-bold text-amber-300">{row.size}</td>
                      <td className="py-2 px-3 text-slate-200">{row.area}</td>
                      <td className="py-2 px-3 font-sans text-slate-400">{row.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Thickness & Ply Count Guide */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 uppercase tracking-wide text-[11px]">
              Thickness & Layer Standards (IS:303 / IS:710)
            </h3>
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-950 font-semibold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Thickness</th>
                    <th className="py-2 px-3">Layer Construction</th>
                    <th className="py-2 px-3">Recommended Use</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {standardThicknesses.map((row) => (
                    <tr key={row.mm} className="hover:bg-slate-800/40 font-mono">
                      <td className="py-2 px-3 font-bold text-slate-100">{row.mm}</td>
                      <td className="py-2 px-3 text-slate-400">{row.ply}</td>
                      <td className="py-2 px-3 font-sans text-slate-300">{row.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">
            Formula: Length (ft) × Width (ft) × Sheets Count = Total Square Feet
          </span>
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
