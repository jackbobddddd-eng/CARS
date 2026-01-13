const canvas = document.getElementById('roadCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameState = 'START';
let distance = 0, gameSpeed = 12, enemies = []; // Start slightly faster
const laneWidth = 140, roadWidth = laneWidth * 3, roadX = (canvas.width - roadWidth) / 2;
let player = { lane: 1, x: roadX + (laneWidth * 1.5), y: canvas.height - 180, targetX: roadX + (laneWidth * 1.5) };

window.startGame = function() {
    gameState = 'PLAYING';
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    spawnEnemy();
};

window.rebootGame = function() {
    gameState = 'PLAYING';
    distance = 0;
    gameSpeed = 12; // Reset to base speed
    enemies = [];
    player.lane = 1;
    player.x = roadX + (laneWidth * 1.5);
    player.targetX = player.x;
    
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    spawnEnemy();
};

function spawnEnemy() {
    if (gameState !== 'PLAYING') return;
    
    // Higher gameSpeed makes enemies spawn faster and move faster
    enemies.push({
        x: roadX + (Math.floor(Math.random() * 3) * laneWidth) + laneWidth/2,
        y: -200, 
        speed: gameSpeed + (Math.random() * 12) // Added more variance to speed
    });
    
    // The spawn rate now gets faster as the game progresses
    let spawnRate = Math.max(200, 1000 - (gameSpeed * 12));
    setTimeout(spawnEnemy, spawnRate);
}

function drawCar(x, y, color, isPlayer) {
    ctx.save();
    ctx.translate(x, y);
    if (!isPlayer) ctx.scale(1, -1);
    ctx.fillStyle = color;
    ctx.shadowBlur = 15; ctx.shadowColor = color;
    ctx.fillRect(-22, -45, 44, 90);
    ctx.fillStyle = "#000"; ctx.fillRect(-18, -12, 36, 22);
    ctx.restore();
}

function loop() {
    ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f0f14'; ctx.fillRect(roadX, 0, roadWidth, canvas.height);
    
    ctx.strokeStyle = '#222'; ctx.setLineDash([40, 80]);
    ctx.lineDashOffset = -(distance * 2.5);
    for(let i=1; i<3; i++) {
        ctx.beginPath(); ctx.moveTo(roadX + i*laneWidth, 0); ctx.lineTo(roadX + i*laneWidth, canvas.height); ctx.stroke();
    }

    if (gameState === 'PLAYING') {
        distance += 1;
        // ACCELERATION FIX: Game speed increases faster now
        gameSpeed += 0.008; 
        player.x += (player.targetX - player.x) * 0.15;

        enemies.forEach((en, i) => {
            en.y += en.speed;
            if (Math.abs(en.x - player.x) < 45 && Math.abs(en.y - player.y) < 85) {
                gameState = 'END';
                document.getElementById('end-screen').classList.remove('hidden');
                document.getElementById('hud').classList.add('hidden');
                document.getElementById('final-score').innerText = `DISTANCE: ${distance}m`;
            }
            if (en.y > canvas.height + 200) enemies.splice(i, 1);
        });

        enemies.forEach(en => drawCar(en.x, en.y, "#00f2ff", false));
        drawCar(player.x, player.y, "#ff0055", true);
        
        document.getElementById('location').innerText = `LAT: ${Math.round(player.x)} / LONG: ${distance}`;
        document.getElementById('percentage').innerText = `${Math.min(100, Math.floor(distance/50))}%`;
        document.getElementById('speed-display').innerText = Math.floor(gameSpeed * 12);
    }
    requestAnimationFrame(loop);
}

window.onkeydown = (e) => {
    if (gameState !== 'PLAYING') return;
    if (["a", "ArrowLeft"].includes(e.key) && player.lane > 0) player.lane--;
    if (["d", "ArrowRight"].includes(e.key) && player.lane < 2) player.lane++;
    player.targetX = roadX + (player.lane * laneWidth) + laneWidth/2;
};

loop();