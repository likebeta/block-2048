cc.Class({
    extends: cc.Component,

    properties: {
        number: {
            default: null,
            type: cc.Label
        },
        _fake_value: 0
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    },

    start() {

    },

    // update (dt) {},
    get_value() {
        return this._fake_value;
    },

    set_fake_value(value) {
        this._fake_value = value;
    },

    set_value: function (value) {
        if (this.number.string !== toString(value)) {
            this._fake_value = toString(value);
            if (value === 0) {
                this.number.string = ''
            } else {
                this.number.string = value;
            }
            this.node.color = this.get_bk_color_by_value(value)
            this.number.node.color = this.get_text_color_by_value(value)
        }
    },

    clone() {},

    get_bk_color_by_value: function (value) {
        var color_map = {
            2: cc.color(0xee, 0xe4, 0xda, 0xFF),
            4: cc.color(0xed, 0xe0, 0xc8, 0xFF),
            8: cc.color(0xf2, 0xb1, 0x79, 0xFF),
            16: cc.color(0xf5, 0x95, 0x63, 0xFF),
            32: cc.color(0xf6, 0x7c, 0x5f, 0xFF),
            64: cc.color(0xf6, 0x5e, 0x3b, 0xFF),
            128: cc.color(0xed, 0xcf, 0x72, 0xFF),
            256: cc.color(0xed, 0xcc, 0x61, 0xFF),
            512: cc.color(0xed, 0xc8, 0x50, 0xFF),
            1024: cc.color(0xed, 0xc5, 0x3f, 0xFF),
            2048: cc.color(0xed, 0xc2, 0x2e, 0xFF)
        };
        return color_map[value] || cc.color(0xee, 0xe4, 0xda, 0xFF);
    },
    get_text_color_by_value: function (value) {
        var color_map = {
            2: cc.color(0x77, 0x6e, 0x65, 0xFF),
            4: cc.color(0x77, 0x6e, 0x65, 0xFF),
            8: cc.color(0x77, 0x6e, 0x65, 0xFF),
            16: cc.color(0x77, 0x6e, 0x65, 0xFF),
            32: cc.color(0x77, 0x6e, 0x65, 0xFF),
            64: cc.color(0x77, 0x6e, 0x65, 0xFF),
            128: cc.color(0x77, 0x6e, 0x65, 0xFF),
            256: cc.color(0x77, 0x6e, 0x65, 0xFF),
            512: cc.color(0x77, 0x6e, 0x65, 0xFF),
            1024: cc.color(0x77, 0x6e, 0x65, 0xFF),
            2048: cc.color(0x77, 0x6e, 0x65, 0xFF)
        };
        return color_map[value] || cc.color(0x77, 0x6e, 0x65, 0xFF);
    },
});