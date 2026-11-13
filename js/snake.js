class World {
  constructor(options = {}) {
    this.w = options.width || 5;
    this.h = options.height || 5;
    this.show = options.show || true;
    this.foodCol = options.foodColor || "random";
    this.snakeCol = options.snakeColor || "green";
    this.auto = options.auto || false;
    this.autoLevel = 0
    this.eyes = options.drawEyes || true;
    this.startLength = options.startLength || 2;
    this.paused = false;

    this.c = document.createElement("canvas");
    if (this.w > this.c.width / 100) {
      this.c.width = this.w * 100;
    }
    this.cell = this.c.width / this.w;
    this.pad = (options.padding || this.cell / 4) / 2;

    this.ctx = this.c.getContext("2d");
    if (this.show) {
      gameCont.append(this.c);
    }

    this.c.height = this.cell * this.h;

    this.score = 0;
    this.food = [];
    this.lastTick = performance.now();
    this.snake = {
      parts: [{ x: 0, y: 0 }],
      dir: "d",
      size: 2,
      oldDir: "d",
    };
    this.addFood();
  }
  autoplay() {
    let sX = this.snake.parts[0].x;
    let sY = this.snake.parts[0].y;

    switch (autoUpgrade.lvl) {
        case 1:
            if (sY == this.h - 1) {
              // Bottom row
              if (this.snake.dir == "r") this.snake.dir = "u";
              if (this.snake.dir == "d") this.snake.dir = "r";
            }
            if (sY == 1) {
              // Second row
              if (this.snake.dir == "r") this.snake.dir = "d";
              if (this.snake.dir == "u") this.snake.dir = "r";
            }
            if (sX == this.w - 1) {
              // Last column
              if (this.snake.dir == "r") this.snake.dir = "u";
              if (sY == 0) this.snake.dir = "l";
            }
            if (sX == 0 && sY == 0) this.snake.dir = "d"; // Top left
            break
    }
  }
  tick() {
    let totalTime = performance.now();
    if (!this.paused) {
      this.moveSnake();
      if (this.auto && autoEnabled) {
        this.autoplay();
      }

      for (let i of this.food) {
        // Check for eaten food
        if (this.collide(i.x, i.y)) {
          this.snake.size += foodUpgrade.lvl + 1;
          this.score++;
          money += moneyModCalc();
          playSound("eat");
        }
        let tries = 0;
        while (
          (this.collide(i.x, i.y) ||
            this.foodCheck(i.x, i.y, this.food.indexOf(i))) &&
          tries < 1000
        ) {
          // Check for a valid spot to put food
          tries++;
          i.x = Math.floor(Math.random() * this.w);
          i.y = Math.floor(Math.random() * this.h);
          if (this.foodCol == "random") {
            i.col = `hsl(${Math.floor(Math.random() * 360)},70%,70%)`;
          }
        }
      }
      this.handlePrestige()
    }
    this.draw();
    updateInfo();
    totalTime = performance.now() - totalTime;
    let fakeThis = this;
    setTimeout(() => {
      fakeThis.tick();
    }, getTickDelay() - totalTime);
  }
  handlePrestige() {
    let prestiged = false;
    if (this.snake.size >= (this.w - 2) * (this.h - 2)) {
      this.snake.size = Math.max(
        Math.ceil(this.snake.size * (getUnlockEfficiency() / 100)),
        this.startLength,
      );
      this.snake.parts.length = Math.max(
        Math.ceil(this.snake.parts.length * (getUnlockEfficiency() / 100)),
        this.startLength,
      );
      this.addFood();
      prestigeEl.innerHTML = "Food+";
      prestiged = true;
    }
    if (this.food.length >= (this.w, this.h) / 2) {
      money += this.w * this.h * (moneyUpgrade.lvl * 0.5);
      this.w += 2;
      this.h += 2;
      addedSize++;
      this.food.length = Math.ceil(this.food.length * (getUnlockEfficiency() / 100));
      this.resize();
      prestigeEl.innerHTML = "Size+";
      prestiged = true;
    }
    if (prestiged) {
      playSound("unlock");
      prestigeEl.classList.remove("slide");
      setTimeout(
        ()=>prestigeEl.classList.add("slide"), 1
      )
    }
  }
  resize() {
    if (this.w > this.c.width / 100) {
      this.c.width = this.w * 100;
    }
    this.cell = this.c.width / this.w;
    this.c.height = this.cell * this.h;
  }
  draw() {
    this.ctx.clearRect(0, 0, this.c.width, this.c.height);
    this.drawFood();
    this.drawSnake();
    if (this.paused) {
      let cssVars = window.getComputedStyle(document.body);
      game.ctx.fillStyle = cssVars.getPropertyValue("--primary");
      game.ctx.fillRect(
        game.c.width / 2 - 55,
        game.c.height / 2 - 105,
        35,
        160,
      );
      game.ctx.fillRect(
        game.c.width / 2 + 20,
        game.c.height / 2 - 105,
        35,
        160,
      );
      game.ctx.fillStyle = cssVars.getPropertyValue("--secondary");
      game.ctx.fillRect(
        game.c.width / 2 - 50,
        game.c.height / 2 - 100,
        25,
        150,
      );
      game.ctx.fillRect(
        game.c.width / 2 + 25,
        game.c.height / 2 - 100,
        25,
        150,
      );
    }
  }
  addFood() {
    let newFood = {
      x: Math.floor(Math.random() * this.w),
      y: Math.floor(Math.random() * this.h),
    };
    if (this.foodCol == "random") {
      newFood.col = `hsl(${Math.floor(Math.random() * 360)},70%,70%)`;
    } else {
      newFood.col = this.foodCol;
    }
    this.food.push(newFood);
  }
  drawFood() {
    for (let i of this.food) {
      this.ctx.fillStyle = i.col;
      this.ctx.fillRect(
        Math.floor(i.x * this.cell + this.pad),
        Math.floor(i.y * this.cell + this.pad),
        Math.floor(this.cell - this.pad * 2),
        Math.floor(this.cell - this.pad * 2),
      );
    }
  }
  moveSnake() {
    if (isNaN(this.snake.parts[0].x) || isNaN(this.snake.parts[0].y)) {
      this.snake.parts[0].x = 0;
      this.snake.parts[0].y = 0;
    }
    let x = parseInt(this.snake.parts[0].x);
    let y = parseInt(this.snake.parts[0].y);
    switch (this.snake.dir) {
      case "u":
        y--;
        break;
      case "l":
        x--;
        break;
      case "r":
        x++;
        break;
      case "d":
        y++;
        break;
    }
    this.snake.oldDir = this.snake.dir;
    if (x < 0 || x >= this.w || y >= this.h || y < 0) {
      this.killSnake();
      x = 0;
      y = 0;
      this.snake.dir = "d";
    }
    this.snake.parts.unshift({ x: x, y: y });
    if (this.snake.parts.length > this.snake.size) {
      this.snake.parts.pop();
    } else if (this.snake.parts.length < this.snake.size) {
      this.snake.parts.push({ x: -this.snake.parts.length, y: 20 });
    }

    if (
      this.collide(
        this.snake.parts[0].x,
        this.snake.parts[0].y,
        (x) => {
          return x;
        },
        true,
      )
    ) {
      this.killSnake();
    }
  }
  killSnake() {
    this.snake.size = this.startLength;
    this.snake.parts.length = 2;
    this.score = 0;
    playSound("death");
  }
  drawSnake() {
    let undrawnParts = 0;
    for (let i = 0; i < this.snake.parts.length; i++) {
      this.ctx.fillStyle = this.getSegmentColor(i);

      let part = this.snake.parts[i];
      let margins = [1, 1, 1, 1];
      if (i != this.snake.parts.length - 1) {
        let nextPart = this.snake.parts[i + 1] || { x: -10, y: -10 };

        try {
          margins = [
            nextPart.y == part.y - 1 ? -1 : 1,
            nextPart.x == part.x - 1 ? -1 : 1,
            nextPart.x == part.x + 1 ? -1 : 1,
            nextPart.y == part.y + 1 ? -1 : 1,
          ];
        } catch {
          margins = [1, 1, 1, 1];
        }
      }

      if (this.snake.parts[i].x < 0) {
        undrawnParts++;
      }

      this.ctx.imageSmoothingEnabled = true;
      this.ctx.fillRect(
        part.x * this.cell + this.pad * margins[1],
        part.y * this.cell + this.pad * margins[0],
        this.cell - this.pad * 2 * margins[2] + this.pad * -(margins[1] - 1),
        this.cell - this.pad * 2 * margins[3] + this.pad * -(margins[0] - 1),
      );
    }
    if (this.eyes) {
      this.ctx.translate(this.cell / 2, this.cell / 2);
      this.ctx.translate(
        this.snake.parts[0].x * this.cell,
        this.snake.parts[0].y * this.cell,
      );
      switch (this.snake.dir) {
        case "u":
          this.ctx.scale(1, -1);
          break;
        case "l":
          this.ctx.rotate(Math.PI / 2);
          break;
        case "r":
          this.ctx.rotate(-Math.PI / 2);
          break;
      }
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(
        this.pad * 0.5,
        this.pad * 0.5,
        (this.cell - this.pad * 1.5) / 3,
        (this.cell - this.pad * 1.5) / 3,
      );

      this.ctx.fillStyle = "black";
      this.ctx.fillRect(
        this.pad * 0.5 + (this.cell - this.pad * 1.5) / 15,
        this.pad * 0.5 + (this.cell - this.pad * 1.5) / 5,
        (this.cell - this.pad * 1.5) / 7,
        (this.cell - this.pad * 1.5) / 7,
      );

      this.ctx.scale(-1, 1);
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(
        this.pad * 0.5,
        this.pad * 0.5,
        (this.cell - this.pad * 1.5) / 3,
        (this.cell - this.pad * 1.5) / 3,
      );
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(
        this.pad * 0.5 + (this.cell - this.pad * 1.5) / 15,
        this.pad * 0.5 + (this.cell - this.pad * 1.5) / 5,
        (this.cell - this.pad * 1.5) / 7,
        (this.cell - this.pad * 1.5) / 7,
      );
      this.ctx.resetTransform();
    }

    // Draw the text saying how much the snake has left to grow. this is awful code
    let partsToGrow =
      undrawnParts + (this.snake.size - this.snake.parts.length);
    if (partsToGrow >= 1) {
      let lastPart =
        this.snake.parts[this.snake.parts.length - undrawnParts - 1];
      this.ctx.fillStyle = "black";
      this.ctx.font = `${this.cell / 4}px 'Press Start 2P'`;
      this.ctx.fillText(
        partsToGrow,
        lastPart.x * this.cell + this.cell / 4,
        lastPart.y * this.cell + this.cell / 1.5,
      );
    }
  }
  getSegmentColor(i) {
    let d = new Date();

    if (d.getMonth() == 5) { // June
      let prideFlags = [
        ["#E57373", "#F5B75C", "#F5E98A", "#81B881", "#7895D4", "#B07AB0"], // Rainbow. the original pride colors are super harsh on the eyes
        ["#5ACDF9", "#F5A8B8", "#FFFFFF", "#F5A8B8"], // Trans
      ];

      let varient = randomFromValue(loadTime + "pride");
      console.log(varient);

      return prideFlags[Math.floor(varient * prideFlags.length)][
        i % prideFlags[Math.floor(varient * prideFlags.length)].length
      ];
    }
    if (d.getMonth() == 9) { // October
      return ["#FFA028", "#961EFF"][i % 2];
    }
    if (d.getMonth() == 11) { // December
      return ["#FF2828", "#2DC82D"][i % 2];
    }

    let colorOffset = randomFromValue(loadTime + "helloo") * 360;
    return `hsl(${colorOffset + ((i % 4) * 30)},70%,70%)`;
    // return `hsl(${(360/this.snake.parts.length)*i},80%,80%)`;
  }
  collide(x, y, func = (x) => {return x;}, ignoreHead) {
    let collide = false;
    let parts = this.snake.parts;
    if (ignoreHead) {
      parts = parts.slice(1);
    }
    for (let i of parts) {
      if (i.x == x && i.y == y) {
        collide = true;
      }
    }
    return func(collide);
  }
  foodCheck(x, y, curFood) {
    let collide = false;
    let foods = this.food.slice(0, curFood).concat(...this.food.slice(curFood + 1));
    for (let i of foods) {
      if (i.x == x && i.y == y) {
        collide = true;
      }
    }
    return collide;
  }
}
