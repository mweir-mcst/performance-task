import kaboom from "kaboom";

kaboom({
    background: [0, 0, 0]
});

const hint = add([
    text("WASD to move", {
        size: 50
    }),
    pos(center().x, center().y - 150),
    origin("center"),
    color(WHITE)
]);

const player = add([
    circle(20),
    outline(6, RED),
    pos(center()),
    opacity(0)
]);

onKeyDown("w", () => {
    player.moveBy(0, -6);
});

onKeyDown("a", () => {
    player.moveBy(-6, 0);
});

onKeyDown("s", () => {
    player.moveBy(0, 6);
});

onKeyDown("d", () => {
    player.moveBy(6, 0);
});

onDraw(() => {
    const angle = Math.atan2(mousePos().y - player.pos.y, mousePos().x - player.pos.x);

    drawTriangle({
        p1: vec2(5, 0),
        p2: vec2(-5, -10),
        p3: vec2(-5, 10),
        pos: player.pos.add(vec2(35 * Math.cos(angle), 35 * Math.sin(angle))),
        angle: angle * 180 / Math.PI,
        fill: true
    });
});