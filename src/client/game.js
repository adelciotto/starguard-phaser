/*
 * ===========================================================================
 * File: game.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

var worlds = require('client/levels/worlds');

import BootState from 'client/states/boot';
import PreloadState from 'client/states/preload';
import SplashState from 'client/states/splash';
import MenuState from 'client/states/menu';
import PlayState from 'client/states/play';

class Game extends Phaser.Game {
    constructor() {
        super(400, 240, Phaser.AUTO, 'game', null, false, false);

        this.isPaused = false;
    }

    start() {
        this.state.add('boot', BootState, true);
        this.state.add('preload', PreloadState, false);
        this.state.add('splash', SplashState, false);
        this.state.add('mainmenu', MenuState, false);
        this.state.add('play', PlayState, false);
        console.log(worlds);
        this._addWorlds(worlds);

        return this;
    }

    _addWorlds(worlds) {
        var i = 1;
        _.each(worlds, (v, k) => {
            this._addLevel(v, i++);
        });
    }

    _addLevel(levels, worldIdx) {
        var levelIdx = 1;
        _.each(levels, (v, k) => {
            this.state.add(`level_${worldIdx}_${levelIdx}`, v, false);
            levelIdx++;
        });
    }
}

export default Game;
