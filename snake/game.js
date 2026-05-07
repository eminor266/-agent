(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayMsg = document.getElementById("overlay-msg");
  const restartBtn = document.getElementById("restart");
  const overlayRestart = document.getElementById("overlay-restart");

  const GRID = 20;
  const COLS = canvas.width / GRID;
  const ROWS = canvas.height / GRID;
  const TICK_MS = 110;
  const BEST_KEY = "snake-best-score";

  let snake;
  let dir;
  let nextDir;
  let food;
  let score;
  let best = Number(localStorage.getItem(BEST_KEY)) || 0;
  let timer;
  let paused;
  let alive;

  bestEl.textContent = String(best);

  function randCell() {
    return {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  }

  function foodOnSnake(cell) {
    return snake.some((s) => s.x === cell.x && s.y === cell.y);
  }

  function spawnFood() {
    let c;
    do {
      c = randCell();
    } while (foodOnSnake(c));
    return c;
  }

  function reset() {
    const mid = { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) };
    snake = [
      { x: mid.x, y: mid.y },
      { x: mid.x - 1, y: mid.y },
      { x: mid.x - 2, y: mid.y },
    ];
    dir = { x: 1, y: 0 };
    nextDir = { ...dir };
    food = spawnFood();
    score = 0;
    paused = false;
    alive = true;
    scoreEl.textContent = "0";
    overlay.classList.add("hidden");
    if (timer) clearInterval(timer);
    timer = setInterval(tick, TICK_MS);
    draw();
  }

  function opposite(a, b) {
    return a.x === -b.x && a.y === -b.y;
  }

  function tick() {
    if (!alive || paused) return;

    if (!opposite(nextDir, dir)) {
      dir = nextDir;
    }

    const head = snake[0];
    const nh = { x: head.x + dir.x, y: head.y + dir.y };

    if (nh.x < 0 || nh.x >= COLS || nh.y < 0 || nh.y >= ROWS) {
      gameOver("撞墙了");
      return;
    }

    if (snake.some((s) => s.x === nh.x && s.y === nh.y)) {
      gameOver("咬到自己了");
      return;
    }

    snake.unshift(nh);

    if (nh.x === food.x && nh.y === food.y) {
      score += 1;
      scoreEl.textContent = String(score);
      if (score > best) {
        best = score;
        bestEl.textContent = String(best);
        localStorage.setItem(BEST_KEY, String(best));
      }
      food = spawnFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function gameOver(msg) {
    alive = false;
    clearInterval(timer);
    timer = null;
    overlayTitle.textContent = "游戏结束";
    overlayMsg.textContent = msg + " · 得分 " + score;
    overlay.classList.remove("hidden");
    draw();
  }

  function drawCell(x, y, fill, stroke) {
    const pad = 1;
    ctx.fillStyle = fill;
    ctx.fillRect(x * GRID + pad, y * GRID + pad, GRID - pad * 2, GRID - pad * 2);
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.strokeRect(x * GRID + pad + 0.5, y * GRID + pad + 0.5, GRID - pad * 2 - 1, GRID - pad * 2 - 1);
    }
  }

  function draw() {
    ctx.fillStyle = "#161b22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#21262d";
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID, 0);
      ctx.lineTo(i * GRID, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j <= ROWS; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * GRID);
      ctx.lineTo(canvas.width, j * GRID);
      ctx.stroke();
    }

    drawCell(food.x, food.y, "#f85149", "#ff7b72");

    snake.forEach((seg, i) => {
      const head = i === 0;
      const green = head ? "#7ee787" : "#56d364";
      const edge = head ? "#aff5b4" : "#7ee787";
      drawCell(seg.x, seg.y, green, edge);
    });

    if (paused && alive) {
      ctx.fillStyle = "rgba(13, 17, 23, 0.55)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#e6edf3";
      ctx.font = "600 18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("已暂停", canvas.width / 2, canvas.height / 2);
      ctx.textAlign = "start";
      ctx.textBaseline = "alphabetic";
    }
  }

  function setDirection(dx, dy) {
    if (!alive) return;
    const cand = { x: dx, y: dy };
    if (!opposite(cand, dir)) {
      nextDir = cand;
    }
  }

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === " " || k === "spacebar") {
      e.preventDefault();
      if (!alive) {
        reset();
        return;
      }
      paused = !paused;
      draw();
      return;
    }

    switch (e.key) {
      case "ArrowUp":
      case "w":
        e.preventDefault();
        setDirection(0, -1);
        break;
      case "ArrowDown":
      case "s":
        e.preventDefault();
        setDirection(0, 1);
        break;
      case "ArrowLeft":
      case "a":
        e.preventDefault();
        setDirection(-1, 0);
        break;
      case "ArrowRight":
      case "d":
        e.preventDefault();
        setDirection(1, 0);
        break;
      default:
        break;
    }
  });

  restartBtn.addEventListener("click", reset);
  overlayRestart.addEventListener("click", reset);

  reset();
})();
