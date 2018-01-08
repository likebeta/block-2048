cc.Class({
    extends: cc.Component,

    properties: {
        best_score: cc.Label,
        score: cc.Label,
        game_wrap: {
            default: [],
            type: cc.Sprite
        },
        block_gap: 7.5,
        replay_btn: cc.Button,
        block_prefab: cc.Prefab,
        game: cc.Layout,
        _tiles: [],
        _free_tiles: [],
        _is_animation: false,
        _game_over: false
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addInputControl(this.game);
        this.addTouchControl(this.game);
        this.initBlocks();
    },
    initBlocks() {
        let self = this;
        this.game_wrap.forEach(function (block, i) {
            let tile = block.getComponent('tile');
            self._tiles.push(tile);
            self.addFreeBlock(i);
            tile.set_value(0);
        });
        let one = this.getFreeBlock();
        this._tiles[one].set_value(2);
        let two = this.getFreeBlock();
        this._tiles[two].set_value(2);
    },
    // update (dt) {},
    loadData() {
        let gamedata = cc.sys.localStorage.getItem('game.2048.data') || '';
        if (gamedata) {
            gamedata = JSON.parse(gamedata);
            if (gamedata.score_info) {
                let info = this.getChildByName('info_wrap');
                info.recover(gamedata.score_info);
            }
            if (gamedata.block_info) {
                let bm = this.getChildByName('block_manager');
                bm.recover(gamedata.block_info);
            }
        }
        return true;
    },
    saveData() {
        let game_data = {
            score_info: {
                high_score: parseInt(this.best_score.string),
                score: parseInt(this.score.string)
            },
            block_info: {}
        };
        game_data = JSON.stringify(game_data);
        cc.sys.localStorage.setItem('game.2048.data', game_data);
        return true;
    },
    addInputControl(target) {
        let self = this;
        // 添加键盘事件监听
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            // 有按键按下时，判断是否是我们指定的方向控制键，并设置向对应方向加速
            onKeyPressed: function (keyCode, event) {
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
        }, target.node);
    },
    addTouchControl(target) {
        let begin_xy;
        let self = this;
        // 添加触摸事件监听
        target.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            begin_xy = event.getLocation();
            return true;
        }, target);
        target.node.on(cc.Node.EventType.TOUCH_END, function (event) {
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
        }, target);
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
    addFreeBlock(tag) {
        this._free_tiles.push(tag);
    },
    getFreeBlock() {
        let index = rand(10000) % this._free_tiles.length;
        let return_val = this._free_tiles[index];
        this.removeFreeBlockByIndex(index);
        return return_val;
    },
    removeFreeBlockByIndex(index) {
        this._free_tiles[index] = this._free_tiles[0];
        this._free_tiles.shift();
    },
    randomNewBlock() {
        if (this._free_tiles.length === 0) {
            cc.log('no free block exist, maybe win');
            return null;
        }
        let index = this.getFreeBlock();
        let b = this._tiles[index];
        let tmp = cc.instantiate(this.block_prefab);
        this.addChild(tmp, 99);
        let value = (rand(100) <= 10) ? 4 : 2;
        b.set_fake_value(value);
        tmp.set_value(value);
        tmp.setScale(0.2);
        this._is_animation = true;
        let zoom_in = new cc.ScaleTo(0.2, 1.0);
        let action_callback = new cc.CallFunc(this.animationEnd, this, [b, value]);
        let seq = new cc.Sequence(zoom_in, action_callback);
        tmp.runAction(seq);
        return b;
    },
    animationEnd(target, data) {
        let b = data[0];
        let value = data[1];
        target.removeFromParent(true);
        b.set_value(value);
        this.is_animation = false;
    },
    rePlay() {
        if (this._is_animation) {
            cc.log('is animation, rePlay failed');
            return false;
        }
        cc.log('rePlay');
        this._game_over = false;
        this._is_animation = false;
        this._free_tiles = [];
        this.removeAllChildren(true);
        return this.initBlocks();
    },
});