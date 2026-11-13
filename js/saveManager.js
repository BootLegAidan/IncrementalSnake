function save() {
  localStorage.setItem('snakeIncSave',JSON.stringify({
    money: money,
    addedSize: addedSize,
    haveAuto: autoUnlocked,
    game: {
      auto: game.auto,
      foodNum: game.food.length,
      snakeSize: game.snake.size,
      score: game.score,
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
      foodCost: foodUpgrade.cost,
      foodLvl: foodUpgrade.lvl,
      startLengthCost: startingLengthUpgrade.cost,
      startLengthLvl: startingLengthUpgrade.lvl
    },
    settings: {
      volume: settings.volume,
      advancedStats: settings.advancedStats,
      autoPause: settings.autoPause
    },
    version: changelogs[changelogs.length-1].version
  }))
}

function sanityCheck(item, defaultVal) {
  if (typeof item == "undefined" || isNaN(item)) {
    return defaultVal
  }
  return item
}

function load() {
  let saveData = JSON.parse(localStorage.getItem('snakeIncSave'))
  // try {
    let sd = saveData
    money = sanityCheck(sd?.money, 0)
    addedSize = sanityCheck(sd?.addedSize, 0)
    for (let i = 0; i < addedSize; i++) {game.h++; game.w++}
    
    if (saveData.game) {
      game.auto = sanityCheck(sd.game.auto, false)
      game.snake.size = sanityCheck(sd.game.snakeSize, 2)
      game.score = sanityCheck(sd.game.score, 0)
      if (saveData.game.foodNum) {
        for (let i = 0; i < saveData.game.foodNum - 1; i++) {
          game.addFood()
        }
      } 
    } else {
        console.warn("Save data for game couldn't be found");
    }

    if (saveData.upgrades) {
      moneyUpgrade.cost = sanityCheck(sd.upgrades.moneyCost, 10)
      moneyUpgrade.lvl = sanityCheck(sd.upgrades.moneyLevel, 0)
      
      speedUpgrade.cost = sanityCheck(sd.upgrades.speedCost, 100)
      speedUpgrade.lvl = sanityCheck(sd.upgrades.speedLevel, 0)
      
      autoUpgrade.cost = sanityCheck(sd.upgrades.autoCost, 500)
      autoUpgrade.lvl = sanityCheck(sd.upgrades.autoLevel, 0)
      autoUnlocked = sanityCheck(sd?.haveAuto, false)
      if (autoUnlocked) {
        autoEnabled = true
      }
      
      efficiencyUpgrade.cost = sanityCheck(sd.upgrades.effCost, 250)
      efficiencyUpgrade.lvl = sanityCheck(sd.upgrades.effLevel, 0)
  
      foodUpgrade.cost = sanityCheck(sd.upgrades.foodCost, 500)
      foodUpgrade.lvl = sanityCheck(sd.upgrades.foodLvl, 0)
  
      startingLengthUpgrade.cost = sanityCheck(sd.upgrades.startLengthCost, 100)
      startingLengthUpgrade.lvl = sanityCheck(sd.upgrades.startLengthLvl, 0)
    } else {
      console.log("Save data for upgrades couldn't be found");
    }

    if (saveData.settings) {
      settings.volume = sanityCheck(sd.settings.volume, 20)
      settings.volumeSlider.value = settings.volume;
      settings.advancedStats = sanityCheck(sd.settings.advancedStats, false)
      settings.autoPause = sanityCheck(sd.settings.autoPause, 20)
    }
    if (saveData.version) {
      lastVersion = saveData.version;
    }
  // } catch {
  //   console.log("Error loading save data");
  // }
}

function reset () {
  // if (confirm('Are you sure you want to reset? This cannot be undone.')){
    resetting = true
    localStorage.setItem('snakeIncSave', "{}")
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