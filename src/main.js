import kaboom from "kaboom";

// Initialize the game
kaboom({
    background: [0, 0, 0]
});
onLoad(() => canvas.focus());

// Determines if enemies should be spawning
let enemySpawn = false;
let timeOffset = 0;
let cancelOnDraw, cancelOnUpdate;

function activeTime() {
    return time() - timeOffset;
}

// Add the hint text in the beginning of the game
const hint1 = add([
    text("WASD to move", {
        size: 50
    }),
    pos(center().x, center().y - 150),
    origin("center"),
    color(WHITE),
    opacity(0.5),
    stay()
]);
const hint2 = add([
    text("click to shoot", {
        size: 50
    }),
    pos(center().x, center().y - 100),
    origin("center"),
    color(WHITE),
    opacity(0.5),
    stay()
]);

scene("game", () => {
    let started = false;
    hint1.text = "WASD to move";
    hint2.text = "click to shoot"

    function start() {
        enemySpawn = true;
        started = true;
        timeOffset = time();
        score.hidden = false;
        hint1.hidden = true;
        hint2.hidden = true;
    }

    // Draw the health bar
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

    // Add the time alive
    const score = add([
        text("time alive: 0", {
            size: 30
        }),
        pos(15, 15),
        color(WHITE),
        opacity(0.5)
    ]);

    score.hidden = true;

    score.onUpdate(() => {
        score.text = `time alive: ${Math.floor(activeTime())}`
    });

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

    player.onDeath(() => go("gameOver"));

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
        if (!started) start();
    });

    onKeyDown("a", () => {
        player.moveBy(-6, 0);
        if (!started) start();
    });

    onKeyDown("s", () => {
        player.moveBy(0, 6);
        if (!started) start();
    });

    onKeyDown("d", () => {
        player.moveBy(6, 0);
        if (!started) start();
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
        if (!started) start();
    });

    cancelOnDraw = onDraw(() => {
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

    cancelOnUpdate = onUpdate(() => {
        if (rand() > 0.99 && enemySpawn) {
            let enemyPos;
            do {
                enemyPos = vec2(randi(width()), randi(height()))
            } while (player.hasPoint(enemyPos));
            const enemy = add([
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
            ]);
            enemy.onUpdate(() => {
                enemy.moveTo(player.pos, 30 + activeTime());
                if (enemy.hp() < 10) enemy.heal(0.01);
            });
            enemy.onCollide("player", () => {
                enemy.destroy();
                player.hurt();
            });
            enemy.onCollide("bullet", (bullet) => {
                enemy.hurt(5);
                bullet.destroy();
            });
            enemy.onDeath(enemy.destroy);
        }
    });
});

scene("gameOver", () => {
    let timeAlive = Math.floor(activeTime());
    hint1.text = "game over"
    hint2.text = "time alive: " + timeAlive
    hint1.hidden = false;
    hint2.hidden = false
    add([
        text("press any key to restart", {
            size: 50
        }),
        pos(center()),
        origin("center"),
        color(WHITE),
        opacity(0.5)
    ]);
    enemySpawn = false;
    cancelOnDraw();
    cancelOnUpdate();

    onKeyPress(() => go("game"));
    onClick(() => go("game"));
});

go("game");