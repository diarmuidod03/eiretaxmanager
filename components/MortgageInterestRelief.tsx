'use client';

import { useState } from 'react';
import { useAppStore, MortgageInterestRelief } from '@/lib/store';
import { Home, Save, AlertCircle, Info } from 'lucide-react';

export default function MortgageInterestReliefComponent() {
  const { mortgageInterestRelief, setMortgageInterestRelief, calculateEstimatedRefund } = useAppStore();
  const [formData, setFormData] = useState<MortgageInterestRelief>({
    mortgageInterestPaid: mortgageInterestRelief?.mortgageInterestPaid || 0,
    mortgageStartDate: mortgageInterestRelief?.mortgageStartDate || '',
    propertyAddress: mortgageInterestRelief?.propertyAddress || '',
    lenderName: mortgageInterestRelief?.lenderName || '',
  });

  const handleSave = () => {
    setMortgageInterestRelief(formData);
    calculateEstimatedRefund();
    alert('Mortgage interest relief saved!');
  };

  // Calculate relief based on tapered rates
  const calculateRelief = () => {
    if (!formData.mortgageStartDate) return 0;
    
    const mortgageDate = new Date(formData.mortgageStartDate);
    const year2013 = new Date('2013-01-01');
    
    // Only eligible if mortgage started before 2013
    if (mortgageDate >= year2013) {
      return 0; // Not eligible
    }

    const interest = formData.mortgageInterestPaid;
    let relief = 0;

    if (interest > 0) {
      const first3000 = Math.min(interest, 3000);
      relief += first3000 * 0.3; // 30% on first €3,000
    }
    if (interest > 3000) {
      const next3000 = Math.min(interest - 3000, 3000);
      relief += next3000 * 0.225; // 22.5% on next €3,000
    }
    if (interest > 6000) {
      const next3000 = Math.min(interest - 6000, 3000);
      relief += next3000 * 0.15; // 15% on next €3,000
    }

    return relief;
  };

  const estimatedRelief = calculateRelief();
  const mortgageDate = formData.mortgageStartDate ? new Date(formData.mortgageStartDate) : null;
  const isEligible = mortgageDate && mortgageDate < new Date('2013-01-01');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mortgage Interest Relief</h1>
          <p className="text-gray-600">Track your mortgage interest payments</p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 mb-1">Mortgage Interest Relief</p>
              <p className="text-sm text-blue-800 mb-2">
                Available for mortgages taken out before 1 January 2013. Relief is tapered:
              </p>
              <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                <li>30% relief on first €3,000 of interest</li>
                <li>22.5% relief on next €3,000</li>
                <li>15% relief on next €3,000</li>
              </ul>
              <p className="text-sm text-blue-800 mt-2 font-medium">
                Note: You can claim BOTH mortgage interest relief AND rent tax credit if you pay your child&apos;s rent in college.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mortgage Start Date
            </label>
            <input
              type="date"
              value={formData.mortgageStartDate}
              onChange={(e) => setFormData({ ...formData, mortgageStartDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            />
            {formData.mortgageStartDate && !isEligible && (
              <p className="text-xs text-red-600 mt-1">
                This mortgage is not eligible for relief (must be taken before 2013)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mortgage Interest Paid in 2025 (€)
            </label>
            <input
              type="number"
              value={formData.mortgageInterestPaid || ''}
              onChange={(e) => setFormData({ ...formData, mortgageInterestPaid: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Address
            </label>
            <input
              type="text"
              value={formData.propertyAddress}
              onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="Enter property address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lender Name
            </label>
            <input
              type="text"
              value={formData.lenderName}
              onChange={(e) => setFormData({ ...formData, lenderName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="e.g., Bank of Ireland, AIB"
            />
          </div>

          {/* Estimated Relief */}
          {isEligible && formData.mortgageInterestPaid > 0 && (
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Estimated Tax Relief:</span>
                <span className="text-2xl font-bold text-primary-600">
                  €{estimatedRelief.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Based on tapered relief rates for mortgages before 2013
              </p>
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Mortgage Interest Relief
          </button>
        </div>
      </div>
    </div>
  );
}

