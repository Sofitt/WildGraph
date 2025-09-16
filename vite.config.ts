import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(), 
    tsconfigPaths(), 
    viteSingleFile({
      removeViteModuleLoader: true
    })
  ],
  css: {
    postcss: './postcss.config.cjs',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'Люминарий.js',
        chunkFileNames: 'Люминарий-[name].js',
        assetFileNames: 'Люминарий-[name].[ext]'
      }
    }
  }
})
