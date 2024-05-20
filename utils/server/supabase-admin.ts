import { createClient } from '@supabase/supabase-js';
import { SUPABSE_URL} from '@/utils/app/consts';
import { SUPABSE_ROLE_KEY } from '@/utils/server/consts';
import {
    createPagesBrowserClient,
    User
  } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/types_db';
export const supabase = createPagesBrowserClient<Database>();
export const supabaseAdmin = createClient<Database>(
    SUPABSE_URL || '',
    SUPABSE_ROLE_KEY || ''
 );