function randomFromValue(value) {
    let str = String(value);
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }

    // Convert hash into a float between 0 and 1
    return (hash >>> 0) / 4294967296;
}

function formatNumber(x, m=2, n=0) {
    const letters = ["", "k", "m", "b", "t"]
    let places = 0
    while (x >= 1000) {
        places ++
        x /= 1000
    }

    if (places == 0) {
        return x = x.toFixed(n)
    }
    return x.toFixed(m) + letters[places];
}

function playSound(name){
  let snd = new Audio("Sounds/"+name+".mp3"); // buffers automatically when created
  snd.volume = settings.volume/100
  snd.play();
}