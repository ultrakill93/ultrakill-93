const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let gameState = "menu";
let elapsedTime = 0;
let difficulty = null;

//map
const map = [
    [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,1],
    [1,1,1,1,0,0,1,1,1,1,1,1,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,0,0,1,1,1,1,1,1,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,1],
    [1,0,0,1,0,0,1,0,0,1,0,1,0,0,0,1],
    [1,1,1,1,0,0,1,1,1,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0]
];

//player
const player = {
    x: 3.5,
    y: 3.5,
    dirX: 1,
    dirY: 0,
    planeX: 0,
    planeY: 0.66,
    moveSpeed: 2.5,
    rotSpeed: 1.8,
    health: 100,
    kills: 0
};

const weapon = {
    recoil: 0,
    flashTimer: 0,
    beamTimer: 0,
    bobTimer: 0
};

const zBuffer = new Array(canvas.width).fill(0);

const enemies = [
    { x: 6.5, y: 3.5, spawnX: 6.5, spawnY: 3.5, hp: 30, speed: 1.6, biteCooldown: 0, hitFlash: 0, respawnTimer: 0 },
    { x: 13.5, y: 8.5, spawnX: 13.5, spawnY: 8.5, hp: 30, speed: 1.6, biteCooldown: 0, hitFlash: 0, respawnTimer: 0 },
    { x: 5.5, y: 11.5, spawnX: 5.5, spawnY: 11.5, hp: 30, speed: 1.6, biteCooldown: 0, hitFlash: 0, respawnTimer: 0 }
];

// inputs
const keys = {};
window.addEventListener("keyup", e => keys[e.code] = false);
window.addEventListener("keydown", e => {
    keys[e.code] = true;

    if (gameState === "menu" && e.code === "Enter") {
        gameState = "playing";
    }

    if (gameState === "playing" && e.code === "Space") {
        e.preventDefault();
        shoot();
    }
});

window.addEventListener("mousedown", e => {
    if (gameState === "playing" && document.pointerLockElement === canvas && e.button === 0) {
        shoot();
    }
});

canvas.addEventListener("click", () => {
    if (gameState === "menu") {
        gameState = "playing";
    }
    if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
    }
});

window.addEventListener("mousemove", e => {
    if (document.pointerLockElement === canvas) {
        rotatePlayer(e.movementX * 0.0008);
    }
});

function rotatePlayer(angle) {
    const oldDirX = player.dirX;
    player.dirX = player.dirX * Math.cos(angle) - player.dirY * Math.sin(angle);
    player.dirY = oldDirX * Math.sin(angle) + player.dirY * Math.cos(angle);

    const oldPlaneX = player.planeX;
    player.planeX = player.planeX * Math.cos(angle) - player.planeY * Math.sin(angle);
    player.planeY = oldPlaneX * Math.sin(angle) + player.planeY * Math.cos(angle);
}

//pew pew function
function shoot() {
    if (weapon.recoil > 2) return;
    weapon.recoil = 18;
    weapon.flashTimer = 4;
    weapon.beamTimer = 6;

    const crosshairX = canvas.width / 2;
    const viewHeight = canvas.height - 60;

    enemies.sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y));

    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e.hp <= 0) continue;

        const spriteX = e.x - player.x;
        const spriteY = e.y - player.y;

        const invDet = 1.0 / (player.planeX * player.dirY - player.dirX * player.planeY);
        const transformX = invDet * (player.dirY * spriteX - player.dirX * spriteY);
        const transformY = invDet * (-player.planeY * spriteX + player.planeX * spriteY);

        if (transformY <= 0.1) continue;

        const spriteScreenX = Math.floor((canvas.width / 2) * (1 + transformX / transformY));
        const spriteHeight = Math.abs(Math.floor((viewHeight / transformY) * 1.1));
        const spriteWidth = Math.floor(spriteHeight * 0.45);

        const halfHitWidth = (spriteWidth * 0.35) + 4;
        const wallDist = zBuffer[Math.floor(crosshairX)] || 999;

        if (Math.abs(crosshairX - spriteScreenX) <= halfHitWidth && transformY < wallDist) {
            e.hp -= 15;
            e.hitFlash = 6;

            if (e.hp <= 0) {
                player.kills++;
                e.respawnTimer = 5;
                if (transformY < 4.5) {
                    player.health = Math.min(100, player.health + 20);
                }
            }
            break;
        }
    }
}

