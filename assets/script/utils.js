function rand(number) {
    var today = new Date();
    var seed = today.getTime();
    seed = (seed * 9301 + 49297) % 233280;
    seed = seed / (233280.0);
    return Math.ceil(seed * number);
}

window.utils = {
    rand: rand
};
