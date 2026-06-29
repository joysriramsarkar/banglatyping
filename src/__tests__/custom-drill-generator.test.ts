import { generateCustomDrill, getUserCustomDrills } from '../lib/custom-drill-generator';
import { supabase } from '../lib/db';
import { generateDrills } from '../lib/lessons';

// Mock dependencies
jest.mock('../lib/db', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('../lib/lessons', () => ({
  generateDrills: jest.fn(),
}));

describe('generateCustomDrill', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should return null and warn when weakCharacters array is empty', async () => {
    const result = await generateCustomDrill('user123', []);

    expect(result).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith('No weak characters found for custom drill generation');
    expect(supabase.from).not.toHaveBeenCalled();
    expect(generateDrills).not.toHaveBeenCalled();
  });
});

describe('getUserCustomDrills', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return an array of custom drills on success', async () => {
    const mockData = [{ id: '1', user_id: 'user123' }, { id: '2', user_id: 'user123' }];
    const mockLimit = jest.fn().mockResolvedValue({ data: mockData, error: null });
    const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const result = await getUserCustomDrills('user123');

    expect(result).toEqual(mockData);
    expect(supabase.from).toHaveBeenCalledWith('custom_drills');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user123');
    expect(mockOrder).toHaveBeenCalledWith('generated_at', { ascending: false });
    expect(mockLimit).toHaveBeenCalledWith(10);
  });

  it('should return an empty array and log error when Supabase returns an error', async () => {
    const mockError = { message: 'Database error' };
    const mockLimit = jest.fn().mockResolvedValue({ data: null, error: mockError });
    const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    const result = await getUserCustomDrills('user123');

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching custom drills:', mockError);
  });

  it('should return an empty array and log exception when an exception is thrown', async () => {
    const mockError = new Error('Network error');
    (supabase.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const result = await getUserCustomDrills('user123');

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Exception fetching custom drills:', mockError);
  });
});
