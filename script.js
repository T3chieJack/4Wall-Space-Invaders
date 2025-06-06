// --- Play background audio ---
const bgAudio = new Audio('audio.mp3');
bgAudio.loop = true;
bgAudio.volume = 0.5;

// --- Autoplay logic: keep trying until it works ---
function autoplayAudio() {
  bgAudio.play().then(updateAudioIcon).catch(() => {
    document.addEventListener('click', autoplayAudio, { once: true });
    document.addEventListener('keydown', autoplayAudio, { once: true });
  });
}
autoplayAudio();

// --- Audio Control Button ---
const audioBtn = document.getElementById('audio-btn');
const audioIcon = document.getElementById('audio-icon');

function updateAudioIcon() {
  if (!audioIcon) return;
  if (!bgAudio.muted && !bgAudio.paused) {
    audioIcon.src = 'mute.png';
    audioIcon.alt = 'Mute';
  } else {
    audioIcon.src = 'play.png';
    audioIcon.alt = 'Play';
  }
}

bgAudio.addEventListener('play', updateAudioIcon);
bgAudio.addEventListener('pause', updateAudioIcon);
bgAudio.addEventListener('volumechange', updateAudioIcon);

if (audioBtn && audioIcon) {
  audioBtn.addEventListener('click', () => {
    if (!bgAudio.muted && !bgAudio.paused) {
      bgAudio.muted = true;
    } else {
      bgAudio.muted = false;
      bgAudio.play();
    }
    updateAudioIcon();
  });
  updateAudioIcon();
}

// --- DOM Elements ---
const player = document.getElementById('player');
const game = document.getElementById('game');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('best-score');
const deathsDisplay = document.getElementById('deaths');
const speedSelect = document.getElementById('speed');

// --- Game Variables ---
let playerX = 150; // left: 150px for 100px wide player in 400px game
const playerSpeed = 30;
const gameWidth = 400;
const playerWidth = 100;
const playerHeight = 100;

const asteroidCount = 4;
const asteroidSize = 70;
let asteroids = [];
let score = 0;
let deaths = 0;
let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;

// --- Bullet Variables ---
let bullets = [];
const bulletSpeed = 10;
const bulletWidth = 8;
const bulletHeight = 20;

// --- Special People Variables ---
const specialPeople = [
  'amber.png',
  'scott.png',
  'mick.png',
  'ricci.png',
  'tiy.png'
];

// --- Game Over Overlay ---
let gameOver = false;
let gameOverOverlay = document.getElementById('game-over-overlay');
if (!gameOverOverlay) {
  gameOverOverlay = document.createElement('div');
  gameOverOverlay.id = 'game-over-overlay';
  gameOverOverlay.style.position = 'absolute';
  gameOverOverlay.style.top = '0';
  gameOverOverlay.style.left = '0';
  gameOverOverlay.style.width = '100%';
  gameOverOverlay.style.height = '100%';
  gameOverOverlay.style.display = 'none';
  gameOverOverlay.style.justifyContent = 'center';
  gameOverOverlay.style.alignItems = 'center';
  gameOverOverlay.style.flexDirection = 'column';
  gameOverOverlay.style.background = 'rgba(0,0,0,0.7)';
  gameOverOverlay.style.zIndex = '10';
  gameOverOverlay.style.color = '#fff';
  gameOverOverlay.style.fontFamily = "'Pixelify Sans', Arial, sans-serif";
  gameOverOverlay.style.fontSize = '2em';
  gameOverOverlay.style.textAlign = 'center';
  game.appendChild(gameOverOverlay);
}
function showGameOver() {
  gameOver = true;
  gameOverOverlay.innerHTML = `
    <div>Score: ${score}</div>
    <div style="font-size:1em;margin-top:20px;">Press <b>P</b> to play</div>
  `;
  gameOverOverlay.style.display = 'flex';
}
function hideGameOver() {
  gameOver = false;
  gameOverOverlay.style.display = 'none';
}

// --- Speed Selector ---
function getAsteroidSpeed() {
  return Number(speedSelect ? speedSelect.value : 1); // was 2
}

