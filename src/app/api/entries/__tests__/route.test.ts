import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

// Mock the lib functions
vi.mock('@/lib/entries', () => ({
  createFeedbackEntry: vi.fn(),
  createAccomplishmentEntry: vi.fn(),
  createKudosEntry: vi.fn(),
  createNotesEntry: vi.fn(),
  createCareerConversationEntry: vi.fn(),
  createThirdPartyFeedbackEntry: vi.fn(),
}));

vi.mock('@/lib/reports', () => ({
  getReportById: vi.fn(),
}));

vi.mock('@/lib/cycles', () => ({
  ensureActiveCycle: vi.fn(),
}));

import { POST } from '../route';
import {
  createFeedbackEntry,
  createAccomplishmentEntry,
  createKudosEntry,
  createNotesEntry,
  createCareerConversationEntry,
  createThirdPartyFeedbackEntry,
} from '@/lib/entries';
import { getReportById } from '@/lib/reports';
import { ensureActiveCycle } from '@/lib/cycles';

const mockCreateFeedbackEntry = createFeedbackEntry as ReturnType<typeof vi.fn>;
const mockCreateAccomplishmentEntry = createAccomplishmentEntry as ReturnType<typeof vi.fn>;
const mockCreateKudosEntry = createKudosEntry as ReturnType<typeof vi.fn>;
const mockCreateNotesEntry = createNotesEntry as ReturnType<typeof vi.fn>;
const mockCreateCareerConversationEntry = createCareerConversationEntry as ReturnType<typeof vi.fn>;
const mockCreateThirdPartyFeedbackEntry = createThirdPartyFeedbackEntry as ReturnType<typeof vi.fn>;
const mockGetReportById = getReportById as ReturnType<typeof vi.fn>;
const mockEnsureActiveCycle = ensureActiveCycle as ReturnType<typeof vi.fn>;

