import { vi } from 'vitest';

// Mock uuid to return predictable IDs
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-1234'),
}));

// Create mock database functions
export const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// Helper to create chainable mock
export function createChainableMock(returnValue: unknown = []) {
  const chain: Record<string, unknown> = {};

  chain.from = vi.fn().mockReturnValue(chain);
  chain.where = vi.fn().mockReturnValue(chain);
  chain.orderBy = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockResolvedValue(returnValue);
  chain.values = vi.fn().mockResolvedValue(undefined);
  chain.set = vi.fn().mockReturnValue(chain);

  // For queries that don't use limit()
  chain.then = vi.fn((resolve: (value: unknown) => void) => resolve(returnValue));

  return chain;
}

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