window.addEventListener("keydown", e => {
    keys[e.code] = true;

    if (gameState === "menu" && e.code === "Enter") {
        gameState = "playing";
    }

    if (gameState === "playing" && e.code === "Space") {
        e.preventDefault();
        shoot();
    }
});

//enemy update
function updateEnemies(dt) {
    for (const e of enemies) {
        if (e.hp <= 0) {
            if (e.respawnTimer > 0) {
                e.respawnTimer -= dt;
                if (e.respawnTimer <= 0) {
                    e.x = e.spawnX;
                    e.y = e.spawnY;
                    e.hp = 30;
                    e.hitFlash = 0;
                    e.biteCooldown = 0;
                }
            }
            continue;
        }
        if (e.hitFlash > 0) e.hitFlash --;
        if (e.biteCooldown > 0) e.biteCooldown -= dt;

        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 9 && dist > 0.7) {
            const vx = (dx / dist) * e.speed * dt;
            const vy = (dy / dist) * e.speed * dt;

            if (map[Math.floor(e.y)][Math.floor(e.x + vx)] === 0) e.x += vx;
            if (map[Math.floor(e.y + vy)][Math.floor(e.x)] === 0) e.y += vy;
        } else if (dist <= 0.7 && e.biteCooldown <= 0) {
            player.health = Math.max(0, player.health - 15);
            e.biteCooldown = 1.0;
        }
        
    }
}

//movement + collision
function update(dt) {
    elapsedTime += dt;

    let moveX = 0;
    let moveY = 0;

    if (keys["KeyW"]) { moveX += player.dirX; moveY += player.dirY; }
    if (keys["KeyS"]) { moveX -= player.dirX; moveY -= player.dirY; }
    if (keys["KeyD"]) { moveX -= player.dirY; moveY += player.dirX; }
    if (keys["KeyA"]) { moveX += player.dirY; moveY -= player.dirX; }

    //keyboard turning for chromebook support (maybe)?
    if (keys["ArrowLeft"]) rotatePlayer(-player.rotSpeed * dt);
    if (keys["ArrowRight"]) rotatePlayer(player.rotSpeed * dt);

    const len = Math.hypot(moveX, moveY);
    if (len > 0) {
        moveX = (moveX / len) * player.moveSpeed * dt;
        moveY = (moveY / len) * player.moveSpeed * dt;
        weapon.bobTimer += 0.07;
    } else {
        weapon.bobTimer = 0;
    }

    if (weapon.recoil > 0) weapon.recoil *= 0.78;
    if (weapon.flashTimer > 0) weapon.flashTimer--;
    if (weapon.beamTimer > 0) weapon.beamTimer--;


    const pad = 0.2;
    if (map[Math.floor(player.y)][Math.floor(player.x + moveX + Math.sign(moveX) * pad)] === 0) {
        player.x += moveX;
    }
    if (map[Math.floor(player.y + moveY + Math.sign(moveY) * pad)][Math.floor(player.x)] === 0) {
        player.y += moveY;
    }

    updateEnemies(dt);
}

const miniScale = 6;
const miniCanvas = document.createElement("canvas");
miniCanvas.width = map[0].length * miniScale;
miniCanvas.height = map.length * miniScale;
const miniCtx = miniCanvas.getContext("2d");

for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
        if (map[r][c] > 0) {
            miniCtx.fillStyle = map[r][c] === 2 ? "#32a046" : map[r][c] === 3 ? "#3c64c8" : "#aa3333";
            miniCtx.fillRect(c * miniScale, r * miniScale, miniScale, miniScale);
        }
    }
}

