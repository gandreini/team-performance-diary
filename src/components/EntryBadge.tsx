'use client';

import type { EntryType, FeedbackType } from '@/db';

interface EntryBadgeProps {
  entryType: EntryType;
  feedbackType?: FeedbackType | null;
}

export function EntryBadge({ entryType, feedbackType }: EntryBadgeProps) {
  const getBadgeConfig = () => {
    switch (entryType) {
      case 'feedback':
        if (feedbackType === 'positive') {
          return { label: 'Positive Feedback', color: 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]' };
        }
        return { label: 'Constructive Feedback', color: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]' };
      case 'accomplishment':
        return { label: 'Accomplishment', color: 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]' };
      case 'kudos':
        return { label: 'Kudos', color: 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]' };
      case 'notes':
        return { label: 'Note', color: 'bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]' };
      case 'career_conversation':
        return { label: 'Career', color: 'bg-[#EFF6FF] text-[#3B82F6] border border-[#BFDBFE]' };
      case 'third_party_feedback':
        return { label: '3rd Party', color: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FDBA74]' };
      default:
        return { label: 'Entry', color: 'bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]' };
    }
  };

  const { label, color } = getBadgeConfig();

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

export function getEntryTypeLabel(entryType: EntryType): string {
  switch (entryType) {
    case 'feedback':
      return 'Feedback';
    case 'accomplishment':
      return 'Accomplishment';
    case 'kudos':
      return 'Kudos';
    case 'notes':
      return 'Note';
    case 'career_conversation':
      return 'Career Conversation';
    case 'third_party_feedback':
      return 'Third-Party Feedback';
    default:
      return 'Entry';
  }
}
