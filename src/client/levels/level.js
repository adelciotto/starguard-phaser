/*
 * ===========================================================================
 * File: level.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import State from 'client/states/state';
import Const from 'const';
import LevelManager from 'client/levels/level_manager';
import OptionsDialog from 'client/gui/options_dialog';

class Level extends State {
    constructor(game, gravity) {
        super(game);

        this.gravity = gravity;
        this.mapKey = '';
        this.levelManager = null;
        this.timer = null;
        this.player = null;
    }

    preload() {
        super.preload();

        // TODO: get tilemap from cache, this should be loaded in the
        // preload state
    }

    create() {
        super.create();

        this.timer = new Phaser.Timer(this.game, false);
        this.time.add(this.timer);
        this._initInputHandler();
        this.player = this.game.player;
        this.levelManager = new LevelManager(this);

        this.levelManager.create();
        this._optionsDialog = new OptionsDialog(this.game, this,
            f => this.resume(), true);
        this.game.startSound.play();
    }

    shutdown() {
        super.shutdown();
        this.levelManager.shutdown();
    }

    update() {
        this.levelManager.update();
    }

    //render() {
        //this.game.debug.body(this.player, '#FF0000', false);
    //}

    pause() {
        if (!this.game.isPaused) {
            this._optionsDialog.show();
            this.levelManager.pause();
            this.game.isPaused = true;
        }
    }

    resume() {
        if (this.game.isPaused) {
            this.levelManager.resume();
            this.game.isPaused = false;
        }
    }

    _initInputHandler() {
        this.inputHandler.setInputMap({
            jump: Phaser.Keyboard.Z,
            shoot: Phaser.Keyboard.X,
            pause: Phaser.Keyboard.ENTER
        });

        this.inputHandler.addListener('left', this, this._onMove);
        this.inputHandler.addListener('right', this, this._onMove);
        this.inputHandler.addListener('jump', this, null, this._onJump,
            this._onJumpReleased);
        this.inputHandler.addListener('pause', this, this._onPause);
    }

    /**
     * input listeners
     */
    _onMove(keycode, active) {
        var dir = (keycode === Phaser.Keyboard.LEFT ? Phaser.LEFT :
            Phaser.RIGHT);
        this.player.move(dir, active);
    }

    _onJump(keycode) {
        this.player.jump();
    }

    _onJumpReleased(keycode) {
        this.player.jumpReleased = true;
    }

    _onPause(keycode) {
        this.pause();
    }
}

export default Level;
