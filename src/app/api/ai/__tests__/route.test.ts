import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/ai', () => ({
  improveText: vi.fn(),
}));

import { POST } from '../improve-text/route';
import { improveText } from '@/lib/ai';

const mockImproveText = improveText as ReturnType<typeof vi.fn>;

function createRequest(body: object): Request {
  return new Request('http://localhost/api/ai/improve-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/ai/improve-text', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should return improved text', async () => {
      mockImproveText.mockResolvedValue('Improved version of the text');

      const request = createRequest({ text: 'Some text to improve', context: 'feedback notes' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.improved_text).toBe('Improved version of the text');
      expect(mockImproveText).toHaveBeenCalledWith('Some text to improve', 'feedback notes');
    });

    it('should use empty context when not provided', async () => {
      mockImproveText.mockResolvedValue('Improved');

      const request = createRequest({ text: 'Some text' });
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockImproveText).toHaveBeenCalledWith('Some text', '');
    });

    it('should return 400 for empty text', async () => {
      const request = createRequest({ text: '' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Text is required');
    });

    it('should return 400 for missing text', async () => {
      const request = createRequest({ context: 'notes' });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 for whitespace-only text', async () => {
      const request = createRequest({ text: '   ' });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 500 when AI service fails', async () => {
      mockImproveText.mockRejectedValue(new Error('AI service unavailable'));

      const request = createRequest({ text: 'Some text', context: 'ctx' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('AI service unavailable');
    });
  });
});
