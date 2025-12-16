
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [react()],
    base: isProd ? '/restaurant-site-demo/' : '/',  
  }
})
