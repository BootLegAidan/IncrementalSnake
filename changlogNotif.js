const version = "2.1.0"
const changelog = [
    "Made food potency affect maoney gain",
    "Changed back to the original sound effects",
    "Only the basic stats are shown by default. You can re-enable them in the settings",
    "Added a setting to automatically pause the snake game. This is off by default",
    "Game now only saves every 10 seconds instead of every tick",
    "Your tail now shows how much more you have to grow",
    "Upgrades are hidden until you have enough money to buy the first upgrade",
    "Changed how the food is colored",
    "Fixed the prestige text showing under the game container",
    "The snake now turns rainbow during pride month",
    "You can no longer wrap around the edge of the screen, might bring this back as an upgrade later"
]
let lastVersion = undefined

let changelogBgEl = document.getElementById("updateNotif-bg")
let changelogEl = document.getElementById("updateNotif")

function showChangelog(force=false) {
    if ((lastVersion === version) && !force) {
        console.log(lastVersion);
        return
    }
    console.log(lastVersion);
    lastVersion = version
    changelogBgEl.style.display = "block"
    changelogEl.innerHTML = `<h2 style="text-align: center;">Changelog - v${version}</h2><br>`
    changelogEl.innerHTML += `<i style="font-size: 0.8em; text-align: center; display: block; margin-bottom: 10px;">(You can view this again later in the settings menu)</i><br>`   
    changelogEl.innerHTML += `<b>New in this version:</b><br>`
    changelog.forEach(entry => {
        changelogEl.innerHTML += `- ${entry}<br>`
    })
    changelogEl.innerHTML += `<br><b style="font-size: 1em; text-align: center; width: 100%; display: block">Your save might be incompatible with the new version</b>`
    changelogEl.innerHTML += `<br><b style="font-size: 2em; text-align: center; width: 100%; display: block">Click anywhere to close this</b>`
}

changelogBgEl.addEventListener("click", () => {
    changelogBgEl.style.display = "none"
})