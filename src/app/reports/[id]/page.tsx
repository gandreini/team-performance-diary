'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/Button';
import { EntryCard } from '@/components/EntryCard';
import { Dropdown } from '@/components/Dropdown';
import { AddEntryDrawer } from '@/components/AddEntryDrawer';
import { EditReportDrawer } from '@/components/EditReportDrawer';
import { ScrollArea } from '@/components/ScrollArea';
import { useToast } from '@/components/Toast';
import type { Report, Entry, Cycle, EntryType } from '@/db';

const ENTRY_TYPES: { value: EntryType; label: string }[] = [
  { value: 'feedback', label: 'Feedback' },
  { value: 'accomplishment', label: 'Accomplishment' },
  { value: 'kudos', label: 'Kudos' },
  { value: 'notes', label: 'Note' },
  { value: 'career_conversation', label: 'Career Conversation' },
  { value: 'third_party_feedback', label: 'Third-Party Feedback' },
];

const ENTRY_TYPE_OPTIONS: { value: EntryType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'accomplishment', label: 'Accomplishment' },
  { value: 'kudos', label: 'Kudos' },
  { value: 'notes', label: 'Notes' },
  { value: 'career_conversation', label: 'Career Conversation' },
  { value: 'third_party_feedback', label: 'Third-Party Feedback' },
];

export default function ReportDiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [report, setReport] = useState<Report | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EntryType | 'all'>('all');

  const [isAddEntryDrawerOpen, setIsAddEntryDrawerOpen] = useState(false);
  const [selectedEntryType, setSelectedEntryType] = useState<EntryType | null>(null);
  const [isEditReportDrawerOpen, setIsEditReportDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [isGoalsExpanded, setIsGoalsExpanded] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Get active cycle
      const cycleResponse = await fetch('/api/cycles/active');
      const cycleData = await cycleResponse.json();
      setCycle(cycleData.cycle);

      // Get report
      const reportResponse = await fetch(`/api/reports/${resolvedParams.id}`);
      if (!reportResponse.ok) {
        router.push('/');
        return;
      }
      const reportData = await reportResponse.json();
      setReport(reportData.report);

      // Get entries for this report and cycle
      const entriesResponse = await fetch(
        `/api/reports/${resolvedParams.id}/entries?cycle_id=${cycleData.cycle.id}`
      );
      const entriesData = await entriesResponse.json();
      setEntries(entriesData.entries || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter(entry => entry.entryType === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7C3AED]" />
      </div>
    );
  }

  if (!report || !cycle) {
    return null;
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <ol className="flex items-center text-xs text-[#71717A]">
          <li>
            <Link href="/" className="hover:text-[#18181B] transition-colors">
              Home
            </Link>
          </li>
          <li className="mx-1.5 text-[#D4D4D8]">/</li>
          <li className="text-[#18181B] font-medium">
            {report.firstName} {report.lastName}
          </li>
        </ol>
      </nav>

      {/* Two-column layout for wide screens */}
      <div className="xl:flex xl:gap-8">
        {/* Left Column - Sticky on wide screens */}
        <div className="xl:w-[500px] xl:flex-shrink-0">
          <div className="xl:sticky xl:top-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-lg font-semibold text-[#18181B] tracking-tight">
                {report.firstName} {report.lastName}
              </h1>
              <Button variant="secondary" onClick={() => setIsEditReportDrawerOpen(true)}>
                Edit Report
              </Button>
            </div>

            {/* Development Goals Section */}
            <div className="bg-white rounded-md border border-[#E4E4E7] mb-6 xl:mb-0">
              <button
                type="button"
                onClick={() => setIsGoalsExpanded(!isGoalsExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#FAFAFA] transition-colors rounded-md"
              >
                <h2 className="text-sm font-semibold text-[#18181B] tracking-tight">Development Goals</h2>
                <svg
                  className={`w-4 h-4 text-[#71717A] transition-transform duration-200 ${isGoalsExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isGoalsExpanded && (
                <ScrollArea maxHeight="calc(100vh - 220px)" className="px-4 pb-4">
                  {report.developmentGoals ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{report.developmentGoals}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm text-[#71717A] italic">
                      No development goals set. Use Edit Report to add.
                    </p>
                  )}
                </ScrollArea>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Entries */}
        <div className="xl:flex-1 xl:min-w-0">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-sm font-semibold text-[#18181B] tracking-tight">Entries</h2>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as EntryType | 'all')}
                  className="px-3 py-1.5 text-sm border border-[#E4E4E7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#DDD6FE] focus:border-[#8B5CF6] bg-white transition-colors min-h-[36px]"
                >
                  {ENTRY_TYPE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-[#71717A]">
                  {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              <Dropdown
                trigger={
                  <Button>
                    Add Entry
                    <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                }
                options={ENTRY_TYPES}
                onSelect={(value) => {
                  setSelectedEntryType(value as EntryType);
                  setIsAddEntryDrawerOpen(true);
                }}
              />
            </div>

            {filteredEntries.length === 0 ? (
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-4 text-sm font-medium text-[#18181B]">
                  {filter === 'all' ? 'No entries yet' : `No ${ENTRY_TYPE_OPTIONS.find(o => o.value === filter)?.label.toLowerCase()} entries yet`}
                </h3>
                <p className="mt-1 text-sm text-[#71717A]">
                  Start tracking by adding your first entry.
                </p>
                <div className="mt-6">
                  <Dropdown
                    trigger={
                      <Button>
                        Add Entry
                        <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>
                    }
                    options={ENTRY_TYPES}
                    onSelect={(value) => {
                      setSelectedEntryType(value as EntryType);
                      setIsAddEntryDrawerOpen(true);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={() => {
                      setEditingEntry(entry);
                      setSelectedEntryType(entry.entryType);
                      setIsAddEntryDrawerOpen(true);
                    }}
                    onDelete={fetchData}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer for adding/editing entries */}
      {selectedEntryType && (
        <AddEntryDrawer
          isOpen={isAddEntryDrawerOpen}
          onClose={() => {
            setIsAddEntryDrawerOpen(false);
            setSelectedEntryType(null);
            setEditingEntry(null);
          }}
          onSuccess={fetchData}
          reportId={report.id}
          cycleId={cycle.id}
          entryType={editingEntry?.entryType || selectedEntryType}
          editEntry={editingEntry}
        />
      )}

      <EditReportDrawer
        isOpen={isEditReportDrawerOpen}
        onClose={() => setIsEditReportDrawerOpen(false)}
        onSuccess={fetchData}
        onDelete={() => router.push('/')}
        report={report}
      />
    </div>
  );
}
