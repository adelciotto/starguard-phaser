/*
 * ===========================================================================
 * File: dialog.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

import TextLabel from 'client/gui/text_label';
import TextButton from 'client/gui/text_button';
import Const from 'const';

class Dialog extends Phaser.Group {
    constructor(game, parent, title, onClose = null, autoShow = false) {
        super(game);

        this._parent = parent;
        this._title = title;
        this._onClose = onClose;
        this._autoShow = autoShow;

        this.fixedToCamera = true;
    }

    setup(bodyTextItems, close) {
        bodyTextItems.unshift({ type: 'label', pos: 'center',
            text: this._title, newLine: true });

        if (close) {
            bodyTextItems.push({ type: 'button', pos: 'center',
                text: 'Close', newLine: true, fn: this.hide, ctx: this });
        }

        this._bodyTextItems = bodyTextItems;
        this._init();

        if (this._autoShow) {
            this.show();
        }
    }

    show() {
        this.visible = true;
        this._textItemsGroup.visible = false;
        this._startOpenTween();
    }

    hide() {
        this._textItemsGroup.visible = false;
        this._startCloseTween();
    }

    _init() {
        // setup the dialog background sprite
        this.visible = false;
        this._dialogSprite = this.create(this.game.width/2,
            this.game.height*0.75, this.game.cache.getBitmapData(Const.RECT));
        this._dialogSprite.anchor.set(0.5);
        this._dialogSprite.alpha = 0.8;
        this._dialogSprite.width = this.game.width + 64;
        this._dialogSprite.height = _.size(this._bodyTextItems) * 12;

        // setup all the text items
        var centerX = this._dialogSprite.x;
        var centerY = this._dialogSprite.y;
        this._textItemsGroup = new Phaser.Group(this.game, this);
        this._initBodyText(centerX, centerY);
        this._dialogSprite.height = 0;
    }

    _initBodyText(centerX, centerY) {
        var size = _.size(this._bodyTextItems);
        var yPos = (size > 1 ? centerY + this._dialogSprite.height/2 -
            12 - size * 8 : centerY);

        _.each(this._bodyTextItems, (v, k) => {
            let xPos = centerX;

            if (v.pos === 'left') {
                xPos = centerX - this._dialogSprite.width/6;
            } else if (v.pos === 'right') {
                xPos = centerX + this._dialogSprite.width/6;
            }

            let item = (v.type === 'label' ?
                new TextLabel(this.game, xPos, yPos, v.text,
                    this._textItemsGroup) :
                new TextButton(this.game, xPos, yPos, v.text,
                    this._textItemsGroup, false, { fn: v.fn, ctx: v.ctx }));

            if (v.newLine) {
                yPos += item.height*2;
            }
        });
    }

    _startOpenTween() {
        var h = this.game.height / 3;
        var tween = this._createTween(h);

        tween.onComplete.add(f => this._textItemsGroup.visible = true);
        tween.start();
    }

    _startCloseTween() {
        var tween = this._createTween(0);

        tween.onComplete.add(f => {
            this.visible = false;

            // if user defined a onclose callback, invoke it
            if (this._onClose) {
                this._onClose();
            }
        });
        tween.start();
    }

    _createTween(height) {
        var tween = this._parent.add.tween(this._dialogSprite)
            .to({ height: height }, 500,
                Phaser.Easing.Quintic.Out);

        return tween;
    }
}

export default Dialog;
