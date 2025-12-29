// Tax relief calculations for Ireland 2024/2025

export interface TaxReliefResult {
  reliefType: string;
  amount: number;
  rate: number;
  description: string;
}

// Flat Rate Expenses by profession (2024 rates)
export const FLAT_RATE_EXPENSES: Record<string, number> = {
  'Nurse': 733,
  'Teacher': 518,
  'Bricklayer': 1173,
  'Carpenter': 1173,
  'Electrician': 1173,
  'Plumber': 1173,
  'Mechanic': 1173,
  'Chef': 733,
  'Hairdresser': 518,
  'Retail Assistant': 518,
};

export function calculateFlatRateExpense(jobTitle: string): number {
  return FLAT_RATE_EXPENSES[jobTitle] || 0;
}

export function calculateMedicalRelief(amount: number, category: string): number {
  if (category === 'Nursing Home') {
    return amount * 0.4; // 40% relief at marginal rate
  }
  return amount * 0.2; // 20% standard relief
}

export function calculateRentTaxCredit(
  totalRent: number,
  isMarried: boolean
): number {
  const maxCredit = isMarried ? 2000 : 1000;
  const credit = totalRent * 0.2; // 20% of rent
  return Math.min(credit, maxCredit);
}

export function calculateRemoteWorkingRelief(
  totalBills: number,
  daysWorked: number
): number {
  const dailyCost = totalBills / 365;
  return dailyCost * daysWorked * 0.3; // 30% relief
}

export function calculateTuitionFeeRelief(feeAmount: number): number {
  const disregard = 3000;
  const taxableAmount = Math.max(0, feeAmount - disregard);
  return taxableAmount * 0.2; // 20% relief
}

export function checkSmallBenefitLimit(
  vouchers: Array<{ value: number }>
): { withinLimit: boolean; total: number; remaining: number; warning: string | null } {
  const total = vouchers.reduce((sum, v) => sum + v.value, 0);
  const limit = 1500;
  const remaining = Math.max(0, limit - total);
  
  let warning: string | null = null;
  if (vouchers.length >= 5) {
    warning = 'You have reached the maximum of 5 vouchers. Adding more will be taxed.';
  } else if (total >= limit) {
    warning = 'You have reached the €1,500 limit. Adding more will be taxed.';
  } else if (total > limit * 0.8) {
    warning = `You have €${remaining.toFixed(2)} left in your Small Benefit Limit.`;
  }
  
  return {
    withinLimit: total <= limit && vouchers.length < 5,
    total,
    remaining,
    warning,
  };
}

