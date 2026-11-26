const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

let gameState = "menu";
let elapsedTime = 0;
let difficulty = null;
let level = "0-1"

//1-3 colors, 0 floor/roof, 4 spawn, 5 enemy spawn (tbd), 6 doors (tbd), 7 end gate to end level (tbd)
//map

//enemy moveable tiles
const allowed_tiles = [0, 4, 5, 7];

const map = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,5,5,5,5,5,5,1,0,0,0,1,5,0,5,0,5,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,5,0,5,0,5,0,1,0,0,0,0,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0],
    [0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,1,0,0],
    [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,5,1,0,1,0,0],
    [0,0,0,0,0,0,1,0,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0,1,5,1,0,1,0,0],
    [0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,1,0,1,5,1,0,1,0,0],
    [0,0,0,0,0,1,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,5,0,5,0,5,0,1,0,0,1,0,1,5,1,0,1,0,0],
    [0,0,0,0,0,1,0,1,0,0,0,0,1,5,5,5,5,5,5,1,0,0,0,1,5,0,5,0,5,0,1,0,0,1,0,1,0,1,0,1,0,0],
    [0,0,0,0,0,1,0,1,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,0,0,1,0,1,0,1,0,1,0,0],
    [0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,5,1,0,0],
    [0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,5,1,0,0],
    [0,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,5,1,0,0],
    [0,1,5,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0],
    [0,1,5,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0],
    [0,1,5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0],
    [0,1,0,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0],
    [0,1,0,1,0,1,5,0,0,0,5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0],
    [0,1,0,1,0,1,0,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0],
    [0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1],
    [0,1,0,1,1,1,0,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,5,0,0,0,5,1],
    [0,1,0,0,0,0,5,0,0,0,5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,5,0,0,0,5,1],
    [0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1],
    [0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0],
    [0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0],
    [0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0],
    [0,0,0,0,0,1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0],
    [0,0,0,0,0,1,5,5,5,5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [0,0,0,0,0,1,1,1,1,5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,7,0,0,1],
    [0,0,0,0,0,0,0,0,1,5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,5,0,0,5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,5,0,0,0,5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,5,0,0,0,5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,4,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

const spawnY = map.findIndex(row => row.includes(4));
const spawnX = spawnY !== -1 ? map[spawnY].indexOf(4) : 3;
const spawnRow = spawnY !== -1 ? spawnY : 3;

//player
const player = {
    x: spawnX + 0.5,
    y: spawnRow + 0.5,
    dirX: 0,
    dirY: -1,
    planeX: 0.66,
    planeY: 0,
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

//filth spawn pad
const EFspawnY = map.findIndex(row => row.includes(5));
const EFspawnX = EFspawnY !== -1 ? map[EFspawnY].indexOf(5) : 3;
const EFspawnRow = EFspawnY !== -1 ? EFspawnY : 3;

const enemies = [];

for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === 5) {
            enemies.push({
                x: x + 0.5,
                y: y + 0.5,
                spawnX: x + 0.5,
                spawnY: y + 0.5,
                hp: 30,
                speed: 1.6,
                biteCooldown: 0,
                hitFlash: 0,
                respawnTimer: 0
            });
        }
    }
}

const particles = [];

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

    if (gameState === "dead" && e.code === "Enter") {
        location.reload();
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
    if (gameState === "dead") {
        location.reload();
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

//blood efx
function spawnBlood(x, y, count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2.5;
        particles.push({
            x: x,
            y: y,
            z: 0.1 + (Math.random() - 0.5) * 0.4,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            vz: (Math.random() - 0.2) * 2.0,
            life: 0.5 + Math.random() * 0.5,
            size: 2 + Math.floor(Math.random() * 2)
        });
    }
}

//pew pew function
function shoot() {
    if (weapon.recoil > 2) return;
    weapon.recoil = 9;
    weapon.flashTimer = 4;
    weapon.beamTimer = 6;

    const crosshairX = canvas.width / 2;
    const viewHeight = canvas.height - 30;

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

        const halfHitWidth = (spriteWidth * 0.35) + 2;
        const wallDist = zBuffer[Math.floor(crosshairX)] || 999;

        if (Math.abs(crosshairX - spriteScreenX) <= halfHitWidth && transformY < wallDist) {
            e.hp -= 15;
            e.hitFlash = 6;
            spawnBlood(e.x, e.y, 8);

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

            if (allowed_tiles.includes(map[Math.floor(e.y)][Math.floor(e.x + vx)])) e.x += vx;
            if (allowed_tiles.includes(map[Math.floor(e.y + vy)][Math.floor(e.x)])) e.y += vy;
        } else if (dist <= 0.7 && e.biteCooldown <= 0) {
            player.health = Math.max(0, player.health - 15);
            e.biteCooldown = 1.0;
        }
        
    }
}

