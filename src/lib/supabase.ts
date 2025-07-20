import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rcfjprtdllvqymhkuewq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'fallback-key';

let supabase;

try {
  if (supabaseAnonKey === 'fallback-key') {
    console.warn('Supabase environment variables not configured. Using mock client.');
    // Create a mock Supabase client
    supabase = {
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase not configured') }) })
      }),
      rpc: () => Promise.resolve({ error: new Error('Supabase not configured') })
    };
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a mock client as fallback
  supabase = {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase not configured') }) })
    }),
    rpc: () => Promise.resolve({ error: new Error('Supabase not configured') })
  };
}

export { supabase };
// Set user context for RLS policies
export const setUserContext = async (userId: string, userRole: string) => {
  if (supabaseAnonKey !== 'fallback-key') {
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
  }
};
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