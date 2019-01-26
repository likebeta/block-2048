'use strict';

let path = require("path");
let fs = require("fire-fs");

module.exports = {
    load() {
        Editor.Builder.on('build-finished', on_build_finished);
    },

    unload() {
        Editor.Builder.removeListener('build-finished', on_build_finished);
    },

    messages: {
        // 'editor:build-finished'(event, options) {},
        'say-usage'(event) {
            Editor.log('任务自动化');
        }
    }
};

function on_build_finished(options, cb) {
    if (options.platform === 'wechatgame') {
        // 修改配置
        let path_ = path.join(options.dest, 'project.config.json');
        let data = fs.readFileSync(path_);
        let conf = JSON.parse(data);
        if (options.debug) {
            conf.setting.urlCheck = false;
        }
        conf.cloudfunctionRoot = "cloudfunction";
        if (!conf.packOptions) {
            conf.packOptions = {};
        }
        if (!conf.packOptions.ignore) {
            conf.packOptions.ignore = [];
        }
        conf.packOptions.ignore.push({
            "type": "folder",
            "value": "cloudfunction"
        });        
        // conf.setting.uglifyFileName = true;
        data = JSON.stringify(conf, null, 2);
        fs.writeFileSync(path_, data);
    }
    cb();
}
