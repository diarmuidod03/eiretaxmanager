'use client';

import { useState, useEffect } from 'react';
import { useAppStore, RemoteWorkingBills } from '@/lib/store';
import { calculateRemoteWorkingRelief } from '@/lib/taxCalculations';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Calendar, Euro, AlertCircle } from 'lucide-react';

export default function RemoteWorking() {
  const { remoteWorkingDays, remoteWorkingBills, setRemoteWorkingDay, setRemoteWorkingBills, calculateEstimatedRefund } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showBillsModal, setShowBillsModal] = useState(false);
  const [bills, setBills] = useState({
    electricity: remoteWorkingBills?.electricity || 0,
    broadband: remoteWorkingBills?.broadband || 0,
    heating: remoteWorkingBills?.heating || 0,
  });

  useEffect(() => {
    calculateEstimatedRefund();
  }, [remoteWorkingDays, remoteWorkingBills, calculateEstimatedRefund]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const toggleDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = remoteWorkingDays.find((d) => d.date === dateStr);
    setRemoteWorkingDay(dateStr, !existing?.worked);
  };

  const handleSaveBills = () => {
    const total = bills.electricity + bills.broadband + bills.heating;
    setRemoteWorkingBills({
      ...bills,
      total,
    });
    setShowBillsModal(false);
    calculateEstimatedRefund();
  };

  const daysWorkedThisMonth = daysInMonth.filter((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return remoteWorkingDays.find((d) => d.date === dateStr && d.worked);
  }).length;

  const totalDaysWorked = remoteWorkingDays.filter((d) => d.worked).length;

  const estimatedRelief = remoteWorkingBills
    ? calculateRemoteWorkingRelief(remoteWorkingBills.total, totalDaysWorked)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Remote Working Relief</h1>
            <p className="text-gray-600">Track your eWorker days</p>
          </div>
          <button
            onClick={() => setShowBillsModal(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Euro className="w-5 h-5" />
            Set Bills
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600">Days Worked</p>
            <p className="text-2xl font-bold text-gray-900">{totalDaysWorked}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-gray-900">{daysWorkedThisMonth}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm text-gray-600">Estimated Relief</p>
            <p className="text-2xl font-bold text-primary-600">€{estimatedRelief.toFixed(2)}</p>
          </div>
        </div>

        {!remoteWorkingBills && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Bills Required</p>
              <p className="text-sm text-yellow-700">
                Please upload your Electricity, Broadband, and Heating bills to calculate relief.
              </p>
            </div>
          </div>
        )}

        {/* Month Navigation */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Previous
          </button>
          <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Next →
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isWorked = remoteWorkingDays.find((d) => d.date === dateStr && d.worked);
              const isToday = isSameDay(day, new Date());
              
              return (
                <button
                  key={dateStr}
                  onClick={() => toggleDay(day)}
                  className={`aspect-square rounded-lg border-2 transition-colors ${
                    isWorked
                      ? 'bg-primary-600 border-primary-700 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  } ${isToday ? 'ring-2 ring-primary-400' : ''}`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary-600 rounded"></div>
              <span>Worked from home</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded"></div>
              <span>Office/Other</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
          <p className="text-sm text-blue-800">
            Tap days you worked from home. Relief is calculated as 30% of your utility costs
            (Electricity, Broadband, Heating) divided by 365 days, multiplied by days worked.
          </p>
        </div>
      </div>

      {/* Bills Modal */}
      {showBillsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Enter Your Annual Bills</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Electricity (€)
                </label>
                <input
                  type="number"
                  value={bills.electricity}
                  onChange={(e) => setBills({ ...bills, electricity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Broadband (€)
                </label>
                <input
                  type="number"
                  value={bills.broadband}
                  onChange={(e) => setBills({ ...bills, broadband: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heating (€)
                </label>
                <input
                  type="number"
                  value={bills.heating}
                  onChange={(e) => setBills({ ...bills, heating: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-bold">
                    €{(bills.electricity + bills.broadband + bills.heating).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBillsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBills}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

