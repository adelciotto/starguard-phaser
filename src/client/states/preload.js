/*
 * ===========================================================================
 * File: preload.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import State from 'client/states/state';
import Const from 'const';

class PreloadState extends State {
    constructor(game) {
        super(game);
    }

    preload() {
        super.preload();

        var loadingBar = this.add.sprite(this.game.width/2, this.game.height/2,
            this.cache.getBitmapData(Const.FILLED_RECT));
        loadingBar.anchor.set(0.5);
        loadingBar.width = 128;
        loadingBar.height = 16;
        this.load.setPreloadSprite(loadingBar);

        this.load.spritesheet(Const.SPRITE_SHEET, '/dist/res/img/sheet.png', 12, 12);
        this.load.spritesheet(Const.GAME_LOGO, '/dist/res/img/logo.png', 24, 12);
        this.load.image(Const.HTML_LOGO, '/dist/res/img/html.png');
        this.load.bitmapFont(Const.GAME_FONT, '/dist/res/fonts/plumber_bros.png',
            '/dist/res/fonts/plumber_bros.xml');

        this.load.tilemap('testmap', '/dist/res/tilemaps/testmap.json',
            null, Phaser.Tilemap.TILED_JSON);
        this.load.image(Const.TILESET_IMG, '/dist/res/tilemaps/tiles.png');

        this.load.audio(Const.START_SOUND, '/dist/res/sounds/start.mp3');
        this.load.audio(Const.JUMP_SOUND, '/dist/res/sounds/jump.mp3');
        this.load.audio(Const.FALL_SOUND, '/dist/res/sounds/hit_ground.mp3');
    }

    create() {
        super.create();

        this.state.start('splash');
    }
}

export default PreloadState;
