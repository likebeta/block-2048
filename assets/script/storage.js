const env = 'block-2048-dev-094ee2';
let open_id = null;
let db = null;
let collection = null;
const NOT_LOGIN = {
    errCode: 400,
    errMsg: "not login"
};

let Storage = cc.Class({
    init() {
        wx.cloud.init({
            traceUser: true,
            env: env
        });
        db = wx.cloud.database();
        collection = db.collection('user_info');
    },
    login(cb) {
        if (open_id) {
            cb && cb({
                openid: open_id
            });
            return
        }
        return wx.cloud.callFunction({
            name: 'login',
            data: {
                env: env
            },
            complete: function (res) {
                if (!res.errCode) {
                    open_id = res.result.openid;
                }
                console.log(res);
                cb && cb(res);
            }
        });
    },
    get_current_user(cb) {
        if (open_id === null) {
            cb && cb(NOT_LOGIN);
            return;
        }
        collection.doc(open_id).get({
            complete: cb
        });
    },
    new_user(data, cb) {
        if (open_id === null) {
            cb && cb(NOT_LOGIN);
            return;
        }
        data.ts = db.serverDate();
        collection.add({
            data: data,
            complete: cb
        });
    },
    update_user(data, cb) {
        if (open_id === null) {
            cb && cb(NOT_LOGIN);
            return;
        }
        data.update_ts = db.serverDate();
        collection.doc(open_id).update({
            data: data,
            complete: cb
        });
    }
});

module.exports = new Storage();
