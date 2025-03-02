import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  if (command === 'build') {
    return {
      build: {
        lib: {
          entry: 'lib/basket.js',
          name: 'basket',
          fileName: (format) => `basket.${format === 'es' ? 'js' : 'cjs'}`,
          formats: ['es', 'cjs']
        },
        rollupOptions: {
          external: ['rsvp'],
          output: {
            globals: {
              rsvp: 'RSVP'
            }
          }
        }
      }
    };
  } else {
    return {
      root: 'demo',
      publicDir: '../public',
      build: {
        outDir: '../dist-demo'
      }
    };
  }
});
