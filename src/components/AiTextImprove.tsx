'use client';

import { useState, useCallback } from 'react';
import { InlineDiff } from './InlineDiff';

type AiState = 'idle' | 'loading' | 'diff';

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
  const [state, setState] = useState<AiState>('idle');
  const [improvedText, setImprovedText] = useState('');
  const [originalText, setOriginalText] = useState('');

  const handleImprove = useCallback(async () => {
    if (!value.trim() || state === 'loading') return;

    setState('loading');
    setOriginalText(value);

    try {
      const response = await fetch('/api/ai/improve-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value, context }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to improve text');
      }

      const data = await response.json();
      setImprovedText(data.improved_text);
      setState('diff');
    } catch {
      setState('idle');
    }
  }, [value, context, state]);

  const handleAccept = useCallback(() => {
    onChange(improvedText);
    setState('idle');
    setImprovedText('');
    setOriginalText('');
  }, [improvedText, onChange]);

  const handleReject = useCallback(() => {
    setState('idle');
    setImprovedText('');
    setOriginalText('');
  }, []);

  const isEmpty = !value.trim();

  return (
    <div className="relative">
      {/* Sparkle button */}
      <div className="absolute right-1.5 top-1.5 z-10">
        <button
          type="button"
          onClick={handleImprove}
          disabled={isEmpty || state === 'loading' || state === 'diff'}
          title={isEmpty ? 'Write some text first' : 'Improve text with AI'}
          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-[#A1A1AA] hover:text-[#7C3AED] hover:bg-[#F5F3FF] disabled:opacity-40 disabled:hover:text-[#A1A1AA] disabled:hover:bg-transparent transition-colors"
        >
          {state === 'loading' ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          )}
        </button>
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
