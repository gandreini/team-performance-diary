'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MarkdownContent } from '@/components/MarkdownContent';
import { Button } from '@/components/Button';
import { EntryCard } from '@/components/EntryCard';
import { ChevronLeft } from 'lucide-react';
import type { Report, Entry, Cycle, ArchivedGoal, EntryType, ArchivedGoalSnapshot } from '@/db';

const ENTRY_TYPE_OPTIONS: { value: EntryType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'accomplishment', label: 'Accomplishment' },
  { value: 'kudos', label: 'Kudos' },
  { value: 'notes', label: 'Notes' },
  { value: 'career_conversation', label: 'Career Conversation' },
  { value: 'third_party_feedback', label: 'Third-Party Feedback' },
];

export default function ArchivedCyclePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [archivedGoals, setArchivedGoals] = useState<ArchivedGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EntryType | 'all'>('all');

  const fetchCycleData = useCallback(async () => {
    try {
      const response = await fetch(`/api/cycles/${resolvedParams.id}`);
      if (!response.ok) {
        router.push('/settings');
        return;
      }
      const data = await response.json();

      if (data.cycle.status !== 'archived') {
        router.push('/settings');
        return;
      }

      setCycle(data.cycle);
      setReports(data.reports || []);

      // Select first report by default if available
      if (data.reports && data.reports.length > 0) {
        setSelectedReportId(data.reports[0].id);
      }
    } catch (error) {
      console.error('Error fetching cycle:', error);
      router.push('/settings');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, router]);

  useEffect(() => {
    fetchCycleData();
  }, [fetchCycleData]);

  const fetchReportData = useCallback(async () => {
    if (!selectedReportId || !cycle) return;

    try {
      // Fetch entries for this report and cycle
      const entriesResponse = await fetch(
        `/api/reports/${selectedReportId}/entries?cycle_id=${cycle.id}`
      );
      const entriesData = await entriesResponse.json();
      setEntries(entriesData.entries || []);

      // Fetch archived goals
      const goalsResponse = await fetch(
        `/api/archived-goals/${selectedReportId}/${cycle.id}`
      );
      const goalsData = await goalsResponse.json();
      setArchivedGoals(goalsData.goals);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  }, [selectedReportId, cycle]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);
  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter(entry => entry.entryType === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3B82F6]" />
      </div>
    );
  }

  if (!cycle) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <Link href="/settings">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-lg font-semibold text-[#111827] tracking-tight">{cycle.name}</h1>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
            Archived
          </span>
        </div>
      </div>

      <p className="text-sm text-[#6B7280] mb-6">
        {formatDate(cycle.startDate)} – {cycle.endDate ? formatDate(cycle.endDate) : 'Present'}
      </p>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-md border border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280]">No reports with entries in this cycle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Reports List */}
          <div className="md:col-span-1">
            <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
              Reports
            </h2>
            <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                  className={`whitespace-nowrap text-left px-3 py-2 rounded-md transition-colors text-sm min-h-[40px] ${
                    selectedReportId === report.id
                      ? 'bg-[#EFF6FF] text-[#3B82F6] font-medium'
                      : 'hover:bg-[#F9FAFB] text-[#4B5563] bg-[#F3F4F6] md:bg-transparent'
                  }`}
                >
                  {report.firstName} {report.lastName}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Report Content */}
          <div className="md:col-span-3">
            {selectedReport && (
              <>
                <h2 className="text-base font-semibold text-[#111827] tracking-tight mb-4">
                  {selectedReport.firstName} {selectedReport.lastName}
                </h2>

                {/* Archived Goals */}
                <div className="bg-white rounded-md border border-[#E5E7EB] p-4 mb-6">
                  <h3 className="text-sm font-semibold text-[#111827] tracking-tight mb-3">
                    Development Goals
                  </h3>
                  {(() => {
                    // Try to parse structured goals first
                    if (archivedGoals?.goalsSnapshot) {
                      try {
                        const goals: ArchivedGoalSnapshot[] = JSON.parse(archivedGoals.goalsSnapshot);
                        if (goals.length > 0) {
                          return (
                            <div className="space-y-3">
                              {goals.map((goal) => (
                                <div
                                  key={goal.id}
                                  className="border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0"
                                >
                                  <h4 className="font-medium text-sm text-[#111827]">{goal.title}</h4>
                                  {goal.description && (
                                    <MarkdownContent className="mt-1 text-[#4B5563]">
                                      {goal.description}
                                    </MarkdownContent>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        }
                      } catch {
                        // Fall through to legacy check
                      }
                    }
                    // Fall back to legacy text field
                    if (archivedGoals?.developmentGoals) {
                      return (
                        <MarkdownContent className="text-[#374151]">
                          {archivedGoals.developmentGoals}
                        </MarkdownContent>
                      );
                    }
                    return (
                      <p className="text-sm text-[#6B7280] italic">
                        No development goals were set for this cycle.
                      </p>
                    );
                  })()}
                </div>

                {/* Entries */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h3 className="text-sm font-semibold text-[#111827] tracking-tight">Entries</h3>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as EntryType | 'all')}
                      className="px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#BFDBFE] focus:border-[#3B82F6] bg-white transition-colors min-h-[36px]"
                    >
                      {ENTRY_TYPE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-[#6B7280]">
                      {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>

                  {filteredEntries.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-md border border-[#E5E7EB]">
                      <p className="text-sm text-[#6B7280]">
                        {filter === 'all'
                          ? 'No entries for this report in this cycle.'
                          : `No ${ENTRY_TYPE_OPTIONS.find(o => o.value === filter)?.label.toLowerCase()} entries.`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredEntries.map((entry) => (
                        <EntryCard
                          key={entry.id}
                          entry={entry}
                          onEdit={() => {}}
                          onDelete={() => {}}
                          readOnly
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
