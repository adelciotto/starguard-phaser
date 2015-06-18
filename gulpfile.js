/*
 * ===========================================================================
 * File: gulpfile.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

var gulp = require('gulp');
var fs = require('fs');
var runSequence = require('run-sequence');
var config = require('./gulp/config.js');

var files = fs.readdirSync('./gulp');

files.forEach(function(file) {
    try {
        require('./gulp/' + file);
    } catch(e) {
        console.error('Unable to require file: ' + file + ': ', e);
    }
});

gulp.task('build', function(cb) {
    runSequence('clean', ['copy', 'assets'], ['jshint', 'scripts'], cb);
});

gulp.task('start', function(cb) {
    runSequence('clean', ['copy', 'assets'], ['jshint', 'scripts'],
        'serve', cb);
});

gulp.task('start:dev', function(cb) {
    runSequence(['copy', 'assets'], ['jshint', 'scripts:watch'],
        'serve:watch', cb);
});

gulp.task('default', ['start:dev']);
