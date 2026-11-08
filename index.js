let infoEl = document.getElementById('info');
let gameCont = document.getElementById('snakeContainer')
let moneyMod = 1
let addedSize = 0
let loaded = false
let autoUnlocked = false
let autoEnabled = false
let resetConfirmations = 0
let resetting = false
let timeSinceLastSave = 0

function moneyModCalc() {
  return moneyMod * (1.01**game.snake.size+(game.score/150)) * (game.foodEffect ** 0.3)
}
function updateInfo() {
  infoEl.innerHTML = `
    Money: $${Math.floor(money)}<br>
    Money Multiplier: x${Math.floor(10*moneyModCalc() )/10}<br>
    Score: ${game.score}<br>
  `
  if (settings.advancedStats) {
    infoEl.innerHTML += `
      Snake length: ${game.snake.size} pixels<br>
      Food count: ${game.food.length}<br>
      Food deliciousness: ${game.foodEffect}<br>
      World size: ${game.w}x${game.h} pixels<br>
      Unlock Efficiency: ${game.unlockEff}%<br>
      ${Math.floor((1000/game.tickDelay)*100)/100} tick${Math.floor((1000/game.tickDelay)*100)/100==1?'':'s'} per second<br>
    `
  }

  if (moneyMod < 1) {
    moneyMod = 1
  }
}
function playSound(name){
  let snd = new Audio("Sounds/"+name+".mp3"); // buffers automatically when created
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
      dir: "d",
      size: 2,
      oldDir: "d",
    }
    this.addFood()
  }
  autoplay () {
    let sX = this.snake.parts[0].x
    let sY = this.snake.parts[0].y

    if (sY == this.h - 1) { // Bottom row
      if (this.snake.dir == "r") this.snake.dir = "u"
      if (this.snake.dir == "d") this.snake.dir = "r"
    }
    if (sY == 1) { // Second row
      if (this.snake.dir == "r") this.snake.dir = "d"
      if (this.snake.dir == "u") this.snake.dir = "r"
    }
    if (sX == this.w - 1) { // Last column
      if (this.snake.dir == "r") this.snake.dir = "u"
      if (sY == 0) this.snake.dir = "l"
    }
    if (sX == 0 && sY == 0) this.snake.dir = "d" // Top left
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
            i.col = `hsl(${Math.floor(Math.random()*360)},70%,70%)`
          }
        }
      }
      if (this.upgrades) {
        let prestiged = false
        if (this.snake.size >= (this.w-2)*(this.h-2)) {
          this.snake.size = Math.max(Math.ceil(this.snake.size*(this.unlockEff/100)),this.startLength)
          this.snake.parts.length = Math.max(Math.ceil(this.snake.parts.length*(this.unlockEff/100)),this.startLength)
          this.addFood()
          prestigeEl.innerHTML = 'Food++'
          prestiged = true
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
          prestigeEl.innerHTML = 'Size++'
          prestiged = true
        }
        if ((this.w+this.h)/2 > 25 && false) {
          this.w = 6
          this.h = 6
          prestigeEl.innerHTML = 'Speed++'
          this.tickDelay *= 0.75
        }
        if (prestiged) {
          playSound('unlock')
          prestigeEl.classList.remove('slide')
          prestigeEl.offsetWidth
          prestigeEl.classList.add('slide')
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
      newFood.col = `hsl(${Math.floor(Math.random()*360)},70%,70%)`
    } else {
      newFood.col = this.foodCol
    }
    this.food.push(newFood)
  }
  drawFood () {
    // let cssVars = window.getComputedStyle(document.body)
    for (let i of this.food) {
      // this.ctx.fillStyle = cssVars.getPropertyValue('--secondary')
      // this.ctx.fillRect(Math.floor((i.x * this.cell) + (this.pad/2)), Math.floor((i.y * this.cell) + (this.pad / 2)), Math.floor(this.cell - this.pad), Math.floor(this.cell - this.pad))
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
      case "u": y--; break
      case "l": x--; break
      case "r": x++; break
      case "d": y++; break
    }
    this.snake.oldDir = this.snake.dir
    if (x < 0 || x >= this.w || y >= this.h || y < 0) {
      this.killSnake()
      x = 0
      y = 0
      this.snake.dir = "d"
    }
    this.snake.parts.unshift({x: x, y: y})
    if (this.snake.parts.length > this.snake.size) {
      this.snake.parts.pop()
    } else if (this.snake.parts.length < this.snake.size) {
      this.snake.parts.push({x:-this.snake.parts.length, y:20})
    }

    if (this.collide(this.snake.parts[0].x,this.snake.parts[0].y,(x)=>{return x},true)) {
      this.killSnake() 
    }
  }
  killSnake () {
    this.snake.size = this.startLength;
    this.snake.parts.length = 2
    this.score = 0;
    playSound('death')
  }
  drawSnake () {
    let undrawnParts = 0
    for (let i = 0; i < this.snake.parts.length; i++) {
      this.ctx.fillStyle = this.getSegmentColor(i)

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

      if (this.snake.parts[i].x < 0) {
        undrawnParts++
      }

      this.ctx.imageSmoothingEnabled = true;
      this.ctx.fillRect(((part.x * this.cell) + (this.pad * margins[1])), ((part.y * this.cell) + (this.pad * margins[0])), (this.cell - (this.pad * 2 * margins[2])  + ((this.pad)*-(margins[1]-1))), (this.cell - (this.pad * 2 * margins[3]) + ((this.pad)*-(margins[0]-1))))
    }
    if (this.eyes) {
      this.ctx.translate(this.cell/2,this.cell/2)
      this.ctx.translate(this.snake.parts[0].x * this.cell, this.snake.parts[0].y * this.cell)
      switch (this.snake.dir) {
        case "u": this.ctx.scale(1,-1); break;
        case "l": this.ctx.rotate(Math.PI/2); break;
        case "r": this.ctx.rotate(-Math.PI/2); break;
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

    // Draw the text saying how much the snake has left to grow. this is awful code
    let partsToGrow = undrawnParts + (this.snake.size - this.snake.parts.length)
    if (partsToGrow >= 1) {
      let lastPart = this.snake.parts[this.snake.parts.length-undrawnParts-1]
      this.ctx.fillStyle = 'black'
      this.ctx.font = `${this.cell/4}px 'Press Start 2P'`
      this.ctx.fillText(partsToGrow, lastPart.x * this.cell + (this.cell/4), lastPart.y * this.cell + (this.cell/1.5))
    }
    
  }
  getSegmentColor(i) {
    let d = new Date()
    
    if (d.getMonth() == 5) { // June
      let prideFlags = [
        ["#E57373", "#F5B75C", "#F5E98A", "#81B881", "#7895D4", "#B07AB0"], // Rainbow. the original pride colors are super harsh on the eyes
        ["#5ACDF9", "#F5A8B8", "#FFFFFF", "#F5A8B8"], // Trans
      ]
      
      let varient = randomFromValue(d.getDay()+"helloo")
      console.log(varient);
      
      return prideFlags[Math.floor(varient * prideFlags.length)][i % prideFlags[Math.floor(varient * prideFlags.length)].length]
    }
    if (d.getMonth() == 9) { // October
      return ["#FFA028", "#961EFF"][i%2]
    }
    if (d.getMonth() == 11) { // December
      return ["#FF2828", "#2DC82D"][i%2]
    }
    return `hsl(${60 + ((i % 3) * 40)},70%,70%)`;
    return `hsl(${(360/this.snake.parts.length)*i},80%,80%)`;
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



document.addEventListener('keydown',(e)=>{
  if (!game.paused) {

    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        if (game.snake.oldDir != "d") {
          game.snake.dir = "u"
        }
        break;
      case 'a':
      case 'arrowleft':
        if (game.snake.oldDir != "r")
          game.snake.dir = "l"
        break;
      case 'd':
      case 'arrowright':
        if (game.snake.oldDir != "l") {
          game.snake.dir = "r"
        }
        break;
      case 's':
      case 'arrowdown':
        if (game.snake.oldDir != "u") {
          game.snake.dir = "d"
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

gameCont.addEventListener("mouseleave", ()=>{
  if (settings.autoPause) {
    game.paused = true
  }
  game.draw()
})
gameCont.addEventListener("mouseenter", ()=>{
  if (settings.autoPause) {
    game.paused = false
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
  setInterval(()=>{
    if (loaded && !resetting) {
      if (Date.now() - timeSinceLastSave > 10000) {
        save()
        // console.log("saved");
        timeSinceLastSave = Date.now()
      }
    }
  }, 10000)
}


function randomFromValue(value) {
    let str = String(value);
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }

    // Convert hash into a float between 0 and 1
    return (hash >>> 0) / 4294967296;
}