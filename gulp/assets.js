/*
 * ===========================================================================
 * File: assets.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var cached = require('gulp-cached');

gulp.task('assets:imagemin', function() {
    return gulp.src('./res/img/*.png')
        .pipe(cached('imagemin'))
        .pipe(gulp.dest('./dist/res/img'));
});

gulp.task('assets:copy', function() {
    return gulp.src(['./res/**/*', '!./res/img'])
        .pipe(gulp.dest('./dist/res'));
});

gulp.task('assets', ['assets:imagemin', 'assets:copy']);
