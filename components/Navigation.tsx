'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Receipt, Calendar, Home as HomeIcon, Ticket, GraduationCap, FileText, Settings, Building2 } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/receipts', icon: Receipt, label: 'Receipts' },
  { path: '/remote-working', icon: Calendar, label: 'Remote Work' },
  { path: '/rent-tax-credit', icon: HomeIcon, label: 'Rent' },
  { path: '/mortgage-interest', icon: Building2, label: 'Mortgage' },
  { path: '/small-benefit', icon: Ticket, label: 'Vouchers' },
  { path: '/lifestyle-credits', icon: GraduationCap, label: 'Lifestyle' },
  { path: '/year-end', icon: FileText, label: 'Filing' },
  { path: '/profile', icon: Settings, label: 'Profile' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/onboarding' || pathname === '/') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

