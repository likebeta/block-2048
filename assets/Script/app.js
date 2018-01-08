const block_number = 4;

cc.Class({
    extends: cc.Component,

    properties: {
        best_score: cc.Label,
        score: cc.Label,
        block_gap: 7.5,
        replay_btn: cc.Button,
        block_prefab: cc.Prefab,
        game: cc.Layout,
        _blocks: [],
        _tiles: [],
        _free_tiles: [],
        _is_animation: false,
        _game_over: false,
        _game_result: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addInputControl(this.game);
        this.addTouchControl(this.game);
        for (let i = 0; i < block_number * block_number; ++i) {
            let block = cc.instantiate(this.block_prefab);
            this.game.node.addChild(block);
            this._blocks.push(block);
        }
        this.resetBlocks();
        this.loadData();
    },
    resetBlocks() {
        let self = this;
        this._blocks.forEach(function (block, i) {
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
        let game_data = cc.sys.localStorage.getItem('game.2048.data') || '';
        if (game_data) {
            game_data = JSON.parse(game_data);
            if (game_data.number !== block_number) {
                cc.log('block number not equal');
                return true;
            }
            if (game_data.score_info) {
                this.recoverScore(game_data.score_info);
            }
            if (game_data.block_info) {
                this.recoverBlocks(game_data.block_info);
            }
            if (game_data.game_over !== undefined) {
                this._game_over = Boolean(game_data.game_over);
                this._game_result = game_data.game_result;
            }
        }
        return true;
    },
    saveData() {
        let game_data = {
            number: block_number,
            game_over: this._game_over,
            game_result: this._game_result,
            score_info: this.snapshotScore(),
            block_info: this.snapshotBlocks()
        };
        game_data = JSON.stringify(game_data);
        cc.sys.localStorage.setItem('game.2048.data', game_data);
        return true;
    },
    snapshotScore() {
        return {
            best_score: parseInt(this.best_score.string),
            score: parseInt(this.score.string)
        };
    },
    snapshotBlocks() {
        let board = [];
        for (let i = 0; i < block_number * block_number; ++i) {
            let v = this._tiles[i].get_value();
            board.push(v);
        }
        return {
            board: board
        };
    },
    recoverScore(info) {
        if (info.best_score) {
            cc.log('recover best score to', info.best_score);
            this.best_score.string = info.best_score;
        }
        if (info.score) {
            cc.log('recover score to', info.score);
            this.score.string = info.score;
        }
        return true;
    },
    recoverBlocks(info) {
        if (info.board !== undefined) {
            cc.log('recover board to', info.board);
            this._free_tiles = [];
            for (let i = 0; i < info.board.length; ++i) {
                this._tiles[i].set_value(info.board[i]);
                if (info.board[i] === 0) {
                    this._free_tiles.push(i);
                }
            }
        }
        cc.log('recover free block to', this._free_tiles);
        return true;
    },
    addInputControl(target) {
        let self = this;
        // 添加键盘事件监听
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            // 有按键按下时，判断是否是我们指定的方向控制键，并设置向对应方向加速
            onKeyPressed(keyCode, event) {
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
        if (this._is_animation) {
            cc.log('is animation ...');
            return false;
        }

        if (this._game_result === 'lose') {
            cc.log('you lost, game over -_-!');
            return false;
        }
        else if (this._game_result === 'win') {
            cc.log('you won, game over ^_^!');
            return false;
        }

        cc.log(direction);

        let tmp_blocks = [];
        for (let i = 0; i < block_number * block_number; ++i) {
            tmp_blocks.push(this._tiles[i]);
        }

        let result = false;
        switch (direction) {
            case 'left':
                result = this.moveLeft(tmp_blocks);
                break;
            case 'right':
                result = this.moveRight(tmp_blocks);
                break;
            case 'down':
                result = this.moveDown(tmp_blocks);
                break;
            case 'up':
                result = this.moveUp(tmp_blocks);
                break;
        }

        if (result.success) {       // vanish block this turn
            this.randomNewBlock();
            if (this._free_tiles.length === 0) {
                if (!this.moveLeft(tmp_blocks, true) && !this.moveRight(tmp_blocks, true)
                    && !this.moveUp(tmp_blocks, true) && !this.moveDown(tmp_blocks, true)) {
                    this._game_result = 'lose';
                    cc.log('you lose, game over');
                }
            }
        }
        return result;
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
    removeFreeBlock(tag) {
        for (let i = 0; i < this._free_tiles.length; ++i) {
            if (this._free_tiles[i] === tag) {
                this.removeFreeBlockByIndex(i);
                break;
            }
        }
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
        let block = this._blocks[index];
        let tmp = cc.instantiate(this.block_prefab);
        block.addChild(tmp, 99);
        tmp.setPosition(0, 0);
        let value = (rand(100) <= 10) ? 4 : 2;
        b.set_fake_value(value);
        let tile = tmp.getComponent('tile');
        tile.set_value(value);
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
        this._is_animation = false;
    },
    rePlay() {
        if (this._is_animation) {
            cc.log('is animation, rePlay failed');
            return false;
        }
        cc.log('rePlay');
        this._game_over = false;
        this._is_animation = false;
        this._tiles = [];
        this._free_tiles = [];
        this.resetBlocks();
        this.score.string = 0;
        return true;
    },
    moveLeft(blocks, test) {
        let success = false, score = 0;
        for (let y = 0; y < block_number; ++y) {
            let left = -1, tmp_tag = 0, tmp_value = 0;
            for (let x = 1; x < block_number; ++x) {
                let curr_tag = x + y * block_number;
                let curr_value = blocks[curr_tag].get_value();
                if (curr_value <= 0) {
                    continue;
                }
                let left_prev = left;
                for (let i = x - 1; i > left; --i) {
                    tmp_tag = i + y * block_number;
                    tmp_value = blocks[tmp_tag].get_value();
                    if (tmp_value <= 0) {
                    }
                    else if (tmp_value === curr_value) { // 合并
                        if (test) {
                            return true;
                        }
                        score += this.combineBlocks(blocks, curr_tag, tmp_tag);
                        left = i;
                        success += true;
                        break;
                    }
                    else {
                        if (i + 1 === x) { // 相邻未移动
                            left = i;
                            break;
                        }
                        else {
                            if (test) {
                                return true;
                            }

                            tmp_tag = i + 1 + y * block_number;
                            this.combineBlocks(blocks, curr_tag, tmp_tag);
                            left = i;
                            success = true;
                            break;
                        }
                    }
                }
                if (left === left_prev && left + 1 !== x) {   // 未移动, 全部是free
                    if (test) {
                        return true;
                    }
                    tmp_tag = left + 1 + y * block_number;
                    this.combineBlocks(blocks, curr_tag, tmp_tag);
                    success = true;
                }
            }
        }
        return {success: success, score: score};
    },
    moveRight(blocks, test) {
        let success = false, score = 0;
        for (let y = 0; y < block_number; ++y) {
            let right = block_number, tmp_tag = 0, tmp_value = 0;
            for (let x = block_number - 2; x >= 0; --x) {
                let curr_tag = x + y * block_number;
                let curr_value = blocks[curr_tag].get_value();
                if (curr_value <= 0) {
                    continue;
                }
                let right_prev = right;
                for (let i = x + 1; i < right; ++i) {
                    tmp_tag = i + y * block_number;
                    tmp_value = blocks[tmp_tag].get_value();
                    if (tmp_value <= 0) {
                    }
                    else if (tmp_value === curr_value) { // 合并
                        if (test) {
                            return true;
                        }
                        score += this.combineBlocks(blocks, curr_tag, tmp_tag);
                        right = i;
                        success = true;
                        break;
                    }
                    else {
                        if (i - 1 === x) { // 相邻未移动
                            right = i;
                            break;
                        }
                        else {
                            if (test) {
                                return true;
                            }

                            tmp_tag = i - 1 + y * block_number;
                            this.combineBlocks(blocks, curr_tag, tmp_tag);
                            right = i;
                            success = true;
                            break;
                        }
                    }
                }
                if (right === right_prev && right - 1 !== x) {   // 未移动, 全部是free
                    if (test) {
                        return true;
                    }
                    tmp_tag = right - 1 + y * block_number;
                    this.combineBlocks(blocks, curr_tag, tmp_tag);
                    success = true;
                }
            }
        }
        return {success: success, score: score};
    },
    moveUp(blocks, test) {
        let success = false, score = 0;
        for (let x = 0; x < block_number; ++x) {
            let up = block_number, tmp_tag = 0, tmp_value = 0;
            for (let y = block_number - 2; y >= 0; --y) {
                let curr_tag = x + y * block_number;
                let curr_value = blocks[curr_tag].get_value();
                if (curr_value <= 0) {
                    continue;
                }
                let up_prev = up;
                for (let i = y + 1; i < up; ++i) {
                    tmp_tag = x + i * block_number;
                    tmp_value = blocks[tmp_tag].get_value();
                    if (tmp_value <= 0) {
                    }
                    else if (tmp_value === curr_value) { // 合并
                        if (test) {
                            return true;
                        }
                        score += this.combineBlocks(blocks, curr_tag, tmp_tag);
                        up = i;
                        success = true;
                        break;
                    }
                    else {
                        if (i - 1 === y) { // 相邻未移动
                            up = i;
                            break;
                        }
                        else {
                            if (test) {
                                return true;
                            }

                            tmp_tag = x + (i - 1) * block_number;
                            this.combineBlocks(blocks, curr_tag, tmp_tag);
                            up = i;
                            success = true;
                            break;
                        }
                    }
                }
                if (up === up_prev && up - 1 !== y) {   // 未移动, 全部是free
                    if (test) {
                        return true;
                    }
                    tmp_tag = x + (up - 1) * block_number;
                    this.combineBlocks(blocks, curr_tag, tmp_tag);
                    success = true;
                }
            }
        }
        return {success: success, score: score};
    },
    moveDown(blocks, test) {
        let success = false, score = 0;
        for (let x = 0; x < block_number; ++x) {
            let down = -1, tmp_tag = 0, tmp_value = 0;
            for (let y = 1; y < block_number; ++y) {
                let curr_tag = x + y * block_number;
                let curr_value = blocks[curr_tag].get_value();
                if (curr_value <= 0) {
                    continue;
                }
                let down_prev = down;
                for (let i = y - 1; i > down; --i) {
                    tmp_tag = x + i * block_number;
                    tmp_value = blocks[tmp_tag].get_value();
                    if (tmp_value <= 0) {
                    }
                    else if (tmp_value === curr_value) { // 合并
                        if (test) {
                            return true;
                        }
                        score += this.combineBlocks(blocks, curr_tag, tmp_tag);
                        down = i;
                        success = true;
                        break;
                    }
                    else {
                        if (i + 1 === y) { // 相邻未移动
                            down = i;
                            break;
                        }
                        else {
                            if (test) {
                                return true;
                            }

                            tmp_tag = x + (i + 1) * block_number;
                            this.combineBlocks(blocks, curr_tag, tmp_tag);
                            down = i;
                            success = true;
                            break;
                        }
                    }
                }
                if (down === down_prev && down + 1 !== y) {   // 未移动, 全部是free
                    if (test) {
                        return true;
                    }
                    tmp_tag = x + (down + 1) * block_number;
                    this.combineBlocks(blocks, curr_tag, tmp_tag);
                    success = true;
                }
            }
        }
        return {success: success, score: score};
    },
    combineBlocks(blocks, t1, t2) {
        let v1 = blocks[t1].get_value();
        let v2 = blocks[t2].get_value();
        this.addFreeBlock(t1);
        this.removeFreeBlock(t2);
        blocks[t1].set_value(0);
        blocks[t2].set_value(v1 + v2);
        return v1 + v2;
    },
});
