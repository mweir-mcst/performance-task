import kaboom from "kaboom";

// Initialize the game
kaboom({
    background: [0, 0, 0]
});
onLoad(() => canvas.focus());

// Determines if enemies should be spawning
let enemySpawn = false;

// Add the hint text in the beginning of the game
add([
    text("WASD to move", {
        size: 50
    }),
    pos(center().x, center().y - 150),
    origin("center"),
    color(WHITE),
    opacity(0.5),
    "hint"
]);
add([
    text("click to shoot", {
        size: 50
    }),
    pos(center().x, center().y - 100),
    origin("center"),
    color(WHITE),
    opacity(0.5),
    "hint"
]);

// Add the player
const player = add([
    circle(20),
    area({
        shape: "circle",
        width: 40,
        height: 40,
        offset: vec2(-20, -20)
    }),
    outline(6, RED),
    pos(center()),
    opacity(0),
    health(10),
    solid(),
    "player"
]);

// Add the outer walls so solids (such as the player and enemies) can't leave the view area
add([
    pos(0, -1),
    area({
        width: width(),
        height: 1
    }),
    solid()
]);
add([
    pos(width(), 0),
    area({
        width: 1,
        height: height()
    }),
    solid()
]);
add([
    pos(0, height()),
    area({
        width: width(),
        height: 1
    }),
    solid()
]);
add([
    pos(-1, 0),
    area({
        width: 1,
        height: height()
    }),
    solid()
]);

player.indicatorPos = vec2();

// Handle movement
onKeyDown("w", () => {
    player.moveBy(0, -6);
    enemySpawn = true;
    destroyAll("hint");
});

onKeyDown("a", () => {
    player.moveBy(-6, 0);
    enemySpawn = true;
    destroyAll("hint");
});

onKeyDown("s", () => {
    player.moveBy(0, 6);
    enemySpawn = true;
    destroyAll("hint");
});

onKeyDown("d", () => {
    player.moveBy(6, 0);
    enemySpawn = true;
    destroyAll("hint");
});

// Handle shooting
onMousePress(mousePos => {
    const angle = mousePos.angle(player.pos);
    add([
        circle(5),
        area({
            shape: "circle",
            width: 10,
            height: 10,
            offset: vec2(-5, -5)
        }),
        color(YELLOW),
        pos(player.indicatorPos),
        move(angle, 1000),
        cleanup(),
        "bullet"
    ]);
    enemySpawn = true;
    destroyAll("hint");
});

function drawHealthBar(obj) {
    drawLine({
        p1: obj.pos.sub(obj.radius, obj.radius + 20),
        p2: obj.pos.sub(-obj.radius, obj.radius + 20),
        width: 5,
        color: WHITE
    });
    drawLine({
        p1: obj.pos.sub(obj.radius, obj.radius + 20),
        p2: obj.pos.sub(-(obj.radius * 2 * obj.hp() / 10 - obj.radius), obj.radius + 20),
        width: 5,
        color: GREEN
    });
}

onDraw(() => {
    // Calculate the indicator's position and render it every frame
    const angle = mousePos().angle(player.pos);
    player.indicatorPos = player.pos.add(vec2(35 * Math.cos(angle * Math.PI / 180), 35 * Math.sin(angle * Math.PI / 180)));
    drawTriangle({
        p1: vec2(5, 0),
        p2: vec2(-5, -10),
        p3: vec2(-5, 10),
        pos: player.indicatorPos,
        angle,
        fill: true
    });
    drawHealthBar(player);
    every("enemy", drawHealthBar);
});

onUpdate(() => {
    if (rand() > 0.95) {
        let enemyPos;
        do {
            enemyPos = vec2(randi(width()), randi(height()))
        } while (player.hasPoint(enemyPos));
        add([
            circle(10),
            pos(enemyPos),
            area({
                shape: "circle",
                width: 20,
                height: 20,
                offset: vec2(-10, -10)
            }),
            solid(),
            color(CYAN),
            health(10),
            "enemy"
        ])
    }
})