'use client';

import { useState, useEffect } from 'react';
import { Drawer } from './Drawer';
import { Modal } from './Modal';
import { Button } from './Button';
import { useToast } from './Toast';
import type { Report } from '@/db';

interface EditReportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
  report: Report;
}

export function EditReportDrawer({ isOpen, onClose, onSuccess, onDelete, report }: EditReportDrawerProps) {
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [developmentGoals, setDevelopmentGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [entryCount, setEntryCount] = useState(0);

  useEffect(() => {
    if (isOpen && report) {
      setFirstName(report.firstName);
      setLastName(report.lastName);
      setDevelopmentGoals(report.developmentGoals || '');
      setErrors({});
      setHasChanges(false);
      fetchEntryCount();
    }
  }, [isOpen, report]);

  const fetchEntryCount = async () => {
    try {
      const response = await fetch(`/api/reports/${report.id}/entries`);
      const data = await response.json();
      setEntryCount(data.entries?.length || 0);
    } catch (error) {
      console.error('Error fetching entry count:', error);
    }
  };

  useEffect(() => {
    if (report) {
      const changed = firstName !== report.firstName ||
        lastName !== report.lastName ||
        developmentGoals !== (report.developmentGoals || '');
      setHasChanges(changed);
    }
  }, [firstName, lastName, developmentGoals, report]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst) {
      newErrors.firstName = 'First name is required';
    } else if (trimmedFirst.length > 50) {
      newErrors.firstName = 'First name must be between 1 and 50 characters';
    }

    if (!trimmedLast) {
      newErrors.lastName = 'Last name is required';
    } else if (trimmedLast.length > 50) {
      newErrors.lastName = 'Last name must be between 1 and 50 characters';
    }

    if (developmentGoals.length > 5000) {
      newErrors.developmentGoals = 'Development goals must be at most 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to discard them?');
      if (!confirmed) return;
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          development_goals: developmentGoals || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update report');
      }

      showToast('Report updated successfully', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      showToast('Report deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      onClose();
      onDelete();
    } catch (error) {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const isValid = firstName.trim().length >= 1 && firstName.trim().length <= 50 &&
    lastName.trim().length >= 1 && lastName.trim().length <= 50 &&
    developmentGoals.length <= 5000;

  return (
    <>
      <Drawer isOpen={isOpen} onClose={handleClose} title="Edit Report" width="xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[#3F3F46] mb-1.5">
                  First name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DDD6FE] transition-colors ${
                    errors.firstName ? 'border-[#DC2626] focus:border-[#DC2626]' : 'border-[#E4E4E7] focus:border-[#8B5CF6]'
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-[#DC2626]">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[#3F3F46] mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DDD6FE] transition-colors ${
                    errors.lastName ? 'border-[#DC2626] focus:border-[#DC2626]' : 'border-[#E4E4E7] focus:border-[#8B5CF6]'
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-[#DC2626]">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 mt-4">
              <label htmlFor="developmentGoals" className="block text-sm font-medium text-[#3F3F46] mb-1.5">
                Development goals (optional)
              </label>
              <textarea
                id="developmentGoals"
                value={developmentGoals}
                onChange={(e) => setDevelopmentGoals(e.target.value)}
                className={`w-full flex-1 min-h-[150px] px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DDD6FE] transition-colors resize-none ${
                  errors.developmentGoals ? 'border-[#DC2626] focus:border-[#DC2626]' : 'border-[#E4E4E7] focus:border-[#8B5CF6]'
                }`}
                placeholder="Markdown supported"
              />
              <div className="flex justify-between mt-1">
                {errors.developmentGoals && (
                  <p className="text-xs text-[#DC2626]">{errors.developmentGoals}</p>
                )}
                <p className={`text-xs ml-auto ${developmentGoals.length > 5000 ? 'text-[#DC2626]' : 'text-[#71717A]'}`}>
                  {developmentGoals.length} / 5000
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 mt-6 border-t border-[#F4F4F5]">
            <Button
              type="button"
              variant="danger"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Report
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading} disabled={!isValid}>
                Save
              </Button>
            </div>
          </div>
        </form>
      </Drawer>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Report"
        role="alertdialog"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#52525B]">
            Are you sure you want to delete <strong className="text-[#18181B]">{report.firstName} {report.lastName}</strong>?
          </p>
          <p className="text-sm text-[#52525B]">
            This will permanently delete this report and all their entries across all cycles. This action cannot be undone.
          </p>
          {entryCount > 0 && (
            <p className="text-sm text-[#DC2626]">
              {entryCount} {entryCount === 1 ? 'entry' : 'entries'} will be deleted.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t border-[#F4F4F5]">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
