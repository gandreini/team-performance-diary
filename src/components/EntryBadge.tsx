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
          return { label: 'Positive', color: 'bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]' };
        }
        return { label: 'Constructive', color: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]' };
      case 'accomplishment':
        return { label: 'Accomplishment', color: 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]' };
      case 'kudos':
        return { label: 'Kudos', color: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]' };
      case 'notes':
        return { label: 'Note', color: 'bg-[#F4F4F5] text-[#52525B] border border-[#E4E4E7]' };
      case 'career_conversation':
        return { label: 'Career', color: 'bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]' };
      case 'third_party_feedback':
        return { label: '3rd Party', color: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FDBA74]' };
      default:
        return { label: 'Entry', color: 'bg-[#F4F4F5] text-[#52525B] border border-[#E4E4E7]' };
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
