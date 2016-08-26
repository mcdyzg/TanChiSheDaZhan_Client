// https://github.com/gulpjs/gulp/tree/master/docs
// https://github.com/gulpjs/gulp/blob/master/docs/API.md
var gulp = require('gulp');

// https://www.npmjs.com/package/gulp-watch/
var watch = require('gulp-watch');

// https://www.npmjs.com/package/gulp-webpack/
var webpack = require("gulp-webpack");

// https://github.com/gulpjs/gulp/blob/master/docs/recipes/server-with-livereload-and-css-injection.md
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// 本地开发版
gulp.task('pack_local', function() {
    gulp.src('')
        .pipe(webpack(require('./webpack.local.js')))
        .pipe(gulp.dest('./dist'))
    console.info('_____pack local: done');
});

// watch files for changes and reload
gulp.task('watch', ['pack_local'], function() {
    // console.log('__dirname:' + __dirname);
    browserSync({
        server: {
            baseDir: './'
        },
        open: "external"
    });

    gulp.watch(
        'src/*'
    , ['pack_local', function() {
        setTimeout(function() {
            reload();
        }, 1000);
    }]);
});
