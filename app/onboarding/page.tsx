import Onboarding from '@/components/Onboarding';
import AuthGuard from '@/components/AuthGuard';

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <Onboarding />
    </AuthGuard>
  );
}

