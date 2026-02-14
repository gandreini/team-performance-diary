import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/db', () => ({
  db: {
    select: () => mockSelect(),
    insert: () => mockInsert(),
    delete: () => mockDelete(),
  },
  reportSummaries: {
    id: 'id',
    reportId: 'report_id',
    cycleId: 'cycle_id',
    content: 'content',
    generatedAt: 'generated_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
}));

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

import { getSummary, upsertSummary, deleteSummariesByReport } from '../report-summaries';

describe('report-summaries lib', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should return a summary for a report+cycle', async () => {
      const mockSummary = {
        id: 'sum-1',
        reportId: 'rep-1',
        cycleId: 'cyc-1',
        content: '## Summary\nGoing well.',
        generatedAt: '2026-02-14T10:00:00Z',
        createdAt: '2026-02-14T10:00:00Z',
        updatedAt: '2026-02-14T10:00:00Z',
      };

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockSummary]),
          }),
        }),
      });

      const result = await getSummary('rep-1', 'cyc-1');
      expect(result).toEqual(mockSummary);
    });

    it('should return null when no summary exists', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await getSummary('rep-1', 'cyc-1');
      expect(result).toBeNull();
    });
  });

  describe('upsertSummary', () => {
    it('should insert and return the summary', async () => {
      const savedSummary = {
        id: 'test-uuid-1234',
        reportId: 'rep-1',
        cycleId: 'cyc-1',
        content: '## New summary',
        generatedAt: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };

      // Mock insert().values().onConflictDoUpdate()
      mockInsert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
        }),
      });

      // Mock the follow-up getSummary call
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([savedSummary]),
          }),
        }),
      });

      const result = await upsertSummary('rep-1', 'cyc-1', '## New summary');

      expect(result.reportId).toBe('rep-1');
      expect(result.cycleId).toBe('cyc-1');
      expect(result.content).toBe('## New summary');
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should use onConflictDoUpdate for atomic upsert', async () => {
      const onConflictMock = vi.fn().mockResolvedValue(undefined);
      const valuesMock = vi.fn().mockReturnValue({
        onConflictDoUpdate: onConflictMock,
      });

      mockInsert.mockReturnValue({
        values: valuesMock,
      });

      const updatedSummary = {
        id: 'existing-id',
        reportId: 'rep-1',
        cycleId: 'cyc-1',
        content: '## Updated summary',
        generatedAt: expect.any(String),
        createdAt: '2026-02-13T10:00:00Z',
        updatedAt: expect.any(String),
      };

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([updatedSummary]),
          }),
        }),
      });

      const result = await upsertSummary('rep-1', 'cyc-1', '## Updated summary');

      expect(onConflictMock).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.any(Array),
          set: expect.objectContaining({
            content: '## Updated summary',
          }),
        })
      );
      expect(result.content).toBe('## Updated summary');
    });
  });

  describe('deleteSummariesByReport', () => {
    it('should delete all summaries for a report', async () => {
      mockDelete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      await deleteSummariesByReport('rep-1');
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