//particle updated
function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
    
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vz -= 5.5 * dt;
        p.z += p.vz * dt;

        if (p.z < -0.45) {
            p.z = -0.45;
            p.vx *= 0.5;
            p.vy *= 0.5;
            p.vz = 0;
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
    if (allowed_tiles.includes(map[Math.floor(player.y)][Math.floor(player.x + moveX + Math.sign(moveX) * pad)])) {
        player.x += moveX;
    }

    if (allowed_tiles.includes(map[Math.floor(player.y + moveY + Math.sign(moveY) * pad)][Math.floor(player.x)])) {
        player.y += moveY;
    }

    updateEnemies(dt);
    updateParticles(dt);
    if (player.health <= 0) {
        player.health = 0;
        gameState = "dead";
        document.exitPointerLock();
    }
}

const miniScale = 6;
const miniCanvas = document.createElement("canvas");
miniCanvas.width = map[0].length * miniScale;
miniCanvas.height = map.length * miniScale;
const miniCtx = miniCanvas.getContext("2d");

for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
        if (map[r][c] > 0 && map[r][c] !== 4 && map[r][c] !== 5) {
            miniCtx.fillStyle = map[r][c] === 2 ? "#32a046" : map[r][c] === 3 ? "#3c64c8" : map[r][c] === 4 ? "#3c64c2" : "#aa3333";
            miniCtx.fillRect(c * miniScale, r * miniScale, miniScale, miniScale);
        }
    }
}

//draw enemy
function drawEnemies() {
    const viewHeight = canvas.height - 30;
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
            : `rgb(${132 * shade | 0}, ${130 * shade | 0}, ${82 * shade | 0})`;

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

function drawParticles() {
    const viewHeight = canvas.height - 30;
    const halfView = viewHeight / 2;

    for (const p of particles) {
        const spriteX = p.x - player.x;
        const spriteY = p.y - player.y;

        const invDet = 1.0 / (player.planeX * player.dirY - player.dirX * player.planeY);
        const transformX = invDet * (player.dirY * spriteX - player.dirX * spriteY);
        const transformY = invDet * (-player.planeY * spriteX + player.planeX * spriteY);

        if (transformY <= 0.1) continue;

        const screenX = Math.floor((canvas.width / 2) * (1 + transformX / transformY));
        const col = Math.max(0, Math.min(canvas.width - 1, screenX));
        if (transformY >= zBuffer[col]) continue;

        const screenY = Math.floor(halfView - (p.z * viewHeight) / transformY);
        if (screenY < 0 || screenY >= viewHeight) continue;

        const pixelSize = Math.max(1, Math.floor((p.size * 2.5) / transformY));
        const shade = 1 / (1 + transformY * 0.15);

        ctx.fillStyle = `rgb(${210 * shade | 0}, ${15 * shade | 0}, ${20 * shade | 0})`;
        ctx.fillRect(screenX - pixelSize / 2, screenY - pixelSize / 2, pixelSize, pixelSize);
    }
}

//draw weapon
function drawWeapon() {
    const bobX = Math.cos(weapon.bobTimer) * 4;
    const bobY = Math.abs(Math.sin(weapon.bobTimer)) * 4;

    const gunX = (canvas.width / 2) - 9 + bobX;
    const gunY = canvas.height - 30 + bobY + weapon.recoil;

    // hitscan laser
    if (weapon.beamTimer > 0) {
        ctx.strokeStyle = `rgba(80, 200, 255, ${weapon.beamTimer / 6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gunX + 9, gunY - 48);
        ctx.lineTo(canvas.width / 2, (canvas.height - 30) / 2);
        ctx.stroke();
    }

    //flash
    if (weapon.flashTimer > 0) {
        ctx.fillStyle = "#55ddff";
        ctx.beginPath();
        ctx.arc(gunX + 9, gunY - 52, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(gunX + 9, gunY - 52, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    //revolver body
    //frame
    ctx.fillStyle = "#2b303a";
    ctx.fillRect(gunX, gunY - 48, 18, 48);

    //blue top shroud
    ctx.fillStyle = "#1d5bbf";
    ctx.fillRect(gunX + 2, gunY - 52, 14, 35);

    //barel and core
    ctx.fillStyle = "#aeb8c4";
    ctx.fillRect(gunX + 5, gunY - 58, 8, 20);
    ctx.fillStyle = "#00e5ff";
    ctx.fillRect(gunX + 7, gunY - 42, 4, 18);
}

//hud gui
function drawHUD() {
    // crosshair
    const cx = canvas.width / 2;
    const cy = (canvas.height - 30) / 2;
    ctx.strokeStyle = "#00ff66";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy);
    ctx.lineTo(cx + 4, cy);
    ctx.moveTo(cx, cy - 4);
    ctx.lineTo(cx, cy + 4);
    ctx.stroke();

    // minimap
    const scale = 3;
    const pad = 5;
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(pad - 1, pad - 1, map[0].length * scale + 2, map.length * scale + 2);
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] > 0 && map[r][c] !== 4 && map[r][c] !== 5 && map[r][c] !== 7) {
                ctx.fillStyle = map[r][c] === 2 ? "#32a046" : map[r][c] === 3 ? "#3c64c8" : "#aa3333";
                ctx.fillRect(pad + c * scale, pad + r * scale, scale, scale);
            }
        }
    }

    //player dot + direction
    const px = pad + player.x * scale;
    const py = pad + player.y * scale;
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(px - 1, py - 1, 2, 2);
    ctx.strokeStyle = "#ffff00";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + player.dirX * 5, py + player.dirY * 5);
    ctx.stroke();

    // bottom bar
    const barHeight = 30;
    const barY = canvas.height - barHeight;

    //run time
    const mins = Math.floor(elapsedTime / 60).toString().padStart(2, "0");
    const secs = Math.floor(elapsedTime % 60).toString().padStart(2, "0");
    const tenths = Math.floor((elapsedTime * 10) % 10);

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(canvas.width - 75, 5, 70, 18);

    ctx.textAlign = "right";
    ctx.font = "bold 10px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${mins}:${secs}.${tenths}`, canvas.width - 8, 16);

    ctx.fillStyle = "#1c1c1c";
    ctx.fillRect(0, barY, canvas.width, barHeight);

    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, barY, canvas.width, barHeight);

    const leftX = canvas.width * 0.22;
    const rightX = canvas.width * 0.78;

    // hud labels + num
    ctx.textAlign = "center";
    ctx.font = "bold 9px monospace";
    ctx.fillStyle = "#888";
    ctx.fillText("HEALTH", leftX, barY + 9);
    ctx.fillText("KILLS", rightX, barY + 9);

    ctx.font = "bold 15px monospace";
    ctx.fillStyle = player.health > 25 ? "#cc2222" : "#ff0000";
    ctx.fillText(`${player.health}%`, 70, barY + 26);

    ctx.fillStyle = "#cccccc";
    ctx.fillText(`${player.kills}`, rightX, barY + 26)
}

