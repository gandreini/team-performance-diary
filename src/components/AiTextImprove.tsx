'use client';

import { useAiTextImprove } from '@/hooks/useAiTextImprove';
import { InlineDiff } from './InlineDiff';
import { Loader2, Sparkles, X } from 'lucide-react';

interface AiTextImproveProps {
  value: string;
  onChange: (value: string) => void;
  context: string;
  maxLength?: number;
  children: React.ReactNode;
}

export function AiTextImprove({
  value,
  onChange,
  context,
  maxLength,
  children,
}: AiTextImproveProps) {
  const {
    state,
    improvedText,
    originalText,
    error,
    isEmpty,
    handleImprove,
    handleAccept,
    handleReject,
    dismissError,
  } = useAiTextImprove({ value, onChange, context });

  return (
    <div className={`relative ${state === 'loading' ? 'ai-loading-active' : ''}`}>
      {/* AI button - absolutely positioned, no vertical space */}
      <div className="absolute -top-7 right-0 z-10">
        <button
          type="button"
          onClick={handleImprove}
          disabled={isEmpty || state === 'loading' || state === 'diff'}
          title={isEmpty ? 'Write some text first' : 'Improve text with AI'}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded text-[#9CA3AF] hover:text-[#3B82F6] hover:bg-[#EFF6FF] disabled:opacity-40 disabled:hover:text-[#9CA3AF] disabled:hover:bg-transparent transition-colors"
        >
          {state === 'loading' ? (
            <Loader2 className="animate-spin w-3.5 h-3.5" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Improve</span>
        </button>

        {/* Error message */}
        {error && (
          <div className="absolute right-0 top-7 z-20">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#FEF2F2] border border-[#FECACA] rounded-md shadow-e1 whitespace-nowrap">
              <p className="text-xs text-[#DC2626]">{error}</p>
              <button
                type="button"
                onClick={dismissError}
                className="text-[#DC2626] hover:text-[#B91C1C] flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Original content (textarea/MarkdownEditor) or diff view */}
      {state === 'diff' ? (
        <InlineDiff
          originalText={originalText}
          improvedText={improvedText}
          maxLength={maxLength}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ) : (
        children
      )}
    </div>
  );
}
