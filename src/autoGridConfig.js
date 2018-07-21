export default class AutoGridConfig {
  constructor() {
    this.distances = AutoGridConfig.generateDefaultDistance();
  }

  static generateDefaultDistance() {
    const max = 12.5;
    const majorGrid = 1;
    const bigItems = [...new Array(100)].reduce((p, _, i) => {
      p.push({
        max: p[i].max * 2,
        majorGrid: (((i - 1) % 3) === 0) ? p[i].majorGrid * 2.5 : p[i].majorGrid * 2,
      });
      return p;
    }, [{ max, majorGrid }]);

    const smallItems = [...new Array(100)].reduce((p, _, i) => {
      p.push({
        max: p[i].max / 2,
        majorGrid: (((i - 1) % 3) === 0) ? p[i].majorGrid / 2.5 : p[i].majorGrid / 2,
      });
      return p;
    }, [{ max: max / 2, majorGrid: majorGrid / 2 }]);

    const reversedSmallItems = [...smallItems].reverse();
    return [...reversedSmallItems, ...bigItems];
  };
}
