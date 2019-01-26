'use strict';
let ctx = {};
ctx.run_mode = 'dev';
cc.log('os', cc.sys.os, 'platform', cc.sys.platform, 'native', cc.sys.isNative, 'browser', cc.sys.isBrowser, 'mobile', cc.sys.isMobile);
ctx.event = new cc.EventTarget();

// 游戏进入后台
cc.game.on(cc.game.EVENT_HIDE, function () {
    ctx.event.emit('enter_background');
});
// 游戏进入前台
cc.game.on(cc.game.EVENT_SHOW, function () {
    ctx.event.emit('enter_foreground');
});

if (cc.sys.platform === cc.sys.WECHAT_GAME) {
    wx.setEnableDebug({ enableDebug: true });
    let storage = require('storage');
    storage.init();
    ctx.storage = storage;
}
window.ctx = ctx;