// --- Asteroid Creation (spread out and move horizontally, easier) ---
function createAsteroids() {
  for (const a of asteroids) {
    if (a.el && a.el.parentNode) a.el.parentNode.removeChild(a.el);
  }
  asteroids = [];
  for (let i = 0; i < asteroidCount; i++) {
    const asteroidEl = document.createElement('div');
    asteroidEl.className = 'asteroid';
    const laneWidth = (gameWidth - asteroidSize) / (asteroidCount + 1);
    const x = Math.round((i + 1) * laneWidth);
    const y = Math.random() * -600;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const speedX = 0.5 + Math.random() * 0.5;
    asteroidEl.style.left = x + 'px';
    asteroidEl.style.top = y + 'px';
    game.appendChild(asteroidEl);
    asteroids.push({el: asteroidEl, x, y, dir, speedX, special: false});
  }
}

// --- Asteroid Reset (randomize horizontal movement) ---
function resetAsteroid(asteroid, initial = false) {
  asteroid.x = Math.floor(Math.random() * (gameWidth - asteroidSize));
  asteroid.y = initial ? Math.random() * -600 : -asteroidSize;
  asteroid.dir = Math.random() < 0.5 ? 1 : -1;
  asteroid.speedX = 0.5 + Math.random() * 0.5;
  if (!asteroid.special) {
    asteroid.el.style.background = "url('darren.png') no-repeat center/contain";
  }
  asteroid.el.style.left = asteroid.x + 'px';
  asteroid.el.style.top = asteroid.y + 'px';
}

// --- Player Movement ---
let autoplay = false;
function movePlayer(e) {
  if (autoplay || gameOver) return;
  if (e.key === 'ArrowLeft' && playerX > 0) {
    playerX -= playerSpeed;
    if (playerX < 0) playerX = 0;
  } else if (e.key === 'ArrowRight' && playerX < gameWidth - playerWidth) {
    playerX += playerSpeed;
    if (playerX > gameWidth - playerWidth) playerX = gameWidth - playerWidth;
  }
  player.style.left = playerX + 'px';
}
document.addEventListener('keydown', movePlayer);

// --- Touchscreen Buttons for Mobile ---
const controls = document.createElement('div');
controls.id = 'touch-controls';
controls.style.position = 'absolute';
controls.style.bottom = '10px';
controls.style.left = '0';
controls.style.width = '100%';
controls.style.display = 'flex';
controls.style.justifyContent = 'center';
controls.style.gap = '20px';
controls.style.zIndex = '20';
controls.style.pointerEvents = 'none';

const leftBtn = document.createElement('button');
leftBtn.textContent = '◀';
leftBtn.style.fontSize = '2em';
leftBtn.style.width = '60px';
leftBtn.style.height = '60px';
leftBtn.style.borderRadius = '50%';
leftBtn.style.border = '2px solid #333';
leftBtn.style.background = '#fff8';
leftBtn.style.pointerEvents = 'auto';

const shootBtn = document.createElement('button');
shootBtn.textContent = '●';
shootBtn.style.fontSize = '2em';
shootBtn.style.width = '60px';
shootBtn.style.height = '60px';
shootBtn.style.borderRadius = '50%';
shootBtn.style.border = '2px solid #333';
shootBtn.style.background = '#fff8';
shootBtn.style.pointerEvents = 'auto';

const rightBtn = document.createElement('button');
rightBtn.textContent = '▶';
rightBtn.style.fontSize = '2em';
rightBtn.style.width = '60px';
rightBtn.style.height = '60px';
rightBtn.style.borderRadius = '50%';
rightBtn.style.border = '2px solid #333';
rightBtn.style.background = '#fff8';
rightBtn.style.pointerEvents = 'auto';

controls.appendChild(leftBtn);
controls.appendChild(shootBtn);
controls.appendChild(rightBtn);
document.body.appendChild(controls);

// Touch button events
leftBtn.addEventListener('touchstart', function(e) {
  e.preventDefault();
  if (!autoplay && !gameOver && playerX > 0) {
    playerX -= playerSpeed;
    if (playerX < 0) playerX = 0;
    player.style.left = playerX + 'px';
  }
});
rightBtn.addEventListener('touchstart', function(e) {
  e.preventDefault();
  if (!autoplay && !gameOver && playerX < gameWidth - playerWidth) {
    playerX += playerSpeed;
    if (playerX > gameWidth - playerWidth) playerX = gameWidth - playerWidth;
    player.style.left = playerX + 'px';
  }
});
shootBtn.addEventListener('touchstart', function(e) {
  e.preventDefault();
  if (!autoplay && !gameOver) {
    createBullet();
  }
});

