 var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    vinylPaths = require('vinyl-paths'),
    del = require('del');

var devdir = 'themes/nightly/assets/dev/';
var styledevdir = devdir + 'style/';
var scriptdevdir = devdir + 'script/';
var libdevdir = devdir + 'lib/';
var fontdevdir = devdir + 'font/';
var imgdevdir = devdir + 'img/';

var distDir = 'themes/nightly/assets/';
var themeDir = [
    'themes/nightly/assets/partial/**/*',
    'themes/nightly/assets/pages/**/*',
    'themes/nightly/assets/layouts/*',
    'themes/nightly/assets/content/*',
    'themes/nightly/assets/img/**/*',
    'themes/nightly/assets/style/*',
    'themes/nightly/assets/script/*',
];

function swallowError (error) {

    //If you want details of the error in the console
    console.log(error.toString());
    notify({message:'Error: ' + error.toString()});

    this.emit('end');
}

/**
 * Compile sass based style and put on temporary dir
 */
gulp.task('style:sass-compile', function() {
    return sass(styledevdir + 'raw/', ({ style: 'expanded', trace: true }))
        .on('error', swallowError)
        .pipe(rename({ extname: '.max.css' }))
        .pipe(gulp.dest(styledevdir + 'temp'));
});

/**
 * Compile (copy) css and put on temporary dir
 */
gulp.task('style:css-compile', function() {
    return gulp.src(styledevdir + 'raw/*.css')
        .pipe(rename({ extname: '.max.css' }))
        .pipe(gulp.dest(styledevdir + 'temp'));
});

/**
 * Minify compiled sass (already css-typed) and put on temp dir too
 */
gulp.task('style:minify', ['style:sass-compile', 'style:css-compile'], function() {
    return gulp.src(styledevdir + 'temp/*.max.css')
        .pipe(rename({ extname: '' }))
        .pipe(rename({ extname: '.min.css' }))
        // See bug https://github.com/jonathanepollack/gulp-minify-css/issues/61
        .pipe(minifycss({ processImport: false }))
        .pipe(gulp.dest(styledevdir + 'temp/'));
});

/**
 * Move all ready-to-deploy style into public dir
 */
gulp.task('style:move-ready-to-deploy', function() {
    return gulp.src(styledevdir + 'deploy/*.css')
        .pipe(gulp.dest( distDir + 'style'));
});

/**
 * Concatenate all style and put on public dir
 */
gulp.task('styles', ['style:minify', 'style:move-ready-to-deploy'], function() {
    // See bug https://github.com/jonathanepollack/gulp-minify-css/issues/61
    var vp = vinylPaths();

    return gulp.src(styledevdir + 'temp/*.min.css')
        .pipe(gulp.dest( distDir + 'style'))
        .on('end', function () {
            del(vp.paths, { force: true });
        });
});

/**
 * Minify script
 */
gulp.task('script:minify', function() {
    return gulp.src(scriptdevdir + 'raw/*.js')
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(scriptdevdir + 'temp'));
});

/**
 * Move all ready-to-deploy script (inside 'deploy/') into public dir
 */
gulp.task('script:move-ready-to-deploy', ['script:minify'], function() {
    return gulp.src(scriptdevdir + 'deploy/*.js')
        .pipe(gulp.dest( distDir + 'script'));
});

/**
 * Move scripts and put on public dir
 */
gulp.task('scripts', ['script:minify', 'script:move-ready-to-deploy'], function() {
    return gulp.src(scriptdevdir + 'temp/*.min.js')
        .pipe(gulp.dest( distDir + 'script'));
});

function syncAll() {
    gulp.start('styles');
    gulp.start('scripts');
}

/**
 * Helper for lost file while checking out accross branch
 */
gulp.task('init', function() {
    gulp.start('styles');
    gulp.start('scripts');
});

/**
 * Watch for change event
 */
gulp.task('watch', function() {
    syncAll();
    gulp.watch(styledevdir + 'raw/*', ['styles']);
    gulp.watch(scriptdevdir + 'raw/*.js', ['scripts']);

    // Buat server livereload
    livereload.listen({
        port: 9000
    });
    gulp.watch(themeDir).on('change', livereload.changed);
});

gulp.task('default', function() {
    syncAll();
});
