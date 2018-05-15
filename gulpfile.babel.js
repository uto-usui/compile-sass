/**
 * Create paths and import packages
 *
 * いろんなところにパスを通す。
 * パッケージを読み込む。
 *
 */
const gulp = require('gulp'),

      //
      // path
      // - - - - - - - - - -
      docs = '.',
      //
      srcDir =  docs + '/src',
      distDir =  docs + '/dist',
      //
      srcAssetsDir = srcDir + '/assets',
      distAssetsDir = distDir + '/assets',
      //
      srcPath = {
        'sassPath': srcAssetsDir + '/sass',
      },
      distPath = {
        'cssPath': distAssetsDir + '/css',
      },

      //
      // common
      // - - - - - - - - -
      plumber = require('gulp-plumber'), // error escape
      rename = require('gulp-rename'), // rename
      notify = require('gulp-notify'), // alert
      watch = require('gulp-watch'),  // watch

      //
      // CSS
      // - - - - - - - - -
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      postcssGapProperties = require('postcss-gap-properties'),
      sass = require('gulp-sass'), // Sass compass
      csscomb = require('gulp-csscomb'), // css
      cssmin = require('gulp-cssmin'), // css min
      frontnote = require('gulp-frontnote'), // style guide
      //
      // browser
      // - - - - - - - - -
      minifyHtml = require('gulp-minify-html'), // html min
      browser = require('browser-sync'); // browser start

/**
 * Start the server
 *
 */
gulp.task('browser', () => {
  browser({
    server: { baseDir: distDir + '/' },
    open: 'external',
  });
});


/**
 * CSS task
 *
 * Convert Sass (SCSS) to CSS. (Compass)
 * Generate a style guide.(frontnote)
 * Execute autoprefixer.
 * Format the order of CSS properties.
 * Save it temporarily, compress it, rename it, resave it.
 * Reload the browser.
 *
 * Sass(SCSS)をCSSに変換する。(compass)
 * スタイルガイドを生成する。(frontnote)
 * autoprefixerを実行する。
 * CSSプロパティの並び順を整形する。
 * 一時保存して、圧縮して名前を変更して、再保存。
 * ブラウザを再起動する。
 *
 */
gulp.task('sass', () => {
  gulp.src(srcPath.sassPath + '/**/*.scss')
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(frontnote({
      out: distPath.cssPath + '/guide/',
      css:  '../main.css',
      title: 'Style Guide'
    }))
    .pipe(sass())
    .pipe(postcss([
      postcssGapProperties(),
      autoprefixer({
        browsers: [
          'last 2 version',
          'Android >= 4.4.4',
          'Explorer 11',
        ],
        cascade: false,
        grid: true,
      })
    ]))
    .pipe(csscomb())
    .pipe(gulp.dest(distPath.cssPath + '/'))
    .pipe(cssmin())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(distPath.cssPath + '/'))
    .pipe(browser.reload({ stream: true }))
    .pipe(notify('🍣 css task finished 🍣'));
});


/**
 *
 * Create common objects that can be used within ejs.
 * Change the extension to html.
 * Compress and save html.
 * Reload the browser.
 *
 * ejs内で利用出来る共通のオブジェクトを作成。
 * htmlに拡張子を変更する。
 * htmlを圧縮して保存。
 * ブラウザを再起動する。
 *
 */
gulp.task('html.init', () => {
  return gulp.src([srcDir + '/**/*.html'])
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(minifyHtml())
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest(distDir + '/'))
    .pipe(notify('🍣 html task finished 🍣'));
});
//
gulp.task('html.reload', ['html.init'], () => {
  return browser.reload();
});
//
gulp.task('html', ['html.init', 'html.reload']);

/**
 * build
 * npm run build
 */
gulp.task('build', ['sass', 'html'], () => {
  return setTimeout(() => {
    gulp.src(srcDir).pipe(notify({
      'title': 'Nice',
      'sound': 'Frog',
      'message': '🍣 build task finished 🍣'
    }));
  }, 1000);
});


/**
 * dafault task
 * npm run dev
 */
gulp.task('default', ['browser'], () => {
  watch([srcPath.sassPath + '/**/*.scss'], () => { gulp.start(['sass']) });
  watch([srcDir + '/**/*.html'], () => { gulp.start(['html']) });
});
