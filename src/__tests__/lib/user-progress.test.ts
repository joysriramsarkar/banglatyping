import { getUserStatistics } from '../../lib/user-progress';
import { supabase } from '../../lib/db';

// Mock the dependencies
jest.mock('../../lib/db', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('getUserStatistics', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return null when an exception is thrown', async () => {
    // Setup the mock to throw an exception
    (supabase.from as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });

    const result = await getUserStatistics('test-user-123');

    // Assertions
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Exception fetching user statistics:',
      expect.any(Error)
    );
  });

  it('should return data when fetch is successful', async () => {
    const mockData = {
      user_id: 'test-user-123',
      lessons_practiced: 5,
      average_accuracy: 95,
      average_wpm: 60,
      best_wpm: 75,
      best_accuracy: 100,
      total_sessions: 10,
    };

    // Setup the mock to return data
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({ data: mockData, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    const result = await getUserStatistics('test-user-123');

    expect(result).toEqual(mockData);
    expect(supabase.from).toHaveBeenCalledWith('user_statistics');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-123');
  });

  it('should return default statistics when error code is PGRST116 (Not Found)', async () => {
    // Setup the mock to return PGRST116 error
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' }
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    const result = await getUserStatistics('test-user-123');

    expect(result).toEqual({
      user_id: 'test-user-123',
      lessons_practiced: 0,
      average_accuracy: 0,
      average_wpm: 0,
      best_wpm: 0,
      best_accuracy: 0,
      total_sessions: 0,
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return null and log error when a general error occurs', async () => {
    // Setup the mock to return a general error
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { code: 'OTHER_ERROR', message: 'Something went wrong' }
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    const result = await getUserStatistics('test-user-123');

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching user statistics:',
      { code: 'OTHER_ERROR', message: 'Something went wrong' }
    );
  });
});
