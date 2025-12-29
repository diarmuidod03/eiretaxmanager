import ProfileEditor from '@/components/ProfileEditor';
import AuthGuard from '@/components/AuthGuard';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <ProfileEditor />
        </div>
      </div>
    </AuthGuard>
  );
}