// Also support mouse for desktop
leftBtn.addEventListener('mousedown', function(e) {
  if (!autoplay && !gameOver && playerX > 0) {
    playerX -= playerSpeed;
    if (playerX < 0) playerX = 0;
    player.style.left = playerX + 'px';
  }
});
rightBtn.addEventListener('mousedown', function(e) {
  if (!autoplay && !gameOver && playerX < gameWidth - playerWidth) {
    playerX += playerSpeed;
    if (playerX > gameWidth - playerWidth) playerX = gameWidth - playerWidth;
    player.style.left = playerX + 'px';
  }
});
shootBtn.addEventListener('mousedown', function(e) {
  if (!autoplay && !gameOver) {
    createBullet();
  }
});

// --- Circular Collision Detection with Easier Hitbox ---
function checkCollision(ax, ay) {
  const playerCenterX = playerX + playerWidth / 2;
  const playerCenterY = 600 - 10 - playerHeight / 2;
  const asteroidCenterX = ax + asteroidSize / 2;
  const asteroidCenterY = ay + asteroidSize / 2;
  const dx = playerCenterX - asteroidCenterX;
  const dy = playerCenterY - asteroidCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const playerRadius = playerWidth * 0.2;
  const asteroidRadius = asteroidSize * 0.2;
  return distance < (playerRadius + asteroidRadius);
}

// --- HUD Update ---
function updateHUD() {
  scoreDisplay.textContent = `Score: ${score}`;
  bestScoreDisplay.textContent = `Best: ${bestScore}`;
  deathsDisplay.textContent = `Deaths: ${deaths}`;
}

// --- Autoplay Feature ---
const autoplayBtn = document.getElementById('autoplay-btn');
if (autoplayBtn) {
  autoplayBtn.addEventListener('click', () => {
    autoplay = !autoplay;
    autoplayBtn.textContent = `Autoplay: ${autoplay ? 'ON' : 'OFF'}`;
  });
}

// --- Perfect Autoplay Logic (always wins) ---
function autoplayMove() {
  let asteroidSpeed = getAsteroidSpeed();
  let safeX = [];
  for (let x = 0; x <= gameWidth - playerWidth; x += playerSpeed) {
    let safe = true;
    for (let i = 0; i < asteroids.length; i++) {
      const a = asteroids[i];
      const playerY = 600 - 10 - playerHeight;
      const timeToPlayer = (playerY - a.y) / asteroidSpeed;
      if (timeToPlayer < 0) continue;
      let tempDir = a.dir;
      let tempX = a.x;
      let remainingTime = timeToPlayer;
      while (remainingTime > 0) {
        let nextWall;
        if (tempDir === 1) {
          nextWall = (gameWidth - asteroidSize - tempX) / (a.speedX || 1);
        } else {
          nextWall = tempX / (a.speedX || 1);
        }
        if (nextWall > remainingTime) {
          tempX += tempDir * a.speedX * remainingTime;
          break;
        } else {
          tempX += tempDir * a.speedX * nextWall;
          tempDir *= -1;
          remainingTime -= nextWall;
        }
      }
      let futureAx = tempX;
      const playerCenterX = x + playerWidth / 2;
      const playerCenterY = playerY + playerHeight / 2;
      const asteroidCenterX = futureAx + asteroidSize / 2;
      const asteroidCenterY = playerY + asteroidSize / 2;
      const dx = playerCenterX - asteroidCenterX;
      const dy = playerCenterY - asteroidCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const playerRadius = playerWidth * 0.2;
      const asteroidRadius = asteroidSize * 0.2;
      if (distance < (playerRadius + asteroidRadius)) {
        safe = false;
        break;
      }
    }
    if (safe) safeX.push(x);
  }
  if (safeX.length > 0) {
    let closest = safeX.reduce((prev, curr) =>
      Math.abs(curr - playerX) < Math.abs(prev - playerX) ? curr : prev
    );
    if (playerX < closest) {
      playerX += playerSpeed;
      if (playerX > closest) playerX = closest;
    } else if (playerX > closest) {
      playerX -= playerSpeed;
      if (playerX < closest) playerX = closest;
    }
    player.style.left = playerX + 'px';
  }
}

// --- Create Bullet Element ---
function createBullet() {
  if (gameOver) return;
  const bullet = document.createElement('div');
  bullet.className = 'bullet';
  const bulletX = playerX + playerWidth / 2 - bulletWidth / 2;
  const bulletY = 600 - 10 - playerHeight;
  bullet.style.left = bulletX + 'px';
  bullet.style.top = bulletY + 'px';
  game.appendChild(bullet);
  bullets.push({el: bullet, x: bulletX, y: bulletY});
}

