/*
 * ===========================================================================
 * File: starfield.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import Const from 'const';

const MaxLayers = 8;
const NumSparklingStars = 3;

class Starfield {
    constructor(parent, numLayers = 8, starsEachLayer = 100) {
        this._parent = parent;
        this._numLayers = Math.min(MaxLayers, numLayers);
        this._starsEachLayer = starsEachLayer;

        this._stars = this._parent.add.group();
        this._sparklingStars = this._parent.add.group();

        this._createStars();
        this._createSparklingStars();
    }

    update() {
        var w = this._parent.game.width;
        var world = this._parent.world;

        for (var i = 0, l = this._stars.total; i < l; i++) {
            let star = this._stars.getAt(i);
            let depth = i % this._numLayers;

            let speed = (depth < 1 ? 1.5 : depth * 1.5);
            star.x -= (star.isShootingStar ? speed * 2 : speed);

            if (star.x < 0) {
                star.x = w + 32;
                star.y = world.randomY;
            }
        }
    }

    _createStars() {
        var world = this._parent.world;

        for (var i = 0; i < this._numLayers * this._starsEachLayer; i++) {
            let star = this._stars.create(world.randomX, world.randomY,
                this._parent.cache.getBitmapData(Const.FILLED_RECT));
            let depth = i % this._numLayers;

            star.anchor.set(0.5);
            star.width = star.height = 2;
            star.alpha = (depth + 1) / this._numLayers;

            // set a select few stars to be shooting stars
            if (star.alpha === 1 && Phaser.Math.chanceRoll(10)) {
                star.width = 16;
                star.isShootingStar = true;
            }
        }
    }

    _createSparklingStars() {
        var world = this._parent.game.world;

        for (var i = 0; i < NumSparklingStars; i++) {
            let star = this._sparklingStars.create(world.randomX, world.randomY,
                Const.SPRITE_SHEET, 314);

            star.anchor.set(0.5);
            star.scale.set(2);

            let duration = this._parent.rnd.between(500, 850);
            let delay = this._parent.rnd.between(250, 500);
            this._parent.add.tween(star.scale)
                .to({ x: 0, y: 0 }, duration, Phaser.Easing.Sinusoidal.Out,
                    true, delay, -1, true)
                .onLoop.add((s, t) => this._onSparklingStarUpdate(star));
        }
    }

    _onSparklingStarUpdate(star) {
        var world = this._parent.world;

        star.x = world.randomX;
        star.y = world.randomY;
    }
}

export default Starfield;
