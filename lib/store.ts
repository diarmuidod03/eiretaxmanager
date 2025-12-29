import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { syncDataToServer, loadDataFromServer } from './api';

export interface UserProfile {
  employmentStatus: 'PAYE' | 'Self-Employed' | 'Both' | null;
  jobTitle: string | null;
  flatRateExpenseCategory: string | null;
  housing: 'Rent' | 'Own with Mortgage' | 'Own outright' | null;
  familyStatus: 'Single' | 'Married' | 'Children' | null;
  childrenAges: number[];
  hasCoeliac: boolean;
  hasDiabetes: boolean;
  yearOfMarriage: number | null;
}

export interface Receipt {
  id: string;
  date: string;
  amount: number;
  category: 'GP/Consultant' | 'Prescriptions' | 'Non-Routine Dental' | 'Nursing Home' | 'Dietary' | 'Guide Dog' | 'Other';
  merchant: string;
  imageUrl: string;
  ocrText: string;
  hasMed2Form: boolean;
  encrypted: boolean;
}

export interface RemoteWorkingDay {
  date: string;
  worked: boolean;
}

export interface RemoteWorkingBills {
  electricity: number;
  broadband: number;
  heating: number;
  total: number;
}

export interface RentTaxCredit {
  totalRent: number;
  landlordName: string;
  rtbNumber: string | null;
  isParentPayingForChild: boolean;
  childName?: string; // For tracking which child's rent
}

export interface MortgageInterestRelief {
  mortgageInterestPaid: number;
  mortgageStartDate: string; // Format: YYYY-MM-DD
  propertyAddress: string;
  lenderName: string;
}

export interface SmallBenefitVoucher {
  id: string;
  value: number;
  date: string;
  description: string;
}

export interface LifestyleCredit {
  id: string;
  type: 'Tuition Fees' | 'Dependent Relative' | 'Cycle to Work' | 'Fisher Tax Credit';
  amount: number;
  date: string;
  details: Record<string, any>;
}

interface AppState {
  hasCompletedOnboarding: boolean;
  userProfile: UserProfile;
  receipts: Receipt[];
  remoteWorkingDays: RemoteWorkingDay[];
  remoteWorkingBills: RemoteWorkingBills | null;
  rentTaxCredit: RentTaxCredit | null;
  mortgageInterestRelief: MortgageInterestRelief | null;
  smallBenefitVouchers: SmallBenefitVoucher[];
  lifestyleCredits: LifestyleCredit[];
  estimatedRefund: number;
  userId: string | null;
  isSyncing: boolean;
  
  // Actions
  setHasCompletedOnboarding: (value: boolean) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  addReceipt: (receipt: Receipt) => void;
  deleteReceipt: (id: string) => void;
  setRemoteWorkingDay: (date: string, worked: boolean) => void;
  setRemoteWorkingBills: (bills: RemoteWorkingBills) => void;
  setRentTaxCredit: (rent: RentTaxCredit) => void;
  setMortgageInterestRelief: (mortgage: MortgageInterestRelief) => void;
  addSmallBenefitVoucher: (voucher: SmallBenefitVoucher) => void;
  deleteSmallBenefitVoucher: (id: string) => void;
  addLifestyleCredit: (credit: LifestyleCredit) => void;
  calculateEstimatedRefund: () => void;
  setUserId: (userId: string | null) => void;
  syncToServer: () => Promise<void>;
  loadFromServer: (userId: string) => Promise<void>;
  resetStore: () => void;
}

