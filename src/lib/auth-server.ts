import { NextRequest } from 'next/server';
import { supabaseAdmin } from './db-admin';
import { getSupabase } from './db';

// Extract token from request and get user
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];

    // Create a new client to avoid state issues between requests
    const supabase = getSupabase();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Authentication error:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}
