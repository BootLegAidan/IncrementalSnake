document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

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
          if (game.snake.oldDir != 2) {
            game.snake.dir = 1
          }
        } else {
          if (game.snake.oldDir != 1) {
            game.snake.dir = 2
          }
        }
    } else {
        if ( yDiff > 0 ) {
          if (game.snake.oldDir != 3) {
            game.snake.dir = 0
          }
        } else {
          if (game.snake.oldDir != 0) {
            game.snake.dir = 3
          }
        }
    }
    game.draw()
    /* reset values */
    xDown = null;
    yDown = null;
};
