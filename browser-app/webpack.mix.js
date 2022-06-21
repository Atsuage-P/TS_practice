const mix = require('laravel-mix');
const fs = require('fs');

mix.setPublicPath('dist');

mix.ts('ts/index.ts', 'dist')
  .sourceMaps()
  .then(() => {
    fs.unlinkSync('dist/mix-manifest.json')
  });

mix.browserSync({
  files: ['dist/*'],
  server: 'dist',
  proxy: false,
  port: 3000,
});
