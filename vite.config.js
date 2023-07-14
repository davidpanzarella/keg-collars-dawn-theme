import { defineConfig } from 'vite';
import { copy } from 'vite-plugin-copy';

export default defineConfig({
  plugins: [
    copy({
      targets: [
        { src: 'node_modules/swiper/swiper-bundle.min.*', dest: 'assets' },
        {
          src: 'node_modules/alpinejs/dist/cdn.min.js',
          dest: 'assets',
          rename: 'alpinejs.min.js',
        },
      ],
      hook: 'writeBundle', // run the plugin at this stage
    }),
  ],
  build: {
    outDir: 'assets',
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      input: './assets/base-tailwind.css',
      output: {
        dir: 'assets',
        assetFileNames: 'styles.css',
      },
    },
  },
});