// raycasting rendering
function draw() {
    const viewHeight = canvas.height - 30;
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
            } else if (map[mapY][mapX] > 0 && map[mapY][mapX] !== 4 && map[mapY][mapX] !== 5) {
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
        if (hit === 7) { r = 128; g = 128; b = 128; }

        const shade = (side === 1 ? 0.7 : 1.0) / (1 + perpWallDist * 0.15);
        ctx.fillStyle = `rgb(${r * shade}, ${g * shade}, ${b * shade})`;
        ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
    }
    drawEnemies();
    drawParticles();
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
    ctx.font = "bold 32px monospace";
    ctx.fillText("ULTRAKILL '93", canvas.width / 2, 160);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px monospace";
    ctx.fillText ("[ CLICK OR PRESS ENTER TO START ]", canvas.width / 2, 270);

    ctx.fillStyle = "#888888";
    ctx.font = "8px monospace";
    ctx.fillText("WASD: Move | Mouse or Arrow: Turn | ESC: Unlock Mouse", canvas.width / 2, 400);
}

function drawDeathScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, 90);
    ctx.scale(1.5, 1.5);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-20, -20, 40, 30);
    ctx.fillRect(-16, -25, 32, 5);
    ctx.fillRect(-16, 10, 32, 8);
    ctx.fillRect(-13, 18, 26, 7);

    ctx.fillStyle = "#000000";
    ctx.fillRect(-14, -13, 10, 12);
    ctx.fillRect(4, -13, 10, 12);

    ctx.fillRect(-3, 2, 6, 7);

    ctx.fillStyle = "#ffffff";
    for (let i = -10; i <= 8; i += 6) {
        ctx.fillRect(i, 13, 4, 8);
    }

    ctx.restore();

    ctx.textAlign = "center";
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px monospace";
    ctx.fillText("YOU DIED", canvas.width / 2, 290);

    ctx.fillStyle = "#ffffff";
    ctx.font = "14x monospace";
    ctx.fillText(`KILLS ${player.kills}`, canvas.width / 2, 230);

    ctx.fillStyle = "#888888";
    ctx.font = "11px monospace";
    ctx.fillText("[ CLICK OR PRESS ENTER TO RESTART ]",
        canvas.width / 2, 170);
}

function drawLevelScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(1.5, 1.5);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.fillText("LEVEL COMPLETE", 0, -10);

    ctx.font = "8px monospace";
    ctx.fillText(`KILLS ${player.kills}`, 0, 15);

    ctx.restore();
}

let lastTime = performance.now()

let eventTriggered = false;

function checkTriggers() {
    const x = Math.floor(player.x);
    const y = Math.floor(player.y);

    if (map[y][x] === 7 && !eventTriggered) {
            eventTriggered = true;
            gameState = "level_complete";
    }
}

//main loop
function gameLoop(now = performance.now()) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (gameState === "menu") {
        drawMenu();
    } else if (gameState === "playing") {
        update(dt);
        draw();
        checkTriggers();
    } else if (gameState === "level_complete") {
        drawLevelScreen();
    } else if (gameState === "dead") {
        drawDeathScreen();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();