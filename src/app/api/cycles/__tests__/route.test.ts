import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the lib functions
vi.mock('@/lib/cycles', () => ({
  getAllCycles: vi.fn(),
  createCycle: vi.fn(),
  cycleNameExists: vi.fn(),
}));

import { GET, POST } from '../route';
import { getAllCycles, createCycle, cycleNameExists } from '@/lib/cycles';

const mockGetAllCycles = getAllCycles as ReturnType<typeof vi.fn>;
const mockCreateCycle = createCycle as ReturnType<typeof vi.fn>;
const mockCycleNameExists = cycleNameExists as ReturnType<typeof vi.fn>;

function createRequest(body: object): Request {
  return new Request('http://localhost/api/cycles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/cycles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return all cycles', async () => {
      const mockCycles = [
        { id: '1', name: 'Cycle 1', status: 'archived' },
        { id: '2', name: 'Cycle 2', status: 'active' },
      ];
      mockGetAllCycles.mockResolvedValue(mockCycles);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cycles).toEqual(mockCycles);
    });

    it('should return empty array when no cycles exist', async () => {
      mockGetAllCycles.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cycles).toEqual([]);
    });
  });

  describe('POST', () => {
    it('should create a new cycle', async () => {
      const mockCycle = { id: '1', name: 'Q1 2024', status: 'active' };
      mockCycleNameExists.mockResolvedValue(false);
      mockCreateCycle.mockResolvedValue(mockCycle);

      const request = createRequest({
        name: 'Q1 2024',
        start_date: '2024-01-01',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.cycle).toEqual(mockCycle);
    });

    it('should return 400 when name is missing', async () => {
      const request = createRequest({
        start_date: '2024-01-01',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name is required');
    });

    it('should return 400 when name is empty after trimming', async () => {
      const request = createRequest({
        name: '   ',
        start_date: '2024-01-01',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name must be between 1 and 50 characters');
    });

    it('should return 400 when name exceeds 50 characters', async () => {
      const request = createRequest({
        name: 'a'.repeat(51),
        start_date: '2024-01-01',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name must be between 1 and 50 characters');
    });

    it('should return 400 when name already exists', async () => {
      mockCycleNameExists.mockResolvedValue(true);

      const request = createRequest({
        name: 'Existing Cycle',
        start_date: '2024-01-01',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('A cycle with this name already exists');
    });

    it('should use current date when start_date is not provided', async () => {
      const mockCycle = { id: '1', name: 'New Cycle', status: 'active' };
      mockCycleNameExists.mockResolvedValue(false);
      mockCreateCycle.mockResolvedValue(mockCycle);

      const request = createRequest({
        name: 'New Cycle',
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockCreateCycle).toHaveBeenCalledWith(
        'New Cycle',
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
      );
    });

    it('should trim whitespace from name', async () => {
      const mockCycle = { id: '1', name: 'Q1 2024', status: 'active' };
      mockCycleNameExists.mockResolvedValue(false);
      mockCreateCycle.mockResolvedValue(mockCycle);

      const request = createRequest({
        name: '  Q1 2024  ',
        start_date: '2024-01-01',
      });
      await POST(request);

      expect(mockCreateCycle).toHaveBeenCalledWith('Q1 2024', '2024-01-01');
    });
  });
});
