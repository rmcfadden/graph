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


  static decimalPlaces(n) {
    // Make sure it is a number and use the builtin number -> string.
    const s = "" + (+n);
    // Pull out the fraction and the exponent.
    const match = /(?:\.(\d+))?(?:[eE]([+\-]?\d+))?$/.exec(s);
    // NaN or Infinity or integer.
    // We arbitrarily decide that Infinity is integral.
    if (!match) { return 0; }
    // Count the number of digits in the fraction and subtract the
    // exponent to simulate moving the decimal point left by exponent places.
    // 1.234e+2 has 1 fraction digit and '234'.length -  2 == 1
    // 1.234e-2 has 5 fraction digit and '234'.length - -2 == 5
    return Math.max(0, (match[1] === "0" ? 0 : (match[1] || "").length) - (match[2] || 0));
  }

}
