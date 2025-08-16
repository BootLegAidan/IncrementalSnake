const version = "2.0.0"
const changelog = [
    "Added a new upgrade: Food Potency",
    "Added the ability to pause the game (P or Escape)",
    "Added settings menu (top right)",
    "Added volume slider",
    "Added tooltips to explain upgrades (hover over the button)",
    "Removed Move Multiplier upgrade",
    "Size and score now persist through saves",
    "Rebalancing (the game is still pretty unbalanced)",
    "Added a favicon and changed the page title",
    "Made it so the snake can grow more than once in a single frame",
    "Cleaned up the source code a bit"
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