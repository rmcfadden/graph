import { Decimal } from "decimal.js";
import lo from "lodash";

export default class Utils {
  static distance(start, end) { return Math.abs(start - end); }

  static closestIndex(items, n, p) {
    return items.reduce((prev, _, i) => (prev === undefined
        || (Math.abs(Utils.pOrO(items[i], p) - n)
        < Math.abs(Utils.pOrO(items[prev], p) - n)) ? i : prev), undefined);
  }

  static closest(items, n, p) {
    const closestIndex = Utils.closestIndex(items, n, p);
    return (closestIndex > 0) ? items[closestIndex] : undefined;
  }

  static range(start, end, step = 1) {
    const distance = Utils.distance(start, end);
    const rangeCount = Decimal(distance).dividedBy(step).ceil().toNumber();
    return [...Array(rangeCount + 1).keys()]
      .map(x => Decimal((Decimal(x).times(step)).toNumber() + start).toNumber());
  }

  static pOrO(o, p) {
    return lo.isFunction(p) ? p(o) : o;
  }

  static alignRange(items, n) {
    if (n === 0) { throw new TypeError("n cannot be 0"); }
    return items
      .map(x => Decimal(Math.round(Decimal(x).dividedBy(n).toNumber())).times(n).toNumber());
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
      x: (p.x * xScale) + xOffset, 
      y: (p.y * yScale) + yOffset,
    };
  }

  static decimalPlaces(n) {
    const match = /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(n);
    if (!match) { return 0; }
    // 1.234e+2 has 1 fraction digit and '234'.length -  2 == 1
    // 1.234e-2 has 5 fraction digit and '234'.length - -2 == 5
    return Math.max(0, (match[1] === "0" ? 0 : (match[1] || "").length) - (match[2] || 0));
  }

  static adjust(x, lineWidth) {
    const i = parseInt(x, 0);
    return lineWidth % 2 === 1 || lineWidth < 1.0 ? i + 0.5 : i;
  }
}
