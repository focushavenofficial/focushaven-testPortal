
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.https://rcfjprtdllvqymhkuewq.supabase.co
;
const supabaseKey = import.meta.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZmpwcnRkbGx2cXltaGt1ZXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDQ1MTksImV4cCI6MjA2ODQyMDUxOX0.UUS4L_bIwRtVRQxFP3GX3Zol2uNowU_XTTLnb6ypwpI;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase
        