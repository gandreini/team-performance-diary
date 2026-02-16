'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tent } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-[#F3F4F6]">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="text-[#111827] hover:text-[#374151] transition-colors mr-4 flex items-center" title="tipi">
            <Tent size={24} strokeWidth={1.75} />
          </Link>
          <nav className="flex space-x-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isActive('/') && !pathname.startsWith('/settings')
                  ? 'bg-[#F3F4F6] text-[#111827]'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/settings"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isActive('/settings')
                  ? 'bg-[#F3F4F6] text-[#111827]'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
              }`}
            >
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
