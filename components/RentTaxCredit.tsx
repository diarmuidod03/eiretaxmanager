'use client';

import { useState } from 'react';
import { useAppStore, RentTaxCredit } from '@/lib/store';
import { calculateRentTaxCredit } from '@/lib/taxCalculations';
import { Euro, Save, AlertCircle } from 'lucide-react';

export default function RentTaxCreditComponent() {
  const { userProfile, rentTaxCredit, setRentTaxCredit, calculateEstimatedRefund } = useAppStore();
  const [formData, setFormData] = useState<RentTaxCredit>({
    totalRent: rentTaxCredit?.totalRent || 0,
    landlordName: rentTaxCredit?.landlordName || '',
    rtbNumber: rentTaxCredit?.rtbNumber || null,
    isParentPayingForChild: rentTaxCredit?.isParentPayingForChild || false,
  });

  const handleSave = () => {
    setRentTaxCredit(formData);
    calculateEstimatedRefund();
    alert('Rent tax credit saved!');
  };

  const isMarried = userProfile.familyStatus === 'Married';
  const maxCredit = isMarried ? 2000 : 1000;
  const estimatedCredit = calculateRentTaxCredit(formData.totalRent, isMarried);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rent Tax Credit</h1>
          <p className="text-gray-600">Claim up to €{maxCredit} in rent tax credit</p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 mb-1">2025 Rent Tax Credit</p>
              <p className="text-sm text-blue-800">
                {isMarried
                  ? 'Married couples can claim up to €2,000 (20% of rent, max €10,000 rent).'
                  : 'Single persons can claim up to €1,000 (20% of rent, max €5,000 rent).'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Rent Paid in 2025 (€)
            </label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={formData.totalRent || ''}
                onChange={(e) => setFormData({ ...formData, totalRent: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Landlord Name
            </label>
            <input
              type="text"
              value={formData.landlordName}
              onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="Enter landlord name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={formData.isParentPayingForChild}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isParentPayingForChild: e.target.checked,
                    rtbNumber: e.target.checked ? null : formData.rtbNumber,
                  })
                }
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                Parent paying for child&apos;s rent in college/digs (RTB number not required)
              </span>
            </label>
            {formData.isParentPayingForChild && (
              <div className="ml-6 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child&apos;s Name (optional)
                </label>
                <input
                  type="text"
                  value={formData.childName || ''}
                  onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="Enter child's name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can claim this even if you also claim mortgage interest relief on your own home.
                </p>
              </div>
            )}
          </div>

          {!formData.isParentPayingForChild && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RTB Number (Tenancy Registration)
              </label>
              <input
                type="text"
                value={formData.rtbNumber || ''}
                onChange={(e) => setFormData({ ...formData, rtbNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                placeholder="Enter RTB registration number"
              />
              <p className="text-xs text-gray-500 mt-1">
                Required for most tenancies. Check your tenancy agreement.
              </p>
            </div>
          )}

          {/* Estimated Credit */}
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Estimated Tax Credit:</span>
              <span className="text-2xl font-bold text-primary-600">
                €{Math.min(estimatedCredit, maxCredit).toFixed(2)}
              </span>
            </div>
            {formData.totalRent * 0.2 > maxCredit && (
              <p className="text-xs text-gray-600 mt-2">
                Capped at €{maxCredit} maximum credit
              </p>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Rent Tax Credit
          </button>
        </div>
      </div>
    </div>
  );
}

