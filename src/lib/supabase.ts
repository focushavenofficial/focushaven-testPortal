import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rcfjprtdllvqymhkuewq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'fallback-key';

let supabase;

try {
  if (supabaseAnonKey === 'fallback-key') {
    console.warn('Supabase environment variables not configured. Using mock client.');
    // Create a comprehensive mock Supabase client
    const createMockQuery = () => ({
      select: () => createMockQuery(),
      eq: () => createMockQuery(),
      single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      order: () => createMockQuery(),
      insert: () => createMockQuery(),
      update: () => createMockQuery(),
      delete: () => createMockQuery(),
      then: (resolve) => resolve({ data: [], error: new Error('Supabase not configured') })
    });

    supabase = {
      from: () => createMockQuery(),
      rpc: () => Promise.resolve({ error: new Error('Supabase not configured') })
    };
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a comprehensive mock client as fallback
  const createMockQuery = () => ({
    select: () => createMockQuery(),
    eq: () => createMockQuery(),
    single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    order: () => createMockQuery(),
    insert: () => createMockQuery(),
    update: () => createMockQuery(),
    delete: () => createMockQuery(),
    then: (resolve) => resolve({ data: [], error: new Error('Supabase not configured') })
  });

  supabase = {
    from: () => createMockQuery(),
    rpc: () => Promise.resolve({ error: new Error('Supabase not configured') })
  };
}

export { supabase };
