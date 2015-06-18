/*
 * ===========================================================================
 * File: leaderboard.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

export function index(req, res) {
    req.app.get('storage').getConnection((conn) => {
        getLeaderboard(conn).then((data) => {
            res.json(data);
            conn.release();
        }).catch((err) => {
            req.app.get('log').error(err);
            res.status(500).json({ error: err });
        });
    }, false);
}

export function addEntry(req, res) {

}

function getLeaderboard(conn) {
    return new Promise((resolve, reject) => {
        conn.query('SELECT * FROM leaderboard', (err, data) => {
            if (err) {
                conn.release();
                reject(err);
            }

            resolve(data);
        });
    });
}
