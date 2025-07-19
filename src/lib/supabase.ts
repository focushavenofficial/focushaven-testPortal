import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rcfjprtdllvqymhkuewq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Set user context for RLS policies
export const setUserContext = async (userId: string, userRole: string) => {
  await supabase.rpc('set_config', {
    setting_name: 'app.current_user_id',
    setting_value: userId,
    is_local: true
  });
  
  await supabase.rpc('set_config', {
    setting_name: 'app.current_user_role',
    setting_value: userRole,
    is_local: true
  });
};