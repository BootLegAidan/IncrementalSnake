let prestigeEl = document.getElementById('prestigeText')
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
    if (this.cost <= money) {
      this.canBuy = true
      this.el.classList.add('canBuy')
    } else {
      this.canBuy = false
      this.el.classList.remove('canBuy')
    }
    this.el.innerHTML = `
    ${this.name} - Lvl ${this.lvl}<br>
    Cost: $${formatNumber(this.cost)}
    `
    if (this.lvl < 1 && this.cost > money) { // Hide upgrades that arent unlocked yet
      this.el.style.display = 'none'
    } else {
      this.el.style.display = 'block'
    }
    if (this.lvl >= this.maxLvl) {
      this.el.style.display = 'none'
    }
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
  level: 0,
  onBuy: (x) => {x.cost = Math.ceil(x.cost * 1.25); moneyMod++;},
  description: "Increases the base amount of money you earn when you eat a food.<br>The equation is <br><code>Money Multiplier * (1.01 ^ (Snake Size + (Score / 150))) * (Food Potency ^ 0.3)</code>"
})
let speedUpgrade = new Upgrade({
  cost: 100,
  name: 'Speed Up',
  level: 0,
  maxLvl: 35,
  onBuy: (x) => {x.cost = Math.ceil(x.cost * 1.4); game.tickDelay *= 0.85;},
  description: "Increases the speed of the game by ~15% (multiplicative)"
})
let startingLengthUpgrade = new Upgrade({
  cost: 100,
  name: 'Starting Length',
  level: 0,
  onBuy: (x) => {x.cost = Math.ceil(x.cost * 1.6); game.startLength += 1; if (game.snake.size < game.startLength) {game.snake.size = game.startLength}},
  description: "Increases the length the snake starts at after dying.<br>This becomes mostly irrelevant after you unlock auto play",
})
let efficiencyUpgrade = new Upgrade({
  cost: 250,
  name: 'Prestige Efficiency',
  level: 0,
  maxLvl: 15,
  onBuy: (x) => {x.cost = Math.ceil(x.cost * 1.8); game.unlockEff += 5},
  description: "When you prestige (food++ or size++),<br>you get to keep <code>(Efficiency * 5)%</code> of your current snakes size and food"
})
let autoUpgrade = new Upgrade({
  cost: 500,
  name: 'Auto Play',
  level: 0,
  maxLevel: 1,
  onBuy: (x) => {
    x.el.style.display = 'none';
    game.auto = true;
    autoUnlocked = true;
  },
  description: "Plays the game for you,<br>can be toggled on or off in the settings"
})
let foodUpgrade = new Upgrade({
  cost: 500,
  name: 'Food Potency',
  level: 0,
  onBuy: (x) => {x.cost = Math.ceil(x.cost * 1.6); game.foodEffect += 1},
  description: "Increases the amount your snake grows when you eat a food"
})

upgrades.push(moneyUpgrade,speedUpgrade,startingLengthUpgrade,autoUpgrade,efficiencyUpgrade,foodUpgrade)

setInterval(()=>{
  for (let i of upgrades) {
    i.update()
  }
}, 500)

// Tooltip for upgrades
upgradePanel.addEventListener("mousemove", (e) => {
    upgradeTooltip.style.display = "none"
    let elRect = upgradePanel.getBoundingClientRect();
    let scrollY = document.querySelectorAll(".sidePanel")[0].scrollTop
    // Calculate the offset for the tooltip to follow the cursor horizontally and vertically
    let offsetX = e.clientX - 150;
    let offsetY = e.clientY + window.pageYOffset + 20;

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