const defaultProfile: UserProfile = {
  employmentStatus: null,
  jobTitle: null,
  flatRateExpenseCategory: null,
  housing: null,
  familyStatus: null,
  childrenAges: [],
  hasCoeliac: false,
  hasDiabetes: false,
  yearOfMarriage: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get): AppState => ({
      hasCompletedOnboarding: false,
      userProfile: defaultProfile,
      receipts: [],
      remoteWorkingDays: [],
      remoteWorkingBills: null,
      rentTaxCredit: null,
      mortgageInterestRelief: null,
      smallBenefitVouchers: [],
      lifestyleCredits: [],
      estimatedRefund: 0,
      userId: null,
      isSyncing: false,

      setHasCompletedOnboarding: (value: boolean) => {
        set({ hasCompletedOnboarding: value });
        get().syncToServer();
      },
      
      updateUserProfile: (profile: Partial<UserProfile>) => {
        set((state: AppState) => ({
          userProfile: { ...state.userProfile, ...profile },
        }));
        get().syncToServer();
      },

      addReceipt: (receipt: Receipt) => {
        set((state: AppState) => ({
          receipts: [...state.receipts, receipt],
        }));
        get().syncToServer();
      },

      deleteReceipt: (id: string) => {
        set((state: AppState) => ({
          receipts: state.receipts.filter((r: Receipt) => r.id !== id),
        }));
        get().syncToServer();
      },

      setRemoteWorkingDay: (date: string, worked: boolean) => {
        set((state: AppState) => {
          const existing = state.remoteWorkingDays.find((d: RemoteWorkingDay) => d.date === date);
          if (existing) {
            return {
              remoteWorkingDays: state.remoteWorkingDays.map((d: RemoteWorkingDay) =>
                d.date === date ? { ...d, worked } : d
              ),
            };
          }
          return {
            remoteWorkingDays: [...state.remoteWorkingDays, { date, worked }],
          };
        });
        get().syncToServer();
      },

      setRemoteWorkingBills: (bills: RemoteWorkingBills) => {
        set({ remoteWorkingBills: bills });
        get().syncToServer();
      },

      setRentTaxCredit: (rent: RentTaxCredit) => {
        set({ rentTaxCredit: rent });
        get().syncToServer();
      },

      setMortgageInterestRelief: (mortgage: MortgageInterestRelief) => {
        set({ mortgageInterestRelief: mortgage });
        get().syncToServer();
      },

      addSmallBenefitVoucher: (voucher: SmallBenefitVoucher) => {
        set((state: AppState) => {
          const newVouchers = [...state.smallBenefitVouchers, voucher];
          const total = newVouchers.reduce((sum: number, v: SmallBenefitVoucher) => sum + v.value, 0);
          if (newVouchers.length > 5 || total > 1500) {
            // Warning will be shown in UI
          }
          return { smallBenefitVouchers: newVouchers };
        });
        get().syncToServer();
      },

      deleteSmallBenefitVoucher: (id: string) => {
        set((state: AppState) => ({
          smallBenefitVouchers: state.smallBenefitVouchers.filter((v: SmallBenefitVoucher) => v.id !== id),
        }));
        get().syncToServer();
      },

      addLifestyleCredit: (credit: LifestyleCredit) => {
        set((state: AppState) => ({
          lifestyleCredits: [...state.lifestyleCredits, credit],
        }));
        get().syncToServer();
      },

      calculateEstimatedRefund: () => {
        const state = get();
        let refund = 0;

        // Medical expenses (20% relief)
        const medicalTotal = state.receipts
          .filter((r: Receipt) => ['GP/Consultant', 'Prescriptions', 'Non-Routine Dental', 'Dietary'].includes(r.category))
          .reduce((sum: number, r: Receipt) => sum + r.amount, 0);
        refund += medicalTotal * 0.2;

        // Nursing home (40% relief)
        const nursingHomeTotal = state.receipts
          .filter((r: Receipt) => r.category === 'Nursing Home')
          .reduce((sum: number, r: Receipt) => sum + r.amount, 0);
        refund += nursingHomeTotal * 0.4;

        // Rent tax credit
        if (state.rentTaxCredit) {
          const maxRentCredit = state.userProfile.familyStatus === 'Married' ? 2000 : 1000;
          refund += Math.min(state.rentTaxCredit.totalRent * 0.2, maxRentCredit);
        }

        // Remote working relief
        if (state.remoteWorkingBills && state.remoteWorkingDays.length > 0) {
          const daysWorked = state.remoteWorkingDays.filter((d: RemoteWorkingDay) => d.worked).length;
          const dailyCost = state.remoteWorkingBills.total / 365;
          refund += dailyCost * daysWorked * 0.3;
        }

        // Lifestyle credits
        state.lifestyleCredits.forEach((credit: LifestyleCredit) => {
          if (credit.type === 'Tuition Fees') {
            const taxableAmount = Math.max(0, credit.amount - 3000);
            refund += taxableAmount * 0.2;
          } else if (credit.type === 'Dependent Relative') {
            refund += 305;
          } else if (credit.type === 'Fisher Tax Credit') {
            refund += 1270;
          }
        });

        set({ estimatedRefund: Math.round(refund * 100) / 100 });
      },

      setUserId: (userId: string | null) => {
        const currentUserId = get().userId;
        // If switching users, reset the store first
        if (currentUserId && currentUserId !== userId) {
          set({
            hasCompletedOnboarding: false,
            userProfile: defaultProfile,
            receipts: [],
            remoteWorkingDays: [],
            remoteWorkingBills: null,
            rentTaxCredit: null,
            mortgageInterestRelief: null,
            smallBenefitVouchers: [],
            lifestyleCredits: [],
            estimatedRefund: 0,
            userId: userId,
            isSyncing: false,
          });
        } else {
          set({ userId });
        }
      },

      syncToServer: async () => {
        const state = get();
        if (!state.userId || state.isSyncing) return;
        
        set({ isSyncing: true });
        try {
          await syncDataToServer(state.userId, {
            hasCompletedOnboarding: state.hasCompletedOnboarding,
            userProfile: state.userProfile,
            receipts: state.receipts,
            remoteWorkingDays: state.remoteWorkingDays,
            remoteWorkingBills: state.remoteWorkingBills,
            rentTaxCredit: state.rentTaxCredit,
            mortgageInterestRelief: state.mortgageInterestRelief,
            smallBenefitVouchers: state.smallBenefitVouchers,
            lifestyleCredits: state.lifestyleCredits,
            estimatedRefund: state.estimatedRefund,
          });
        } catch (error) {
          console.error('Failed to sync:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      loadFromServer: async (userId: string) => {
        set({ isSyncing: true });
        try {
          // First, reset store to defaults to clear any previous user's data
          set({
            hasCompletedOnboarding: false,
            userProfile: defaultProfile,
            receipts: [],
            remoteWorkingDays: [],
            remoteWorkingBills: null,
            rentTaxCredit: null,
            mortgageInterestRelief: null,
            smallBenefitVouchers: [],
            lifestyleCredits: [],
            estimatedRefund: 0,
            userId,
          });

          const data = await loadDataFromServer(userId);
          if (data) {
            // Load user's data from server
            set({
              hasCompletedOnboarding: data.hasCompletedOnboarding ?? false,
              userProfile: data.userProfile ?? defaultProfile,
              receipts: data.receipts ?? [],
              remoteWorkingDays: data.remoteWorkingDays ?? [],
              remoteWorkingBills: data.remoteWorkingBills ?? null,
              rentTaxCredit: data.rentTaxCredit ?? null,
              mortgageInterestRelief: data.mortgageInterestRelief ?? null,
              smallBenefitVouchers: data.smallBenefitVouchers ?? [],
              lifestyleCredits: data.lifestyleCredits ?? [],
              estimatedRefund: data.estimatedRefund ?? 0,
              userId,
            });
          }
          // If no data, keep defaults (already set above)
        } catch (error) {
          console.error('Failed to load:', error);
          // Keep defaults on error
        } finally {
          set({ isSyncing: false });
        }
      },

      resetStore: () => {
        set({
          hasCompletedOnboarding: false,
          userProfile: defaultProfile,
          receipts: [],
          remoteWorkingDays: [],
          remoteWorkingBills: null,
          rentTaxCredit: null,
          mortgageInterestRelief: null,
          smallBenefitVouchers: [],
          lifestyleCredits: [],
          estimatedRefund: 0,
          userId: null,
          isSyncing: false,
        });
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('eiretax-storage');
        }
      },
    }),
    {
      name: 'eiretax-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist userId to localStorage, not the actual data
      // Data should come from the server per user
      partialize: (state) => ({ userId: state.userId }),
    }
  )
);

