'use client';

import { useState, useEffect } from 'react';
import { Drawer } from './Drawer';
import { Button } from './Button';
import { MarkdownEditor } from './MarkdownEditor';
import { useToast } from './Toast';
import type { EntryType, FeedbackType, Entry } from '@/db';

interface AddEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reportId: string;
  cycleId: string;
  entryType: EntryType;
  editEntry?: Entry | null;
}

const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  feedback: 'Feedback',
  accomplishment: 'Accomplishment',
  kudos: 'Kudos',
  notes: 'Note',
  career_conversation: 'Career Conversation',
  third_party_feedback: 'Third-Party Feedback',
};

export function AddEntryDrawer({
  isOpen,
  onClose,
  onSuccess,
  reportId,
  cycleId,
  entryType,
  editEntry,
}: AddEntryDrawerProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form fields
  const [feedbackType, setFeedbackType] = useState<FeedbackType | ''>('');
  const [situation, setSituation] = useState('');
  const [behavior, setBehavior] = useState('');
  const [impact, setImpact] = useState('');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const [providerName, setProviderName] = useState('');

  const isEditing = !!editEntry;

  useEffect(() => {
    if (isOpen) {
      if (editEntry) {
        setFeedbackType(editEntry.feedbackType || '');
        setSituation(editEntry.situation || '');
        setBehavior(editEntry.behavior || '');
        setImpact(editEntry.impact || '');
        setNotes(editEntry.notes || '');
        setLink(editEntry.link || '');
        setProviderName(editEntry.providerName || '');
        setHasChanges(false);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editEntry]);

  const resetForm = () => {
    setFeedbackType('');
    setSituation('');
    setBehavior('');
    setImpact('');
    setNotes('');
    setLink('');
    setProviderName('');
    setHasChanges(false);
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to discard them?');
      if (!confirmed) return;
    }
    onClose();
  };

  const isValidUrl = (url: string) => {
    if (!url.trim()) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isFormValid = () => {
    switch (entryType) {
      case 'feedback':
        return (
          feedbackType !== '' &&
          situation.trim().length >= 1 && situation.length <= 1000 &&
          behavior.trim().length >= 1 && behavior.length <= 1000 &&
          impact.trim().length >= 1 && impact.length <= 1000 &&
          notes.length <= 2000
        );
      case 'kudos':
        return (
          notes.trim().length >= 1 && notes.length <= 5000 &&
          isValidUrl(link) && link.length <= 500
        );
      case 'third_party_feedback':
        return (
          providerName.trim().length >= 1 && providerName.trim().length <= 100 &&
          notes.trim().length >= 1 && notes.length <= 5000
        );
      default:
        return notes.trim().length >= 1 && notes.length <= 5000;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    try {
      const url = isEditing ? `/api/entries/${editEntry.id}` : '/api/entries';
      const method = isEditing ? 'PUT' : 'POST';

      const body: Record<string, unknown> = {
        report_id: reportId,
        cycle_id: cycleId,
        entry_type: entryType,
      };

      switch (entryType) {
        case 'feedback':
          body.feedback_type = feedbackType;
          body.situation = situation.trim();
          body.behavior = behavior.trim();
          body.impact = impact.trim();
          body.notes = notes.trim() || null;
          break;
        case 'kudos':
          body.notes = notes.trim();
          body.link = link.trim() || null;
          break;
        case 'third_party_feedback':
          body.provider_name = providerName.trim();
          body.notes = notes.trim();
          break;
        default:
          body.notes = notes.trim();
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save entry');
      }

      const entryLabel = ENTRY_TYPE_LABELS[entryType];
      showToast(`${entryLabel} ${isEditing ? 'updated' : 'added'} successfully`, 'success');
      onSuccess();
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const typeLabel = ENTRY_TYPE_LABELS[entryType];
    return `${isEditing ? 'Edit' : 'Add'} ${typeLabel}`;
  };

  const inputClassName = "w-full px-3 py-2 text-sm border border-[#E4E4E7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#DDD6FE] focus:border-[#8B5CF6] transition-colors placeholder:text-[#A1A1AA]";
  const textareaClassName = "w-full px-3 py-2 text-sm border border-[#E4E4E7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#DDD6FE] focus:border-[#8B5CF6] transition-colors placeholder:text-[#A1A1AA] resize-none";

  const renderFeedbackForm = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-[#3F3F46] mb-2">Feedback Type</label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="feedbackType"
              value="positive"
              checked={feedbackType === 'positive'}
              onChange={(e) => { setFeedbackType(e.target.value as FeedbackType); setHasChanges(true); }}
              className="h-4 w-4 text-[#7C3AED] focus:ring-[#8B5CF6] border-[#D4D4D8]"
            />
            <span className="ml-2 text-sm text-[#3F3F46]">Positive</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="feedbackType"
              value="constructive"
              checked={feedbackType === 'constructive'}
              onChange={(e) => { setFeedbackType(e.target.value as FeedbackType); setHasChanges(true); }}
              className="h-4 w-4 text-[#7C3AED] focus:ring-[#8B5CF6] border-[#D4D4D8]"
            />
            <span className="ml-2 text-sm text-[#3F3F46]">Constructive</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="situation" className="block text-sm font-medium text-[#3F3F46] mb-1">
          Situation
        </label>
        <p className="text-xs text-[#71717A] mb-1.5">
          Describe the specific context—when and where this occurred
        </p>
        <textarea
          id="situation"
          value={situation}
          onChange={(e) => { setSituation(e.target.value); setHasChanges(true); }}
          rows={4}
          className={textareaClassName}
        />
        <p className={`text-xs mt-1 text-right ${situation.length > 1000 ? 'text-[#DC2626]' : 'text-[#71717A]'}`}>
          {situation.length} / 1000
        </p>
      </div>

      <div>
        <label htmlFor="behavior" className="block text-sm font-medium text-[#3F3F46] mb-1">
          Behavior
        </label>
        <p className="text-xs text-[#71717A] mb-1.5">
          Describe the specific, observable action (not your interpretation)
        </p>
        <textarea
          id="behavior"
          value={behavior}
          onChange={(e) => { setBehavior(e.target.value); setHasChanges(true); }}
          rows={4}
          className={textareaClassName}
        />
        <p className={`text-xs mt-1 text-right ${behavior.length > 1000 ? 'text-[#DC2626]' : 'text-[#71717A]'}`}>
          {behavior.length} / 1000
        </p>
      </div>

      <div>
        <label htmlFor="impact" className="block text-sm font-medium text-[#3F3F46] mb-1">
          Impact
        </label>
        <p className="text-xs text-[#71717A] mb-1.5">
          Describe the effect on you, the team, or outcomes
        </p>
        <textarea
          id="impact"
          value={impact}
          onChange={(e) => { setImpact(e.target.value); setHasChanges(true); }}
          rows={4}
          className={textareaClassName}
        />
        <p className={`text-xs mt-1 text-right ${impact.length > 1000 ? 'text-[#DC2626]' : 'text-[#71717A]'}`}>
          {impact.length} / 1000
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#3F3F46] mb-1.5">
          Additional notes (optional)
        </label>
        <MarkdownEditor
          value={notes}
          onChange={(value) => { setNotes(value); setHasChanges(true); }}
          rows={6}
          maxLength={2000}
        />
      </div>
    </>
  );

  const renderKudosForm = () => (
    <>
      <div>
        <label htmlFor="link" className="block text-sm font-medium text-[#3F3F46] mb-1.5">
          Link to kudos (optional)
        </label>
        <input
          type="url"
          id="link"
          value={link}
          onChange={(e) => { setLink(e.target.value); setHasChanges(true); }}
          className={`${inputClassName} ${link && !isValidUrl(link) ? 'border-[#DC2626]' : ''}`}
          placeholder="https://..."
        />
        {link && !isValidUrl(link) && (
          <p className="text-xs text-[#DC2626] mt-1">Please enter a valid URL</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#3F3F46] mb-1.5">
          Describe the kudos
        </label>
        <MarkdownEditor
          value={notes}
          onChange={(value) => { setNotes(value); setHasChanges(true); }}
          rows={12}
          maxLength={5000}
        />
      </div>
    </>
  );

  const renderThirdPartyFeedbackForm = () => (
    <>
      <div>
        <label htmlFor="providerName" className="block text-sm font-medium text-[#3F3F46] mb-1.5">
          Who provided this feedback?
        </label>
        <input
          type="text"
          id="providerName"
          value={providerName}
          onChange={(e) => { setProviderName(e.target.value); setHasChanges(true); }}
          className={inputClassName}
        />
        <p className={`text-xs mt-1 text-right ${providerName.trim().length > 100 ? 'text-[#DC2626]' : 'text-[#71717A]'}`}>
          {providerName.trim().length} / 100
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#3F3F46] mb-1.5">
          Feedback content
        </label>
        <MarkdownEditor
          value={notes}
          onChange={(value) => { setNotes(value); setHasChanges(true); }}
          rows={12}
          maxLength={5000}
        />
      </div>
    </>
  );

  const renderSimpleForm = (label: string) => (
    <div>
      <label className="block text-sm font-medium text-[#3F3F46] mb-1.5">
        {label}
      </label>
      <MarkdownEditor
        value={notes}
        onChange={(value) => { setNotes(value); setHasChanges(true); }}
        rows={14}
        maxLength={5000}
      />
    </div>
  );

  const renderForm = () => {
    switch (entryType) {
      case 'feedback':
        return renderFeedbackForm();
      case 'kudos':
        return renderKudosForm();
      case 'third_party_feedback':
        return renderThirdPartyFeedbackForm();
      case 'accomplishment':
        return renderSimpleForm('What did they accomplish?');
      case 'notes':
        return renderSimpleForm('Note');
      case 'career_conversation':
        return renderSimpleForm('Conversation notes');
      default:
        return null;
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title={getTitle()} width="xl">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 space-y-5">
          {renderForm()}
        </div>

        <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-[#F4F4F5]">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!isFormValid()}>
            Save
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
