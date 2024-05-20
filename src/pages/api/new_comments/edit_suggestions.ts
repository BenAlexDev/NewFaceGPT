import { createEmbedding } from '@/utils/server/generate-embeddings';
import { convertAndSave } from '@/utils/server/generate-suggestions';
import { supabase, supabaseAdmin } from '@/utils/server/supabase-admin'
import type { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const suggestions = req.body.suggestions;
    const id = req.body.id;
    await supabaseAdmin.from('webhook').update([{suggestions}]).eq("id", id);
    res.status(200).json({});
}
