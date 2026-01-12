'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  id?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Markdown supported',
  rows = 10,
  maxLength,
  id,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const isOverLimit = maxLength ? value.length > maxLength : false;

  return (
    <div className="border border-[#E4E4E7] rounded-md overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[#E4E4E7] bg-[#FAFAFA]">
        <button
          type="button"
          onClick={() => setActiveTab('write')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'write'
              ? 'text-[#18181B] bg-white border-b-2 border-[#7C3AED] -mb-px'
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
              ? 'text-[#18181B] bg-white border-b-2 border-[#7C3AED] -mb-px'
              : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Content */}
      {activeTab === 'write' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full px-3 py-2 text-sm focus:outline-none resize-none placeholder:text-[#A1A1AA]"
          placeholder={placeholder}
        />
      ) : (
        <div
          className="px-3 py-2 overflow-y-auto bg-white"
          style={{ minHeight: `${rows * 1.5 + 1}rem` }}
        >
          {value.trim() ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-[#A1A1AA] italic">Nothing to preview</p>
          )}
        </div>
      )}

      {/* Character count */}
      {maxLength && (
        <div className="px-3 py-1.5 border-t border-[#F4F4F5] bg-[#FAFAFA]">
          <p className={`text-xs text-right ${isOverLimit ? 'text-[#DC2626]' : 'text-[#71717A]'}`}>
            {value.length} / {maxLength}
          </p>
        </div>
      )}
    </div>
  );
}
