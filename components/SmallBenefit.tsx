'use client';

import { useState } from 'react';
import { useAppStore, SmallBenefitVoucher } from '@/lib/store';
import { checkSmallBenefitLimit } from '@/lib/taxCalculations';
import { Ticket, Plus, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function SmallBenefit() {
  const { smallBenefitVouchers, addSmallBenefitVoucher, deleteSmallBenefitVoucher } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    value: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const limitCheck = checkSmallBenefitLimit(smallBenefitVouchers);
  const percentageUsed = (limitCheck.total / 1500) * 100;

  const handleAdd = () => {
    if (!formData.value || !formData.description) {
      alert('Please fill in all fields');
      return;
    }

    const value = parseFloat(formData.value);
    const newTotal = limitCheck.total + value;

    if (smallBenefitVouchers.length >= 5) {
      if (!confirm('You already have 5 vouchers. Adding more will be taxed. Continue?')) {
        return;
      }
    }

    if (newTotal > 1500) {
      if (!confirm(`This will exceed the €1,500 limit. The excess will be taxed. Continue?`)) {
        return;
      }
    }

    const voucher: SmallBenefitVoucher = {
      id: Date.now().toString(),
      value,
      date: formData.date,
      description: formData.description,
    };

    addSmallBenefitVoucher(voucher);
    setShowAddModal(false);
    setFormData({ value: '', date: new Date().toISOString().split('T')[0], description: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Small Benefit Exemption</h1>
            <p className="text-gray-600">Track your work vouchers</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Voucher
          </button>
        </div>

        {/* Fuel Gauge */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Small Benefit Limit</h2>
            <span className="text-2xl font-bold text-gray-900">
              €{limitCheck.total.toFixed(2)} / €1,500
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 mb-2">
            <div
              className={`h-6 rounded-full transition-all ${
                percentageUsed >= 100
                  ? 'bg-red-500'
                  : percentageUsed >= 80
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>0%</span>
            <span>{Math.round(percentageUsed)}%</span>
            <span>100%</span>
          </div>
          {limitCheck.warning && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">{limitCheck.warning}</p>
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Rules</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Maximum 5 vouchers per year</li>
            <li>Maximum total value: €1,500</li>
            <li>Exceeding these limits will result in tax liability</li>
            <li>If you&apos;re close to the limit, ask for vouchers next January 1st</li>
          </ul>
        </div>

        {/* Vouchers List */}
        <div className="space-y-4">
          {smallBenefitVouchers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No vouchers yet</p>
              <p className="text-sm text-gray-500">Add your work vouchers to track your limit</p>
            </div>
          ) : (
            smallBenefitVouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{voucher.description}</h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(voucher.date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-900">€{voucher.value.toFixed(2)}</span>
                  <button
                    onClick={() => {
                      if (confirm('Delete this voucher?')) {
                        deleteSmallBenefitVoucher(voucher.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Work Voucher</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="e.g., Christmas Bonus Voucher"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value (€)
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Received
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
              {limitCheck.total + parseFloat(formData.value || '0') > 1500 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This will exceed the €1,500 limit. The excess will be taxed.
                  </p>
                </div>
              )}
              {smallBenefitVouchers.length >= 4 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <strong>Stop!</strong> You already have {smallBenefitVouchers.length} vouchers. Adding a 6th will be taxed. Consider asking for it next January 1st.
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ value: '', date: new Date().toISOString().split('T')[0], description: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

