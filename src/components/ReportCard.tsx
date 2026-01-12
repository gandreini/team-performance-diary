'use client';

import Link from 'next/link';
import type { Report } from '@/db';

interface ReportCardProps {
  report: Report & { entryCount: number };
}

export function ReportCard({ report }: ReportCardProps) {
  const entryLabel = report.entryCount === 1 ? '1 entry' : `${report.entryCount} entries`;

  return (
    <Link
      href={`/reports/${report.id}`}
      className="block bg-white rounded-md border border-[#E4E4E7] p-4 hover:border-[#D4D4D8] hover:bg-[#FAFAFA] transition-all duration-150 cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-[#18181B] tracking-tight">
            {report.firstName} {report.lastName}
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">{entryLabel}</p>
        </div>
        <svg
          className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#71717A] transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}
