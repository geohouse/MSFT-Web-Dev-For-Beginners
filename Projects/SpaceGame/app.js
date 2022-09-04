// This is the centralized storage location for registering
// what actions should be taken in response to different user interactions,
// and therefore is the key part of the pub/sub model.

// The 'on' method registers callback functions 'listeners' (stored as functions
// in an array) for each type of user interaction (interaction type is the key for
// the lookup object, and the array of actions to be taken upon that interaction is the
// value for the key in that lookup object).

// The 'emit' method is what gets called when the specified types of user interactions
// have happened. All that's known before the emit call is that the interaction has
// taken place (through eventHandler and checking for specific interaction type),
// but NOT what other related actions may be needed based on that interaction type.
// The emit method looks up the array of associated callback functions (actions)
// that have been registered for that specific type of user interaction, and it calls
// each of them to make those actions happen. It optionally can take a payload that is
// directly passed to the callback function for each of the events that needs to be done
// upon that type of user interaction.
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

  rectFromGameObject() {
    return {
      top: this.y,
      left: this.x,
      bottom: this.y + this.height,
      right: this.x + this.width,
    };
  }
}

function intersectRect(rect1, rect2) {
  return !(
    rect2.left > rect1.right ||
    rect2.right < rect1.left ||
    rect2.top > rect1.bottom ||
    rect2.bottom < rect1.top
  );
}

class Hero extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 99;
    this.height = 75;
    this.type = "Hero";
    this.speed = { x: 0, y: 0 };
    this.cooldown = 0;
    this.life = 3;
    this.points = 0;
  }
  fire() {
    gameObjects.push(new Laser(this.x + 45, this.y - 10));
    this.cooldown = 300;
    let id = setInterval(() => {
      if (this.cooldown > 0) {
        this.cooldown -= 100;
      } else {
        clearInterval(id);
      }
    }, 100);
  }
  canFire() {
    return this.cooldown === 0;
  }
  decrementLife() {
    this.life--;
    if (this.life === 0) {
      this.dead = true;
    }
  }
  incrementPoints() {
    this.points += 100;
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

class Laser extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 9;
    this.height = 33;
    this.type = "Laser";
    this.img = laserImg;
    let id = setInterval(() => {
      if (this.y > 0) {
        this.y -= 15;
      } else {
        this.dead = true;
        clearInterval(id);
      }
    }, 100);
  }
}

function updateGameObjects() {
  const enemies = gameObjects.filter((go) => go.type === "Enemy");
  const lasers = gameObjects.filter((go) => go.type === "Laser");
  // the laser hit something
  lasers.forEach((laser) => {
    enemies.forEach((enemy) => {
      const heroRect = hero.rectFromGameObject();
      if (
        intersectRect(laser.rectFromGameObject(), enemy.rectFromGameObject())
      ) {
        eventEmitter.emit(Messages.collisionEnemyLaser, {
          first: laser,
          second: enemy,
        });
      }
      if (intersectRect(heroRect, enemy.rectFromGameObject())) {
        eventEmitter.emit(Messages.collisionEnemyHero, { enemy });
      }
    });
  });
  // remove any dead objects
  gameObjects = gameObjects.filter((go) => !go.dead);
}

function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      resolve(img);
    };
  });
}

const Messages = {
  keyEventUp: "keyEventUp",
  keyEventDown: "keyEventDown",
  keyEventLeft: "keyEventLeft",
  keyEventRight: "keyEventRight",
  keyEventSpace: "KeyEventSpace",
  collisionEnemyLaser: "collisionEnemyLaser",
  collisionEnemyHero: "collisionEnemyHero",
};

let heroImg,
  enemyImg,
  laserImg,
  lifeImg,
  canvas,
  ctx,
  gameObjects = [],
  hero,
  totalScore = 0,
  livesRemaining = 3,
  eventEmitter = new EventEmitter();

let onKeyDown = function (event) {
  console.log(event.key);
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

// TODO make message driven
window.addEventListener("keyup", (evt) => {
  if (evt.key === "ArrowUp") {
    eventEmitter.emit(Messages.keyEventUp);
  } else if (evt.key === "ArrowDown") {
    eventEmitter.emit(Messages.keyEventDown);
  } else if (evt.key === "ArrowLeft") {
    eventEmitter.emit(Messages.keyEventLeft);
  } else if (evt.key === "ArrowRight") {
    eventEmitter.emit(Messages.keyEventRight);
  } else if (evt.key === " ") {
    console.log("triggered laser");
    eventEmitter.emit(Messages.keyEventSpace);
  }
});

function createEnemies() {
  const MONSTER_TOTAL = 5;
  const MONSTER_WIDTH = MONSTER_TOTAL * 98;
  const START_X = (canvas.width - MONSTER_WIDTH) / 2;
  const STOP_X = START_X + MONSTER_WIDTH;

  for (let x = START_X; x < STOP_X; x += 98) {
    for (let y = 0; y < 50 * 5; y += 50) {
      const enemy = new Enemy(x, y);
      enemy.img = enemyImg;
      gameObjects.push(enemy);
    }
  }
}

function createHero() {
  // hero is defined above globally and is only initialized here.
  hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
  hero.img = heroImg;
  gameObjects.push(hero);
}

function drawGameObjects(ctx) {
  gameObjects.forEach((go) => go.draw(ctx));
}

function drawLife() {
  const startPos = canvas.width - 180;
  for (let index = 0; index < hero.life; index++) {
    ctx.drawImage(lifeImg, startPos + 45 * (index + 1), canvas.height - 37);
  }
}

function drawPoints() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "left";
  drawText(`Points: ${hero.points}`, 10, canvas.height - 20);
}

function drawText(message, x, y) {
  ctx.fillText(message, x, y);
}

function initGame() {
  gameObjects = [];
  createEnemies();
  createHero();

  eventEmitter.on(Messages.keyEventUp, () => {
    hero.y -= 15;
  });

  eventEmitter.on(Messages.keyEventDown, () => {
    hero.y += 15;
  });

  eventEmitter.on(Messages.keyEventLeft, () => {
    hero.x -= 15;
  });

  eventEmitter.on(Messages.keyEventRight, () => {
    hero.x += 15;
  });

  eventEmitter.on(Messages.keyEventSpace, () => {
    if (hero.canFire()) {
      hero.fire();
    }
  });

  eventEmitter.on(Messages.collisionEnemyLaser, (_, { first, second }) => {
    first.dead = true;
    second.dead = true;
    hero.incrementPoints();
  });

  eventEmitter.on(Messages.collisionEnemyHero, (_, { enemy }) => {
    enemy.dead = true;
    hero.decrementLife();
  });
}

window.onload = async () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  heroImg = await loadTexture("assets/player.png");
  enemyImg = await loadTexture("assets/enemyShip.png");
  laserImg = await loadTexture("assets/laserRed.png");
  lifeImg = await loadTexture("assets/life.png");

  initGame();
  let gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGameObjects(ctx);
    updateGameObjects();
    drawPoints();
    drawLife();
  }, 100);
};
