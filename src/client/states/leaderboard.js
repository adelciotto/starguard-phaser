/*
 * ===========================================================================
 * File: leaderboard.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import State from 'client/states/state';
import TextLabel from 'client/gui/text_label';
import TextButton from 'client/gui/text_button';

class LeaderboardState extends State {
    constructor(game) {
        super(game);
    }

    preload() {
        this.load.json('leaderboard', `/leaderboard`);
    }

    create() {
        super.create();

        var title = new TextLabel(this.game, this.game.width/2, 20, 'leaderboard', null,
            true, true, 'center', 10);
        var exit = new TextButton(this.game, this.game.width/2, this.game.height - 30, 'mainmenu', null,
            true, { fn: this._onMainMenuSelected, ctx: this }, true, 'center', 10);
        this.add.existing(title);
        this.add.existing(exit);

        this._initLeaderboard();
    }

    _initLeaderboard() {
        var board = this.cache.getJSON('leaderboard');

        var yPos = 40;
        for (var entry of board) {
            let entryLabel = new TextLabel(this.game, this.game.width/2, yPos,
                `${entry.name}     ${entry.score}`);

            this.add.existing(entryLabel);
            yPos += entryLabel.height * 2;
        }
    }

    _onMainMenuSelected() {
        this.state.start('mainmenu');
    }
}

export default LeaderboardState;
