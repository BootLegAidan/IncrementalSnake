function randomFromValue(value) {
    let str = String(value);
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }

    // Convert hash into a float between 0 and 1
    return (hash >>> 0) / 4294967296;
}

function formatNumber(x) {
    const formatLetters = [
        [1000000000000, "t"],
        [1000000000, "b"],
        [1000000, "m"],
        [1000, "k"],
    ];
    for (const [num, letter] of formatLetters) {
        if (x >= num) {
            return `${(x / num).toFixed(2)}${letter}`;
        }
    }
    return x.toFixed(2);
}