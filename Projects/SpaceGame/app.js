function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      resolve(img);
    };
  });
}

function createEnemies(ctx, canvas, enemyImg) {
  // TODO draw enemies
  const enemyTotal = 5;
  const enemyWidth = enemyTotal * 98;
  const startX = (canvas.width - enemyWidth) / 2;
  const stopX = (canvas.width + enemyWidth) / 2;

  for (let x = startX; x < stopX; x += 98) {
    for (let y = 0; y < 50 * 5; y += 50) {
      ctx.drawImage(enemyImg, x, y);
    }
  }
}

window.onload = async () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  // TODO load textures

  const heroImg = await loadTexture("./assets/player.png");
  const enemyImg = await loadTexture("./assets/enemyShip.png");

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 1024, 768);

  ctx.drawImage(
    heroImg,
    canvas.width / 2 - 45,
    canvas.height - canvas.height / 4
  );
  // TODO draw black background
  // TODO draw hero
  // TODO uncomment the next line when you add enemies to screen
  createEnemies(ctx, canvas, enemyImg);
};
