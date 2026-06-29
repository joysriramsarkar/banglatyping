import { getUserWeakCharacters } from '@/lib/user-progress';
import { supabase } from '@/lib/db';

jest.mock('@/lib/db', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('getUserWeakCharacters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an empty array when supabase returns null data', async () => {
    const mockLimit = jest.fn().mockResolvedValue({ data: null, error: null });
    const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockLt = jest.fn().mockReturnValue({ order: mockOrder });
    const mockEq = jest.fn().mockReturnValue({ lt: mockLt });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const result = await getUserWeakCharacters('test-user-id');

    expect(supabase.from).toHaveBeenCalledWith('user_weak_characters');
    expect(result).toEqual([]);
  });

  it('should return data when supabase returns valid data', async () => {
    const mockData = [{ character: 'ক', accuracy_rate: 85 }];
    const mockLimit = jest.fn().mockResolvedValue({ data: mockData, error: null });
    const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockLt = jest.fn().mockReturnValue({ order: mockOrder });
    const mockEq = jest.fn().mockReturnValue({ lt: mockLt });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const result = await getUserWeakCharacters('test-user-id');

    expect(supabase.from).toHaveBeenCalledWith('user_weak_characters');
    expect(result).toEqual(mockData);
  });

  it('should return an empty array when supabase returns an error', async () => {
    const mockError = { message: 'Database error' };
    const mockLimit = jest.fn().mockResolvedValue({ data: null, error: mockError });
    const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockLt = jest.fn().mockReturnValue({ order: mockOrder });
    const mockEq = jest.fn().mockReturnValue({ lt: mockLt });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    // Mock console.error to prevent it from cluttering the test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getUserWeakCharacters('test-user-id');

    expect(supabase.from).toHaveBeenCalledWith('user_weak_characters');
    expect(result).toEqual([]);

    consoleSpy.mockRestore();
  });

  it('should return an empty array when supabase throws an exception', async () => {
    const mockError = new Error('Network error');
    const mockLimit = jest.fn().mockRejectedValue(mockError);
    const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockLt = jest.fn().mockReturnValue({ order: mockOrder });
    const mockEq = jest.fn().mockReturnValue({ lt: mockLt });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    // Mock console.error to prevent it from cluttering the test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getUserWeakCharacters('test-user-id');

    expect(supabase.from).toHaveBeenCalledWith('user_weak_characters');
    expect(result).toEqual([]);

    consoleSpy.mockRestore();
  });
});