//draw enemy
function drawEnemies() {
    const viewHeight = canvas.height - 60;
    const halfView = viewHeight / 2;

    const alive = enemies
        .filter(e => e.hp > 0)
        .sort((a, b) => Math.hypot(b.x - player.x, b.y - player.y) - Math.hypot(a.x - player.x, a.y - player.y));
    
    for (const e of alive) {
        const spriteX = e.x - player.x;
        const spriteY = e.y - player.y;

        const invDet = 1.0 / (player.planeX * player.dirY - player.dirX * player.planeY);
        const transformX = invDet * (player.dirY * spriteX - player.dirX * spriteY);
        const transformY = invDet * (-player.planeY * spriteX + player.planeX * spriteY);

        if (transformY <= 0.1) continue;

        const spriteScreenX = Math.floor((canvas.width / 2) * (1 + transformX / transformY));
        const spriteHeight = Math.abs(Math.floor((viewHeight / transformY) * 1.1));
        const spriteWidth = Math.floor(spriteHeight * 0.45);

        const drawStartY = Math.max(0, -spriteHeight / 2 + halfView);
        const drawStartX = Math.floor(spriteScreenX - spriteWidth / 2);

        const centerCol = Math.max(0, Math.min(canvas.width - 1, spriteScreenX));
        if (transformY >= zBuffer[centerCol]) continue;

        //shading
        const shade = 1 / (1 + transformY * 0.15);
        const bodyColor = e.hitFlash > 0
            ? "#ff4444"
            : `rgb(${132 * shade | 0}, ${130 * shade | 0}, ${82 * shade | 0})`; // Official Filth olive-tan (#848252)

        //torso
        ctx.fillStyle = bodyColor;
        ctx.fillRect(drawStartX + spriteWidth * 0.15, drawStartY, spriteWidth * 0.7, spriteHeight * 0.58);

        //legs
        ctx.fillRect(drawStartX + spriteWidth * 0.18, drawStartY + spriteHeight * 0.58, spriteWidth * 0.24, spriteHeight * 0.42);
        ctx.fillRect(drawStartX + spriteWidth * 0.58, drawStartY + spriteHeight * 0.58, spriteWidth * 0.24, spriteHeight * 0.42);

        //face
        ctx.fillStyle = "#2a0505";
        ctx.fillRect(drawStartX + spriteWidth * 0.25, drawStartY + spriteHeight * 0.14, spriteWidth * 0.5, spriteHeight * 0.24);
        ctx.fillStyle = "#e8e4d8";
        ctx.fillRect(drawStartX + spriteWidth * 0.28, drawStartY + spriteHeight * 0.14, spriteWidth * 0.44, spriteHeight * 0.05);
        ctx.fillRect(drawStartX + spriteWidth * 0.28, drawStartY + spriteHeight * 0.33, spriteWidth * 0.44, spriteHeight * 0.05);
    }
}

//draw weapon
function drawWeapon() {
    const bobX = Math.cos(weapon.bobTimer) * 8;
    const bobY = Math.abs(Math.sin(weapon.bobTimer)) * 8;

    const gunX = (canvas.width / 2) - 16 + bobX;
    const gunY = canvas.height - 60 + bobY + weapon.recoil;

    // hitscan laser
    if (weapon.beamTimer > 0) {
        ctx.strokeStyle = `rgba(80, 200, 255, ${weapon.beamTimer / 6})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(gunX + 18, gunY - 95);
        ctx.lineTo(canvas.width / 2, (canvas.height - 60) / 2);
        ctx.stroke();
    }

    //flash
    if (weapon.flashTimer > 0) {
        ctx.fillStyle = "#55ddff";
        ctx.beginPath();
        ctx.arc(gunX + 18, gunY - 105, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(gunX + 18, gunY - 105, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    //revolver body
    //frame
    ctx.fillStyle = "#2b303a";
    ctx.fillRect(gunX, gunY - 95, 36, 95);

    //blue top shroud
    ctx.fillStyle = "#1d5bbf";
    ctx.fillRect(gunX + 4, gunY - 105, 28, 70);

    //barel and core
    ctx.fillStyle = "#aeb8c4";
    ctx.fillRect(gunX + 10, gunY - 115, 16, 40);
    ctx.fillStyle = "#00e5ff";
    ctx.fillRect(gunX + 14, gunY - 85, 8, 35);
}

//hud gui
function drawHUD() {
    // crosshair
    const cx = canvas.width / 2;
    const cy = (canvas.height - 60) / 2;
    ctx.strokeStyle = "#00ff66";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy);
    ctx.lineTo(cx + 8, cy);
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx, cy + 8);
    ctx.stroke();

    // minimap
    const scale = 6;
    const pad = 10;
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(pad - 2, pad - 2, map[0].length * scale + 4, map.length * scale + 4);
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] > 0) {
                ctx.fillStyle = map[r][c] === 2 ? "#32a046" : map[r][c] === 3 ? "#3c64c8" : "#aa3333";
                ctx.fillRect(pad + c * scale, pad + r * scale, scale, scale);
            }
        }
    }

    //player dot + direction
    const px = pad + player.x * scale;
    const py = pad + player.y * scale;
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(px - 2, py - 2, 4, 4);
    ctx.strokeStyle = "#ffff00";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + player.dirX * 10, py + player.dirY * 10);
    ctx.stroke();

    // bottom bar
    const barHeight = 60;
    const barY = canvas.height - barHeight;

    //run time
    const mins = Math.floor(elapsedTime / 60).toString().padStart(2, "0");
    const secs = Math.floor(elapsedTime % 60).toString().padStart(2, "0");
    const tenths = Math.floor((elapsedTime * 10) % 10);

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(canvas.width - 145, 10, 135, 34);

    ctx.textAlign = "right";
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${mins}:${secs}.${tenths}`, canvas.width - 18, 38);

    ctx.fillStyle = "#1c1c1c";
    ctx.fillRect(0, barY, canvas.width, barHeight);

    ctx.strokeStyle = "#555";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, barY, canvas.width, barHeight);

    // hud labels + num
    ctx.textAlign = "center";
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = "#888";
    ctx.fillText("HEALTH", 140, barY + 20);
    ctx.fillText("KILLS", 660, barY + 20);

    ctx.font = "bold 28px monospace";
    ctx.fillStyle = player.health > 25 ? "#cc2222" : "#ff0000";
    ctx.fillText(`${player.health}%`, 140, barY + 48);

    ctx.fillStyle = "#cccccc";
    ctx.fillText(`${player.kills}`, 660, barY + 48)
}

