
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LocationData } from '../types';

// Safely access environment variables
const supabaseUrl = typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined;
const supabaseAnonKey = typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined;

// Prevent "supabaseUrl is required" crash by checking values before initialization
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const TARGET_ID = 'mey_syavarul';

/**
 * Updates the target's location in the database.
 * Fails gracefully if Supabase is not configured.
 */
export const updateLocation = async (location: LocationData) => {
  if (!supabase) {
    console.warn('Supabase not configured. Location update skipped.');
    return;
  }
  
  const { error } = await supabase
    .from('locations')
    .upsert({
      id: TARGET_ID,
      lat: location.lat,
      lng: location.lng,
      accuracy: location.accuracy,
      timestamp: location.timestamp
    });
  
  if (error) console.error('Error updating location:', error);
};

/**
 * Fetches the most recent location from the database.
 */
export const getLatestLocation = async (): Promise<LocationData | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', TARGET_ID)
      .single();

    if (error) {
      console.error('Error fetching location:', error);
      return null;
    }
    return data as LocationData;
  } catch (e) {
    console.error('Supabase fetch failed:', e);
    return null;
  }
};

/**
 * Subscribes to real-time location changes.
 */
export const subscribeToLocation = (onUpdate: (location: LocationData) => void) => {
  if (!supabase) {
    return { unsubscribe: () => {} };
  }

  return supabase
    .channel('public:locations')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'locations', filter: `id=eq.${TARGET_ID}` },
      (payload) => {
        onUpdate(payload.new as LocationData);
      }
    )
    .subscribe();
};
