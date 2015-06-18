/*
 * ===========================================================================
 * File: index.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import path from 'path';

const AppDir = path.dirname(require.main.filename);

export function index(req, res) {
    // render the index page
    res.sendFile(path.join(AppDir, 'dist', 'index.html'), null, (err) => {
        if (err) {
            req.app.get('log').error(err);
            res.status(err.status).end();
        }
    });
}
