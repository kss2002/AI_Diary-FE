//vite.confug.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,  
    port: 5173,

    proxy: {
      '/api': {
        target: 'http://3.34.67.51:8080', //  백엔드 서버
        changeOrigin: true,               
        secure: false,

       
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'http://3.34.67.51:8080');
          });
        },

        
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
