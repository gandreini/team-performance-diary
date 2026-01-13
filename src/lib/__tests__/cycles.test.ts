import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/db', () => ({
  db: {
    select: () => mockSelect(),
    insert: () => mockInsert(),
    update: () => mockUpdate(),
  },
  cycles: {
    id: 'id',
    status: 'status',
    name: 'name',
    createdAt: 'created_at',
  },
}));

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

// Import after mocking
import {
  getActiveCycle,
  getAllCycles,
  getArchivedCycles,
  getCycleById,
  createCycle,
  ensureActiveCycle,
  archiveCycleAndCreateNew,
  cycleNameExists,
} from '../cycles';

describe('cycles lib', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveCycle', () => {
    it('should return active cycle when exists', async () => {
      const mockCycle = { id: '1', name: 'Cycle 1', status: 'active' };

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockCycle]),
          }),
        }),
      });

      const result = await getActiveCycle();
      expect(result).toEqual(mockCycle);
    });

    it('should return null when no active cycle exists', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await getActiveCycle();
      expect(result).toBeNull();
    });
  });

  describe('getAllCycles', () => {
    it('should return all cycles ordered by createdAt', async () => {
      const mockCycles = [
        { id: '1', name: 'Cycle 1', status: 'archived' },
        { id: '2', name: 'Cycle 2', status: 'active' },
      ];

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockCycles),
        }),
      });

      const result = await getAllCycles();
      expect(result).toEqual(mockCycles);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no cycles exist', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await getAllCycles();
      expect(result).toEqual([]);
    });
  });

  describe('getArchivedCycles', () => {
    it('should return archived cycles sorted by endDate descending', async () => {
      const mockCycles = [
        { id: '1', name: 'Cycle 1', status: 'archived', endDate: '2024-01-01' },
        { id: '2', name: 'Cycle 2', status: 'archived', endDate: '2024-06-01' },
      ];

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockCycles),
        }),
      });

      const result = await getArchivedCycles();

      // Should be sorted by endDate descending
      expect(result[0].endDate).toBe('2024-06-01');
      expect(result[1].endDate).toBe('2024-01-01');
    });

    it('should handle cycles with null endDate', async () => {
      const mockCycles = [
        { id: '1', name: 'Cycle 1', status: 'archived', endDate: null },
        { id: '2', name: 'Cycle 2', status: 'archived', endDate: '2024-06-01' },
      ];

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockCycles),
        }),
      });

      const result = await getArchivedCycles();

      // Cycle with endDate should come first
      expect(result[0].endDate).toBe('2024-06-01');
      expect(result[1].endDate).toBeNull();
    });
  });

  describe('getCycleById', () => {
    it('should return cycle when found', async () => {
      const mockCycle = { id: '1', name: 'Cycle 1', status: 'active' };

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockCycle]),
          }),
        }),
      });

      const result = await getCycleById('1');
      expect(result).toEqual(mockCycle);
    });

    it('should return null when cycle not found', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await getCycleById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('createCycle', () => {
    it('should create a new cycle with provided name and start date', async () => {
      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const result = await createCycle('Q1 2024', '2024-01-01');

      expect(result).toMatchObject({
        id: 'test-uuid-1234',
        name: 'Q1 2024',
        status: 'active',
        startDate: '2024-01-01',
        endDate: null,
      });
      expect(result.createdAt).toBeDefined();
    });
  });

  describe('ensureActiveCycle', () => {
    it('should return existing active cycle', async () => {
      const mockCycle = { id: '1', name: 'Cycle 1', status: 'active' };

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockCycle]),
          }),
        }),
      });

      const result = await ensureActiveCycle();
      expect(result).toEqual(mockCycle);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should create Cycle 1 when no active cycle exists', async () => {
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

      const result = await ensureActiveCycle();

      expect(result.name).toBe('Cycle 1');
      expect(result.status).toBe('active');
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('archiveCycleAndCreateNew', () => {
    it('should archive current cycle and create new one', async () => {
      const activeCycle = { id: '1', name: 'Cycle 1', status: 'active' };

      // First call for getActiveCycle
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([activeCycle]),
          }),
        }),
      });

      mockUpdate.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const result = await archiveCycleAndCreateNew('Cycle 2');

      expect(result.archived.status).toBe('archived');
      expect(result.archived.endDate).toBeDefined();
      expect(result.new.name).toBe('Cycle 2');
      expect(result.new.status).toBe('active');
    });

    it('should throw error when no active cycle exists', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(archiveCycleAndCreateNew('Cycle 2')).rejects.toThrow(
        'No active cycle to archive'
      );
    });
  });

  describe('cycleNameExists', () => {
    it('should return true when name exists', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: '1', name: 'Cycle 1' }]),
          }),
        }),
      });

      const result = await cycleNameExists('Cycle 1');
      expect(result).toBe(true);
    });

    it('should return false when name does not exist', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await cycleNameExists('Non-existent');
      expect(result).toBe(false);
    });
  });
});
