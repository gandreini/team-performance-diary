'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useToast } from './Toast';
import type { EntryType, FeedbackType, Entry } from '@/db';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reportId: string;
  cycleId: string;
  editEntry?: Entry | null;
}

const ENTRY_TYPES: { value: EntryType; label: string }[] = [
  { value: 'feedback', label: 'Feedback' },
  { value: 'accomplishment', label: 'Accomplishment' },
  { value: 'kudos', label: 'Kudos' },
  { value: 'notes', label: 'Notes' },
  { value: 'career_conversation', label: 'Career Conversation' },
  { value: 'third_party_feedback', label: 'Third-Party Feedback' },
];

export function AddEntryModal({
  isOpen,
  onClose,
  onSuccess,
  reportId,
  cycleId,
  editEntry,
}: AddEntryModalProps) {
  const { showToast } = useToast();
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [entryType, setEntryType] = useState<EntryType | null>(null);
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
        // Editing mode
        setStep('form');
        setEntryType(editEntry.entryType);
        setFeedbackType(editEntry.feedbackType || '');
        setSituation(editEntry.situation || '');
        setBehavior(editEntry.behavior || '');
        setImpact(editEntry.impact || '');
        setNotes(editEntry.notes || '');
        setLink(editEntry.link || '');
        setProviderName(editEntry.providerName || '');
        setHasChanges(false);
      } else {
        // Adding mode
        setStep('select');
        setEntryType(null);
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

  const handleTypeSelect = (type: EntryType) => {
    setEntryType(type);
    setStep('form');
  };

  const getMaxNotesLength = () => {
    return entryType === 'feedback' ? 2000 : 5000;
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
    if (!entryType) return false;

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
    if (!isFormValid() || !entryType) return;

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

      const entryLabel = ENTRY_TYPES.find(t => t.value === entryType)?.label || 'Entry';
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
    if (step === 'select') return 'Add Entry';
    if (!entryType) return 'Add Entry';

    const typeLabel = ENTRY_TYPES.find(t => t.value === entryType)?.label || 'Entry';
    if (entryType === 'notes') {
      return isEditing ? 'Edit Note' : 'Add Note';
    }
    return `${isEditing ? 'Edit' : 'Add'} ${typeLabel}`;
  };

  const renderTypeSelection = () => (
    <div className="grid grid-cols-2 gap-2">
      {ENTRY_TYPES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleTypeSelect(value)}
          className="p-3 text-left border border-[#E5E7EB] rounded-md hover:border-[#8B5CF6] hover:bg-[#F5F3FF] transition-colors"
        >
          <span className="text-sm font-medium text-[#111827]">{label}</span>
        </button>
      ))}
    </div>
  );

  const inputClassName = "w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#DDD6FE] focus:border-[#8B5CF6] transition-colors placeholder:text-[#9CA3AF]";
  const textareaClassName = "w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#DDD6FE] focus:border-[#8B5CF6] transition-colors placeholder:text-[#9CA3AF] resize-none";

  const renderFeedbackForm = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-2">Feedback Type</label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="feedbackType"
              value="positive"
              checked={feedbackType === 'positive'}
              onChange={(e) => { setFeedbackType(e.target.value as FeedbackType); setHasChanges(true); }}
              className="h-4 w-4 text-[#7C3AED] focus:ring-[#8B5CF6] border-[#D1D5DB]"
            />
            <span className="ml-2 text-sm text-[#374151]">Positive</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="feedbackType"
              value="constructive"
              checked={feedbackType === 'constructive'}
              onChange={(e) => { setFeedbackType(e.target.value as FeedbackType); setHasChanges(true); }}
              className="h-4 w-4 text-[#7C3AED] focus:ring-[#8B5CF6] border-[#D1D5DB]"
            />
            <span className="ml-2 text-sm text-[#374151]">Constructive</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="situation" className="block text-sm font-medium text-[#374151] mb-1">
          Situation
        </label>
        <p className="text-xs text-[#6B7280] mb-1.5">
          Describe the specific context—when and where this occurred
        </p>
        <textarea
          id="situation"
          value={situation}
          onChange={(e) => { setSituation(e.target.value); setHasChanges(true); }}
          rows={3}
          className={textareaClassName}
        />
        <p className={`text-xs mt-1 text-right ${situation.length > 1000 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
          {situation.length} / 1000
        </p>
      </div>

      <div>
        <label htmlFor="behavior" className="block text-sm font-medium text-[#374151] mb-1">
          Behavior
        </label>
        <p className="text-xs text-[#6B7280] mb-1.5">
          Describe the specific, observable action (not your interpretation)
        </p>
        <textarea
          id="behavior"
          value={behavior}
          onChange={(e) => { setBehavior(e.target.value); setHasChanges(true); }}
          rows={3}
          className={textareaClassName}
        />
        <p className={`text-xs mt-1 text-right ${behavior.length > 1000 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
          {behavior.length} / 1000
        </p>
      </div>

      <div>
        <label htmlFor="impact" className="block text-sm font-medium text-[#374151] mb-1">
          Impact
        </label>
        <p className="text-xs text-[#6B7280] mb-1.5">
          Describe the effect on you, the team, or outcomes
        </p>
        <textarea
          id="impact"
          value={impact}
          onChange={(e) => { setImpact(e.target.value); setHasChanges(true); }}
          rows={3}
          className={textareaClassName}
        />
        <p className={`text-xs mt-1 text-right ${impact.length > 1000 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
          {impact.length} / 1000
        </p>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-[#374151] mb-1">
          Additional notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setHasChanges(true); }}
          rows={3}
          className={textareaClassName}
          placeholder="Markdown supported"
        />
        <p className={`text-xs mt-1 text-right ${notes.length > 2000 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
          {notes.length} / 2000
        </p>
      </div>
    </>
  );

  const renderKudosForm = () => (
    <>
      <div>
        <label htmlFor="link" className="block text-sm font-medium text-[#374151] mb-1.5">
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
        <label htmlFor="notes" className="block text-sm font-medium text-[#374151] mb-1.5">
          Describe the kudos
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setHasChanges(true); }}
          rows={4}
          className={textareaClassName}
          placeholder="Markdown supported"
        />
        <p className={`text-xs mt-1 text-right ${notes.length > 5000 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
          {notes.length} / 5000
        </p>
      </div>
    </>
  );

  const renderThirdPartyFeedbackForm = () => (
    <>
      <div>
        <label htmlFor="providerName" className="block text-sm font-medium text-[#374151] mb-1.5">
          Who provided this feedback?
        </label>
        <input
          type="text"
          id="providerName"
          value={providerName}
          onChange={(e) => { setProviderName(e.target.value); setHasChanges(true); }}
          className={inputClassName}
        />
        <p className={`text-xs mt-1 text-right ${providerName.trim().length > 100 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
          {providerName.trim().length} / 100
        </p>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-[#374151] mb-1.5">
          Feedback content
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setHasChanges(true); }}
          rows={4}
          className={textareaClassName}
          placeholder="Markdown supported"
        />
        <p className={`text-xs mt-1 text-right ${notes.length > 5000 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
          {notes.length} / 5000
        </p>
      </div>
    </>
  );

  const renderSimpleForm = (label: string, placeholder: string) => (
    <div>
      <label htmlFor="notes" className="block text-sm font-medium text-[#374151] mb-1.5">
        {label}
      </label>
      <textarea
        id="notes"
        value={notes}
        onChange={(e) => { setNotes(e.target.value); setHasChanges(true); }}
        rows={6}
        className={textareaClassName}
        placeholder={placeholder}
      />
      <p className={`text-xs mt-1 text-right ${notes.length > 5000 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
        {notes.length} / 5000
      </p>
    </div>
  );

  const renderForm = () => {
    if (!entryType) return null;

    switch (entryType) {
      case 'feedback':
        return renderFeedbackForm();
      case 'kudos':
        return renderKudosForm();
      case 'third_party_feedback':
        return renderThirdPartyFeedbackForm();
      case 'accomplishment':
        return renderSimpleForm('What did they accomplish?', 'Markdown supported');
      case 'notes':
        return renderSimpleForm('Note', 'Markdown supported');
      case 'career_conversation':
        return renderSimpleForm('Conversation notes', 'Markdown supported');
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()}>
      {step === 'select' ? (
        renderTypeSelection()
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderForm()}
          <div className="flex justify-end gap-2 pt-4 border-t border-[#F3F4F6]">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={!isFormValid()}>
              Save
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
