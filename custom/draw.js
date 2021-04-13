const drawutil = {
  /**
   * Draws a line from x1, y1 to x2, y2
   * May be quicker to use _r.transform stuff
   * @param {Number} x1 The start X coord
   * @param {Number} y1 The start Y coord
   * @param {Number} x2 The end X coord
   * @param {Number} y2 The end Y coord
   * @param {Number} width The width of the line
   */
  line(x1, y1, x2, y2, width=1) {
    const halfW = width/1;
    const lineX = x2 - x1;
    const lineY = y2 - y1;
    const len = Math.sqrt(lineX * lineX + lineY * lineY);
    const perpX = lineY / len;
    const perpY = -(lineX / len);
    _r.quad(
      x1 + perpX * halfW, y1 + perpY * halfW, 0, 0,
      x2 + perpX * halfW, y2 + perpY * halfW, 1, 0,
      x2 - perpX * halfW, y2 - perpY * halfW, 1, 1,
      x1 - perpX * halfW, y1 - perpY * halfW, 0, 1
    );
  }
}