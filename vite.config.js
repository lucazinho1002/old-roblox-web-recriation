import { defineConfig } from 'vite';

export default defineConfig({
  // Desativa o comportamento padrão da pasta public ser servida na raiz
  publicDir: false,
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true
  },
  base: './'
});