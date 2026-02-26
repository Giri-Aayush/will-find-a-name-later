import { createClient } from '@supabase/supabase-js';
import { loadConfig } from '../config.js';

const config = loadConfig();

export const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
