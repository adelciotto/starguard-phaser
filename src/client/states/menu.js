/*
 * ===========================================================================
 * File: menu.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import State from 'client/states/state';
import Starfield from 'client/effects/starfield';
import OptionsDialog from 'client/gui/options_dialog';
import MainMenuDialog from 'client/gui/main_menu_dialog';
import Const from 'const';

class MenuState extends State {
    constructor(game) {
        super(game);

        this.optionsDialog = null;

        this._starfield = null;
        this._mainMenuDialog = null;
    }

    create() {
        super.create();

        this.world.resize(this.game.width, this.game.height);
        this._starfield = new Starfield(this, 4, 32);
        this._createLogo();

        this.optionsDialog = new OptionsDialog(this.game, this,
            f => this._onOptionsClose());
        this._mainMenuDialog = new MainMenuDialog(this.game, this,
            f => this._onMainMenuClose());
    }

    update() {
        this._starfield.update();
    }

    _createLogo() {
        var topHalf = this.add.sprite(-36, this.game.height/2 - 54,
            Const.GAME_LOGO, 0);
        var bottomHalf = this.add.sprite(this.game.width + 36,
            this.game.height/2 - 18, Const.GAME_LOGO, 1);

        topHalf.anchor.x = topHalf.anchor.y = bottomHalf.anchor.x =
            bottomHalf.anchor.y = 0.5;
        topHalf.scale.x = topHalf.scale.y = bottomHalf.scale.x =
            bottomHalf.scale.y = 3;
        this.add.tween(topHalf)
            .to({ x: this.game.width/2 }, 1000, Phaser.Easing.Exponential.Out,
                true);
        this.add.tween(bottomHalf)
            .to({ x: this.game.width/2 }, 1000, Phaser.Easing.Exponential.Out,
                true)
            .onComplete.add(f => this._mainMenuDialog.show());
    }

    _onOptionsClose() {
        this._mainMenuDialog.show();
    }

    _onMainMenuClose() {
        this.optionsDialog.show();
    }
}

export default MenuState;
