'use client';

import { useState } from 'react';
import { useAppStore, LifestyleCredit } from '@/lib/store';
import { calculateTuitionFeeRelief } from '@/lib/taxCalculations';
import { GraduationCap, Users, Bike, Anchor, Plus, CheckCircle } from 'lucide-react';

const LIFESTYLE_CREDIT_TYPES = [
  {
    id: 'Tuition Fees',
    name: 'Tuition Fees',
    icon: GraduationCap,
    description: 'Third level education fees (€3,000 disregard)',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'Dependent Relative',
    name: 'Dependent Relative',
    icon: Users,
    description: 'Maintaining a relative who can\'t care for themselves',
    color: 'bg-green-100 text-green-800',
    fixedAmount: 305,
  },
  {
    id: 'Cycle to Work',
    name: 'Cycle to Work',
    icon: Bike,
    description: 'Bike purchase (eligibility resets every 4 years)',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'Fisher Tax Credit',
    name: 'Fisher Tax Credit',
    icon: Anchor,
    description: '80+ days at sea (€1,270 credit)',
    color: 'bg-indigo-100 text-indigo-800',
    fixedAmount: 1270,
  },
];

export default function LifestyleCredits() {
  const { lifestyleCredits, addLifestyleCredit, calculateEstimatedRefund } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    details: {} as Record<string, any>,
  });

  const handleAdd = () => {
    if (!selectedType) return;

    const creditType = LIFESTYLE_CREDIT_TYPES.find((t) => t.id === selectedType);
    if (!creditType) return;

    if (selectedType === 'Tuition Fees' && !formData.amount) {
      alert('Please enter the tuition fee amount');
      return;
    }

    const credit: LifestyleCredit = {
      id: Date.now().toString(),
      type: selectedType as any,
      amount: parseFloat(formData.amount) || creditType.fixedAmount || 0,
      date: formData.date,
      details: formData.details,
    };

    addLifestyleCredit(credit);
    calculateEstimatedRefund();
    setShowAddModal(false);
    setSelectedType(null);
    setFormData({ amount: '', date: new Date().toISOString().split('T')[0], details: {} });
  };

  const getCreditIcon = (type: string) => {
    const creditType = LIFESTYLE_CREDIT_TYPES.find((t) => t.id === type);
    return creditType?.icon || CheckCircle;
  };

  const calculateCreditValue = (credit: LifestyleCredit) => {
    if (credit.type === 'Tuition Fees') {
      return calculateTuitionFeeRelief(credit.amount);
    } else if (credit.type === 'Dependent Relative') {
      return 305;
    } else if (credit.type === 'Fisher Tax Credit') {
      return 1270;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lifestyle Credits</h1>
            <p className="text-gray-600">Set and forget credits</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Credit
          </button>
        </div>

        {/* Available Credits */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {LIFESTYLE_CREDIT_TYPES.map((type) => {
            const Icon = type.icon;
            const hasCredit = lifestyleCredits.some((c) => c.type === type.id);
            return (
              <div
                key={type.id}
                className={`bg-white rounded-xl shadow-md p-6 border-2 ${
                  hasCredit ? 'border-primary-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${type.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{type.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                    {hasCredit && (
                      <span className="inline-flex items-center gap-1 text-xs text-primary-600 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Claimed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Claimed Credits */}
        {lifestyleCredits.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Claims</h2>
            {lifestyleCredits.map((credit) => {
              const Icon = getCreditIcon(credit.type);
              const creditType = LIFESTYLE_CREDIT_TYPES.find((t) => t.id === credit.type);
              return (
                <div
                  key={credit.id}
                  className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${creditType?.color || 'bg-gray-100'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{credit.type}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(credit.date).toLocaleDateString()}
                        {credit.type === 'Tuition Fees' && ` - €${credit.amount.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      €{calculateCreditValue(credit).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Tax Credit</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Lifestyle Credit</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LIFESTYLE_CREDIT_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-4 border-2 rounded-lg text-left transition-colors ${
                          selectedType === type.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium text-sm">{type.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{type.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedType === 'Tuition Fees' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tuition Fee Amount (€)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    €3,000 disregard applies. Relief calculated on remainder at 20%.
                  </p>
                </div>
              )}

              {selectedType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
              )}

              {selectedType && (
                <div className="pt-4 border-t">
                  {selectedType === 'Tuition Fees' && formData.amount && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Estimated Credit:</strong> €
                        {calculateTuitionFeeRelief(parseFloat(formData.amount) || 0).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {LIFESTYLE_CREDIT_TYPES.find((t) => t.id === selectedType)?.fixedAmount && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Credit Amount:</strong> €
                        {LIFESTYLE_CREDIT_TYPES.find((t) => t.id === selectedType)?.fixedAmount}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedType(null);
                    setFormData({ amount: '', date: new Date().toISOString().split('T')[0], details: {} });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!selectedType || (selectedType === 'Tuition Fees' && !formData.amount)}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Credit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

