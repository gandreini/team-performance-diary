'use client';

import { useState, useCallback } from 'react';
import { MarkdownContent } from './MarkdownContent';
import { InlineDiff } from './InlineDiff';

type AiState = 'idle' | 'loading' | 'diff';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  id?: string;
  className?: string;
  fillHeight?: boolean;
  aiContext?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Markdown supported',
  rows = 10,
  maxLength,
  id,
  className = '',
  fillHeight = false,
  aiContext,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [aiState, setAiState] = useState<AiState>('idle');
  const [improvedText, setImprovedText] = useState('');
  const [originalText, setOriginalText] = useState('');

  const isOverLimit = maxLength ? value.length > maxLength : false;
  const showAiButton = aiContext !== undefined;
  const isEmpty = !value.trim();

  const handleImprove = useCallback(async () => {
    if (isEmpty || aiState === 'loading') return;

    setAiState('loading');
    setOriginalText(value);

    try {
      const response = await fetch('/api/ai/improve-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value, context: aiContext || '' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to improve text');
      }

      const data = await response.json();
      setImprovedText(data.improved_text);
      setAiState('diff');
    } catch {
      setAiState('idle');
    }
  }, [value, aiContext, aiState, isEmpty]);

  const handleAccept = useCallback(() => {
    onChange(improvedText);
    setAiState('idle');
    setImprovedText('');
    setOriginalText('');
  }, [improvedText, onChange]);

  const handleReject = useCallback(() => {
    setAiState('idle');
    setImprovedText('');
    setOriginalText('');
  }, []);

  return (
    <div className={`border border-[#E4E4E7] rounded-md overflow-hidden ${fillHeight ? 'flex flex-col h-full' : ''} ${className}`}>
      {/* Tabs */}
      <div className="flex items-center border-b border-[#E4E4E7] bg-[#FAFAFA]">
        <button
          type="button"
          onClick={() => setActiveTab('write')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'write'
              ? 'text-[#18181B] bg-white border-b-2 border-[#18181B] -mb-px'
              : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'preview'
              ? 'text-[#18181B] bg-white border-b-2 border-[#18181B] -mb-px'
              : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          Preview
        </button>

        {/* AI Improve button in tab bar */}
        {showAiButton && activeTab === 'write' && (
          <div className="ml-auto mr-2">
            <button
              type="button"
              onClick={handleImprove}
              disabled={isEmpty || aiState === 'loading' || aiState === 'diff'}
              title={isEmpty ? 'Write some text first' : 'Improve text with AI'}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-[#A1A1AA] hover:text-[#7C3AED] hover:bg-[#F5F3FF] disabled:opacity-40 disabled:hover:text-[#A1A1AA] disabled:hover:bg-transparent transition-colors"
            >
              {aiState === 'loading' ? (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              )}
              <span className="hidden sm:inline">Improve</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {aiState === 'diff' && activeTab === 'write' ? (
        <div className={`px-3 py-2 ${fillHeight ? 'flex-1 min-h-0 overflow-y-auto' : ''}`}>
          <InlineDiff
            originalText={originalText}
            improvedText={improvedText}
            maxLength={maxLength}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </div>
      ) : activeTab === 'write' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={fillHeight ? undefined : rows}
          className={`w-full px-3 py-2 text-sm focus:outline-none resize-none placeholder:text-[#A1A1AA] ${fillHeight ? 'flex-1 min-h-0' : ''}`}
          placeholder={placeholder}
        />
      ) : (
        <div
          className={`px-3 py-2 overflow-y-auto bg-white ${fillHeight ? 'flex-1 min-h-0' : ''}`}
          style={fillHeight ? undefined : { minHeight: `${rows * 1.5 + 1}rem` }}
        >
          {value.trim() ? (
            <MarkdownContent>{value}</MarkdownContent>
          ) : (
            <p className="text-sm text-[#A1A1AA] italic">Nothing to preview</p>
          )}
        </div>
      )}

      {/* Character count */}
      {maxLength && (
        <div className="px-3 py-1.5 border-t border-[#F4F4F5] bg-[#FAFAFA] flex-shrink-0">
          <p className={`text-xs text-right ${isOverLimit ? 'text-[#DC2626]' : 'text-[#71717A]'}`}>
            {value.length} / {maxLength}
          </p>
        </div>
      )}
    </div>
  );
}
