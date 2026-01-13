'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-[#F4F4F5]">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="text-base font-semibold text-[#18181B] tracking-tight truncate mr-4">
            <span className="hidden sm:inline">Team Performance Diary</span>
            <span className="sm:hidden">TPD</span>
          </Link>
          <nav className="flex space-x-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isActive('/') && !pathname.startsWith('/settings')
                  ? 'bg-[#F4F4F5] text-[#18181B]'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FAFAFA]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/settings"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isActive('/settings')
                  ? 'bg-[#F4F4F5] text-[#18181B]'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FAFAFA]'
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
