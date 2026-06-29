import { generateCustomDrill, deleteCustomDrill } from '../lib/custom-drill-generator';
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

describe('deleteCustomDrill', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let mockEq: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockEq = jest.fn();
    mockDelete = jest.fn().mockReturnValue({ eq: mockEq });

    (supabase.from as jest.Mock).mockReturnValue({
      delete: mockDelete
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return true on successful deletion', async () => {
    mockEq.mockResolvedValueOnce({ error: null });

    const result = await deleteCustomDrill('drill-123');

    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('custom_drills');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', 'drill-123');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should log error and return false when supabase returns an error', async () => {
    const mockError = new Error('Database error');
    mockEq.mockResolvedValueOnce({ error: mockError });

    const result = await deleteCustomDrill('drill-123');

    expect(result).toBe(false);
    expect(supabase.from).toHaveBeenCalledWith('custom_drills');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', 'drill-123');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting custom drill:', mockError);
  });

  it('should log exception and return false when supabase query throws', async () => {
    const mockException = new Error('Network exception');
    mockEq.mockRejectedValueOnce(mockException);

    const result = await deleteCustomDrill('drill-123');

    expect(result).toBe(false);
    expect(supabase.from).toHaveBeenCalledWith('custom_drills');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', 'drill-123');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Exception deleting custom drill:', mockException);
  });
});
