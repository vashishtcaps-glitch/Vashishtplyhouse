import React, { useState, useEffect, useMemo } from 'react';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  getCatalogProducts,
  saveCatalogProduct,
  deleteCatalogProduct,
  resetCatalogToDefaults,
} from '../utils/storage';
import { CatalogProduct, UnitType, VASHISHT_FIRM_PROFILE } from '../types/invoice';
import { formatINR } from '../utils/calculations';
import {
  X,
  Save,
  RotateCcw,
  Landmark,
  Phone,
  Mail,
  MapPin,
  Package,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  Building,
} from 'lucide-react';
import { VashishtLogo } from './VashishtLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (updated: AppSettings) => void;
  onCatalogChange?: (products: CatalogProduct[]) => void;
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

const CATEGORY_OPTIONS = [
  'Fasteners & Nails',
  'Hardware & Hinges',
  'Plywood, Timber & Veneer',
  'Adhesives & Chemicals',
  'Laminates & Plastics',
  'Logistics & Services',
  'General',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onCatalogChange,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'profile'>('catalog');
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [termsText, setTermsText] = useState((settings.defaultTerms || []).join('\n'));

  // Catalog State
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New/Edit product form state
  const [productForm, setProductForm] = useState<Partial<CatalogProduct>>({
    name: '',
    hsn: '4412',
    category: 'Plywood, Timber & Veneer',
    unit: 'SQFT',
    rate: 0,
    isTaxInclusive: true,
    taxRate: 18,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(settings);
      setTermsText((settings.defaultTerms || []).join('\n'));
      const prods = getCatalogProducts();
      setProducts(prods);
    }
  }, [isOpen, settings]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.hsn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  if (!isOpen) return null;

  // Handle saving business & bank profile
  const handleSaveProfile = () => {
    const updatedTerms = termsText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const updated: AppSettings = {
      ...formData,
      defaultTerms: updatedTerms,
    };
    onSaveSettings(updated);
    onClose();
  };

  // Reset business & bank defaults
  const handleResetProfile = () => {
    if (confirm('Reset business & bank details to factory defaults?')) {
      setFormData(DEFAULT_SETTINGS);
      setTermsText(DEFAULT_SETTINGS.defaultTerms.join('\n'));
    }
  };

  // Catalog Actions
  const handleStartAdd = () => {
    setProductForm({
      name: '',
      hsn: '4412',
      category: 'Plywood, Timber & Veneer',
      unit: 'SQFT',
      rate: 0,
      isTaxInclusive: true,
      taxRate: 18,
    });
    setEditingProduct(null);
    setIsAddingNew(true);
  };

  const handleStartEdit = (prod: CatalogProduct) => {
    setProductForm({ ...prod });
    setEditingProduct(prod);
    setIsAddingNew(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name?.trim()) return;

    const toSave: CatalogProduct = {
      id: editingProduct?.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: productForm.name.trim(),
      hsn: productForm.hsn !== undefined ? productForm.hsn.trim() : '',
      category: productForm.category || 'General',
      unit: (productForm.unit as UnitType) || 'PCS',
      rate: Number(productForm.rate) || 0,
      isTaxInclusive: !!productForm.isTaxInclusive,
      taxRate: Number(productForm.taxRate) || 18,
    };

    const updated = saveCatalogProduct(toSave);
    setProducts(updated);
    if (onCatalogChange) onCatalogChange(updated);
    setIsAddingNew(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Remove "${name}" from master catalog?`)) {
      const updated = deleteCatalogProduct(id);
      setProducts(updated);
      if (onCatalogChange) onCatalogChange(updated);
    }
  };

  const handleResetCatalog = () => {
    if (confirm('Restore all 23 factory default catalog products? Any custom additions will be reset.')) {
      const updated = resetCatalogToDefaults();
      setProducts(updated);
      if (onCatalogChange) onCatalogChange(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Settings & Catalog Master</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-white/[0.06]">
                  Vashisht Ply House
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage product inventory, pricing algorithms, and statutory GST profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('catalog');
                setIsAddingNew(false);
              }}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-slate-900 text-emerald-400 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/[0.02]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Product Catalog Master</span>
              <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-slate-900 text-emerald-400 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/[0.02]'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Business & Bank Profile</span>
            </button>
          </div>

          {activeTab === 'catalog' && (
            <div className="flex items-center gap-2 pb-2">
              <button
                type="button"
                onClick={handleResetCatalog}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Reset to 23 factory defaults"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={handleStartAdd}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Product</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Product Catalog Master */}
        {activeTab === 'catalog' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Inline Add / Edit Drawer */}
            {isAddingNew && (
              <form
                onSubmit={handleSaveProduct}
                className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-3.5 shadow-lg animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span>{editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {/* Item Name */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-400 font-medium">Product / Item Name *</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. 18mm Century MR Ply 8x4 / 3 inch Screw"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:border-emerald-500 outline-none"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:border-emerald-500 outline-none"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* HSN Code */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">HSN Code</label>
                    <input
                      type="text"
                      list="hsn-list"
                      value={productForm.hsn}
                      onChange={(e) => setProductForm({ ...productForm, hsn: e.target.value })}
                      placeholder="e.g. 4412, 7318, 8302"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold focus:border-emerald-500 outline-none"
                    />
                  </div>

                  {/* Unit */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Unit</label>
                    <select
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value as UnitType })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:border-emerald-500 outline-none"
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rate */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Default Rate (₹)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={productForm.rate || ''}
                      onChange={(e) => setProductForm({ ...productForm, rate: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-semibold text-right focus:border-emerald-500 outline-none"
                    />
                  </div>

                  {/* Pricing Mode: Incl vs Excl */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Pricing Mode</label>
                    <select
                      value={productForm.isTaxInclusive ? 'incl' : 'excl'}
                      onChange={(e) =>
                        setProductForm({ ...productForm, isTaxInclusive: e.target.value === 'incl' })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-medium focus:border-emerald-500 outline-none"
                    >
                      <option value="incl">GST Inclusive (MRP)</option>
                      <option value="excl">GST Exclusive (+ GST)</option>
                    </select>
                  </div>

                  {/* GST % */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">GST Rate %</label>
                    <select
                      value={productForm.taxRate}
                      onChange={(e) => setProductForm({ ...productForm, taxRate: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono font-semibold text-center focus:border-emerald-500 outline-none"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18% (Standard)</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingProduct ? 'Update Product' : 'Add to Catalog'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Catalog Filter & Search Strip */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search item name, HSN code, or category..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500 cursor-pointer w-full sm:w-auto"
              >
                <option value="All">All Categories ({products.length})</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Catalog Products Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 font-mono text-center">HSN</th>
                    <th className="py-2.5 px-3 text-center">Unit</th>
                    <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 text-center">Mode</th>
                    <th className="py-2.5 px-3 font-mono text-center">GST %</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No catalog items found matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-200">
                          {prod.name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {prod.category}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-amber-400 font-bold text-center">
                          {prod.hsn}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-300">
                          {prod.unit}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-100 text-right">
                          ₹ {formatINR(prod.rate)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              prod.isTaxInclusive
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                            }`}
                          >
                            {prod.isTaxInclusive ? 'INCL' : 'EXCL'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-center text-slate-300">
                          {prod.taxRate}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(prod)}
                              className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Edit item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Business & Bank Profile */}
        {activeTab === 'profile' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-200">
            {/* Statutory Business Profile Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Building className="w-4 h-4" />
                  <span>Seller Business Information (Printed on A4 Invoice)</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">State Code: 02 (HP)</span>
              </div>

              {/* Company Logo Display */}
              <div className="flex items-center gap-3.5 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <div className="p-1 bg-white/5 rounded-lg border border-white/10">
                  <VashishtLogo size={44} variant="color" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <span>Official Company Logo Active</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Synchronized
                    </span>
                  </div>
                  <div className="text-[10.5px] text-slate-400 mt-0.5">
                    Rendered across the web header and official A4 Tax Invoices / PDF prints.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-medium mb-1">Trade / Firm Name</label>
                  <input
                    type="text"
                    value={formData.firmProfile?.firmName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firmProfile: { ...(formData.firmProfile || VASHISHT_FIRM_PROFILE), firmName: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:border-emerald-500 outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Proprietor Name</label>
                  <input
                    type="text"
                    value={formData.firmProfile?.proprietor || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firmProfile: { ...(formData.firmProfile || VASHISHT_FIRM_PROFILE), proprietor: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={formData.firmProfile?.gstin || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firmProfile: { ...(formData.firmProfile || VASHISHT_FIRM_PROFILE), gstin: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold focus:border-emerald-500 outline-none uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-medium mb-1">Official Address</label>
                  <textarea
                    rows={2}
                    value={formData.firmProfile?.address || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firmProfile: { ...(formData.firmProfile || VASHISHT_FIRM_PROFILE), address: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Contact Phone Numbers (Comma separated)</label>
                  <input
                    type="text"
                    value={(formData.firmProfile?.phones || []).join(', ')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firmProfile: {
                          ...(formData.firmProfile || VASHISHT_FIRM_PROFILE),
                          phones: e.target.value.split(',').map((p) => p.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Default Invoice Prefix</label>
                  <input
                    type="text"
                    value={formData.invoicePrefix}
                    onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Official Bank Account Details */}
            <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>Official Bank Account (Printed on Invoice Footer)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-medium mb-1">Account Holder / Beneficiary</label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountHolder || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, accountHolder: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-semibold focus:border-emerald-500 outline-none uppercase"
                    placeholder="M/s VASHISHT PLY HOUSE PROP ROHIT KUMAR"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankDetails.bankName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, bankName: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-semibold focus:border-emerald-500 outline-none"
                    placeholder="Himachal Pradesh Gramin Bank"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountNo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, accountNo: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono font-bold focus:border-emerald-500 outline-none"
                    placeholder="88672100000390"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.bankDetails.ifsc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, ifsc: e.target.value.toUpperCase() },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono font-bold focus:border-emerald-500 outline-none uppercase"
                    placeholder="PUNB0HPGB04"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Branch</label>
                  <input
                    type="text"
                    value={formData.bankDetails.branch}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, branch: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
                    placeholder="Badehar (Distt. Una, HP)"
                  />
                </div>
              </div>
            </div>

            {/* Default Terms & Conditions */}
            <div className="space-y-2 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <label className="block text-slate-400 font-medium text-[11px] uppercase tracking-wider">
                Terms & Conditions (1 line per term - printed on A4 invoice)
              </label>
              <textarea
                rows={2}
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 font-mono text-xs focus:border-emerald-500 outline-none"
                placeholder="Goods once sold will not be taken back.&#10;Subject to Una (H.P.) jurisdiction only."
              />
            </div>
          </div>
        )}

        {/* Modal Bottom Action Strip */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3 shrink-0">
          {activeTab === 'profile' ? (
            <>
              <button
                type="button"
                onClick={handleResetProfile}
                className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Profile Defaults</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Total Products: <strong className="text-slate-200 font-mono">{products.length} items</strong> (Instant autocomplete active)
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close Catalog
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
