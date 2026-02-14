import { useState, useCallback } from 'react';

type AiState = 'idle' | 'loading' | 'diff' | 'error';

interface UseAiTextImproveOptions {
  value: string;
  onChange: (value: string) => void;
  context: string;
}

export function useAiTextImprove({ value, onChange, context }: UseAiTextImproveOptions) {
  const [state, setState] = useState<AiState>('idle');
  const [improvedText, setImprovedText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEmpty = !value.trim();

  const handleImprove = useCallback(async () => {
    if (isEmpty || state === 'loading') return;

    setState('loading');
    setOriginalText(value);
    setError(null);

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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to improve text';
      setError(message);
      setState('error');
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setError(null);
        setState('idle');
      }, 5000);
    }
  }, [value, context, state, isEmpty]);

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

  const dismissError = useCallback(() => {
    setError(null);
    setState('idle');
  }, []);

  return {
    state,
    improvedText,
    originalText,
    error,
    isEmpty,
    handleImprove,
    handleAccept,
    handleReject,
    dismissError,
  };
}
