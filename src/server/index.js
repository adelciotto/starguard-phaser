/*
 * ===========================================================================
 * File: index.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

var routes = require('./routes');

import express from 'express';
import Storage from './storage/storage';
import errorHandler from 'errorhandler';
import path from 'path';
import http from 'http';
import Log from 'log';
import * as leaderboard from './routes/leaderboard'; // jshint ignore: line

const NodeEnv = process.env.NODE_ENV || 'development';

var app;
var storage;
var log;

export function start(dirname) {
    app = express();
    log = new Log('info');

    var options;
    if (NodeEnv === 'development') {
        options = { host: 'localhost', user: 'root', pass: '' };
        app.use(errorHandler());
    } else if (NodeEnv === 'production') {
        // TODO: set db connection options for prod env
    }

    storage = new Storage(app, options);
    app.set('log', log);
    app.set('storage', storage);

    initRoutes(dirname);
}

function initRoutes(dirname) {
    app.get('/', routes.index);
    app.get('/leaderboard', leaderboard.index);
    app.use(express.static(path.join(dirname, '/dist')));

    listen();
}

function listen() {
    var port = process.env.PORT || 8080;

    app.listen(port, f => {
        log.info('express server listening on port: %d', port);
    });
}
