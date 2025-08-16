let settings = {
    button: document.getElementById('settingsButton'),
    element: document.getElementById("settings"),
    background: document.getElementById("settingsBack"),
    panel: document.getElementById('settingsMenu'),
    panelShown: false,
    volumeSlider: document.getElementById("volumeSlider"),
    volume: 20
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

