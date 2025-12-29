import MortgageInterestReliefComponent from '@/components/MortgageInterestRelief';
import AuthGuard from '@/components/AuthGuard';

export default function MortgageInterestPage() {
  return (
    <AuthGuard>
      <MortgageInterestReliefComponent />
    </AuthGuard>
  );
}

