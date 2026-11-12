const changelogs = [
    {
        "version": "2.1.3",
        "notes": [
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
            "You can no longer wrap around the edge of the screen, might bring this back as an upgrade later",
            "Made the layout a little bit more dynamic"
        ]
    },
    {
        "version": "2.2.1",
        "notes": [
            "Moved the autoplay toggle to the settings menu",
            "The speed upgrade now increases speed by ~15%",
            "The prestige efficiency upgrade now increases 5%",
            "Numbers are now formatted",
            "Fixed the changelog background appearing incorrectly",
            "Made it so the changelog can show multiple versions",
            "Fixed an issue that made it so the prestige text would only show up once",
        ]
    },
    {
        "version": "2.2.1",
        "notes": [
            "Fixed an issue that would cause the game to not load your save",
            "The snake is now a random color",
        ]
    }
]
let lastVersion = undefined

let changelogBgEl = document.getElementById("updateNotif-bg")
let changelogEl = document.getElementById("updateNotif")

function showChangelog(force=false) {
    if ((lastVersion === changelogs[changelogs.length-1].version) && !force) {
        console.log(lastVersion);
        return
    }
    console.log(lastVersion);
    lastVersion = changelogs[changelogs.length-1].version
    
    changelogEl.innerHTML = ``
    changelogEl.innerHTML += `<i style="font-size: 0.8em; text-align: center; display: block; margin-bottom: 10px;">(You can view this again later in the settings menu)</i><br>`   
    changelogEl.innerHTML += `<b style="font-size: 1em; text-align: center; width: 100%; display: block">Your save might be incompatible with the new version</b>`
    changelogEl.innerHTML += `<br><b style="font-size: 2em; text-align: center; width: 100%; display: block">Click anywhere to close this</b>`
    for (let i = changelogs.length - 1; i >= 0; i--) {
        const update = changelogs[i]
        changelogBgEl.style.display = "block"
        changelogEl.innerHTML += `<h2 style="text-align: center;">v${update.version}</h2><br>`
        changelogEl.innerHTML += `<b>New in this version:</b><br>`
        update.notes.forEach(entry => {
            changelogEl.innerHTML += `- ${entry}<br>`
        })
    }
}

changelogBgEl.addEventListener("click", () => {
    changelogBgEl.style.display = "none"
})