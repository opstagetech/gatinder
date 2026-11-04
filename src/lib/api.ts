import { supabase, PHOTO_BUCKET } from './supabase';
import type { Cat, CatInput, Settings } from '../types';

/** Mensagens de erro em português para a equipe */
export function friendlyError(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? String(e);
  if (/Invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.';
  if (/Email not confirmed/i.test(msg)) return 'Este e-mail ainda não foi confirmado no Supabase.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) return 'Sem conexão com a internet. Tente de novo.';
  if (/row-level security|permission denied/i.test(msg)) return 'Sua conta não tem permissão para isso. Fale com o responsável.';
  if (/payload too large|exceeded the maximum/i.test(msg)) return 'A foto é grande demais.';
  return msg;
}

export async function listCats(): Promise<Cat[]> {
  const { data, error } = await supabase
    .from('cats')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Cat[];
}

export async function getCat(id: string): Promise<Cat> {
  const { data, error } = await supabase.from('cats').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Cat;
}

/** Envia a foto já cortada; devolve o caminho no bucket */
export async function uploadPhoto(blob: Blob): Promise<string> {
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, {
    contentType: blob.type,
    cacheControl: '31536000', // nome é único: pode guardar em cache "pra sempre"
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function removePhoto(path: string | null | undefined) {
  if (!path) return;
  // se falhar, só sobra um arquivo órfão no bucket; não atrapalha a equipe
  await supabase.storage.from(PHOTO_BUCKET).remove([path]).catch(() => {});
}

export async function saveCat(id: string | null, input: CatInput & { photo_path: string | null }): Promise<Cat> {
  const q = id
    ? supabase.from('cats').update(input).eq('id', id).select().single()
    : supabase.from('cats').insert(input).select().single();
  const { data, error } = await q;
  if (error) throw error;
  return data as Cat;
}

export async function updateStatus(id: string, status: Cat['status']) {
  const { error } = await supabase.from('cats').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteCat(cat: Cat) {
  const { error } = await supabase.from('cats').delete().eq('id', cat.id);
  if (error) throw error;
  await removePhoto(cat.photo_path);
}

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase.from('settings').select('*').single();
  if (error) throw error;
  return data as Settings;
}

export async function saveSettings(s: Omit<Settings, 'id' | 'updated_at'>) {
  const { error } = await supabase.from('settings').update(s).eq('id', true);
  if (error) throw error;
}
