import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Navegadores de smart TV costumam ser versões antigas do Chrome:
    // o código e o CSS são "traduzidos" para funcionar neles também.
    target: ['es2017', 'chrome61', 'safari12'],
    cssTarget: ['chrome61', 'safari12'],
  },
});
