let infoEl = document.getElementById('info');
let gameCont = document.getElementById('snakeContainer')
let moneyMod = 1
let addedSize = 0
let loaded = false
let autoUnlocked = false
let autoEnabled = false
let resetConfirmations = 0
let resetting = false

function moneyModCalc() {
  return moneyMod * (1.01**game.snake.size+(game.score/150))
}
function updateInfo() {
  infoEl.innerHTML = `
    Money: $${Math.floor(money)}<br>
    Money Multiplier: x${Math.floor(10*moneyModCalc() )/10}<br>
    Score: ${game.score}<br>
    Snake length: ${game.snake.size} pixels<br>
    Food count: ${game.food.length}<br>
    Food deliciousness: ${game.foodEffect}<br>
    World size: ${game.w}x${game.h} pixels<br>
    Unlock Efficiency: ${game.unlockEff}%<br>
    ${Math.floor((1000/game.tickDelay)*100)/100} tick${Math.floor((1000/game.tickDelay)*100)/100==1?'':'s'} per second<br>

  `
  if (loaded && !resetting) {
    save()
  }

  if (moneyMod < 1) {
    moneyMod = 1
  }
}
function playSound(name){
  let snd = new Audio("Sounds/"+name+".wav"); // buffers automatically when created
  snd.volume = settings.volume/100
  snd.play();
}

