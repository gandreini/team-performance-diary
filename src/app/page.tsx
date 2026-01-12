'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/Button';
import { ReportCard } from '@/components/ReportCard';
import { AddReportModal } from '@/components/AddReportModal';
import type { Report, Cycle } from '@/db';

interface ReportWithCount extends Report {
  entryCount: number;
}

export default function Home() {
  const [reports, setReports] = useState<ReportWithCount[]>([]);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // First ensure we have an active cycle
      const cycleResponse = await fetch('/api/cycles/active');
      const cycleData = await cycleResponse.json();
      setCycle(cycleData.cycle);

      // Then fetch reports
      const reportsResponse = await fetch('/api/reports');
      const reportsData = await reportsResponse.json();
      const reportsList = reportsData.reports || [];

      // Get entry counts for each report
      if (reportsList.length > 0) {
        const reportsWithCounts = await Promise.all(
          reportsList.map(async (report: Report) => {
            const entriesResponse = await fetch(
              `/api/reports/${report.id}/entries?cycle_id=${cycleData.cycle.id}`
            );
            const entriesData = await entriesResponse.json();
            return {
              ...report,
              entryCount: entriesData.entries?.length || 0,
            };
          })
        );
        setReports(reportsWithCounts);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-lg font-semibold text-[#18181B] tracking-tight">Reports</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          Add Report
        </Button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-md border border-[#E4E4E7]">
          <svg
            className="mx-auto h-10 w-10 text-[#D4D4D8]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-[#18181B]">No reports yet</h3>
          <p className="mt-1 text-sm text-[#71717A]">
            Add your first report to get started.
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsAddModalOpen(true)}>
              Add Report
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      <AddReportModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
