'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import type { Cycle } from '@/db';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [activeCycle, setActiveCycle] = useState<Cycle | null>(null);
  const [archivedCycles, setArchivedCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [newCycleName, setNewCycleName] = useState('');
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState('');

  // Backup/restore state
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      // Get active cycle
      const activeResponse = await fetch('/api/cycles/active');
      const activeData = await activeResponse.json();
      setActiveCycle(activeData.cycle);

      // Get all cycles to filter archived
      const allResponse = await fetch('/api/cycles');
      const allData = await allResponse.json();
      const archived = allData.cycles
        .filter((c: Cycle) => c.status === 'archived')
        .sort((a: Cycle, b: Cycle) => {
          if (!a.endDate) return 1;
          if (!b.endDate) return -1;
          return b.endDate.localeCompare(a.endDate);
        });
      setArchivedCycles(archived);
    } catch (error) {
      console.error('Error fetching cycles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleArchive = async () => {
    const trimmedName = newCycleName.trim();

    if (!trimmedName) {
      setArchiveError('New cycle name is required');
      return;
    }

    if (trimmedName.length > 50) {
      setArchiveError('Cycle name must be between 1 and 50 characters');
      return;
    }

    setArchiving(true);
    setArchiveError('');

    try {
      const response = await fetch('/api/cycles/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_cycle_name: trimmedName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to archive cycle');
      }

      const data = await response.json();
      showToast(`Cycle archived successfully. New cycle '${data.new.name}' is now active.`, 'success');
      setIsArchiveModalOpen(false);
      setNewCycleName('');
      fetchData();
    } catch (error) {
      if (error instanceof Error) {
        setArchiveError(error.message);
      } else {
        setArchiveError('Something went wrong. Please try again.');
      }
    } finally {
      setArchiving(false);
    }
  };

  const handleCloseArchiveModal = () => {
    setIsArchiveModalOpen(false);
    setNewCycleName('');
    setArchiveError('');
  };

  const handleDownloadBackup = async () => {
    try {
      const response = await fetch('/api/backup');
      if (!response.ok) {
        throw new Error('Failed to create backup');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tpd-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('Backup downloaded successfully', 'success');
    } catch (error) {
      showToast('Failed to download backup', 'error');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        showToast('Please select a valid JSON backup file', 'error');
        return;
      }
      setSelectedFile(file);
      setIsRestoreModalOpen(true);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) return;

    setRestoring(true);
    try {
      const content = await selectedFile.text();
      const backup = JSON.parse(content);

      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backup),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to restore backup');
      }

      const data = await response.json();
      showToast(`Backup restored: ${data.stats.reports} reports, ${data.stats.entries} entries`, 'success');
      setIsRestoreModalOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchData();
    } catch (error) {
      if (error instanceof SyntaxError) {
        showToast('Invalid backup file format', 'error');
      } else if (error instanceof Error) {
        showToast(error.message, 'error');
      } else {
        showToast('Failed to restore backup', 'error');
      }
    } finally {
      setRestoring(false);
    }
  };

  const handleCloseRestoreModal = () => {
    setIsRestoreModalOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-[#18181B] tracking-tight mb-6">Settings</h1>

      {/* Current Cycle Section */}
      <div className="bg-white rounded-md border border-[#E4E4E7] p-5 mb-6">
        <h2 className="text-base font-semibold text-[#18181B] tracking-tight mb-4">Current Cycle</h2>

        {activeCycle ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-[#18181B]">{activeCycle.name}</span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                Active
              </span>
            </div>
            <p className="text-sm text-[#71717A]">
              Started: {formatDate(activeCycle.startDate)}
            </p>
            <div className="pt-3">
              <Button onClick={() => setIsArchiveModalOpen(true)}>
                Archive & Start New Cycle
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-[#52525B] mb-4">No active cycle found.</p>
            <Button onClick={fetchData}>Create Cycle</Button>
          </div>
        )}
      </div>

      {/* Archived Cycles Section */}
      <div className="bg-white rounded-md border border-[#E4E4E7] p-5 mb-6">
        <h2 className="text-base font-semibold text-[#18181B] tracking-tight mb-4">Archived Cycles</h2>

        {archivedCycles.length === 0 ? (
          <p className="text-sm text-[#71717A] italic">No archived cycles yet</p>
        ) : (
          <div className="space-y-2">
            {archivedCycles.map((cycle) => (
              <Link
                key={cycle.id}
                href={`/cycles/${cycle.id}`}
                className="block p-3 border border-[#E4E4E7] rounded-md hover:border-[#D4D4D8] hover:bg-[#FAFAFA] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-[#18181B]">{cycle.name}</span>
                    <p className="text-xs text-[#71717A] mt-0.5">
                      {formatDate(cycle.startDate)} – {cycle.endDate ? formatDate(cycle.endDate) : 'Present'}
                    </p>
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
            ))}
          </div>
        )}
      </div>

      {/* Data Backup Section */}
      <div className="bg-white rounded-md border border-[#E4E4E7] p-5">
        <h2 className="text-base font-semibold text-[#18181B] tracking-tight mb-2">Data Backup</h2>
        <p className="text-sm text-[#71717A] mb-4">
          Download a backup of all your data or restore from a previous backup.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleDownloadBackup}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Backup
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Restore from Backup
          </Button>
        </div>

        <div className="mt-4 p-3 bg-[#F4F4F5] rounded-md">
          <p className="text-xs text-[#52525B]">
            <strong>Tip:</strong> Download a backup regularly and save it to a safe location (iCloud, Dropbox, Google Drive, etc.) to protect your data.
          </p>
        </div>
      </div>

      {/* Archive Modal */}
      <Modal
        isOpen={isArchiveModalOpen}
        onClose={handleCloseArchiveModal}
        title="Archive & Start New Cycle"
      >
        <div className="space-y-4">
          <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-md">
            <p className="text-sm text-[#D97706]">
              This will archive all current entries and development goals. This action cannot be undone.
            </p>
          </div>

          <div>
            <label htmlFor="newCycleName" className="block text-sm font-medium text-[#3F3F46] mb-1.5">
              New cycle name
            </label>
            <input
              type="text"
              id="newCycleName"
              value={newCycleName}
              onChange={(e) => {
                setNewCycleName(e.target.value);
                setArchiveError('');
              }}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DDD6FE] transition-colors placeholder:text-[#A1A1AA] ${
                archiveError ? 'border-[#DC2626] focus:border-[#DC2626]' : 'border-[#E4E4E7] focus:border-[#8B5CF6]'
              }`}
              placeholder="e.g., H1 2025, Q2 Review"
            />
            {archiveError && (
              <p className="mt-1 text-xs text-[#DC2626]">{archiveError}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#F4F4F5]">
            <Button variant="secondary" onClick={handleCloseArchiveModal}>
              Cancel
            </Button>
            <Button
              onClick={handleArchive}
              loading={archiving}
              disabled={!newCycleName.trim()}
            >
              Archive & Start New
            </Button>
          </div>
        </div>
      </Modal>

      {/* Restore Modal */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={handleCloseRestoreModal}
        title="Restore from Backup"
        role="alertdialog"
      >
        <div className="space-y-4">
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-md">
            <p className="text-sm text-[#B91C1C]">
              <strong>Warning:</strong> This will replace ALL current data with the backup. This action cannot be undone.
            </p>
          </div>

          {selectedFile && (
            <div className="p-3 bg-[#F4F4F5] rounded-md">
              <p className="text-sm text-[#52525B]">
                <strong>File:</strong> {selectedFile.name}
              </p>
              <p className="text-xs text-[#71717A] mt-1">
                Size: {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-[#F4F4F5]">
            <Button variant="secondary" onClick={handleCloseRestoreModal}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRestore}
              loading={restoring}
            >
              Restore Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
