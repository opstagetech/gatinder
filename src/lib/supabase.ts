import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** false quando faltam as variáveis de ambiente (mostramos um aviso na tela) */
export const supabaseConfigured = Boolean(url && key);

export const supabase = createClient(url || 'http://localhost', key || 'missing-key', {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const PHOTO_BUCKET = 'cat-photos';

/** URL pública da foto (o bucket é público só para leitura) */
export function photoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}
