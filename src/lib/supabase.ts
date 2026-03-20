import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/[^\x20-\x7E]/g, '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/[^\x20-\x7E]/g, '').trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PointStatus = 'livre' | 'atencao' | 'sujo';

export interface StatusUpdate {
  id: string;
  poi_id: string;
  status: PointStatus;
  timestamp: string; // ISO string
  message: string;
  reporter_location?: 'via-foz' | 'via-cascavel';
}

export interface POI {
  id: string;
  name: string;
  type: 'prf' | 'pre' | 'receita' | 'pedagio';
  lat: number;
  lng: number;
  status: PointStatus;
  lastUpdate: string; // Using camelCase for frontend compatibility
  last_update?: string; // Keep snake_case as optional for DB mapping
  image_url?: string;
  routes: string[];
  history?: StatusUpdate[];
}
