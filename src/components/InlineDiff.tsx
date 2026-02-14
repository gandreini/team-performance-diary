'use client';

import { useMemo } from 'react';
import { diffWords } from 'diff';

interface InlineDiffProps {
  originalText: string;
  improvedText: string;
  maxLength?: number;
  onAccept: () => void;
  onReject: () => void;
}

export function InlineDiff({
  originalText,
  improvedText,
  maxLength,
  onAccept,
  onReject,
}: InlineDiffProps) {
  const changes = useMemo(
    () => diffWords(originalText, improvedText),
    [originalText, improvedText]
  );

  const isOverLimit = maxLength ? improvedText.length > maxLength : false;
  const isIdentical = originalText === improvedText;

  if (isIdentical) {
    return (
      <div className="px-3 py-3 bg-[#FAFAFA] rounded-md">
        <p className="text-sm text-[#71717A] italic mb-3">No improvements suggested — the text looks good as is.</p>
        <button
          type="button"
          onClick={onReject}
          className="text-sm text-[#52525B] hover:text-[#18181B] underline"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Diff content */}
      <div className="px-3 py-2 bg-white border border-[#E4E4E7] rounded-md text-sm leading-relaxed whitespace-pre-wrap">
        {changes.map((change, index) => {
          if (change.added) {
            return (
              <span
                key={index}
                className="bg-[#DCFCE7] text-[#166534] rounded-sm px-0.5"
              >
                {change.value}
              </span>
            );
          }
          if (change.removed) {
            return (
              <span
                key={index}
                className="bg-[#FEE2E2] text-[#991B1B] line-through rounded-sm px-0.5"
              >
                {change.value}
              </span>
            );
          }
          return <span key={index}>{change.value}</span>;
        })}
      </div>

      {/* Character limit warning */}
      {isOverLimit && maxLength && (
        <p className="text-xs text-[#DC2626]">
          Improved text ({improvedText.length} chars) exceeds the {maxLength} character limit.
        </p>
      )}

      {/* Accept / Reject buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-[#18181B] text-white hover:bg-[#27272A] transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Accept
        </button>
        <button
          type="button"
          onClick={onReject}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-[#52525B] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Reject
        </button>
      </div>
    </div>
  );
}
