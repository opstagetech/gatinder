import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { supabaseConfigured } from './lib/supabase';
import { AdminLayout } from './admin/AdminLayout';
import { CatList } from './admin/CatList';
import { CatForm } from './admin/CatForm';
import { Settings } from './admin/Settings';
import { TvScreen } from './tv/TvScreen';

export default function App() {
  if (!supabaseConfigured) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <div className="text-5xl">🔧</div>
        <h1 className="mt-4 font-display text-2xl font-bold">Falta configurar o Supabase</h1>
        <p className="mt-2 text-muted">
          Cadastre <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> nas variáveis de ambiente do
          Cloudflare Pages e publique de novo.
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/tv" element={<TvScreen />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<CatList />} />
          <Route path="novo" element={<CatForm />} />
          <Route path="gato/:id" element={<CatForm />} />
          <Route path="config" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
