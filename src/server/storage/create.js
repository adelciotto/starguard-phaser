/*
 * ===========================================================================
 * File: create.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

export function create(conn) {
    createDb(conn).then(createTables).then(f => {
        console.log('successfully connected to db');
        conn.release();
    }).catch((err) => {
        console.error(err);
    });
}

function createDb(conn) {
    return new Promise((resolve, reject) => {
        conn.query('CREATE DATABASE IF NOT EXISTS game_data', (err) => {
            if (err) {
                conn.release();
                reject(err);
            }

            resolve(conn);
        });
    });
}

function createTables(conn) {
    return new Promise((resolve, reject) => {
        conn.query('USE game_data', (err) => {
            if (err) {
                conn.release();
                reject(err);
            }

            conn.query(`
                        CREATE TABLE IF NOT EXISTS leaderboard(
                            id INT NOT NULL AUTO_INCREMENT,
                            PRIMARY KEY(ID),
                            name VARCHAR(30),
                            score INT)
                      `,
            (err) => {
                if (err) {
                    conn.release();
                    reject(err);
                }

                resolve();
            });
        });
    });
}
