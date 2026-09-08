/**
 * Legacy Supabase adapter forwarder.
 * Supabase client has been removed and replaced by liveDb (VITE_LIVE_DATABASE_URL).
 */
import { liveDb } from './dbClient';

export const supabase = liveDb;
export default liveDb;