function createRequest(body: object): Request {
  return new Request('http://localhost/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/entries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetReportById.mockResolvedValue({ id: 'report-1', firstName: 'Test', lastName: 'User' });
    mockEnsureActiveCycle.mockResolvedValue({ id: 'cycle-1', name: 'Cycle 1' });
  });

  describe('validation', () => {
    it('should return 400 when report_id is missing', async () => {
      const request = createRequest({ entry_type: 'feedback' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Report ID is required');
    });

    it('should return 404 when report does not exist', async () => {
      mockGetReportById.mockResolvedValue(null);

      const request = createRequest({
        report_id: 'non-existent',
        entry_type: 'feedback',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Report not found');
    });

    it('should return 400 when entry_type is invalid', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'invalid_type',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Valid entry type is required');
    });

    it('should use active cycle when cycle_id is not provided', async () => {
      mockCreateNotesEntry.mockResolvedValue({ id: '1', entryType: 'notes' });

      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'notes',
        notes: 'Test note',
      });
      await POST(request);

      expect(mockEnsureActiveCycle).toHaveBeenCalled();
      expect(mockCreateNotesEntry).toHaveBeenCalledWith(
        expect.objectContaining({ cycleId: 'cycle-1' })
      );
    });
  });

  describe('feedback entry', () => {
    it('should create feedback entry with valid data', async () => {
      const mockEntry = { id: '1', entryType: 'feedback' };
      mockCreateFeedbackEntry.mockResolvedValue(mockEntry);

      const request = createRequest({
        report_id: 'report-1',
        cycle_id: 'cycle-1',
        entry_type: 'feedback',
        feedback_type: 'positive',
        situation: 'Test situation',
        behavior: 'Test behavior',
        impact: 'Test impact',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.entry).toEqual(mockEntry);
    });

    it('should return 400 when feedback_type is missing', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'feedback',
        situation: 'Test',
        behavior: 'Test',
        impact: 'Test',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Please select feedback type');
    });

    it('should return 400 when feedback_type is invalid', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'feedback',
        feedback_type: 'invalid',
        situation: 'Test',
        behavior: 'Test',
        impact: 'Test',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Please select feedback type');
    });

    it('should return 400 when situation is empty', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'feedback',
        feedback_type: 'positive',
        situation: '',
        behavior: 'Test',
        impact: 'Test',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Situation is required');
    });

    it('should return 400 when situation exceeds 1000 characters', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'feedback',
        feedback_type: 'positive',
        situation: 'a'.repeat(1001),
        behavior: 'Test',
        impact: 'Test',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Situation must be at most 1000 characters');
    });

    it('should return 400 when behavior is empty', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'feedback',
        feedback_type: 'positive',
        situation: 'Test',
        behavior: '',
        impact: 'Test',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Behavior is required');
    });

    it('should return 400 when behavior exceeds 1000 characters', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'feedback',
        feedback_type: 'positive',
        situation: 'Test',
        behavior: 'a'.repeat(1001),
        impact: 'Test',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Behavior must be at most 1000 characters');
    });

    it('should return 400 when impact is empty', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'feedback',
        feedback_type: 'positive',
        situation: 'Test',
        behavior: 'Test',
        impact: '',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Impact is required');
    });

    it('should return 400 when impact exceeds 1000 characters', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'feedback',
        feedback_type: 'positive',
        situation: 'Test',
        behavior: 'Test',
        impact: 'a'.repeat(1001),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Impact must be at most 1000 characters');
    });

    it('should return 400 when notes exceed 2000 characters', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'feedback',
        feedback_type: 'positive',
        situation: 'Test',
        behavior: 'Test',
        impact: 'Test',
        notes: 'a'.repeat(2001),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Notes must be at most 2000 characters');
    });
  });

  describe('accomplishment entry', () => {
    it('should create accomplishment entry with title', async () => {
      const mockEntry = { id: '1', entryType: 'accomplishment' };
      mockCreateAccomplishmentEntry.mockResolvedValue(mockEntry);

      const request = createRequest({
        report_id: 'report-1',
        cycle_id: 'cycle-1',
        entry_type: 'accomplishment',
        title: 'Great achievement',
        notes: 'Details here',
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockCreateAccomplishmentEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Great achievement',
          notes: 'Details here',
        })
      );
    });

    it('should return 400 when notes are empty', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'accomplishment',
        notes: '',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Description is required');
    });

    it('should return 400 when notes exceed 5000 characters', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'accomplishment',
        notes: 'a'.repeat(5001),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Description must be at most 5000 characters');
    });

    it('should return 400 when title exceeds 200 characters', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'accomplishment',
        title: 'a'.repeat(201),
        notes: 'Valid notes',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Title must be at most 200 characters');
    });
  });

  describe('kudos entry', () => {
    it('should create kudos entry with link', async () => {
      const mockEntry = { id: '1', entryType: 'kudos' };
      mockCreateKudosEntry.mockResolvedValue(mockEntry);

      const request = createRequest({
        report_id: 'report-1',
        cycle_id: 'cycle-1',
        entry_type: 'kudos',
        notes: 'Great work!',
        link: 'https://example.com',
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockCreateKudosEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: 'Great work!',
          link: 'https://example.com',
        })
      );
    });

    it('should return 400 when notes are empty', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'kudos',
        notes: '',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Description is required');
    });

    it('should return 400 when link is invalid URL', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'kudos',
        notes: 'Great work!',
        link: 'not-a-valid-url',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Please enter a valid URL');
    });

    it('should return 400 when link exceeds 500 characters', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'kudos',
        notes: 'Great work!',
        link: 'https://example.com/' + 'a'.repeat(500),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Link must be at most 500 characters');
    });
  });

  describe('notes entry', () => {
    it('should create notes entry', async () => {
      const mockEntry = { id: '1', entryType: 'notes' };
      mockCreateNotesEntry.mockResolvedValue(mockEntry);

      const request = createRequest({
        report_id: 'report-1',
        cycle_id: 'cycle-1',
        entry_type: 'notes',
        notes: 'Meeting notes',
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockCreateNotesEntry).toHaveBeenCalled();
    });

    it('should return 400 when notes are empty', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'notes',
        notes: '   ',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Note content is required');
    });

    it('should return 400 when notes exceed 5000 characters', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'notes',
        notes: 'a'.repeat(5001),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Note must be at most 5000 characters');
    });
  });

  describe('career_conversation entry', () => {
    it('should create career conversation entry', async () => {
      const mockEntry = { id: '1', entryType: 'career_conversation' };
      mockCreateCareerConversationEntry.mockResolvedValue(mockEntry);

      const request = createRequest({
        report_id: 'report-1',
        cycle_id: 'cycle-1',
        entry_type: 'career_conversation',
        notes: 'Career goals discussion',
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockCreateCareerConversationEntry).toHaveBeenCalled();
    });

    it('should return 400 when notes are empty', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'career_conversation',
        notes: '',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Conversation notes are required');
    });
  });

  describe('third_party_feedback entry', () => {
    it('should create third-party feedback entry', async () => {
      const mockEntry = { id: '1', entryType: 'third_party_feedback' };
      mockCreateThirdPartyFeedbackEntry.mockResolvedValue(mockEntry);

      const request = createRequest({
        report_id: 'report-1',
        cycle_id: 'cycle-1',
        entry_type: 'third_party_feedback',
        provider_name: 'John Smith',
        notes: 'Feedback content',
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockCreateThirdPartyFeedbackEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          providerName: 'John Smith',
          notes: 'Feedback content',
        })
      );
    });

    it('should return 400 when provider_name is empty', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'third_party_feedback',
        provider_name: '',
        notes: 'Feedback',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Feedback provider is required');
    });

    it('should return 400 when provider_name exceeds 100 characters', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'third_party_feedback',
        provider_name: 'a'.repeat(101),
        notes: 'Feedback',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Provider name must be at most 100 characters');
    });

    it('should return 400 when notes are empty', async () => {
      const request = createRequest({
        report_id: 'report-1',
        entry_type: 'third_party_feedback',
        provider_name: 'John Smith',
        notes: '',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Feedback content is required');
    });
  });
});
