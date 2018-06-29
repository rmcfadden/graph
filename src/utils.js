export default class Utils {  
  static distance(start, end) { return Math.abs(start - end); }
  
  static range(start, end, step = 1) {
    const distance = Utils.distance(start, end) / step;
    return [...Array(Math.ceil(distance) + 1).keys()].map(x => (x * step) + start);
  }

  static closestTo(items , n) {
    const closest = items.reduce((prev, next, i) => 
      prev === undefined || (Math.abs(items[i]  - n) < Math.abs(items[prev] - n) ) ? i : prev, undefined);
    return (closest > 0 ) ? items[closest] : undefined;
  }

  static offsetRangeToClosest(items, n) {
    const closest = Utils.closestTo(items, n);
    return items.map( x => closest > 0 ? x + closest : x -closest);
  }

  static isBetween(x, start, end) {
    return x >= start && x <= end;
  }
}