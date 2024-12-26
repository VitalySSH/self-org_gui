import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()]
    },
    // preprocessorOptions: {
    //   scss: {
    //     api: 'modern-compile',
    //     quietDeps: true,
    //     additionalData: `
    //       @use 'src/shared/assets/scss/variables' as *'
    //     ` + ';',
    //   }
    // },
  },
})
