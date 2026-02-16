'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
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
      className="block bg-white rounded-lg border border-[#E5E7EB] p-6 hover:border-[#D1D5DB] hover:shadow-e1 transition-all duration-150 cursor-pointer group"
    >
      <div className="flex flex-col items-center text-center">
        {/* User Avatar */}
        <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3 group-hover:bg-[#E5E7EB] transition-colors">
          <User className="w-7 h-7 text-[#6B7280]" strokeWidth={1.5} />
        </div>

        {/* Name */}
        <h3 className="text-sm font-medium text-[#111827] tracking-tight">
          {report.firstName} {report.lastName}
        </h3>

        {/* Entry count */}
        <p className="text-xs text-[#6B7280] mt-1">{entryLabel}</p>
      </div>
    </Link>
  );
}