class World {
  constructor (options = {}) {
    this.w = (options.width || 5)
    this.h = (options.height || 5)
    this.show = (options.show || true)
    this.foodCol = (options.foodColor || 'random')
    this.snakeCol = (options.snakeColor || 'green')
    this.tickDelay = (options.tickDelay || 1000)
    this.auto = (options.auto || false)
    this.upgrades = (options.upgrades || false)
    this.eyes = (options.drawEyes || true)
    this.unlockEff = (options.efficiency || options.unlockEff || 1)
    this.foodEffect = (options.foodEffect || 1)
    this.startLength = (options.startLength || 2)
    this.paused = false

    this.c = document.createElement('canvas')
    if (this.w > this.c.width / 100) {
      this.c.width = this.w * 100
    }
    this.cell = this.c.width / this.w
    this.pad = (options.padding || this.cell / 4) / 2

    this.ctx = this.c.getContext('2d')
    if (this.show) {
      gameCont.append(this.c)
    }

    this.c.height = this.cell * this.h

    this.score = 0
    this.food = []
    this.lastTick = performance.now()
    this.snake = {
      parts: [{x: 0, y: 0}],
      dir: 3,
      size: 2,
      oldDir: 3,
    }
    this.addFood()
  }
  autoplay () {
    let sX = this.snake.parts[0].x
    let sY = this.snake.parts[0].y
    if (this.snake.dir == 1) {
      this.snake.dir = 0
    }
    if (this.snake.dir == 2) {
      if (sX % 2) {
        this.snake.dir = 0
      } else {
        this.snake.dir = 3
      }
    }
    if ((sY >= this.h - 1 && this.snake.dir == 3) || (sY <= 0 && this.snake.dir == 0)) {
      this.snake.dir = 2
    }
  }
  tick () {
    let totalTime = performance.now()
    if (!this.paused) {
      let size = this.snake.size
      this.moveSnake()
      if (this.auto && autoEnabled) {
        this.autoplay()
      }
      for (let i of this.food) {
        if (this.collide(i.x,i.y)) {
          this.snake.size+= this.foodEffect
          this.score ++
          money += moneyModCalc()
          playSound('eat')
        }
        let tries = 0
        while ((this.collide(i.x,i.y) || this.foodCheck(i.x,i.y,this.food.indexOf(i))) || ((i.x < 0 || i.x > this.w) || (i.y < 0 || i.y > this.h)) && tries < 1000) {
          tries++
          i.x = Math.floor(Math.random() * this.w)
          i.y = Math.floor(Math.random() * this.h)
          if (this.foodCol == 'random') {
            i.col = '#' + Math.floor(Math.random()*16777215).toString(16)
          }
        }
      }
      if (this.upgrades) {
        let upgraded = false
        if (this.snake.size >= (this.w-2)*(this.h-2)) {
          this.snake.size = Math.max(Math.ceil(this.snake.size*(this.unlockEff/100)),this.startLength)
          this.snake.parts.length = Math.max(Math.ceil(this.snake.parts.length*(this.unlockEff/100)),this.startLength)
          this.addFood()
          upgradeEl.innerHTML = 'Food++'
          upgraded = true
        }
        if (this.food.length >= (this.w,this.h)/2) {
          money += (this.w * this.h) * (moneyMod * 0.5)
          switch (Math.round(Math.random())) {
            case 0 : this.w +=2; break;
            case 1: this.h +=2; break;
          }
          addedSize++
          this.food.length = Math.ceil(this.food.length*(this.unlockEff/100))
          this.resize()
          upgradeEl.innerHTML = 'Size++'
          upgraded = true
        }
        if ((this.w+this.h)/2 > 25 && false) {
          this.w = 6
          this.h = 6
          upgradeEl.innerHTML = 'Speed++'
          this.tickDelay *= 0.75
        }
        if (upgraded) {
          playSound('unlock')
          upgradeEl.classList.remove('slide')
          upgradeEl.offsetWidth
          upgradeEl.classList.add('slide')
        }
      }
    }
    this.draw()
    updateInfo()
    totalTime = performance.now() - totalTime
    let fakeThis = this
    setTimeout(()=>{
      fakeThis.tick()
    }, this.tickDelay-totalTime)
  }
  resize () {
    if (this.w > this.c.width / 100) {
      this.c.width = this.w * 100
    }
    this.cell = this.c.width / this.w
    this.c.height = this.cell * this.h
    if (parseInt(getComputedStyle(this.c).height) > window.innerHeight) {
      this.w += 2;
      this.h -= 2;
      this.resize()
    }
  }
  draw () {
    // for (let x = 0; x < this.w; x++){for (let y = 0; y < this.h; y++){this.ctx.fillStyle = 'white';this.ctx.fillRect(x * this.cell,y * this.cell,1,1)}} // Grid for debugging
    this.ctx.clearRect(0,0,this.c.width,this.c.height)
    this.drawFood()
    this.drawSnake()
    if (this.paused) {
      let cssVars = window.getComputedStyle(document.body)
      game.ctx.fillStyle = cssVars.getPropertyValue('--primary')
      game.ctx.fillRect(game.c.width/2-55,game.c.height/2-105,35,160)
      game.ctx.fillRect(game.c.width/2+20,game.c.height/2-105,35,160)
      game.ctx.fillStyle = cssVars.getPropertyValue('--secondary')
      game.ctx.fillRect(game.c.width/2-50,game.c.height/2-100,25,150)
      game.ctx.fillRect(game.c.width/2+25,game.c.height/2-100,25,150)
    }
  }
  addFood () {
    let newFood = {
      x: Math.floor(Math.random() * this.w),
      y: Math.floor(Math.random() * this.h),
    }
    if (this.foodCol == 'random') {
      newFood.col = '#' + Math.floor(Math.random()*16777215).toString(16)
    } else {
      newFood.col = this.foodCol
    }
    this.food.push(newFood)
  }
  drawFood () {
    let cssVars = window.getComputedStyle(document.body)
    for (let i of this.food) {
      this.ctx.fillStyle = cssVars.getPropertyValue('--secondary')
      this.ctx.fillRect(Math.floor((i.x * this.cell) + (this.pad/2)), Math.floor((i.y * this.cell) + (this.pad / 2)), Math.floor(this.cell - this.pad), Math.floor(this.cell - this.pad))
      this.ctx.fillStyle = i.col
      this.ctx.fillRect(Math.floor((i.x * this.cell) + this.pad), Math.floor((i.y * this.cell) + this.pad), Math.floor(this.cell - (this.pad * 2)), Math.floor(this.cell - (this.pad * 2)))
    }
  }
  moveSnake () {
    if (isNaN(this.snake.parts[0].x) || isNaN(this.snake.parts[0].y)) {
      this.snake.parts[0].x = 0
      this.snake.parts[0].y = 0
    }
    let x = parseInt(this.snake.parts[0].x)
    let y = parseInt(this.snake.parts[0].y)
    switch (this.snake.dir) {
      case 0: y--; break
      case 1: x--; break
      case 2: x++; break
      case 3: y++; break
    }
    this.snake.oldDir = this.snake.dir
    if (x < 0) {
      x = this.w - 1
    }
    if (y < 0) {
      y = this.h - 1
    }
    this.snake.parts.unshift({x: x % this.w, y: y % this.h})
    if (this.snake.parts.length > this.snake.size) {
      this.snake.parts.pop()
    } else if (this.snake.parts.length < this.snake.size) {
      this.snake.parts.push({x:-this.snake.parts.length, y:20})
    }

    if (this.collide(this.snake.parts[0].x,this.snake.parts[0].y,(x)=>{return x},true)) {
      this.snake.size = this.startLength;
      this.snake.parts.length = 2
      this.score = 0;
      playSound('death')
    }
  }
  drawSnake () {
    for (let i = 0; i < this.snake.parts.length; i++) {
      switch (this.snakeCol) {
        case 'alternate': this.ctx.fillStyle = `hsl(${60 + ((i % 3) * 40)},70%,70%)`; break;
        case 'rainbow': this.ctx.fillStyle = `hsl(${(360/this.snake.parts.length)*i},70%,70%)`; break;
        case 'xmas': this.ctx.fillStyle = `rgb(${[255,45][i%2]},${[40,200][i%2]},${[40,45][i%2]})`; break;
        case 'hallow': this.ctx.fillStyle = `rgb(${[255,150][i%2]},${[160,30][i%2]},${[40,255][i%2]})`; break;
        default: this.ctx.fillStyle = this.snakeCol
      }

      let part = this.snake.parts[i]
      let margins = [1,1,1,1]
      if (i != this.snake.parts.length - 1) {
        let nextPart = (this.snake.parts[i+1] || {x: -10, y: -10})

        try {
          margins = [
            (nextPart.y == part.y-1 ? -1 : 1),
            (nextPart.x == part.x-1 ? -1 : 1),
            (nextPart.x == part.x+1 ? -1 : 1),
            (nextPart.y == part.y+1 ? -1 : 1)
          ]
        } catch {
          margins = [1,1,1,1]
        }
      }


      this.ctx.imageSmoothingEnabled = true;
      this.ctx.fillRect(((part.x * this.cell) + (this.pad * margins[1])), ((part.y * this.cell) + (this.pad * margins[0])), (this.cell - (this.pad * 2 * margins[2])  + ((this.pad)*-(margins[1]-1))), (this.cell - (this.pad * 2 * margins[3]) + ((this.pad)*-(margins[0]-1))))
    }
    if (this.eyes) {
      this.ctx.translate(this.cell/2,this.cell/2)
      this.ctx.translate(this.snake.parts[0].x * this.cell, this.snake.parts[0].y * this.cell)
      switch (this.snake.dir) {
        case 0: this.ctx.scale(1,-1); break;
        case 1: this.ctx.rotate(Math.PI/2); break;
        case 2: this.ctx.rotate(-Math.PI/2); break;
      }
      this.ctx.fillStyle = 'white'
      this.ctx.fillRect(this.pad*0.5,this.pad*0.5,(this.cell-(this.pad*1.5))/3,(this.cell-(this.pad*1.5))/3)

      this.ctx.fillStyle = 'black'
      this.ctx.fillRect(
        this.pad*0.5 + ((this.cell-(this.pad*1.5))/15),
        this.pad*0.5 + ((this.cell-(this.pad*1.5))/5),
        (this.cell-(this.pad*1.5))/7,
        (this.cell-(this.pad*1.5))/7
      )

      this.ctx.scale(-1,1)
      this.ctx.fillStyle = 'white'
      this.ctx.fillRect(this.pad*0.5,this.pad*0.5,(this.cell-(this.pad*1.5))/3,(this.cell-(this.pad*1.5))/3)
      this.ctx.fillStyle = 'black'
      this.ctx.fillRect(
        this.pad*0.5 + ((this.cell-(this.pad*1.5))/15),
        this.pad*0.5 + ((this.cell-(this.pad*1.5))/5),
        (this.cell-(this.pad*1.5))/7,
        (this.cell-(this.pad*1.5))/7
      )
      this.ctx.resetTransform()
    }
  }
  collide (x,y,func=(x)=>{return x},ignoreHead) {
    let collide = false
    let parts = this.snake.parts
    if (ignoreHead) {
      parts = parts.slice(1)
    }
    for (let i of parts) {
      if (i.x == x && i.y == y) {
        collide = true
      }
    }
    return func(collide)
  }
  foodCheck (x,y,curFood) {
    let collide = false
    let foods = this.food.slice(0,curFood).concat(...this.food.slice(curFood+1))
    for (let i of foods) {
      if (i.x == x && i.y == y) {
        collide = true
      }
    }
    return collide
  }
}


