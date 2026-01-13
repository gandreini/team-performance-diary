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
  entries: {
    id: 'id',
    reportId: 'report_id',
    cycleId: 'cycle_id',
    entryType: 'entry_type',
  },
}));

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

// Import after mocking
import {
  getEntriesByReportAndCycle,
  getEntryById,
  createFeedbackEntry,
  createAccomplishmentEntry,
  createKudosEntry,
  createNotesEntry,
  createCareerConversationEntry,
  createThirdPartyFeedbackEntry,
  updateEntry,
  deleteEntry,
} from '../entries';

describe('entries lib', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEntriesByReportAndCycle', () => {
    it('should return entries for a report and cycle', async () => {
      const mockEntries = [
        { id: '1', reportId: 'report-1', cycleId: 'cycle-1', entryType: 'feedback' },
        { id: '2', reportId: 'report-1', cycleId: 'cycle-1', entryType: 'kudos' },
      ];

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockEntries),
          }),
        }),
      });

      const result = await getEntriesByReportAndCycle('report-1', 'cycle-1');
      expect(result).toEqual(mockEntries);
    });

    it('should filter by entry type when provided', async () => {
      const mockEntries = [
        { id: '1', reportId: 'report-1', cycleId: 'cycle-1', entryType: 'feedback' },
      ];

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockEntries),
          }),
        }),
      });

      const result = await getEntriesByReportAndCycle('report-1', 'cycle-1', 'feedback');
      expect(result).toEqual(mockEntries);
    });

    it('should return empty array when no entries exist', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await getEntriesByReportAndCycle('report-1', 'cycle-1');
      expect(result).toEqual([]);
    });
  });

  describe('getEntryById', () => {
    it('should return entry when found', async () => {
      const mockEntry = { id: '1', reportId: 'report-1', entryType: 'feedback' };

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockEntry]),
          }),
        }),
      });

      const result = await getEntryById('1');
      expect(result).toEqual(mockEntry);
    });

    it('should return null when entry not found', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await getEntryById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('createFeedbackEntry', () => {
    it('should create a feedback entry with all fields', async () => {
      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const data = {
        reportId: 'report-1',
        cycleId: 'cycle-1',
        feedbackType: 'positive' as const,
        situation: 'Test situation',
        behavior: 'Test behavior',
        impact: 'Test impact',
        notes: 'Additional notes',
      };

      const result = await createFeedbackEntry(data);

      expect(result).toMatchObject({
        id: 'test-uuid-1234',
        reportId: 'report-1',
        cycleId: 'cycle-1',
        entryType: 'feedback',
        feedbackType: 'positive',
        situation: 'Test situation',
        behavior: 'Test behavior',
        impact: 'Test impact',
        notes: 'Additional notes',
      });
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should create feedback entry with null notes when not provided', async () => {
      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const data = {
        reportId: 'report-1',
        cycleId: 'cycle-1',
        feedbackType: 'constructive' as const,
        situation: 'Test situation',
        behavior: 'Test behavior',
        impact: 'Test impact',
      };

      const result = await createFeedbackEntry(data);

      expect(result.notes).toBeNull();
      expect(result.feedbackType).toBe('constructive');
    });
  });

  describe('createAccomplishmentEntry', () => {
    it('should create an accomplishment entry with title', async () => {
      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const data = {
        reportId: 'report-1',
        cycleId: 'cycle-1',
        title: 'Great achievement',
        notes: 'Details about the accomplishment',
      };

      const result = await createAccomplishmentEntry(data);

      expect(result).toMatchObject({
        id: 'test-uuid-1234',
        reportId: 'report-1',
        cycleId: 'cycle-1',
        entryType: 'accomplishment',
        title: 'Great achievement',
        notes: 'Details about the accomplishment',
      });
    });

    it('should create accomplishment entry with null title when not provided', async () => {
      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const data = {
        reportId: 'report-1',
        cycleId: 'cycle-1',
        notes: 'Details about the accomplishment',
      };

      const result = await createAccomplishmentEntry(data);

      expect(result.title).toBeNull();
      expect(result.notes).toBe('Details about the accomplishment');
    });
  });

  describe('createKudosEntry', () => {
    it('should create a kudos entry with link', async () => {
      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const data = {
        reportId: 'report-1',
        cycleId: 'cycle-1',
        notes: 'Great job on the project!',
        link: 'https://example.com/kudos',
      };

      const result = await createKudosEntry(data);

      expect(result).toMatchObject({
        id: 'test-uuid-1234',
        entryType: 'kudos',
        notes: 'Great job on the project!',
        link: 'https://example.com/kudos',
      });
    });

    it('should create kudos entry with null link when not provided', async () => {
      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const data = {
        reportId: 'report-1',
        cycleId: 'cycle-1',
        notes: 'Excellent work!',
      };

      const result = await createKudosEntry(data);

      expect(result.link).toBeNull();
    });
  });

  describe('createNotesEntry', () => {
    it('should create a notes entry', async () => {
      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const data = {
        reportId: 'report-1',
        cycleId: 'cycle-1',
        notes: 'Meeting notes from 1:1',
      };

      const result = await createNotesEntry(data);

      expect(result).toMatchObject({
        id: 'test-uuid-1234',
        entryType: 'notes',
        notes: 'Meeting notes from 1:1',
      });
    });
  });

  describe('createCareerConversationEntry', () => {
    it('should create a career conversation entry', async () => {
      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const data = {
        reportId: 'report-1',
        cycleId: 'cycle-1',
        notes: 'Discussion about career goals',
      };

      const result = await createCareerConversationEntry(data);

      expect(result).toMatchObject({
        id: 'test-uuid-1234',
        entryType: 'career_conversation',
        notes: 'Discussion about career goals',
      });
    });
  });

  describe('createThirdPartyFeedbackEntry', () => {
    it('should create a third-party feedback entry', async () => {
      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const data = {
        reportId: 'report-1',
        cycleId: 'cycle-1',
        providerName: 'John Smith',
        notes: 'Feedback from stakeholder',
      };

      const result = await createThirdPartyFeedbackEntry(data);

      expect(result).toMatchObject({
        id: 'test-uuid-1234',
        entryType: 'third_party_feedback',
        providerName: 'John Smith',
        notes: 'Feedback from stakeholder',
      });
    });

    it('should trim whitespace from provider name', async () => {
      mockInsert.mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      const data = {
        reportId: 'report-1',
        cycleId: 'cycle-1',
        providerName: '  John Smith  ',
        notes: 'Feedback',
      };

      const result = await createThirdPartyFeedbackEntry(data);

      expect(result.providerName).toBe('John Smith');
    });
  });

  describe('updateEntry', () => {
    it('should update an existing entry', async () => {
      const mockEntry = {
        id: '1',
        reportId: 'report-1',
        cycleId: 'cycle-1',
        entryType: 'feedback',
        notes: 'Original notes',
      };

      const updatedEntry = {
        ...mockEntry,
        notes: 'Updated notes',
      };

      // Mock for getEntryById check
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn()
              .mockResolvedValueOnce([mockEntry]) // First call - check exists
              .mockResolvedValueOnce([updatedEntry]), // Second call - return updated
          }),
        }),
      });

      mockUpdate.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const result = await updateEntry('1', { notes: 'Updated notes' });

      expect(result).toMatchObject({
        id: '1',
        notes: 'Updated notes',
      });
    });

    it('should return null when entry does not exist', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await updateEntry('non-existent', { notes: 'Updated' });

      expect(result).toBeNull();
    });
  });

  describe('deleteEntry', () => {
    it('should delete an existing entry and return true', async () => {
      const mockEntry = { id: '1', entryType: 'feedback' };

      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockEntry]),
          }),
        }),
      });

      mockDelete.mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      const result = await deleteEntry('1');

      expect(result).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should return false when entry does not exist', async () => {
      mockSelect.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await deleteEntry('non-existent');

      expect(result).toBe(false);
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });
});
