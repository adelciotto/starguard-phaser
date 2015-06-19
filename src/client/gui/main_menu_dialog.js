/*
 * ===========================================================================
 * File: options_dialog.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import Dialog from 'client/gui/dialog';

class MainMenuDialog extends Dialog {
    constructor(game, parent, onClose, autoStart) {
        super(game, parent, 'Starguard', onClose, autoStart);

        this.setup();
    }

    setup() {
        super.setup([
            { type: 'button', pos: 'center', text: 'Start',
                newLine: true, fn: this._onStartSelected, ctx: this },
            { type: 'button', pos: 'center', text: 'Leaderboard',
                newLine: true, fn: this._onLeaderboardSelected, ctx: this },
            { type: 'button', pos: 'center', text: 'Options',
                newLine: true, fn: this._onOptionsSelected, ctx: this }
        ]);
    }

    _onStartSelected() {
        this._parent.state.start('play');
    }

    _onLeaderboardSelected() {
        this._parent.state.start('leaderboard');
    }

    _onOptionsSelected() {
        this.hide();
    }
}

export default MainMenuDialog;
