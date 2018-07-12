export default class GridLines {
  constructor({
    type = "grid",
    show = true,
    style = "grey",
    step = 1,
    showLabels = false,
  } = {}) {
    this.type = type;
    this.show = show;
    this.style = style;
    this.step = step;
    this.showLabels = showLabels;
    this.labelStyle = "black";
    this.labelsInNegative = true;
    this.textHeight = 16;
    this.labelFormatter = (label) => {
      if (typeof label !== "number") { return label; }
      const decimalPlaces = this.decimalPlaces(label);
      if (decimalPlaces === 0) { return label; }
      if (decimalPlaces > 3) { return label.toExponential(); }
      if (decimalPlaces > 2) { return parseFloat(label).toFixed(3).toLocaleString(); }
      return label;
    };

    // TODO: move to utilty class
    this.decimalPlaces = (n) => {
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
      return Math.max(
          0,  // lower limit.
          (match[1] == '0' ? 0 : (match[1] || '').length)  // fraction length
          - (match[2] || 0));  // exponent
    }

  }
}
