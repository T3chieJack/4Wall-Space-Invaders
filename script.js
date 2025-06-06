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
// Make the game easier: lower default speed
function getAsteroidSpeed() {
  return Number(speedSelect ? speedSelect.value : 1); // was 2
}

// --- Asteroid Creation (spread out and move horizontally, easier) ---
function createAsteroids() {
  // Remove old asteroids from DOM if any
  for (const a of asteroids) {
    if (a.el && a.el.parentNode) a.el.parentNode.removeChild(a.el);
  }
  asteroids = [];
  for (let i = 0; i < asteroidCount; i++) {
    const asteroidEl = document.createElement('div');
    asteroidEl.className = 'asteroid';
    // Spread asteroids further apart
    const laneWidth = (gameWidth - asteroidSize) / (asteroidCount + 1);
    const x = Math.round((i + 1) * laneWidth);
    const y = Math.random() * -600;
    const dir = Math.random() < 0.5 ? 1 : -1;
    // Lower horizontal speed
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
  asteroid.speedX = 0.5 + Math.random() * 0.5; // easier: slower horizontal speed
  // If it's a special asteroid, keep its background
  if (!asteroid.special) {
    asteroid.el.style.background = "url('darren.png') no-repeat center/contain";
  }
  asteroid.el.style.left = asteroid.x + 'px';
  asteroid.el.style.top = asteroid.y + 'px';
}

// --- Player Movement ---
let autoplay = false;
function movePlayer(e) {
  if (autoplay || gameOver) return; // Disable manual movement in autoplay or game over
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

// --- Touchscreen Controls ---
let touchStartX = null;

function handleTouchStart(e) {
  if (gameOver || autoplay) return;
  if (e.touches && e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
  }
}

function handleTouchMove(e) {
  if (gameOver || autoplay) return;
  if (touchStartX === null) return;
  if (e.touches && e.touches.length === 1) {
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - touchStartX;
    if (Math.abs(deltaX) > 20) { // Only move if swipe is significant
      if (deltaX > 0 && playerX < gameWidth - playerWidth) {
        playerX += playerSpeed;
        if (playerX > gameWidth - playerWidth) playerX = gameWidth - playerWidth;
      } else if (deltaX < 0 && playerX > 0) {
        playerX -= playerSpeed;
        if (playerX < 0) playerX = 0;
      }
      player.style.left = playerX + 'px';
      touchStartX = touchX; // Reset for next swipe
    }
  }
}

function handleTouchEnd(e) {
  touchStartX = null;
}

// Tap to shoot
function handleTouchTap(e) {
  if (!autoplay && !gameOver) {
    createBullet();
  }
}

// Attach listeners to the game area
game.addEventListener('touchstart', handleTouchStart, {passive: true});
game.addEventListener('touchmove', handleTouchMove, {passive: true});
game.addEventListener('touchend', handleTouchEnd, {passive: true});
game.addEventListener('touchcancel', handleTouchEnd, {passive: true});

// Tap anywhere in the lower half of the game area to shoot
game.addEventListener('touchend', function(e) {
  if (gameOver || autoplay) return;
  if (e.changedTouches && e.changedTouches.length === 1) {
    const touchY = e.changedTouches[0].clientY;
    const rect = game.getBoundingClientRect();
    if (touchY > rect.top + rect.height / 2) {
      handleTouchTap(e);
    }
  }
}, {passive: true});

// --- Circular Collision Detection with Easier Hitbox ---
function checkCollision(ax, ay) {
  // Center of player
  const playerCenterX = playerX + playerWidth / 2;
  const playerCenterY = 600 - 10 - playerHeight / 2;
  // Center of asteroid
  const asteroidCenterX = ax + asteroidSize / 2;
  const asteroidCenterY = ay + asteroidSize / 2;

  const dx = playerCenterX - asteroidCenterX;
  const dy = playerCenterY - asteroidCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Shrink radii for a much easier hitbox (20% of size)
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

  // Try every possible player position (in steps of playerSpeed)
  for (let x = 0; x <= gameWidth - playerWidth; x += playerSpeed) {
    let safe = true;
    for (let i = 0; i < asteroids.length; i++) {
      const a = asteroids[i];
      // Predict when asteroid will reach player's Y
      const playerY = 600 - 10 - playerHeight;
      const timeToPlayer = (playerY - a.y) / asteroidSpeed;
      if (timeToPlayer < 0) continue; // Asteroid already passed

      // Predict asteroid's future X at that time (simulate bouncing)
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

      // Use circular collision logic for prediction
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

  // If there is a safe spot, move towards the closest one
  if (safeX.length > 0) {
    // Find the closest safeX to current playerX
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
  // Start at center top of player
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
  // Simple rectangle collision
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
const MAX_SPECIAL_ASTEROIDS = 2; // Limit to 2 special people at a time

function spawnSpecialPerson() {
  // Remove oldest special asteroid if over the limit
  if (specialAsteroids.length >= MAX_SPECIAL_ASTEROIDS) {
    const old = specialAsteroids.shift();
    if (old.el && old.el.parentNode) old.el.parentNode.removeChild(old.el);
    // Also remove from main asteroids array
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
// Spawn a special person every 7 seconds
setInterval(spawnSpecialPerson, 7000);

// --- Main Game Loop ---
function gameLoop() {
  if (gameOver) return;

  let asteroidSpeed = getAsteroidSpeed();

  // Move asteroids
  for (let i = 0; i < asteroids.length; i++) {
    const a = asteroids[i];
    // Move down
    a.y += asteroidSpeed;
    // Move side-to-side
    a.x += a.dir * a.speedX;
    // Bounce off walls
    if (a.x <= 0) {
      a.x = 0;
      a.dir = 1;
    } else if (a.x >= gameWidth - asteroidSize) {
      a.x = gameWidth - asteroidSize;
      a.dir = -1;
    }
    a.el.style.left = a.x + 'px';
    a.el.style.top = a.y + 'px';

    // Check collision with player
    if (checkCollision(a.x, a.y)) {
      deaths++;
      updateHUD();
      // Reset all asteroids
      for (let j = 0; j < asteroids.length; j++) {
        resetAsteroid(asteroids[j], true);
      }
      // Remove all bullets
      for (let b of bullets) game.removeChild(b.el);
      bullets = [];
      showGameOver();
      return;
    }

    // Reset asteroid if out of bounds
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

  // Move bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.y -= bulletSpeed;
    b.el.style.top = b.y + 'px';

    // Remove bullet if out of bounds
    if (b.y + bulletHeight < 0) {
      game.removeChild(b.el);
      bullets.splice(i, 1);
      continue;
    }

    // Check collision with asteroids
    for (let j = 0; j < asteroids.length; j++) {
      const a = asteroids[j];
      if (checkBulletCollision(b.x, b.y, a.x, a.y)) {
        // Destroy asteroid and bullet
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
    // Remove all bullets
    for (let b of bullets) game.removeChild(b.el);
    bullets = [];
    // Reset all asteroids
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