// --- Handle Shooting ---
document.addEventListener('keydown', function(e) {
  if (e.code === 'Space' && !autoplay && !gameOver) {
    createBullet();
  }
});

// --- Bullet-Asteroid Collision ---
function checkBulletCollision(bx, by, ax, ay) {
  return (
    bx < ax + asteroidSize &&
    bx + bulletWidth > ax &&
    by < ay + asteroidSize &&
    by + bulletHeight > ay
  );
}

// --- Special Person Asteroid Spawner ---
let lastSpecialIndex = -1;
let specialAsteroids = [];
const MAX_SPECIAL_ASTEROIDS = 2;
function spawnSpecialPerson() {
  if (specialAsteroids.length >= MAX_SPECIAL_ASTEROIDS) {
    const old = specialAsteroids.shift();
    if (old.el && old.el.parentNode) old.el.parentNode.removeChild(old.el);
    const idx = asteroids.indexOf(old);
    if (idx !== -1) asteroids.splice(idx, 1);
  }
  let idx;
  do {
    idx = Math.floor(Math.random() * specialPeople.length);
  } while (idx === lastSpecialIndex && specialPeople.length > 1);
  lastSpecialIndex = idx;
  const img = specialPeople[idx];
  const asteroidEl = document.createElement('div');
  asteroidEl.className = 'asteroid special-asteroid';
  asteroidEl.style.background = `url('${img}') no-repeat center/contain`;
  const x = Math.floor(Math.random() * (gameWidth - asteroidSize));
  const y = -asteroidSize;
  const dir = Math.random() < 0.5 ? 1 : -1;
  const speedX = 0.5 + Math.random() * 0.5;
  asteroidEl.style.left = x + 'px';
  asteroidEl.style.top = y + 'px';
  game.appendChild(asteroidEl);
  const specialObj = {el: asteroidEl, x, y, dir, speedX, special: true};
  asteroids.push(specialObj);
  specialAsteroids.push(specialObj);
}
setInterval(spawnSpecialPerson, 7000);

// --- Main Game Loop ---
function gameLoop() {
  if (gameOver) return;
  let asteroidSpeed = getAsteroidSpeed();
  for (let i = 0; i < asteroids.length; i++) {
    const a = asteroids[i];
    a.y += asteroidSpeed;
    a.x += a.dir * a.speedX;
    if (a.x <= 0) {
      a.x = 0;
      a.dir = 1;
    } else if (a.x >= gameWidth - asteroidSize) {
      a.x = gameWidth - asteroidSize;
      a.dir = -1;
    }
    a.el.style.left = a.x + 'px';
    a.el.style.top = a.y + 'px';
    if (checkCollision(a.x, a.y)) {
      deaths++;
      updateHUD();
      for (let j = 0; j < asteroids.length; j++) {
        resetAsteroid(asteroids[j], true);
      }
      for (let b of bullets) game.removeChild(b.el);
      bullets = [];
      showGameOver();
      return;
    }
    if (a.y > 600) {
      resetAsteroid(a, false);
      score++;
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
      }
      updateHUD();
    }
  }
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.y -= bulletSpeed;
    b.el.style.top = b.y + 'px';
    if (b.y + bulletHeight < 0) {
      game.removeChild(b.el);
      bullets.splice(i, 1);
      continue;
    }
    for (let j = 0; j < asteroids.length; j++) {
      const a = asteroids[j];
      if (checkBulletCollision(b.x, b.y, a.x, a.y)) {
        resetAsteroid(a, false);
        game.removeChild(b.el);
        bullets.splice(i, 1);
        score += 5;
        if (score > bestScore) {
          bestScore = score;
          localStorage.setItem('bestScore', bestScore);
        }
        updateHUD();
        break;
      }
    }
  }
  if (autoplay) autoplayMove();
  requestAnimationFrame(gameLoop);
}

// --- Listen for "P" to restart ---
document.addEventListener('keydown', function(e) {
  if (gameOver && (e.key === 'p' || e.key === 'P')) {
    score = 0;
    updateHUD();
    hideGameOver();
    playerX = 150;
    player.style.left = playerX + 'px';
    for (let b of bullets) game.removeChild(b.el);
    bullets = [];
    for (let j = 0; j < asteroids.length; j++) {
      resetAsteroid(asteroids[j], true);
    }
    gameLoop();
  }
});

// --- Start Game ---
function startGame() {
  createAsteroids();
  updateHUD();
  player.style.left = playerX + 'px';
  gameLoop();
}

window.onload = startGame;