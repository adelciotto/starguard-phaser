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

        this.load.spritesheet(Const.SPRITE_SHEET, 'res/img/sheet.png', 12, 12);
        this.load.spritesheet(Const.GAME_LOGO, 'res/img/logo.png', 24, 12);
        this.load.image(Const.HTML_LOGO, 'res/img/html.png');
        this.load.bitmapFont(Const.GAME_FONT, 'res/fonts/font.png',
            'res/fonts/font.xml');

        this.load.tilemap('testmap', 'res/tilemaps/testmap.json',
            null, Phaser.Tilemap.TILED_JSON);
        this.load.image(Const.TILESET_IMG, 'res/tilemaps/tiles.png');

        this.load.audio(Const.START_SOUND, 'res/sounds/start.mp3');
        this.load.audio(Const.JUMP_SOUND, 'res/sounds/jump.mp3');
        this.load.audio(Const.FALL_SOUND, 'res/sounds/hit_ground.mp3');
    }

    create() {
        super.create();

        this.state.start('splash');
    }
}

export default PreloadState;
