'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Camera, Calendar, Ticket, AlertCircle, TrendingUp, LogOut, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { signOut, useSession } from 'next-auth/react';
import AuthGuard from './AuthGuard';

function DashboardContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    userProfile,
    estimatedRefund,
    receipts,
    smallBenefitVouchers,
    calculateEstimatedRefund,
  } = useAppStore();

  useEffect(() => {
    calculateEstimatedRefund();
  }, [calculateEstimatedRefund]);

  // Calculate progress through tax year
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31);
  const totalDays = Math.ceil((yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
  const progress = (daysPassed / totalDays) * 100;

  // Small benefit limit check
  const smallBenefitTotal = smallBenefitVouchers.reduce((sum, v) => sum + v.value, 0);
  const smallBenefitRemaining = Math.max(0, 1500 - smallBenefitTotal);
  const smallBenefitWarning = smallBenefitRemaining < 300;

  // Check for non-routine dental without Med 2
  const dentalWithoutMed2 = receipts.filter(
    (r) => r.category === 'Non-Routine Dental' && !r.hasMed2Form
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Money Dashboard</h1>
            <p className="text-gray-600">Your tax relief at a glance</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Edit Profile"
            >
              <Settings className="w-5 h-5" />
            </button>
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-10 h-10 rounded-full"
              />
            )}
            <button
              onClick={() => {
                const { resetStore } = useAppStore.getState();
                resetStore();
                signOut({ callbackUrl: '/login' });
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* The "Pot" - Estimated Refund */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-xl p-8 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-100 text-sm font-medium mb-1">Estimated Refund</p>
              <p className="text-5xl font-bold">€{estimatedRefund.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-16 h-16 text-primary-200" />
          </div>

          {/* Timeline */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-primary-100 mb-2">
              <span>Jan 1</span>
              <span>{format(now, 'MMM d')}</span>
              <span>Dec 31</span>
            </div>
            <div className="w-full bg-primary-400 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-primary-100 mt-2">
              {Math.round(progress)}% through tax year {now.getFullYear()}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => router.push('/receipts')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center gap-3"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary-600" />
            </div>
            <span className="font-medium text-gray-700">Snap Receipt</span>
          </button>

          <button
            onClick={() => router.push('/remote-working')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center gap-3"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-medium text-gray-700">Log Remote Days</span>
          </button>

          <button
            onClick={() => router.push('/small-benefit')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center gap-3"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Ticket className="w-6 h-6 text-purple-600" />
            </div>
            <span className="font-medium text-gray-700">Log Work Voucher</span>
          </button>
        </div>

        {/* Alerts Reel */}
        <div className="space-y-3 mb-6">
          {smallBenefitWarning && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">
                  Small Benefit Limit Warning
                </p>
                <p className="text-sm text-yellow-700">
                  You have €{smallBenefitRemaining.toFixed(2)} left in your Small Benefit Limit.
                </p>
              </div>
            </div>
          )}

          {dentalWithoutMed2.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Action Required</p>
                <p className="text-sm text-red-700">
                  Upload your dentist&apos;s Med 2 Form for {dentalWithoutMed2.length} non-routine dental
                  {dentalWithoutMed2.length > 1 ? ' procedures' : ' procedure'}.
                </p>
              </div>
            </div>
          )}

          {(userProfile.housing === 'Rent' || userProfile.housing === 'Own with Mortgage') && !useAppStore.getState().rentTaxCredit && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Rent Tax Credit Available</p>
                <p className="text-sm text-blue-700">
                  {userProfile.housing === 'Own with Mortgage' 
                    ? 'Parents: You can claim rent tax credit for paying your child\'s rent in college, even if you have a mortgage.'
                    : `You may be eligible for up to €${userProfile.familyStatus === 'Married' ? '2,000' : '1,000'} in rent tax credit.`}
                </p>
              </div>
            </div>
          )}
          {userProfile.housing === 'Own with Mortgage' && !useAppStore.getState().mortgageInterestRelief && (
            <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-purple-800">Mortgage Interest Relief Available</p>
                <p className="text-sm text-purple-700">
                  If your mortgage started before 2013, you may be eligible for mortgage interest relief.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Receipts Captured</p>
            <p className="text-3xl font-bold text-gray-900">{receipts.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Medical Expenses</p>
            <p className="text-3xl font-bold text-gray-900">
              €{receipts.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => router.push('/receipts/new')}
          className="w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
        >
          <Camera className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

