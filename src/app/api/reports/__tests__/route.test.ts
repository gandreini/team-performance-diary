import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the lib functions
vi.mock('@/lib/reports', () => ({
  getAllReports: vi.fn(),
  createReport: vi.fn(),
}));

import { GET, POST } from '../route';
import { getAllReports, createReport } from '@/lib/reports';

const mockGetAllReports = getAllReports as ReturnType<typeof vi.fn>;
const mockCreateReport = createReport as ReturnType<typeof vi.fn>;

function createRequest(body: object): Request {
  return new Request('http://localhost/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/reports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return all reports', async () => {
      const mockReports = [
        { id: '1', firstName: 'Alice', lastName: 'Anderson' },
        { id: '2', firstName: 'Bob', lastName: 'Brown' },
      ];
      mockGetAllReports.mockResolvedValue(mockReports);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reports).toEqual(mockReports);
    });

    it('should return empty array when no reports exist', async () => {
      mockGetAllReports.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reports).toEqual([]);
    });
  });

  describe('POST', () => {
    it('should create a new report', async () => {
      const mockReport = { id: '1', firstName: 'Alice', lastName: 'Anderson' };
      mockCreateReport.mockResolvedValue(mockReport);

      const request = createRequest({
        first_name: 'Alice',
        last_name: 'Anderson',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.report).toEqual(mockReport);
    });

    it('should create a report with development goals', async () => {
      const mockReport = {
        id: '1',
        firstName: 'Alice',
        lastName: 'Anderson',
        developmentGoals: 'Learn TypeScript',
      };
      mockCreateReport.mockResolvedValue(mockReport);

      const request = createRequest({
        first_name: 'Alice',
        last_name: 'Anderson',
        development_goals: 'Learn TypeScript',
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockCreateReport).toHaveBeenCalledWith('Alice', 'Anderson', 'Learn TypeScript');
    });

    it('should return 400 when first_name is missing', async () => {
      const request = createRequest({
        last_name: 'Anderson',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('First name is required');
    });

    it('should return 400 when first_name is empty after trimming', async () => {
      const request = createRequest({
        first_name: '   ',
        last_name: 'Anderson',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('First name must be between 1 and 50 characters');
    });

    it('should return 400 when first_name exceeds 50 characters', async () => {
      const request = createRequest({
        first_name: 'a'.repeat(51),
        last_name: 'Anderson',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('First name must be between 1 and 50 characters');
    });

    it('should return 400 when last_name is missing', async () => {
      const request = createRequest({
        first_name: 'Alice',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Last name is required');
    });

    it('should return 400 when last_name is empty after trimming', async () => {
      const request = createRequest({
        first_name: 'Alice',
        last_name: '   ',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Last name must be between 1 and 50 characters');
    });

    it('should return 400 when last_name exceeds 50 characters', async () => {
      const request = createRequest({
        first_name: 'Alice',
        last_name: 'a'.repeat(51),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Last name must be between 1 and 50 characters');
    });

    it('should return 400 when development_goals exceeds 5000 characters', async () => {
      const request = createRequest({
        first_name: 'Alice',
        last_name: 'Anderson',
        development_goals: 'a'.repeat(5001),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Development goals must be at most 5000 characters');
    });

    it('should trim whitespace from names', async () => {
      const mockReport = { id: '1', firstName: 'Alice', lastName: 'Anderson' };
      mockCreateReport.mockResolvedValue(mockReport);

      const request = createRequest({
        first_name: '  Alice  ',
        last_name: '  Anderson  ',
      });
      await POST(request);

      expect(mockCreateReport).toHaveBeenCalledWith('Alice', 'Anderson', null);
    });

    it('should pass null when development_goals is not provided', async () => {
      const mockReport = { id: '1', firstName: 'Alice', lastName: 'Anderson' };
      mockCreateReport.mockResolvedValue(mockReport);

      const request = createRequest({
        first_name: 'Alice',
        last_name: 'Anderson',
      });
      await POST(request);

      expect(mockCreateReport).toHaveBeenCalledWith('Alice', 'Anderson', null);
    });
  });
});
