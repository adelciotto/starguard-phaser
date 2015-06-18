/*
 * ===========================================================================
 * File: serve.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

var gulp = require('gulp');
var gls = require('gulp-live-server');

var server;

gulp.task('serve', function() {
    serve(false);
});

gulp.task('serve:watch', function() {
    serve(true);
});

var serve = function(watch) {
    server = gls.new('app.js');
    server.start();

    if (watch) {
        gulp.watch(['app.js', './src/server/**/*.js'], function() {
            server.start.apply(server);
        });
    }
};
