/*
 * ===========================================================================
 * File: storage.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import mysql from 'mysql';
import _ from 'underscore';
import { create } from './create';

class Storage {
    constructor(app, options, connLimit = 100) {
        this._app = app;
        this._dbPool = mysql.createPool(_.extend(options, {
            connectionLimit: connLimit,
            database: 'game_data'
        }));

        this.getConnection(create, false);
    }

    getConnection(cb, autoRelease = true) {
        this._getConnectionFromPool().then((conn) => {
            cb(conn);

            if (autoRelease) {
                conn.release();
            }
        }).catch((err) => {
            this._app.get('log').error(err);
        });
    }

    _getConnectionFromPool() {
        return new Promise((resolve, reject) => {
            this._dbPool.getConnection((err, conn) => {
                if (err) {
                    conn.release();
                    reject('could not get connection from pool');
                }

                resolve(conn);
            });
        });
    }
}

export default Storage;
