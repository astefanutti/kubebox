
module.exports = function (widget) {
  widget.removeAllListeners('wheeldown');
  widget.removeAllListeners('wheelup');

  let delta = 0, tick = false;

  const scroll = function (d) {
    delta += d;
    if (!tick) {
      setTimeout(function () {
        if (delta != 0 && !widget.detached) {
          widget.scroll(delta);
          delta = 0;
        }
        tick = false;
      }, 20);
      tick = true;
    }
  };

  widget.on('wheeldown', _ => scroll(1));
  widget.on('wheelup', _ => scroll(-1));
}
