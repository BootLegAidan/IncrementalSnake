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
      snakeSize: game.snake.size,
      score: game.score,
      foodEffect: game.foodEffect
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
    },
    version: version
  }))
//   console.log("Saved Succesfully");
  
}

function load() {
  let saveData = JSON.parse(localStorage.getItem('snakeIncSave'))
  try {

    money = (saveData.money || 0)
    moneyMod = (saveData.moneyMod || 1)
    addedSize = (saveData.addedSize || 0)
    autoUnlocked = (saveData.haveAuto || false)
    if (autoUnlocked) {
      autoUpgrade.cost = 0;
      autoUpgrade.canBuy = true
      autoUpgrade.buy()
  
      // Turn on auto and update the button
      autoEnabled = true
      autoUpgrade.toggle.on = true
      autoUpgrade.toggle.update()
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
      game.snake.size = (saveData.game.snakeSize || 2)
      game.score = (saveData.game.score || 0)
      game.foodEffect = (saveData.game.foodEffect || 1)
      if (saveData.game.foodNum) {
        for (let i = 0; i < saveData.game.foodNum - 1; i++) {
          game.addFood()
        }
      } else {
        console.log("Save data for game couldn't be found");
      }
    }
    if (saveData.upgrades) {
      moneyUpgrade.cost = (saveData.upgrades.moneyCost || 10)
      moneyUpgrade.lvl = (saveData.upgrades.moneyLevel || 1)
  
      speedUpgrade.cost = (saveData.upgrades.speedCost || 250)
      speedUpgrade.lvl = (saveData.upgrades.speedLevel || 0)
  
      autoUpgrade.cost = (saveData.upgrades.autoCost || 1000)
      autoUpgrade.lvl = (saveData.upgrades.autoLevel || 0)
  
      efficiencyUpgrade.cost = (saveData.upgrades.effCost || 250)
      efficiencyUpgrade.lvl = (saveData.upgrades.effLevel || 1)
  
      foodUpgrade.cost = (saveData.upgrades.foodCost || 500)
      foodUpgrade.lvl = (saveData.upgrades.foodLvl || 1)
  
      startingLengthUpgrade.cost = (saveData.upgrades.startLengthCost || 100)
      startingLengthUpgrade.lvl = (saveData.upgrades.startLengthLvl || 1)
    } else {
      console.log("Save data for upgrades couldn't be found");
    }
    if (saveData.settings) {
      settings.volume = (saveData.settings.volume || 20);
      settings.volumeSlider.value = settings.volume;
    }
    if (saveData.version) {
      lastVersion = saveData.version;
    }
  } catch {
    console.log("Error loading save data");
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