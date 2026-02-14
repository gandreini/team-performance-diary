import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/db', () => ({
  db: {
    select: () => mockSelect(),
    insert: () => mockInsert(),
    update: () => mockUpdate(),
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
    it('should create a new summary when none exists', async () => {
      // getSummary returns null
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const result = await upsertSummary('rep-1', 'cyc-1', '## New summary');

      expect(result.id).toBe('test-uuid-1234');
      expect(result.reportId).toBe('rep-1');
      expect(result.cycleId).toBe('cyc-1');
      expect(result.content).toBe('## New summary');
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should update existing summary', async () => {
      const existingSummary = {
        id: 'existing-id',
        reportId: 'rep-1',
        cycleId: 'cyc-1',
        content: '## Old summary',
        generatedAt: '2026-02-13T10:00:00Z',
        createdAt: '2026-02-13T10:00:00Z',
        updatedAt: '2026-02-13T10:00:00Z',
      };

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([existingSummary]),
          }),
        }),
      });

      mockUpdate.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const result = await upsertSummary('rep-1', 'cyc-1', '## Updated summary');

      expect(result.id).toBe('existing-id');
      expect(result.content).toBe('## Updated summary');
      expect(mockUpdate).toHaveBeenCalled();
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
