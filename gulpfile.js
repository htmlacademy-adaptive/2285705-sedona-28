import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import {deleteAsync} from 'del';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import terser from 'gulp-terser';
import { stacksvg } from "gulp-stacksvg";

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//HTML

  const html = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('build'));

}

//Scripts

 const scripts = () => {
  return gulp.src('source/js/script.js')
  .pipe(terser())
  .pipe(gulp.dest('build/js'));
}

//Images

  const optimizeImages = () => {
  return gulp.src('source/img/**/*.jpg')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'));
}

  const copyImages = () => {
  return gulp.src('source/img/**/*.jpg')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'));
}

//WebP

  const createWebp = () => {
  return gulp.src('source/img/**/*.jpg')
  .pipe(squoosh( {
    webp: {}
  }))
  .pipe(gulp.dest('build/img'));
}

//SVG

 const svg = () => {
 return gulp.src(['source/img/**/*.svg', '!source/img/icons/*.svg'])
.pipe(svgo())
.pipe(gulp.dest('build/img'));
 }

 const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
    .pipe(svgo())
    .pipe(stacksvg({
      output: 'sprite.svg'
    }))
    .pipe(gulp.dest('build/img/icons'));
}

// Copy

  const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
    'source/manifest.webmanifest',
    ] , {
      base: 'source'
    })
    .pipe(gulp.dest('build'))
  done();
}

//Clean

  export const clean = () => {
  return deleteAsync('build');
}

// Server

  const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//Reload

  const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

  const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
}

//Build

  export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    createWebp,
    sprite
  ),
);

//Default

  export default  gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    createWebp,
    sprite
  ),
  gulp.series (
    server,
    watcher
  ));
