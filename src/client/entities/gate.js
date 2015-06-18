/*
 * ===========================================================================
 * File: gate.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import Const from 'const';

class Gate extends Phaser.Sprite {
    constructor(game, x, y) {
        super(game, x, y, game.cache.getBitmapData(Const.FILLED_RECT));

        this.anchor.set(0.5);
        this.width = Const.BLOCK_SIZE * 6;
        this.height = Const.BLOCK_SIZE * 6;
        this.tint = 0x0000FF;

        game.add.tween(this)
            .to({ alpha: 0.25 }, 500, Phaser.Easing.Sinusoidal.Out,
                true, 0, -1, true);
    }
}

export default Gate;
