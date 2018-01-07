const Tile = require('./tile');

cc.Class({
    extends: cc.Component,

    properties: {
        best_score: {
            default: null,
            type: cc.Label
        },
        score: {
            default: null,
            type: cc.Label
        },
        game_wrap: {
            default: [],
            type: cc.Sprite
        },

        block_gap: 7.5,
        replay_btn: {
            default: null,
            type: cc.Button
        },
        _tiles: [],
        _free_tiles: [],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addInputControl();
        this.addTouchControl();
        for (let i in this.game_wrap) {
            let tile = this.game_wrap[i].getComponent('tile');
            this._tiles.push(tile);
            this.addFreeBlock(i);
            tile.set_value(0);
        }

        let one = this.getFreeBlock();
        this._tiles[one].set_value(2);
        let two = this.getFreeBlock();
        this._tiles[two].set_value(2);
    },

    start() {},

    // update (dt) {},
    loadData() {
        let gamedata = cc.sys.localStorage.getItem('game.2048.data') || '';
        if (gamedata) {
            gamedata = JSON.parse(gamedata);
            if (gamedata.score_info) {
                var info = this.getChildByName('info_wrap');
                info.recover(gamedata.score_info);
            }
            if (gamedata.block_info) {
                var bm = this.getChildByName('block_manager');
                bm.recover(gamedata.block_info);
            }
        }
        return true;
    },
    saveData() {
        var gamedata = {
            score_info: {
                high_score: parseInt(this.best_score.string),
                score: parseInt(this.score.string)
            },
            block_info: {}
        };
        gamedata = JSON.stringify(gamedata);
        cc.sys.localStorage.setItem('game.2048.data', gamedata);
        return true;
    },
    addInputControl() {
        let self = this;
        // 添加键盘事件监听
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            // 有按键按下时，判断是否是我们指定的方向控制键，并设置向对应方向加速
            onKeyPressed: function (keyCode, event) {
                cc.log('input', keyCode, event);
                let result = false;
                switch (keyCode) {
                    case cc.KEY.up:
                        result = self.handleAction('up');
                        break;
                    case cc.KEY.down:
                        result = self.handleAction('down');
                        break;
                    case cc.KEY.left:
                        result = self.handleAction('left');
                        break;
                    case cc.KEY.right:
                        result = self.handleAction('right');
                        break;
                }
                if (result.success) {
                    if (result.score) {
                        self.incrScore(result.score);
                    }
                    self.saveData();
                }
            }
        }, self.node);
    },
    addTouchControl() {
        let begin_xy;
        let self = this;
        // 添加触摸事件监听
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            begin_xy = event.getLocation();
            return true;
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            let end_xy = event.getLocation();
            let x_axis = end_xy.x - begin_xy.x;
            let y_axis = end_xy.y - begin_xy.y;
            let result = false;
            if (Math.abs(x_axis) >= Math.abs(y_axis)) {
                if (x_axis <= -self.block_gap) {
                    result = self.handleAction('left');
                } else if (x_axis >= self.block_gap) {
                    result = self.handleAction('right');
                }
            } else {
                if (y_axis <= -self.block_gap) {
                    result = self.handleAction('down');
                } else if (y_axis >= self.block_gap) {
                    result = self.handleAction('up');
                }
            }
            if (result.success) {
                if (result.score) {
                    self.incrScore(result.score);
                }
                self.saveData();
            }
        }, this);
    },
    handleAction(direction) {
        // todo: 
        cc.log('------------', direction);
        return {
            success: true,
            score: 2
        };
    },
    incrScore(score) {
        let new_score = score + parseInt(this.score.string);
        this.score.string = new_score;
        if (new_score > this.best_score.string) {
            this.best_score.string = new_score;
        }
    },
    addFreeBlock (tag) {
        this._free_tiles.push(tag);
    },
    getFreeBlock () {
        let index = rand(10000) % this._free_tiles.length;
        let return_val = this._free_tiles[index];
        this.removeFreeBlockByIndex(index);
        return return_val;
    },
    removeFreeBlockByIndex (index) {
        this._free_tiles[index] = this._free_tiles[0];
        this._free_tiles.shift();
    },
    randomNewBlock () {
        # todo
        if (this._free_tiles.length === 0) {
            cc.log('no free block exist, maybe win');
            return null;
        }
        var tag = this.getFreeBlock();
        var b = this.getChildByTag(tag);
        var tmp = b.clone();
        this.addChild(tmp, 99);
        var value = (rand(100) <= 10) ? 4 : 2;
        b.setFakeValue(value);
        tmp.setValue(value);
        tmp.setTag(100 + tag);
        tmp.setScale(0.2);
        this.is_animation = true;
        var zoom_in = new cc.ScaleTo(0.2, 1.0);
        var action_callback = new cc.CallFunc(this.animationEnd, this, [b, value]);
        var seq = new cc.Sequence(zoom_in, action_callback);
        tmp.runAction(seq);
        return b;
    },
});