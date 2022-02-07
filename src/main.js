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
    const indicatorPos = player.pos.add(vec2((mousePos().x - player.pos.x) * 0.1, (mousePos().y - player.pos.y) * 0.1));

    drawCircle({
        pos: indicatorPos,
        radius: 10,
        color: WHITE
    });

    drawLine({
        p1: player.pos,
        p2: indicatorPos,
        width: 4,
        color: WHITE
    })
});