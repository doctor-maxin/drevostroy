let gulp = require('gulp');
let sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
let browserSync = require('browser-sync').create();
const {series} = require('gulp');
const minifyJS = require('gulp-js-minify')
const browserify = require('gulp-browserify');

sass.compiler = require('node-sass');
 
function css() {

    return gulp.src('./assets/css/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/css'))

}

function js() {
    return gulp.src('./assets/js/**/*.js')
        .pipe(minifyJS())
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(gulp.dest('dist/js'))
}

function serve() {
    browserSync.init({
        server: {
            baseDir: './'
        }
    })

    gulp.watch('./assets/sass/**/*.scss', styles);
    gulp.watch('./assets/css/**/*.css', css);

    gulp.watch('./dist/js/**/*.js').on('change', browserSync.reload)
    gulp.watch('./dist/css/**/*.css').on('change', browserSync.reload)
    gulp.watch("*.html").on('change', browserSync.reload);
}

function styles() {
  return gulp.src('./assets/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./assets/css'))
};



exports.default = series(js, serve)