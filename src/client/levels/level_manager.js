/*
 * ===========================================================================
 * File: level_manager.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import Gate from 'client/entities/gate';
import Const from 'const';

class LevelManager {
    constructor(level) {
        this.map = null;

        this._player = level.player;
        this._level = level;
        this._game = level.game;
        this._physics = level.physics;
        this._inputHandler = level.inputHandler;
        this._timer = level.timer;
        this._mainGroup = null;
        this._entitiesGroup = null;
        this._collisionLayer = null;
        this._staticLayer = null;
    }

    create() {
        this._mainGroup = this._level.add.group();
        this._entitiesGroup = this._level.add.group();
        this._mainGroup.add(this._entitiesGroup);

        this._createWorld();
        this._player.setup(this._level);
        this._entitiesGroup.add(this._player);

        // make sure the entities group is rendered on top
        this._mainGroup.bringToTop(this._entitiesGroup);

        this._level.camera.checkBounds();
        this._level.camera.follow(this._player, Phaser.FOLLOW_PLATFORMER);
        this._physics.arcade.gravity.y = this._level.gravity;
    }

    shutdown() {
        this._level.camera.reset();
        this._mainGroup.destroy();
    }

    update() {
        this._updateCollision();
        this._updateEntities();
    }

    pause() {
        if (!this._game.inMultiplayerMode) {
            this._game.input.keyboard.enabled = false;
            this._entitiesGroup.callAll('pause');
        }
    }

    resume() {
        if (!this._game.inMultiplayerMode) {
            this._game.input.keyboard.enabled = true;
            this._entitiesGroup.callAll('resume');
        }
    }

    _createWorld() {
        this._createMap();
        this._createMapObjects();
    }

    _createMap() {
        this.map = this._level.add.tilemap(this._level.mapKey);
        this.map.addTilesetImage(Const.TILESET_IMG, Const.TILESET_IMG);

        this._collisionLayer = this.map.createLayer('collision_layer');
        this._collisionLayer.visible = false;
        this._staticLayer = this.map.createLayer('static_layer');
        this._collisionLayer.resizeWorld();

        this.map.setCollision(9, true, this._collisionLayer);
        this._mainGroup.add(this._staticLayer);
    }

    _createMapObjects() {
        var objLayer = this.map.objects.object_layer;

        // set player spawn point
        for (var obj of objLayer) {
            let props = obj.properties;

            switch(obj.name) {
                case 'spawn':
                    let gate = new Gate(this._game, obj.x, obj.y, props.width,
                        props.height);
                    this._entitiesGroup.add(gate);
                    this._player.position.set(obj.x, obj.y);
                    break;
                case 'exit':
                    let exit = new Gate(this._game, obj.x, obj.y, props.width,
                        props.height);
                    this._entitiesGroup.add(exit);
                    break;
            }
        }
    }

    _updateCollision() {
        this._physics.arcade.collide(this._player, this._collisionLayer);
    }

    _updateEntities() {
        this._entitiesGroup.callAll('update');
    }

    _addEntity(entity) {

    }
}

export default LevelManager;


