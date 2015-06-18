/*
 * ===========================================================================
 * File: play.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import State from 'client/states/state';
import Player from 'client/entities/player';
import Const from 'const';

class PlayState extends State {
    constructor(game) {
        super(game);
    }

    create() {
        super.create();

        this.game.player = new Player(this.game, 0, 0);
        this.game.startSound = this.game.add.audio(Const.START_SOUND);
        this.game.hitGroundSound = this.game.add.audio(Const.FALL_SOUND);
        this.game.jumpSound = this.game.add.audio(Const.JUMP_SOUND);

        this.state.start('level_1_1');
    }
}

export default PlayState;
