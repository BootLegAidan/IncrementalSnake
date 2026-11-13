let infoEl = document.getElementById('info');
let gameCont = document.getElementById('snakeContainer')
let addedSize = 0
let loaded = false
let autoUnlocked = false
let autoEnabled = false
let resetConfirmations = 0
let resetting = false
let timeSinceLastSave = 0
let loadTime = 0

function moneyModCalc() {
  return (moneyUpgrade.lvl + 1) * (1.01**game.snake.size+(game.score/150)) * Math.max(1, foodUpgrade.lvl ** 0.3)
}
function updateInfo() {
  infoEl.innerHTML = `
    Money: $${formatNumber(money)}<br>
    Money per food: x${formatNumber(moneyModCalc())}<br>
    Score: ${game.score}<br>
  `
  if (settings.advancedStats) {
    infoEl.innerHTML += `
      Snake length: ${game.snake.size} pixels<br>
      Food count: ${game.food.length}<br>
      Food potency: ${foodUpgrade.lvl}<br>
      World size: ${game.w}x${game.h} pixels<br>
      Prestige Efficiency: ${getUnlockEfficiency()}%<br>
      ${Math.floor((1000/getTickDelay())*100)/100} tick${Math.floor((1000/getTickDelay())*100)/100==1?'':'s'} per second<br>
    `
  }
}

let game = new World({ // Create the snake game
  width: 6,
  height: 6,
  show: true,
  auto: false
})
game.tick()

document.addEventListener('keydown',(e)=>{
  key = e.key.toLowerCase()
  if (!game.paused) {
    switch (key) { // Handle arrow keys and wasd
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
  if (["escape", "p", " "].includes(key)) { // Pausing
    game.paused = !game.paused
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
  loadTime = performance.now()
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


