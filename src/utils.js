export default class Utils {
  static distance(start, end) { return Math.abs(start - end); }

  static closestTo(items, n) {
    const closest = items.reduce((prev, _, i) => (prev === undefined
        || (Math.abs(items[i] - n) < Math.abs(items[prev] - n)) ? i : prev), undefined);
    return (closest > 0) ? items[closest] : undefined;
  }

  static alignRange(items, n) {
    if (n === 0) { throw new TypeError("n cannot be 0"); }
    return items.map(x => Math.round(x / n) * n);
  }

  static isBetween(x, start, end) {
    return x >= start && x <= end;
  }

  static applyTansform(p, transform) {
    const {
      xOffset,
      yOffset,
      xScale,
      yScale,
    } = transform;

    return {
      x: (p.x + xOffset) * xScale,
      y: (p.y + yOffset) * yScale,
    };
  }
}
