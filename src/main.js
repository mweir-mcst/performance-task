/**
 * The Shoot-Down! Created as an AP Performance Task on 2/17/22.
 * @author Matthew Weir
 * @version 1.0.0
 */

import kaboom from "kaboom";

// Initialize the game
kaboom({
    background: [0, 0, 0]
});
onLoad(() => canvas.focus());

// Determines if enemies should be spawning
let enemySpawn = false;
// The offset of the game's time from the start of each round's time
let timeOffset = 0;
// Used to cancel the draw and update functions in the main game
let cancelOnDraw, cancelOnUpdate;
// The previous history of scores
let scoreHistory = getData("scoreHistory", []);

// Calculates the time a round has been running
function activeTime() {
    return time() - timeOffset;
}

// Helper function to add a text object.
function addText(content, size, x, y, props = []) {
    return add([
        text(content, {size}),
        pos(x, y),
        color(WHITE),
        opacity(0.5)
    ].concat(props));
}

scene("game", () => {
    // Hint text that shows you how to play
    const hint1 = addText("WASD to move", 50, center().x, center().y - 150, [origin("center")]);
    const hint2 = addText("click to shoot", 50, center().x, center().y - 100, [origin("center")]);

    // Add the time alive, and hide it until the round starts
    const score = addText("time alive: 0", 30, 15, 15);
    score.hidden = true;

    // Whether the round has started
    let started = false;

    // Starts the round
    function start() {
        // Start spawning enemies and update some variables
        enemySpawn = true;
        started = true;
        timeOffset = time();
        // Hide the hint text and show the time alive
        score.hidden = false;
        hint1.hidden = true;
        hint2.hidden = true;
    }

    // Draw the health bar
    function drawHealthBar(obj) {
        // Draw the white full length bar
        drawLine({
            p1: obj.pos.sub(obj.radius, obj.radius * 1.75),
            p2: obj.pos.sub(-obj.radius, obj.radius * 1.75),
            width: 5,
            color: WHITE
        });
        // Draw the green bar that represents how much health the player has
        drawLine({
            p1: obj.pos.sub(obj.radius, obj.radius * 1.75),
            p2: obj.pos.sub(-(obj.radius * 2 * obj.hp() / 10 - obj.radius), obj.radius * 1.75),
            width: 5,
            color: rgb(0, 128, 0)
        });
    }

    // Every frame, update the time alive display with the time alive
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
    player.indicatorPos = vec2();

    // When the player dies, go to the game over screen
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
        // Create a bullet at the indicator position, moving indefinitely towards the mouse, which gets destroyed when it leaves view
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
        // Draw the player's health bar
        drawHealthBar(player);
        // Draw each enemy's health bar
        every("enemy", drawHealthBar);
    });

    cancelOnUpdate = onUpdate(() => {
        // Every frame, if a random number from 0 to 1 is greater than 0.99 (and enemy spawning is enabled) spawn an enemy.
        if (rand() > 0.99 && enemySpawn) {
            let enemyPos;
            do {
                // Calculate a random enemy position, and make sure that the enemy doesn't spawn on top of the player
                enemyPos = vec2(randi(width()), randi(height()))
            } while (player.hasPoint(enemyPos));
            // Spawn the enemy
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
            // Every frame, move the enemy towards the player at a speed depending on how long the round has been active for.
            // Also heal the enemy
            enemy.onUpdate(() => {
                enemy.moveTo(player.pos, 30 + activeTime());
                if (enemy.hp() < 10) enemy.heal(0.01);
            });
            // If the enemy hits the player, destory the enemy and damage the player.
            enemy.onCollide("player", () => {
                enemy.destroy();
                player.hurt();
            });
            // If a bullet hts the player, destroy the bullet and hurt the enemy.
            enemy.onCollide("bullet", (bullet) => {
                enemy.hurt(5);
                bullet.destroy();
            });
            // If the enemy dies, destroy it.
            enemy.onDeath(enemy.destroy);
        }
    });
});

scene("gameOver", () => {
    // Get the round's active time, push it to the history, and save the history.
    let timeAlive = Math.floor(activeTime());
    scoreHistory.push(timeAlive);
    setData("scoreHistory", scoreHistory);
    // If the active time is greater than the previous high score, save the new time as the high score.
    if (timeAlive > getData("highScore", timeAlive)) setData("highScore", timeAlive);
    // Stop drawing the health bars and player indicator, and stop checking for game updates.
    cancelOnDraw();
    cancelOnUpdate();
    // Stop spawning enemies
    enemySpawn = false;
    // Go to the game over screen itself
    go("gameOverScreen");
});

scene("gameOverScreen", () => {
    // Add the game over screen's text
    addText("game over", 50, center().x, center().y - 150, [origin("center")]);
    addText("time alive: " + scoreHistory[scoreHistory.length - 1], 50, center().x, center().y - 100, [origin("center")]);
    addText("press space to restart", 50, center().x, center().y, [origin("center")]);
    addText("press S to view past scores", 50, center().x, center().y + 50, [origin("center")]);

    // If space is pressed, start a new round
    onKeyPress("space", () => go("game"));
    // If s is pressed, view the scores
    onKeyPress("s", () => go("scores"));
})

scene("scores", () => {
    // Show last round's score and the current high score
    addText("scores", 100, center().x, 75, [origin("center")]);
    addText("score: " + scoreHistory[scoreHistory.length - 1], 50, center().x, 150, [origin("center")]);
    addText("high: " + getData("highScore", scoreHistory[scoreHistory.length - 1]), 50, center().x, 200, [origin("center")]);

    // Display all the past scores, with up to 5 scores per line
    addText("past scores", 75, center().x, 300, [origin("center")]);
    for (let i = 0; i < Math.ceil(scoreHistory.length / 5); i++) {
        addText(scoreHistory.slice(0, -1).slice(i * 5, i * 5 + 5).join(", ") + ((i + 1) * 5 < scoreHistory.length - 1 ? "," : ""), 50, center().x, 375 + 50 * i, [origin("center")]);
    }

    // If space is pressed, go back to the game over screen
    addText("press space to return", 50, center().x, height() - 100, [origin("center")]);
    onKeyPress("space", () => go("gameOverScreen"));
});

// Go to the game screen to start
go("game");