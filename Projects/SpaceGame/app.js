function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      resolve(img);
    };
  });
}

function createEnemies() {
  // TODO draw enemies
  const enemyTotal = 5;
  const enemyWidth = enemyTotal * 98;
  const startX = (canvas.width - enemyWidth) / 2;
  const stopX = (canvas.width + enemyWidth) / 2;

  for (let x = startX; x < stopX; x += 98) {
    for (let y = 0; y < 50 * 5; y += 50) {
      const enemy = new Enemy(x, y);
      enemy.img = enemyImg;
      gameObjects.push(enemy);
      //ctx.drawImage(enemyImg, x, y);
    }
  }
}

function createHero() {
  hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
  hero.img = heroImg;
  gameObjects.push(hero);
  // ctx.drawImage(
  //   heroImg,
  //   canvas.width / 2 - 45,
  //   canvas.height - canvas.height / 4
  // );
}

class GameObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dead = false;
    this.type = "";
    this.width = 0;
    this.height = 0;
    this.img = undefined;
  }

  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
}

class Hero extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 99;
    this.height = 75;
    this.type = "Hero";
    this.speed = { x: 0, y: 0 };
  }
}

class Enemy extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 98;
    this.height = 50;
    this.type = "Enemy";
    let id = setInterval(() => {
      if (this.y < canvas.height - this.height) {
        this.y += 5;
      } else {
        console.log(`Stopped at: ${this.y}`);
        clearInterval(id);
      }
    }, 300);
  }
}

let onKeyDown = function (event) {
  console.log(event.keyCode);
  switch (event.keyCode) {
    case 37:
    case 39:
    case 38:
    case 40:
    case 32:
      event.preventDefault();
      break;
    default:
      break;
  }
};

window.addEventListener("keydown", onKeyDown);

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowUp") {
    eventEmitter.emit(Messages.keyEventUp);
  } else if (event.key === "ArrowDown") {
    eventEmitter.emit(Messages.keyEventDown);
  } else if (event.key === "ArrowLeft") {
    eventEmitter.emit(Messages.keyEventLeft);
  } else if (event.key === "ArrowRight") {
    eventEmitter.emit(Messages.keyEventRight);
  }
});

class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  on(message, listener) {
    if (!this.listeners[message]) {
      this.listeners[message] = [];
    }
    this.listeners[message].push(listener);
  }

  emit(message, payload = null) {
    if (this.listeners[message]) {
      this.listeners[message].forEach((listener) => listener(message, payload));
    }
  }
}

const Messages = {
  keyUpEvent: "keyEventUp",
  keyDownEvent: "keyEventDown",
  keyLeftEvent: "keyEventLeft",
  keyRightEvent: "keyEventRight",
};

let heroImg,
  enemyImg,
  laserImg,
  canvas,
  ctx,
  gameObjects = [],
  hero,
  eventEmitter = new EventEmitter();

function initGame() {
  gameObjects = [];
  createEnemies();
  createHero();

  eventEmitter.on(Messages.keyUpEvent, () => {
    hero.y -= 5;
  });

  eventEmitter.on(Messages.keyDownEvent, () => {
    hero.y += 5;
  });

  eventEmitter.on(Messages.keyLeftEvent, () => {
    hero.x -= 5;
  });

  eventEmitter.on(Messages.keyRightEvent, () => {
    hero.x += 5;
  });
}

function drawGameObjects() {
  gameObjects.forEach((go) => go.draw(ctx));
}

window.onload = async () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  // TODO load textures

  heroImg = await loadTexture("./assets/player.png");
  enemyImg = await loadTexture("./assets/enemyShip.png");
  laserImg = await loadTexture("./assets/laserRed.png");

  initGame();
  let gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 1024, 768);
    drawGameObjects(ctx);
  }, 100);

  // createHero(ctx, canvas, heroImg);

  // // TODO draw black background
  // // TODO draw hero
  // // TODO uncomment the next line when you add enemies to screen
  // createEnemies(ctx, canvas, enemyImg);
};
