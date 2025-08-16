let upgradeEl = document.getElementById('upgradeText')
let upgradePanel = document.getElementById('upgrades')
let money = 0


class Upgrade {
  constructor (options) {
    this.cost = options.cost // Number - Starting cost of the upgrade
    this.onBuy = options.onBuy // Function - Function to call when the upgrade is successfully purchased
    this.lvl = (options.level || options.lvl || 0) // Number - Starting level of the upgrade
    this.name = options.name // String - What text is displayed on the upgrade element
    this.maxLvl = (options.maxLevel || options.maxLvl || Infinity)
    this.el = document.createElement('button')
    this.el.classList.add('upgrade')
    this.el.description = options.description || ""

    upgradePanel.append(this.el)
    let fakeThis = this
    this.el.addEventListener('click',()=>{fakeThis.buy(fakeThis)})

    this.update()
  }
  update () {
    if (this.lvl >= this.maxLvl) {
      this.el.remove()
    }
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
  onBuy: (x) => {x.cost = Math.ceil(x.cost * 1.25); moneyMod++;},
  description: "Increases the base amount of money you earn when you eat a food.<br>The equation is <code>Money Multiplier * (1.01 ^ (Snake Size + (Score / 150)))</code>"
})
let speedUpgrade = new Upgrade({
  cost: 100,
  name: 'Speed Up',
  level: 1,
  maxLvl: 100,
  onBuy: (x) => {x.cost = Math.ceil(x.cost * 1.7); game.tickDelay *= 0.9;},
  description: "Increases the speed of the game by ~10% (multiplicative)"
})
let startingLengthUpgrade = new Upgrade({
  cost: 100,
  name: 'Starting Length',
  level: 1,
  onBuy: (x) => {x.cost = Math.ceil(x.cost * 1.6); game.startLength += 1; if (game.snake.size < game.startLength) {game.snake.size = game.startLength}},
  description: "Increases the length the snake starts at after dying.<br>This becomes mostly irrelevant after you unlock auto play",
})
let efficiencyUpgrade = new Upgrade({
  cost: 250,
  name: 'Unlock Efficiency',
  level: 1,
  maxLvl: 90,
  onBuy: (x) => {x.cost = Math.ceil(x.cost * 1.5); game.unlockEff += 1},
  description: "When you prestige (food++ or size++),<br>you get to keep x% of your current snakes size"
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
  },
  description: "Plays the game for you,<br>can be toggled on or off once bought"
})
let foodUpgrade = new Upgrade({
  cost: 500,
  name: 'Food Potency',
  level: 1,
  onBuy: (x) => {x.cost = Math.ceil(x.cost * 1.6); game.foodEffect += 1},
  description: "Increases the amount your snake grows when you eat a food"
})

upgrades.push(moneyUpgrade,speedUpgrade,startingLengthUpgrade,autoUpgrade,efficiencyUpgrade,foodUpgrade)

setInterval(()=>{
  for (let i of upgrades) {
    i.update()
  }
  if (autoUnlocked) {
    autoUpgrade.toggle.update()
  }
}, 500)

// Tooltip for upgrades
upgradePanel.addEventListener("mousemove", (e) => {
    upgradeTooltip.style.display = "none"
    let elRect = upgradePanel.getBoundingClientRect();
    let scrollY = document.querySelectorAll(".sidePanel")[0].scrollTop
    // Calculate the offset for the tooltip to follow the cursor horizontally and vertically
    let offsetX = e.clientX - elRect.left + 20;
    let offsetY = e.clientY - (elRect.top*0) + (scrollY);

    // Update the position of the tooltip
    upgradeTooltip.style.left = offsetX + "px";
    upgradeTooltip.style.top = offsetY + "px";  // If you also want vertical positioning
    hoveredUpgrade = upgradePanel.querySelectorAll("button:hover")[0]
    if (hoveredUpgrade) {
        upgradeTooltip.innerHTML = hoveredUpgrade.description
        if (hoveredUpgrade.description == "" || hoveredUpgrade.description == undefined) {
            upgradeTooltip.style.display = "none"
        } else {
            upgradeTooltip.style.display = "block"
        }
    }
});
upgradePanel.addEventListener("mouseleave", (e) => {
    upgradeTooltip.style.display = "none"
})