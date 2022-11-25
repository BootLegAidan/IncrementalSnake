game.c.addEventListener('touchstart', handleTouchStart, false);
game.c.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
};

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
          game.snake.dir = 2
        } else {
            game.snake.dir = 1
        }
    } else {
        if ( yDiff > 0 ) {
            game.snake.dir = 3
        } else {
            game.snake.dir = 0
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
};
