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
  reports: {
    id: 'id',
    firstName: 'first_name',
    lastName: 'last_name',
  },
  entries: {
    reportId: 'report_id',
    cycleId: 'cycle_id',
  },
  archivedGoals: {
    reportId: 'report_id',
  },
}));

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

// Import after mocking
import {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getReportEntryCount,
  getReportsWithEntryCounts,
  getTotalEntryCount,
} from '../reports';

describe('reports lib', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllReports', () => {
    it('should return all reports ordered by name', async () => {
      const mockReports = [
        { id: '1', firstName: 'Alice', lastName: 'Anderson' },
        { id: '2', firstName: 'Bob', lastName: 'Brown' },
      ];

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockReports),
        }),
      });

      const result = await getAllReports();
      expect(result).toEqual(mockReports);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no reports exist', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await getAllReports();
      expect(result).toEqual([]);
    });
  });

  describe('getReportById', () => {
    it('should return report when found', async () => {
      const mockReport = { id: '1', firstName: 'Alice', lastName: 'Anderson' };

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockReport]),
          }),
        }),
      });

      const result = await getReportById('1');
      expect(result).toEqual(mockReport);
    });

    it('should return null when report not found', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await getReportById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('createReport', () => {
    it('should create a report with all fields', async () => {
      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const result = await createReport('Alice', 'Anderson', 'Development goals here');

      expect(result).toMatchObject({
        id: 'test-uuid-1234',
        firstName: 'Alice',
        lastName: 'Anderson',
        developmentGoals: 'Development goals here',
      });
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should create report with null development goals when not provided', async () => {
      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const result = await createReport('Bob', 'Brown');

      expect(result.developmentGoals).toBeNull();
    });

    it('should trim whitespace from names', async () => {
      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const result = await createReport('  Alice  ', '  Anderson  ');

      expect(result.firstName).toBe('Alice');
      expect(result.lastName).toBe('Anderson');
    });
  });

  describe('updateReport', () => {
    it('should update existing report', async () => {
      const mockReport = {
        id: '1',
        firstName: 'Alice',
        lastName: 'Anderson',
        developmentGoals: null,
      };

      const updatedReport = {
        ...mockReport,
        firstName: 'Alicia',
      };

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn()
              .mockResolvedValueOnce([mockReport])
              .mockResolvedValueOnce([updatedReport]),
          }),
        }),
      });

      mockUpdate.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const result = await updateReport('1', { firstName: 'Alicia' });

      expect(result).toMatchObject({
        id: '1',
        firstName: 'Alicia',
      });
    });

    it('should return null when report does not exist', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await updateReport('non-existent', { firstName: 'Test' });

      expect(result).toBeNull();
    });

    it('should trim whitespace from updated names', async () => {
      const mockReport = { id: '1', firstName: 'Alice', lastName: 'Anderson' };
      const updatedReport = { ...mockReport, firstName: 'Alicia' };

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn()
              .mockResolvedValueOnce([mockReport])
              .mockResolvedValueOnce([updatedReport]),
          }),
        }),
      });

      mockUpdate.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      await updateReport('1', { firstName: '  Alicia  ' });

      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should update development goals to null', async () => {
      const mockReport = {
        id: '1',
        firstName: 'Alice',
        lastName: 'Anderson',
        developmentGoals: 'Old goals',
      };

      const updatedReport = { ...mockReport, developmentGoals: null };

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn()
              .mockResolvedValueOnce([mockReport])
              .mockResolvedValueOnce([updatedReport]),
          }),
        }),
      });

      mockUpdate.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const result = await updateReport('1', { developmentGoals: null });

      expect(result?.developmentGoals).toBeNull();
    });
  });

  describe('deleteReport', () => {
    it('should delete report and return true', async () => {
      const mockReport = { id: '1', firstName: 'Alice', lastName: 'Anderson' };

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockReport]),
          }),
        }),
      });

      mockDelete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      const result = await deleteReport('1');

      expect(result).toBe(true);
      // Should delete from all related tables
      expect(mockDelete).toHaveBeenCalledTimes(3); // archivedGoals, entries, reports
    });

    it('should return false when report does not exist', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await deleteReport('non-existent');

      expect(result).toBe(false);
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('getReportEntryCount', () => {
    it('should return entry count for report and cycle', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 5 }]),
        }),
      });

      const result = await getReportEntryCount('report-1', 'cycle-1');
      expect(result).toBe(5);
    });

    it('should return 0 when no entries exist', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      });

      const result = await getReportEntryCount('report-1', 'cycle-1');
      expect(result).toBe(0);
    });

    it('should return 0 when result is empty', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await getReportEntryCount('report-1', 'cycle-1');
      expect(result).toBe(0);
    });
  });

  describe('getTotalEntryCount', () => {
    it('should return total entry count for a report', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 10 }]),
        }),
      });

      const result = await getTotalEntryCount('report-1');
      expect(result).toBe(10);
    });

    it('should return 0 when no entries exist', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      });

      const result = await getTotalEntryCount('report-1');
      expect(result).toBe(0);
    });
  });

  describe('getReportsWithEntryCounts', () => {
    it('should return reports with entry counts', async () => {
      const mockReports = [
        { id: '1', firstName: 'Alice', lastName: 'Anderson' },
        { id: '2', firstName: 'Bob', lastName: 'Brown' },
      ];

      // Mock for getAllReports
      mockSelect
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockReports),
          }),
        })
        // Mock for getReportEntryCount calls
        .mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 3 }]),
          }),
        });

      const result = await getReportsWithEntryCounts('cycle-1');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: '1',
        firstName: 'Alice',
        entryCount: 3,
      });
    });

    it('should return empty array when no reports exist', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await getReportsWithEntryCounts('cycle-1');
      expect(result).toEqual([]);
    });
  });
});
