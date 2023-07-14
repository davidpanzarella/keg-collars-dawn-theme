import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'node_modules/swiper/swiper-bundle.min.*', dest: '' },
        {
          src: 'node_modules/alpinejs/dist/cdn.min.js',
          dest: '',
          rename: 'alpinejs.min.js'
        }
      ]
    })
  ],
  build: {
    outDir: 'assets',
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      input: './assets/base-tailwind.css',
      output: {
        dir: 'assets',
        assetFileNames: 'styles.css'
      }
    }
  }
});
