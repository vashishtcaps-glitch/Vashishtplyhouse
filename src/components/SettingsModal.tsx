import React, { useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../utils/storage';
import { VASHISHT_FIRM_PROFILE } from '../types/invoice';
import { X, Save, RotateCcw, Landmark, Phone, Mail, MapPin } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (updated: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [termsText, setTermsText] = useState(settings.defaultTerms.join('\n'));

  if (!isOpen) return null;

  const handleSave = () => {
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

  const handleReset = () => {
    if (confirm('Reset bank details & configuration to verified defaults?')) {
      setFormData(DEFAULT_SETTINGS);
      setTermsText(DEFAULT_SETTINGS.defaultTerms.join('\n'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Official Bank Details & Print Settings</h2>
              <p className="text-xs text-slate-400">Configure bank credentials and standard terms printed on the A4 invoice</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-200">
          {/* Statutory Firm Info Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{VASHISHT_FIRM_PROFILE.firmName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/20">
                GST: {VASHISHT_FIRM_PROFILE.gstin}
              </span>
            </div>
            <div className="text-slate-300 text-[11px] space-y-1">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{VASHISHT_FIRM_PROFILE.address}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {VASHISHT_FIRM_PROFILE.phones.join(', ')}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {VASHISHT_FIRM_PROFILE.email}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span>Official Bank Account (Printed on Invoice)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Account Name (Beneficiary)</label>
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 outline-none"
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
                  placeholder="886721000000390"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Branch Name</label>
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono font-bold uppercase focus:border-emerald-500 outline-none"
                  placeholder="PUNB0HPGB04"
                />
              </div>
            </div>
          </div>

          {/* Invoice Number Prefix */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Invoice Numbering Prefix
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Prefix</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-emerald-500 outline-none"
                placeholder="e.g. VPH/26-27/"
              />
            </div>
          </div>

          {/* Standard Terms & Conditions (2 brief lines) */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-medium">Standard Terms & Conditions (One per line)</label>
            <textarea
              rows={3}
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 text-xs font-mono focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