let game = new World({
  width: 6,
  height: 6,
  show: true,
  auto: false,
  tickDelay: 1000,
  upgrades: true,
  snakeColor: 'alternate'
})
game.tick()
if (Math.random() <= 0.05) {
  game.snakeCol = 'rainbow'
}
let d = new Date()
if (d.getMonth() == 11) {
  game.snakeCol = 'xmas'
}
if (d.getMonth() == 9) {
  game.snakeCol = 'hallow'
}





document.addEventListener('keydown',(e)=>{
  if (!game.paused) {

    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        if (game.snake.oldDir != 3) {
          game.snake.dir = 0
        }
        break;
      case 'a':
      case 'arrowleft':
        if (game.snake.oldDir != 2)
          game.snake.dir = 1
        break;
      case 'd':
      case 'arrowright':
        if (game.snake.oldDir != 1) {
          game.snake.dir = 2
        }
        break;
      case 's':
      case 'arrowdown':
        if (game.snake.oldDir != 0) {
          game.snake.dir = 3
        }
        break;
    }
  }
  if (e.key.toLowerCase() == 'escape' || e.key.toLowerCase() == 'p' || e.key.toLowerCase() == ' ') {
    if (game.paused) {
      game.paused = false
    } else {
      game.paused = true
    }
  }
  game.draw()
})

window.onload = ()=>{
  loaded = true;
  load()
  showChangelog()
  if (game.h % 2 == 1) {
    game.h ++
  }
  if (game.w % 2 == 1) {
    game.w ++
  }
  game.resize()
}
