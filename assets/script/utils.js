function rand(number) {
    let today = new Date();
    let seed = today.getTime();
    seed = (seed * 9301 + 49297) % 233280;
    seed = seed / (233280.0);
    return Math.ceil(seed * number);
}

window.utils = {
    rand: rand
};
