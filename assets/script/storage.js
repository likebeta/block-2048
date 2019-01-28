const NOT_LOGIN = {
    errCode: 400,
    errMsg: "not login"
};

let Storage = cc.Class({
    ctor: function () {
        this.env = null;
        this.open_id = null;
        this.db = null;
        this.collection = null;
    },
    init(env) {
        wx.cloud.init({ traceUser: true, env: env });
        this.env = env;
        this.db = wx.cloud.database();
        this.collection = this.db.collection('user_info');
    },
    login(cb) {
        let self = this;
        if (this.open_id) {
            cb && cb({ openid: this.open_id });
            return
        }
        return wx.cloud.callFunction({
            name: 'login',
            data: { env: self.env },
            complete: function (res) {
                if (!res.errCode) {
                    self.open_id = res.result.openid;
                }
                cb && cb(res);
            }
        });
    },
    get_current_user(cb) {
        if (this.open_id === null) {
            cb && cb(NOT_LOGIN);
            return;
        }
        this.collection.doc(this.open_id).get({ complete: cb });
    },
    new_user(data, cb) {
        if (this.open_id === null) {
            cb && cb(NOT_LOGIN);
            return;
        }
        data.ts = this.db.serverDate();
        data._id = this.open_id;
        this.collection.add({ data: data, complete: cb });
    },
    update_user(data, cb) {
        if (this.open_id === null) {
            cb && cb(NOT_LOGIN);
            return;
        }
        data.update_ts = this.db.serverDate();
        this.collection.doc(this.open_id).update({ data: data, complete: cb });
    }
});

module.exports = new Storage();
