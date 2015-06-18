/*
 * ===========================================================================
 * File: entity.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

class Entity extends Phaser.Sprite {
    constructor(game, x, y, key, frame) {
        super(game, x, y, key, frame);

        this.facing = Phaser.LEFT;
    }

    setup(level) {
        level.physics.enable(this, Phaser.Physics.ARCADE);
        this.anchor.set(0.5, 1);
        this.body.fixedRotation = true;
    }

    pause() {
        this.animations.currentAnim.paused = true;
        this.body.enable = false;
    }

    resume() {
        this.animations.currentAnim.paused = false;
        this.body.enable = true;
    }

    flip() {
        var dir = (this.facing === 1 ? -2 : 2);
        this.scale.x = dir;
    }

    _addAnimations(anims, frameRate = 60, loop = false) {
        for (var i = 0, l = anims.length; i < l; ++i) {
            let anim = anims[i];
            this.animations.add(anim.name, anim.frames, frameRate, loop);
        }
    }
}

export default Entity;