// raycasting rendering
function draw() {
    const viewHeight = canvas.height - 60;
    const halfView = viewHeight / 2;

    ctx.fillStyle = "#1c1c1c"
    ctx.fillRect(0, 0, canvas.width, halfView);
    ctx.fillStyle = "#3a3a3a";
    ctx.fillRect(0, halfView, canvas.width, halfView);

    for (let x = 0; x < canvas.width; x++) {
        const cameraX = (2 * x) / canvas.width - 1;
        const rayDirX = player.dirX + player.planeX * cameraX;
        const rayDirY = player.dirY + player.planeY * cameraX;

        let mapX = Math.floor(player.x);
        let mapY = Math.floor(player.y);

        const deltaDistX = Math.abs(1 / rayDirX);
        const deltaDistY = Math.abs(1 / rayDirY);

        let stepX, stepY, sideDistX, sideDistY;

        if (rayDirX < 0) {
            stepX = -1;
            sideDistX = (player.x - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1.0 - player.x) * deltaDistX;
        }

        if (rayDirY < 0) {
            stepY = -1;
            sideDistY = (player.y - mapY) * deltaDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1.0 - player.y) * deltaDistY;
        }

        let hit = 0;
        let side = 0;
        while (hit === 0) {
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }
            if (!map[mapY] || map[mapY][mapX] === undefined) {
                hit = 1;
            } else if (map[mapY][mapX] > 0) {
                hit = map[mapY][mapX];
            }
            
        }

        const perpWallDist = side === 0 ? (sideDistX - deltaDistX) : (sideDistY - deltaDistY);
        zBuffer[x] = perpWallDist;

        const lineHeight = Math.floor((viewHeight / perpWallDist) * 1.35);

        const drawStart = Math.max(0, -lineHeight / 2 + halfView);
        const drawEnd = Math.min(viewHeight, lineHeight / 2 + halfView);

        let r = 180, g = 50, b = 50;
        if (hit === 2) { r = 50; g = 160; b = 70; }
        if (hit === 3) { r = 60; g = 100; b = 200; }

        const shade = (side === 1 ? 0.7 : 1.0) / (1 + perpWallDist * 0.15);
        ctx.fillStyle = `rgb(${r * shade}, ${g * shade}, ${b * shade})`;
        ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
    }
    drawEnemies();
    drawWeapon();
    drawHUD();
}

//main menu
function drawMenu() {
    const grade = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grade.addColorStop(0, "#1a0505");
    grade.addColorStop(1, "#000000");
    ctx.fillStyle = grade;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";
    ctx.fillStyle = "#cc2222";
    ctx.font = "bold 64px monospace";
    ctx.fillText("ULTRAKILL '93", canvas.width / 2, 160);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px monospace";
    ctx.fillText ("[ CLICK OR PRESS ENTER TO START ]", canvas.width / 2, 270);

    ctx.fillStyle = "#888888";
    ctx.font = "16px monospace";
    ctx.fillText("WASD: Move | Mouse or Arrow: Turn | ESC: Unlock Mouse", canvas.width / 2, 400);
}

let lastTime = performance.now()

//main loop
function gameLoop(now = performance.now()) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (gameState === "menu") {
        drawMenu();
    } else if (gameState === "playing") {
        update(dt);
        draw();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();