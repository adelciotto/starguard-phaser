/*
 * ===========================================================================
 * File: player.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import Entity from 'client/entities/entity';
import Const from 'const';

let PlayerStates = {
    Idle: 0,
    Walking: 1,
    Jumping: 2,
    Falling: 4
};

class Player extends Entity {
    constructor(game, x, y) {
        super(game, x, y, Const.SPRITE_SHEET, 0);
        this.currentState = PlayerStates.Falling;
        this.jumpReleased = true;

        this._grounded = false;
        this._moving = [];
        this._addAnimations([{ name: 'walk', frames: [1, 2, 3, 4, 5] }],
            20, true);
        this.scale.set(2, 2);
    }

    setup(level) {
        super.setup(level);

        this._velocity = this.body.velocity;
        this._acceleration = this.body.acceleration;
        this.body.setSize(8, 6);
        this.body.maxVelocity.x = Const.PLAYER_MAX_VEL;
        this.body.drag.set(Const.PLAYER_DRAG, 0);
    }

    update() {
        this._updateAnimations();
        this._grounded = this.body.onFloor() || this.body.touching.down;

        if (this._isCurrentState(PlayerStates.Falling)) {
            if (this._grounded) {
                this.game.hitGroundSound.play();
            }
        }

        if (this._moving[Phaser.LEFT]) {
            this._acceleration.x = -Const.PLAYER_ACCEL;
            if (this._grounded) {
                this.currentState = PlayerStates.Walking;
            }
        } else if (this._moving[Phaser.RIGHT]) {
            this._acceleration.x = Const.PLAYER_ACCEL;
            if (this._grounded) {
                this.currentState = PlayerStates.Walking;
            }
        } else {
            this._acceleration.x = 0;
            if (this._grounded) {
                this.currentState = PlayerStates.Idle;
            }
        }

        // perform variable jump height check
        if (this._isCurrentState(PlayerStates.Jumping) && this.jumpReleased) {
            if (this._velocity.y < Const.PLAYER_JUMP_SPEED/4) {
                this._velocity.y = Const.PLAYER_JUMP_SPEED/4;
            }
        }

        if (this._isCurrentState(PlayerStates.Jumping) &&
            this._velocity.y > 0) {
            this.currentState = PlayerStates.Falling;
        }

        // cap player fall speed
        this._velocity.y = Math.min(this._velocity.y,
            Const.PLAYER_MAX_FALL_SPEED);
    }

    jump() {
        if (this._grounded && !this._isCurrentState(PlayerStates.Jumping) &&
            this.jumpReleased) {
            this.jumpReleased = false;

            // set the appropriate state
            this.currentState = PlayerStates.Jumping;
            this._velocity.y = Const.PLAYER_JUMP_SPEED;
            this.game.jumpSound.play();
        }
    }

    move(direction, active) {
        this._moving[direction] = active;
        this.facing = direction;
    }

    _updateAnimations() {
        this.flip();

        switch (this.currentState) {
            case PlayerStates.Walking:
                this.animations.play('walk');
                break;
            case PlayerStates.Jumping:
                this.frame = 26;
                break;
            case PlayerStates.Falling:
                this.frame = 27;
                break;
            case PlayerStates.Idle: // jshint ignore:line
            default:
                this.frame = 0;
                break;
        }
    }

    _isCurrentState(state) {
        return (this.currentState === state);
    }
}

export default Player;
