'use client';

import Link from 'next/link';
import type { Report } from '@/db';

interface ReportCardProps {
  report: Report & { entryCount: number };
}

export function ReportCard({ report }: ReportCardProps) {
  const entryLabel = report.entryCount === 1 ? '1 entry' : `${report.entryCount} entries`;

  // Generate initials for the avatar
  const initials = `${report.firstName.charAt(0)}${report.lastName.charAt(0)}`.toUpperCase();

  return (
    <Link
      href={`/reports/${report.id}`}
      className="block bg-white rounded-lg border border-[#E4E4E7] p-5 hover:border-[#D4D4D8] hover:shadow-sm transition-all duration-150 cursor-pointer group"
    >
      <div className="flex flex-col items-center text-center">
        {/* User Avatar */}
        <div className="w-14 h-14 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-3 group-hover:bg-[#E4E4E7] transition-colors">
          <svg
            className="w-7 h-7 text-[#71717A]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>

        {/* Name */}
        <h3 className="text-sm font-medium text-[#18181B] tracking-tight">
          {report.firstName} {report.lastName}
        </h3>

        {/* Entry count */}
        <p className="text-xs text-[#71717A] mt-1">{entryLabel}</p>
      </div>
    </Link>
  );
}
