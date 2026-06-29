import { getUserWeakCharacters } from '../lib/user-progress';
import { supabase } from '../lib/db';

// Mock dependencies
jest.mock('../lib/db', () => {
  return {
    supabase: {
      from: jest.fn(),
    },
  };
});

describe('getUserWeakCharacters', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let mockLimit: jest.Mock;
  let mockOrder: jest.Mock;
  let mockLt: jest.Mock;
  let mockEq: jest.Mock;
  let mockSelect: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Setup chainable mocks
    mockLimit = jest.fn();
    mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
    mockLt = jest.fn().mockReturnValue({ order: mockOrder });
    mockEq = jest.fn().mockReturnValue({ lt: mockLt });
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return an array of weak characters on successful fetch', async () => {
    const mockData = [
      { character: 'a', accuracy_rate: 80, strength_level: 'Weak' },
      { character: 'b', accuracy_rate: 70, strength_level: 'Very Weak' }
    ];

    mockLimit.mockResolvedValueOnce({ data: mockData, error: null });

    const result = await getUserWeakCharacters('user123', 95);

    expect(result).toEqual(mockData);
    expect(supabase.from).toHaveBeenCalledWith('user_weak_characters');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user123');
    expect(mockLt).toHaveBeenCalledWith('accuracy_rate', 95);
    expect(mockOrder).toHaveBeenCalledWith('accuracy_rate', { ascending: true });
    expect(mockLimit).toHaveBeenCalledWith(30);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return an empty array and log error when supabase returns an error', async () => {
    const mockError = { message: 'Database connection error' };

    mockLimit.mockResolvedValueOnce({ data: null, error: mockError });

    const result = await getUserWeakCharacters('user123');

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching weak characters:', mockError);
    // Uses default threshold
    expect(mockLt).toHaveBeenCalledWith('accuracy_rate', 95);
  });

  it('should return an empty array and log error when an exception is thrown', async () => {
    const exception = new Error('Network timeout');

    mockLimit.mockRejectedValueOnce(exception);

    const result = await getUserWeakCharacters('user123');

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Exception fetching weak characters:', exception);
  });
});
