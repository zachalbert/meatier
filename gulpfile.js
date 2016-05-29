var gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    browserSync     = require('browser-sync'),
    autoprefixer    = require('gulp-autoprefixer'),
    uglify          = require('gulp-uglify'),
    jshint          = require('gulp-jshint'),
    header          = require('gulp-header'),
    rename          = require('gulp-rename'),
    cleanCSS        = require('gulp-clean-css'),
    nunjucksRender  = require('gulp-nunjucks-render'),
    data            = require('gulp-data'),
    concat          = require('gulp-concat'),
    del             = require('del'),
    sourcemaps      = require('gulp-sourcemaps'),
    plumber         = require('gulp-plumber'),
    package         = require('./package.json');


var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');

var config = {
  jsPaths: [
    'src/js/vendor/modernizr.js',
    'src/js/vendor/jquery.min.js',
    'src/js/vendor/underscore-min.js',
    'src/js/vendor/bootstrap.min.js',
    'src/js/modules/_config.js',
    'src/js/modules/_tools.js',
    'src/js/modules/*',
    'src/js/scripts.js'
  ],
  htmlPaths: [
    'src/templates/*.+(html|nunjucks)'
  ]
};

// De-caching for Data files
function requireUncached( $module ) {
  delete require.cache[require.resolve( $module )];
  return require( $module );
}

gulp.task( 'css', function() {
  return gulp.src('src/scss/style.scss')
  .pipe(sourcemaps.init())
  .pipe(plumber())
  .pipe(sass())
  .pipe(autoprefixer('last 3 version'))
  .pipe(plumber.stop())
  .pipe(gulp.dest('dist/assets/css'))
  .pipe(cleanCSS())
  .pipe(rename({ suffix: '.min' }))
  .pipe(header(banner, { package : package }))
  .pipe(sourcemaps.write('maps'))
  .pipe(gulp.dest('dist/assets/css'))
  .pipe(browserSync.reload({stream:true}));
});

gulp.task( 'js', ['clean:js'], function() {
  gulp.src( config.jsPaths )
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(jshint('.jshintrc'))
    .pipe(concat('scripts.js'))
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task( 'clean:js', function() {
  return del([
    './dist/assets/js/scripts.js',
    './dist/assets/js/scripts.min.js',
  ]);
});

gulp.task( 'html', function() {
  nunjucksRender.nunjucks.configure(['src/templates/']);

  return gulp.src( 'src/templates/layout.html' )
  .pipe( data( function( file ) {
    return requireUncached('./src/data/data.json');
  }))
  .pipe(nunjucksRender())
  .pipe(rename({ basename: 'index' }))
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.reload({stream:true}));
});

gulp.task( 'browser-sync', function() {
  browserSync.init(null, {
    server: {
      baseDir: "dist"
    },
    browser: "google chrome"
  });
});

gulp.task('default', ['css', 'js', 'html', 'browser-sync'], function () {
    gulp.watch("src/scss/*/*.scss", ['css']);
    gulp.watch("src/js/**/*", ['js']);
    gulp.watch("src/templates/**/*.+(html|json)", ['html']);
});
