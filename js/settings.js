let settings = {
    button: document.getElementById('settingsButton'),
    element: document.getElementById("settings"),
    background: document.getElementById("settingsBack"),
    panel: document.getElementById('settingsMenu'),
    panelShown: false,
    volumeSlider: document.getElementById("volumeSlider"),
    volume: 20,
    advancedStatsBox: document.getElementById("showAdvancedStats"),
    advancedStats: false,
    autoPauseBox: document.getElementById("autoPause"),
    autoPause: false
}
settings.button.addEventListener('click', () => {
    if (settings.panelShown) {
        settings.element.style.top = "-100%"
        settings.panelShown = false
    } else {
        settings.element.style.top = "0%"
        settings.panelShown = true
    }
})
settings.background.addEventListener("click", ()=>{
    if (settings.panelShown) {
        settings.element.style.top = "-100%"
        settings.panelShown = false
    } else {
        settings.element.style.top = "0%"
        settings.panelShown = true
    }
})
// volume
settings.volumeSlider.value = settings.volume
settings.volumeSlider.addEventListener("change", ()=>{
    settings.volume = settings.volumeSlider.value
})

// Advanced stats
settings.advancedStats = settings.advancedStatsBox.checked
settings.advancedStatsBox.addEventListener("change", ()=>{
    settings.advancedStats = settings.advancedStatsBox.checked
})

// Auto pause
settings.autoPauseBox = document.getElementById("autoPause")
settings.autoPause = settings.autoPauseBox.checked
settings.autoPauseBox.addEventListener("change", ()=>{
    settings.autoPause = settings.autoPauseBox.checked
})