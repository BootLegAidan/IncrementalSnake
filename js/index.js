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
    Money: $${formatNumber(money)}<br>
    Money Multiplier: x${formatNumber(moneyModCalc())}<br>
    Score: ${game.score}<br>
  `
  if (settings.advancedStats) {
    infoEl.innerHTML += `
      Snake length: ${game.snake.size} pixels<br>
      Food count: ${game.food.length}<br>
      Food potency: ${game.foodEffect}<br>
      World size: ${game.w}x${game.h} pixels<br>
      Prestige Efficiency: ${game.unlockEff}%<br>
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

let game = new World({ // Create the snake game
  width: 6,
  height: 6,
  show: true,
  auto: false,
  tickDelay: 1000,
  upgrades: true
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


