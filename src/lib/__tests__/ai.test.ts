import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store original env
const originalEnv = { ...process.env };

describe('ai lib', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.N8N_IMPROVE_TEXT_WEBHOOK_URL = 'https://n8n.example.com/webhook/improve';
    process.env.N8N_REPORT_SUMMARY_WEBHOOK_URL = 'https://n8n.example.com/webhook/summary';
    process.env.N8N_WEBHOOK_AUTH_TOKEN = 'test-token';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe('improveText', () => {
    it('should call N8N webhook and return improved text', async () => {
      const mockResponse = { improved_text: 'Better text here' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { improveText } = await import('../ai');
      const result = await improveText('Some text', 'feedback notes');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://n8n.example.com/webhook/improve',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
          body: JSON.stringify({ text: 'Some text', context: 'feedback notes' }),
        })
      );
      expect(result).toBe('Better text here');
    });

    it('should throw if webhook URL is not configured', async () => {
      delete process.env.N8N_IMPROVE_TEXT_WEBHOOK_URL;

      // Re-import to pick up env change
      vi.resetModules();
      const { improveText } = await import('../ai');

      await expect(improveText('text', 'ctx')).rejects.toThrow(
        'N8N_IMPROVE_TEXT_WEBHOOK_URL is not configured'
      );
    });

    it('should throw on non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const { improveText } = await import('../ai');

      await expect(improveText('text', 'ctx')).rejects.toThrow(
        'N8N webhook returned 500: Internal Server Error'
      );
    });

    it('should throw on invalid response shape', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ wrong_field: 'value' }),
      });

      const { improveText } = await import('../ai');

      await expect(improveText('text', 'ctx')).rejects.toThrow(
        'Invalid response from AI service: missing improved_text'
      );
    });

    it('should send request without auth header when no token configured', async () => {
      delete process.env.N8N_WEBHOOK_AUTH_TOKEN;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ improved_text: 'improved' }),
      });

      vi.resetModules();
      const { improveText } = await import('../ai');
      await improveText('text', 'ctx');

      const callHeaders = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
      expect(callHeaders['Authorization']).toBeUndefined();
    });
  });

  describe('generateReportSummary', () => {
    it('should call N8N webhook with structured payload', async () => {
      const mockResponse = { summary: '## Summary\nThings are going well.' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { generateReportSummary } = await import('../ai');
      const payload = {
        report: { firstName: 'John', lastName: 'Doe' },
        goals: [{ title: 'Goal 1', description: 'Description' }],
        entries: [{
          entryType: 'feedback',
          feedbackType: 'positive',
          feedbackGiven: true,
          situation: 'Good work',
          behavior: 'Proactive',
          impact: 'Team morale',
          title: null,
          notes: null,
          providerName: null,
          linkedGoals: ['Goal 1'],
        }],
      };

      const result = await generateReportSummary(payload);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://n8n.example.com/webhook/summary',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        })
      );
      expect(result).toBe('## Summary\nThings are going well.');
    });

    it('should throw if webhook URL is not configured', async () => {
      delete process.env.N8N_REPORT_SUMMARY_WEBHOOK_URL;

      vi.resetModules();
      const { generateReportSummary } = await import('../ai');

      await expect(
        generateReportSummary({
          report: { firstName: 'A', lastName: 'B' },
          goals: [],
          entries: [],
        })
      ).rejects.toThrow('N8N_REPORT_SUMMARY_WEBHOOK_URL is not configured');
    });
  });
});
