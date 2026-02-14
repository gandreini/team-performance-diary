'use client';

import { useState, useEffect } from 'react';
import { Drawer } from './Drawer';
import { Button } from './Button';
import { MarkdownEditor } from './MarkdownEditor';
import { AiTextImprove } from './AiTextImprove';
import { GoalLinkSelector } from './GoalLinkSelector';
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
  const [title, setTitle] = useState('');
  const [linkedGoalIds, setLinkedGoalIds] = useState<string[]>([]);

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
        setTitle(editEntry.title || '');
        setHasChanges(false);

        // Fetch linked goals for this entry
        fetch(`/api/entries/${editEntry.id}`)
          .then(res => res.json())
          .then(data => {
            setLinkedGoalIds(data.linkedGoalIds || []);
          })
          .catch(console.error);
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
    setTitle('');
    setLinkedGoalIds([]);
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
      case 'accomplishment':
        return (
          notes.trim().length >= 1 && notes.length <= 5000 &&
          title.length <= 200
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
        case 'accomplishment':
          body.title = title.trim() || null;
          body.notes = notes.trim();
          break;
        default:
          body.notes = notes.trim();
      }

      // Include linked goals when editing
      if (isEditing && linkedGoalIds.length > 0) {
        body.goal_ids = linkedGoalIds;
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

  const inputClassName = "w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#DDD6FE] focus:border-[#8B5CF6] transition-colors placeholder:text-[#9CA3AF]";
  const textareaClassName = "w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#DDD6FE] focus:border-[#8B5CF6] transition-colors placeholder:text-[#9CA3AF] resize-none";

  const renderFeedbackForm = () => (
    <div className="flex flex-col h-full gap-6">
      <div className="flex-shrink-0">
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

      <div className="flex-shrink-0">
        <label htmlFor="situation" className="block text-sm font-medium text-[#374151] mb-1">
          Situation
        </label>
        <p className="text-xs text-[#6B7280] mb-1.5">
          Describe the specific context—when and where this occurred
        </p>
        <AiTextImprove value={situation} onChange={(v) => { setSituation(v); setHasChanges(true); }} context="feedback situation" maxLength={1000}>
          <textarea
            id="situation"
            value={situation}
            onChange={(e) => { setSituation(e.target.value); setHasChanges(true); }}
            rows={4}
            className={textareaClassName}
          />
        </AiTextImprove>
        <p className={`text-xs mt-1 text-right ${situation.length > 1000 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
          {situation.length} / 1000
        </p>
      </div>

      <div className="flex-shrink-0">
        <label htmlFor="behavior" className="block text-sm font-medium text-[#374151] mb-1">
          Behavior
        </label>
        <p className="text-xs text-[#6B7280] mb-1.5">
          Describe the specific, observable action (not your interpretation)
        </p>
        <AiTextImprove value={behavior} onChange={(v) => { setBehavior(v); setHasChanges(true); }} context="feedback behavior observation" maxLength={1000}>
          <textarea
            id="behavior"
            value={behavior}
            onChange={(e) => { setBehavior(e.target.value); setHasChanges(true); }}
            rows={4}
            className={textareaClassName}
          />
        </AiTextImprove>
        <p className={`text-xs mt-1 text-right ${behavior.length > 1000 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
          {behavior.length} / 1000
        </p>
      </div>

      <div className="flex-shrink-0">
        <label htmlFor="impact" className="block text-sm font-medium text-[#374151] mb-1">
          Impact
        </label>
        <p className="text-xs text-[#6B7280] mb-1.5">
          Describe the effect on you, the team, or outcomes
        </p>
        <AiTextImprove value={impact} onChange={(v) => { setImpact(v); setHasChanges(true); }} context="feedback impact description" maxLength={1000}>
          <textarea
            id="impact"
            value={impact}
            onChange={(e) => { setImpact(e.target.value); setHasChanges(true); }}
            rows={4}
            className={textareaClassName}
          />
        </AiTextImprove>
        <p className={`text-xs mt-1 text-right ${impact.length > 1000 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
          {impact.length} / 1000
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <label className="block text-sm font-medium text-[#374151] mb-1.5 flex-shrink-0">
          Additional notes (optional)
        </label>
        <MarkdownEditor
          value={notes}
          onChange={(value) => { setNotes(value); setHasChanges(true); }}
          maxLength={2000}
          fillHeight
          aiContext="feedback additional notes"
        />
      </div>
    </div>
  );

  const renderKudosForm = () => (
    <div className="flex flex-col h-full gap-6">
      <div className="flex-shrink-0">
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

      <div className="flex-1 flex flex-col min-h-0">
        <label className="block text-sm font-medium text-[#374151] mb-1.5 flex-shrink-0">
          Describe the kudos
        </label>
        <MarkdownEditor
          value={notes}
          onChange={(value) => { setNotes(value); setHasChanges(true); }}
          maxLength={5000}
          fillHeight
          aiContext="kudos description"
        />
      </div>
    </div>
  );

  const renderThirdPartyFeedbackForm = () => (
    <div className="flex flex-col h-full gap-6">
      <div className="flex-shrink-0">
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

      <div className="flex-1 flex flex-col min-h-0">
        <label className="block text-sm font-medium text-[#374151] mb-1.5 flex-shrink-0">
          Feedback content
        </label>
        <MarkdownEditor
          value={notes}
          onChange={(value) => { setNotes(value); setHasChanges(true); }}
          maxLength={5000}
          fillHeight
          aiContext="third-party feedback content"
        />
      </div>
    </div>
  );

  const renderSimpleForm = (label: string, context: string) => (
    <div className="flex flex-col h-full">
      <label className="block text-sm font-medium text-[#374151] mb-1.5 flex-shrink-0">
        {label}
      </label>
      <MarkdownEditor
        value={notes}
        onChange={(value) => { setNotes(value); setHasChanges(true); }}
        maxLength={5000}
        fillHeight
        aiContext={context}
      />
    </div>
  );

  const renderAccomplishmentForm = () => (
    <div className="flex flex-col h-full gap-6">
      <div className="flex-shrink-0">
        <label htmlFor="title" className="block text-sm font-medium text-[#374151] mb-1.5">
          Title (optional)
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setHasChanges(true); }}
          className={inputClassName}
          placeholder="Brief title for this accomplishment"
        />
        <p className={`text-xs mt-1 text-right ${title.length > 200 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
          {title.length} / 200
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <label className="block text-sm font-medium text-[#374151] mb-1.5 flex-shrink-0">
          What did they accomplish?
        </label>
        <MarkdownEditor
          value={notes}
          onChange={(value) => { setNotes(value); setHasChanges(true); }}
          maxLength={5000}
          fillHeight
          aiContext="accomplishment description"
        />
      </div>
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
        return renderAccomplishmentForm();
      case 'notes':
        return renderSimpleForm('Note', 'performance note');
      case 'career_conversation':
        return renderSimpleForm('Conversation notes', 'career conversation notes');
      default:
        return null;
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title={getTitle()} width="xl">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 min-h-0">
          {renderForm()}
        </div>

        {/* Goal Linking - Only shown when editing */}
        {isEditing && (
          <div className="pt-5 mt-5 border-t border-[#F3F4F6] flex-shrink-0">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Link to Development Goals
            </label>
            <GoalLinkSelector
              reportId={reportId}
              selectedGoalIds={linkedGoalIds}
              onChange={(goalIds) => { setLinkedGoalIds(goalIds); setHasChanges(true); }}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-[#F3F4F6] flex-shrink-0">
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
