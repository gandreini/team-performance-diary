'use client';

import { useState } from 'react';
import { MarkdownContent } from './MarkdownContent';
import { InlineDiff } from './InlineDiff';
import { useAiTextImprove } from '@/hooks/useAiTextImprove';
import { Loader2, Sparkles, X } from 'lucide-react';

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

  const isOverLimit = maxLength ? value.length > maxLength : false;
  const showAiButton = aiContext !== undefined;

  const ai = useAiTextImprove({ value, onChange, context: aiContext || '' });

  return (
    <div className={`border border-[#E5E7EB] rounded-md overflow-hidden ${fillHeight ? 'flex flex-col h-full' : ''} ${ai.state === 'loading' ? 'ai-loading-border' : ''} ${className}`}>
      {/* Tabs */}
      <div className="flex items-center border-b border-[#E5E7EB] bg-[#F9FAFB]">
        <button
          type="button"
          onClick={() => setActiveTab('write')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'write'
              ? 'text-[#111827] bg-white border-b-2 border-[#111827] -mb-px'
              : 'text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'preview'
              ? 'text-[#111827] bg-white border-b-2 border-[#111827] -mb-px'
              : 'text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          Preview
        </button>

        {/* AI Improve button in tab bar */}
        {showAiButton && activeTab === 'write' && (
          <div className="ml-auto mr-2 relative">
            <button
              type="button"
              onClick={ai.handleImprove}
              disabled={ai.isEmpty || ai.state === 'loading' || ai.state === 'diff'}
              title={ai.isEmpty ? 'Write some text first' : 'Improve text with AI'}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-[#9CA3AF] hover:text-[#3B82F6] hover:bg-[#EFF6FF] disabled:opacity-40 disabled:hover:text-[#9CA3AF] disabled:hover:bg-transparent transition-colors"
            >
              {ai.state === 'loading' ? (
                <Loader2 className="animate-spin w-3.5 h-3.5" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Improve</span>
            </button>

            {/* Error message */}
            {ai.error && (
              <div className="absolute right-0 top-8 z-20">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-[#FEF2F2] border border-[#FECACA] rounded-md shadow-e1 whitespace-nowrap">
                  <p className="text-xs text-[#DC2626]">{ai.error}</p>
                  <button
                    type="button"
                    onClick={ai.dismissError}
                    className="text-[#DC2626] hover:text-[#B91C1C] flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {ai.state === 'diff' && activeTab === 'write' ? (
        <div className={`px-3 py-2 ${fillHeight ? 'flex-1 min-h-0 overflow-y-auto' : ''}`}>
          <InlineDiff
            originalText={ai.originalText}
            improvedText={ai.improvedText}
            maxLength={maxLength}
            onAccept={ai.handleAccept}
            onReject={ai.handleReject}
          />
        </div>
      ) : activeTab === 'write' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={fillHeight ? undefined : rows}
          className={`w-full px-3 py-2 text-sm focus:outline-none resize-none placeholder:text-[#9CA3AF] ${fillHeight ? 'flex-1 min-h-0' : ''}`}
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
            <p className="text-sm text-[#9CA3AF] italic">Nothing to preview</p>
          )}
        </div>
      )}

      {/* Character count */}
      {maxLength && (
        <div className="px-3 py-2 border-t border-[#F3F4F6] bg-[#F9FAFB] flex-shrink-0">
          <p className={`text-xs text-right ${isOverLimit ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}>
            {value.length} / {maxLength}
          </p>
        </div>
      )}
    </div>
  );
}
