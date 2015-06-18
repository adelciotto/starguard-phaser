/*
 * ===========================================================================
 * File: world_1.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import Level from 'client/levels/level';
import Const from 'const';

class TestLevel extends Level {
    constructor(game) {
        super(game, Const.NORMAL_GRAVITY);

        this.mapKey = 'testmap';
    }

    create() {
        super.create();

        this.stage.backgroundColor = 0x000000;
    }
}

exports.TestLevel = TestLevel;
