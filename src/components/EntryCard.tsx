'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { EntryBadge } from './EntryBadge';
import { Button } from './Button';
import { Modal } from './Modal';
import { useToast } from './Toast';
import type { Entry } from '@/db';

interface EntryCardProps {
  entry: Entry;
  onEdit: () => void;
  onDelete: () => void;
  readOnly?: boolean;
}

export function EntryCard({ entry, onEdit, onDelete, readOnly = false }: EntryCardProps) {
  const { showToast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isOptimisticallyDeleted, setIsOptimisticallyDeleted] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDelete = async () => {
    // Optimistic UI: immediately close modal and hide the card
    setIsDeleteModalOpen(false);
    setIsOptimisticallyDeleted(true);

    try {
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      showToast('Entry deleted', 'success');
      onDelete();
    } catch (error) {
      // Restore the card on failure
      setIsOptimisticallyDeleted(false);
      showToast('Failed to delete entry. Please try again.', 'error');
    }
  };

  const renderContent = () => {
    switch (entry.entryType) {
      case 'feedback':
        return (
          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-[#71717A]">Situation</span>
              <p className="text-sm text-[#3F3F46] mt-0.5">{entry.situation}</p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-[#71717A]">Behavior</span>
              <p className="text-sm text-[#3F3F46] mt-0.5">{entry.behavior}</p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-[#71717A]">Impact</span>
              <p className="text-sm text-[#3F3F46] mt-0.5">{entry.impact}</p>
            </div>
            {entry.notes && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-[#71717A]">Notes</span>
                <div className="prose prose-sm mt-0.5 max-w-none text-[#3F3F46]">
                  <ReactMarkdown>{entry.notes}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        );

      case 'kudos':
        return (
          <div className="space-y-2">
            {entry.link && (
              <div>
                <a
                  href={entry.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7C3AED] hover:text-[#6D28D9] hover:underline text-sm break-all"
                >
                  {entry.link}
                </a>
              </div>
            )}
            <div className="prose prose-sm max-w-none text-[#3F3F46]">
              <ReactMarkdown>{entry.notes || ''}</ReactMarkdown>
            </div>
          </div>
        );

      case 'third_party_feedback':
        return (
          <div className="space-y-2">
            <p className="text-sm text-[#71717A]">
              From: <span className="font-medium text-[#18181B]">{entry.providerName}</span>
            </p>
            <div className="prose prose-sm max-w-none text-[#3F3F46]">
              <ReactMarkdown>{entry.notes || ''}</ReactMarkdown>
            </div>
          </div>
        );

      default:
        return (
          <div className="prose prose-sm max-w-none text-[#3F3F46]">
            <ReactMarkdown>{entry.notes || ''}</ReactMarkdown>
          </div>
        );
    }
  };

  // Hide the card when optimistically deleted
  if (isOptimisticallyDeleted) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-md border border-[#E4E4E7] p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <EntryBadge entryType={entry.entryType} feedbackType={entry.feedbackType} />
            <span className="text-xs text-[#71717A]">
              {formatDate(entry.createdAt)} at {formatTime(entry.createdAt)}
            </span>
          </div>
          {!readOnly && (
            <div className="flex gap-0.5">
              <button
                onClick={onEdit}
                className="p-2 text-[#A1A1AA] hover:text-[#52525B] hover:bg-[#F4F4F5] rounded transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Edit entry"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 text-[#A1A1AA] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Delete entry"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
        {renderContent()}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Entry"
        role="alertdialog"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#52525B]">
            Are you sure you want to delete this entry? This action cannot be undone.
          </p>
          <div className="p-3 bg-[#FAFAFA] rounded-md border border-[#F4F4F5]">
            <EntryBadge entryType={entry.entryType} feedbackType={entry.feedbackType} />
            <p className="mt-2 text-sm text-[#52525B] line-clamp-2">
              {entry.notes || entry.situation || ''}
            </p>
          </div>
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
