'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { FileText, Download, Calendar } from 'lucide-react';

export default function YearEndFiling() {
  const {
    receipts,
    remoteWorkingDays,
    remoteWorkingBills,
    rentTaxCredit,
    mortgageInterestRelief,
    smallBenefitVouchers,
    lifestyleCredits,
    userProfile,
    estimatedRefund,
  } = useAppStore();

  const [selectedYear, setSelectedYear] = useState(2024);

  // Calculate values for Form 12
  const medicalExpenses = receipts
    .filter((r) => ['GP/Consultant', 'Prescriptions', 'Non-Routine Dental', 'Dietary'].includes(r.category))
    .reduce((sum, r) => sum + r.amount, 0);

  const nursingHomeExpenses = receipts
    .filter((r) => r.category === 'Nursing Home')
    .reduce((sum, r) => sum + r.amount, 0);

  const remoteWorkingRelief = remoteWorkingBills && remoteWorkingDays.length > 0
    ? (remoteWorkingBills.total / 365) * remoteWorkingDays.filter((d) => d.worked).length * 0.3
    : 0;

  const rentCredit = rentTaxCredit
    ? Math.min(rentTaxCredit.totalRent * 0.2, userProfile.familyStatus === 'Married' ? 2000 : 1000)
    : 0;

  // Calculate mortgage interest relief
  const mortgageRelief = mortgageInterestRelief ? (() => {
    const mortgageDate = new Date(mortgageInterestRelief.mortgageStartDate);
    const year2013 = new Date('2013-01-01');
    
    if (mortgageDate >= year2013) return 0; // Not eligible
    
    const interest = mortgageInterestRelief.mortgageInterestPaid;
    let relief = 0;
    
    if (interest > 0) {
      const first3000 = Math.min(interest, 3000);
      relief += first3000 * 0.3;
    }
    if (interest > 3000) {
      const next3000 = Math.min(interest - 3000, 3000);
      relief += next3000 * 0.225;
    }
    if (interest > 6000) {
      const next3000 = Math.min(interest - 6000, 3000);
      relief += next3000 * 0.15;
    }
    
    return relief;
  })() : 0;

  const tuitionFeeRelief = lifestyleCredits
    .filter((c) => c.type === 'Tuition Fees')
    .reduce((sum, c) => sum + Math.max(0, (c.amount - 3000) * 0.2), 0);

  const dependentRelativeCredit = lifestyleCredits
    .filter((c) => c.type === 'Dependent Relative').length * 305;

  const fisherCredit = lifestyleCredits
    .filter((c) => c.type === 'Fisher Tax Credit').length * 1270;

  const form12Fields = [
    { box: '6', label: 'Health Expenses (Med 1)', amount: medicalExpenses, rate: '20%' },
    { box: '7', label: 'Nursing Home Expenses', amount: nursingHomeExpenses, rate: '40%' },
    { box: '8', label: 'Rent Tax Credit', amount: rentCredit, rate: 'Flat' },
    { box: '8a', label: 'Mortgage Interest Relief', amount: mortgageRelief, rate: 'Tapered' },
    { box: '9', label: 'Remote Working Relief', amount: remoteWorkingRelief, rate: '30%' },
    { box: '10', label: 'Tuition Fees', amount: tuitionFeeRelief, rate: '20%' },
    { box: '11', label: 'Dependent Relative', amount: dependentRelativeCredit, rate: 'Flat' },
    { box: '12', label: 'Fisher Tax Credit', amount: fisherCredit, rate: 'Flat' },
  ].filter((field) => field.amount > 0);

  const handleExport = () => {
    // In a real app, this would generate a ZIP file with all receipts
    alert('Export functionality would generate a ZIP file with all receipts for audit purposes.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Year-End & Filing</h1>
            <p className="text-gray-600">Form 12 Helper & Retrospection</p>
          </div>
          <button
            onClick={handleExport}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Receipts
          </button>
        </div>

        {/* Year Selector */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            >
              {[2021, 2022, 2023, 2024, 2025].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600">
              Revenue allows claims for the last 4 years
            </p>
          </div>
        </div>

        {/* Form 12 Helper */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold">Form 12 Helper</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Use these values when filing your Form 12 on Revenue.ie
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">Box</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-700">Rate</th>
                </tr>
              </thead>
              <tbody>
                {form12Fields.map((field) => (
                  <tr key={field.box} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">Box {field.box}</td>
                    <td className="py-3 px-4 text-gray-700">{field.label}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      €{field.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">{field.rate}</td>
                  </tr>
                ))}
                <tr className="bg-primary-50 font-bold">
                  <td colSpan={2} className="py-3 px-4 text-gray-900">Total Estimated Refund</td>
                  <td colSpan={2} className="py-3 px-4 text-right text-primary-600 text-xl">
                    €{estimatedRefund.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Retrospection */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Found Money - Retrospective Claims</h2>
          <p className="text-gray-600 mb-4">
            Revenue allows you to claim reliefs for the last 4 years. Check if you missed anything:
          </p>
          <div className="space-y-3">
            {[2021, 2022, 2023, 2024].map((year) => (
              <div
                key={year}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{year}</h3>
                    <p className="text-sm text-gray-600">
                      {year === 2022 && 'Did you pay rent in 2022? You can still claim €500 retroactively.'}
                      {year === 2023 && 'Check your medical expenses and rent payments for 2023.'}
                      {year === 2024 && 'Current year - all claims active.'}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                    Review {year}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600">Total Receipts</p>
            <p className="text-2xl font-bold text-gray-900">{receipts.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600">Remote Days</p>
            <p className="text-2xl font-bold text-gray-900">
              {remoteWorkingDays.filter((d) => d.worked).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600">Vouchers</p>
            <p className="text-2xl font-bold text-gray-900">{smallBenefitVouchers.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

