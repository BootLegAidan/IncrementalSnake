let infoEl = document.getElementById('info');
let gameCont = document.getElementById('snakeContainer')
let upgradeEl = document.getElementById('upgradeText')
let upgradePanel = document.getElementById('upgrades')
let money = 0
let moneyMod = 1
let addedSize = 0
let loaded = false
let autoUnlocked = false
let autoEnabled = false
let resetConfirmations = 0
let enableSound = true
let resetting = false

function moneyModCalc() {
  return moneyMod * (1.01**game.snake.size)
}
function updateInfo() {
  infoEl.innerHTML = `
    Money: $${Math.floor(money)}<br>
    Money Multiplier: x${Math.floor(10*moneyModCalc() )/10}<br>
    Score: ${game.score}<br>
    Snake length: ${game.snake.size} pixels<br>
    Food count: ${game.food.length}<br>
    World size: ${game.w}x${game.h} pixels<br>
    Unlock Efficiency: ${game.unlockEff}%<br>
    ${Math.floor((1000/game.tickDelay)*100)/100} tick${Math.floor((1000/game.tickDelay)*100)/100==1?'':'s'} per second<br>
    ${loopUpgrade.lvl} move${loopUpgrade.lvl==1?'':'s'} per tick<br>

  `
  if (loaded && !resetting) {
    save()
  }

  if (moneyMod < 1) {
    moneyMod = 1
  }

  if (game.unlockEff >= 90) {
    efficiencyUpgrade.el.remove()
  }
  if (loopUpgrade.lvl >= 25) {
    loopUpgrade.el.remove()
  }
  if (speedUpgrade.lvl >= 150) {
    speedUpgrade.el.remove()
  }
}
function playSound(name){
  if (enableSound) {
    let snd = new Audio("Sounds/"+name+".wav"); // buffers automatically when created
    snd.play();
  }
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
    for (let i = 0; i < loopUpgrade.lvl; i++) {
      let size = this.snake.size
      this.moveSnake()
      if (this.auto && autoEnabled) {
        this.autoplay()
      }
      for (let i of this.food) {
        if (this.collide(i.x,i.y)) {
          this.snake.size++
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
          this.snake.size = Math.max(Math.ceil(this.snake.size*(this.unlockEff/100)),2)
          this.snake.parts.length = Math.max(Math.ceil(this.snake.parts.length*(this.unlockEff/100)),2)
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
    let fakeThis = this
    setTimeout(()=>{
      fakeThis.tick()
    }, this.tickDelay)
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
    for (let x = 0; x < this.w; x++){for (let y = 0; y < this.h; y++){this.ctx.fillStyle = 'white';this.ctx.fillRect(x * this.cell,y * this.cell,1,1)}}
    this.ctx.clearRect(0,0,this.c.width,this.c.height)
    this.drawFood()
    this.drawSnake()
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
    for (let i of this.food) {
      this.ctx.fillStyle = '#bbb'
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
      this.snake.parts.unshift({})
    }

    if (this.collide(this.snake.parts[0].x,this.snake.parts[0].y,(x)=>{return x},true)) {
      this.snake.size = 2;
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
class Upgrade {
  constructor (options) {
    this.cost = options.cost // Number - Starting cost of the upgrade
    this.onBuy = options.onBuy // Function - Function to call when the upgrade is successfully purchased
    this.lvl = (options.level || options.lvl || 0) // Number - Starting level of the upgrade
    this.name = options.name // String - What text is displayed on the upgrade element
    this.el = document.createElement('button')

    upgradePanel.append(this.el)
    let fakeThis = this
    this.el.addEventListener('click',()=>{fakeThis.buy(fakeThis)})

    this.update()
  }
  update () {
    if (this.cost <= money) {
      this.canBuy = true
      this.el.classList.add('canBuy')
    } else {
      this.canBuy = false
      this.el.classList.remove('canBuy')
    }
    this.el.innerHTML = `
      ${this.name} - Lvl ${this.lvl}<br>
      Cost: ${Math.ceil(this.cost)}
    `
  }
  buy () {
    if (this.canBuy) {
      money -= this.cost
      this.lvl ++

      let fakeThis = this
      this.onBuy(fakeThis)

      updateInfo()
      this.update()
    }
  }
}
class ToggleButton {
  constructor (options) {
    this.name = options.name // String - What text is on the button
    this.clickFun = (options.function || options.fun || options.click || options.clickFun) // Function - What to do when the button is clicked

    this.on = false
    this.el = document.createElement('button')

    upgradePanel.append(this.el)
    let fakeThis = this
    this.el.onclick = () => {
      this.on = !this.on;
      this.clickFun(fakeThis)
      this.update()
    }
  }
  update () {
    this.el.innerHTML = `${this.name} - ${this.on ? 'On' : 'Off'}`
    this.el.style.background = (this.on ? '#040' : '#400')
  }
}
let upgrades = []
let moneyUpgrade = new Upgrade({
  cost: 10,
  name: 'Money Multiplier',
  level: 1,
  onBuy: (x) => {x.cost+=Math.log(x.cost*1.25)**1.5;moneyMod++}
})
let speedUpgrade = new Upgrade({
  cost: 250,
  name: 'Speed Up',
  level: 0,
  onBuy: (x) => {x.cost+=Math.log(x.cost*2)**2.5;game.tickDelay*=0.95}
})
let efficiencyUpgrade = new Upgrade({
  cost: 250,
  name: 'Unlock Efficiency',
  level: 1,
  onBuy: (x) => {x.cost+=Math.log(x.cost*3)**2.5;game.unlockEff+=1}
})
let autoUpgrade = new Upgrade({
  cost: 500,
  name: 'Auto Play',
  level: 0,
  onBuy: (x) => {
    x.el.remove();
    game.auto = true;
    autoUnlocked = true;
    x.toggle = new ToggleButton({
      name: 'Autoplay',
      click: (x) => {
        autoEnabled = x.on
        if (x.on) {
          game.autoplay()
          game.draw()
        }
      }
    })
  }
})
let loopUpgrade = new Upgrade({
  cost: 2500,
  name: 'Move Multiplier',
  level: 1,
  onBuy: (x) => {x.cost+=(Math.log(x.cost*10)*10)**1.5;}
})

upgrades.push(moneyUpgrade,speedUpgrade,autoUpgrade,efficiencyUpgrade,loopUpgrade)

setInterval(()=>{
  for (let i of upgrades) {
    i.update()
  }
  if (autoUnlocked) {
    autoUpgrade.toggle.update()
  }
}, 500)

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

function save() {
  localStorage.setItem('snakeIncSave',JSON.stringify({
    money: money,
    moneyMod: moneyMod,
    addedSize: addedSize,
    haveAuto: autoUnlocked,
    game: {
      tickDelay: game.tickDelay,
      auto: game.auto,
      unlockEff: game.unlockEff,
      foodNum: game.food.length,
      snakeSize: game.snake.size
    },
    upgrades: {
      moneyCost: moneyUpgrade.cost,
      moneyLevel: moneyUpgrade.lvl,
      speedCost: speedUpgrade.cost,
      speedLevel: speedUpgrade.lvl,
      autoCost: autoUpgrade.cost,
      autoLevel: autoUpgrade.lvl,
      effCost: efficiencyUpgrade.cost,
      effLevel: efficiencyUpgrade.lvl,

      loopCost: loopUpgrade.cost,
      loopLevel: loopUpgrade.lvl
    }
  }))
}
function load() {
  let saveData = JSON.parse(localStorage.getItem('snakeIncSave'))
  money = (saveData.money || 0)
  moneyMod = (saveData.moneyMod || 1)
  addedSize = (saveData.addedSize || 0)
  autoUnlocked = (saveData.haveAuto || false)
  if (autoUnlocked) {
    autoUpgrade.cost = 0;
    autoUpgrade.canBuy = true
    autoUpgrade.buy()
  }
  if (addedSize >= 1) {
    for (let i = 0; i < addedSize; i++) {
      let dimension = Math.round(Math.random())
      switch (dimension) {
        case 0: game.h++; break
        case 1: game.w++; break
      }
    }
  }

  if (saveData.game) {
    // game.w = 6
    // game.h = 6
    game.tickDelay = (saveData.game.tickDelay || 1000)
    game.auto = (saveData.game.auto || false)
    game.unlockEff = (saveData.game.unlockEff || 1)
    if (saveData.game.foodNum) {
      for (let i = 0; i < saveData.game.foodNum - 1; i++) {
        game.addFood()
      }
    }
  }
  // game.snake.size = (saveData.game.snakeSize || 2)
  if (saveData.upgrades) {
    moneyUpgrade.cost = (saveData.upgrades.moneyCost || 10)
    moneyUpgrade.lvl = (saveData.upgrades.moneyLevel || 1)

    speedUpgrade.cost = (saveData.upgrades.speedCost || 250)
    speedUpgrade.lvl = (saveData.upgrades.speedLevel || 0)

    autoUpgrade.cost = (saveData.upgrades.autoCost || 1000)
    autoUpgrade.lvl = (saveData.upgrades.autoLevel || 0)

    efficiencyUpgrade.cost = (saveData.upgrades.effCost || 250)
    efficiencyUpgrade.lvl = (saveData.upgrades.effLevel || 1)

    loopUpgrade.cost = (saveData.upgrades.loopCost || 2500)
    loopUpgrade.lvl = (saveData.upgrades.loopLevel || 1)
  }
}
function reset () {
  // if (confirm('Are you sure you want to reset? This cannot be undone.')){
    resetting = true
    localStorage.removeItem('snakeIncSave')
    // load()
    location.reload()
  // }
}
document.getElementsByClassName('reset')[0].onclick = ()=>{
  if (resetConfirmations == 0) {
    setTimeout(()=>{
      resetConfirmations = 0
      document.getElementsByClassName('reset')[0].innerHTML = 'Reset Progress'
    },10000)
  }
  resetConfirmations++
  document.getElementsByClassName('reset')[0].innerHTML = `Click ${5 - resetConfirmations} more times to reset`
  if (resetConfirmations == 5) {
    reset()
  }
}

document.addEventListener('keydown',(e)=>{
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
  game.draw()
})

window.onload = ()=>{
  loaded = true;
  load()
  if (game.h % 2 == 1) {
    game.h ++
  }
  if (game.w % 2 == 1) {
    game.w ++
  }
  game.resize()
}
