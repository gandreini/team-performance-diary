'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function transformCheckboxShorthand(text: string): string {
  return text
    // Handle "- [] " -> "- [ ] " (with dash, missing space inside)
    .replace(/^- \[\] /gm, '- [ ] ')
    .replace(/^- \[x\] /gim, '- [x] ')
    // Handle "[] " -> "- [ ] " (without dash)
    .replace(/^\[\] /gm, '- [ ] ')
    .replace(/^\[x\] /gim, '- [x] ');
}

interface MarkdownContentProps {
  children: string;
  className?: string;
}

export function MarkdownContent({ children, className = '' }: MarkdownContentProps) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {transformCheckboxShorthand(children)}
      </ReactMarkdown>
    </div>
  );
}
