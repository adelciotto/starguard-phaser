/*
 * ===========================================================================
 * File: boot.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import State from 'client/states/state';
import Const from 'const';

class BootState extends State {
    constructor(game) {
        super(game);
    }

    create() {
        this._configureScale();
        this._configureInput();

        this.game.renderer.renderSession.roundPixels = true;
        this.stage.smoothed = false;
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.add.plugin(Phaser.Plugin.Debug);

        this._prerender();
        this.state.start('preload');
    }

    _prerender() {
        // pre-render some simple assets that I cannot be bothered
        // creating in GIMP
        var bmd = this.add.bitmapData(1, 1);
        bmd.context.fillStyle = '#FFFFFF';
        bmd.context.fillRect(0, 0, 1, 1);
        this.cache.addBitmapData(Const.FILLED_RECT, bmd);

        bmd = this.add.bitmapData(16, 16);
        bmd.context.fillStyle = '#000000';
        bmd.context.fillRect(0, 0, 16, 16);
        bmd.context.strokeStyle = '#FFFFFF';
        bmd.context.rect(0, 0, 16, 16);
        bmd.context.stroke();
        this.cache.addBitmapData(Const.RECT, bmd);
    }

    _configureScale() {
        this.scale.minWidth = this.width;
        this.scale.minHeight = this.height;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        this.scale.scaleMode = this.scale.fullScreenScaleMode =
            Phaser.ScaleManager.SHOW_ALL;
        this.scale.setScreenSize();
    }

    _configureInput() {
        // capture certain keys to prevent their default actions in the browser.
        // this is only necessary because this is an HTML5 game.
        this.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN
        ]);

        this.input.maxPointers = 1;
    }
}

export default BootState;
