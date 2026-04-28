import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@scss': path.resolve(__dirname, 'src/scss'),
      variables: path.resolve(__dirname, 'src/scss/_variables.scss'),
      mixins: path.resolve(__dirname, 'src/scss/mixins/_index.scss')
    }
  },
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use '@scss/variables' as *;`
      }
    }
  }
})
