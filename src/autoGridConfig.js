export default class AutoStepConfig {
  constructor() {
    this.distances = AutoStepConfig.generateDefaultDistances();
  }

  static generateDefaultDistances() {
    const max = 12.5;
    const majorStep = 1;
    const count = 50;
    const bigItems = [...new Array(count - 1)].reduce((p, _, i) => {
      const distance = {
        //max: p[i].max * 2,
        max: (((i - 1) % 3) === 0) ? p[i].max * 2.5 : p[i].max * 2,
        majorStep: (((i - 1) % 3) === 0) ? p[i].majorStep * 2.5 : p[i].majorStep * 2,
      };
      p.push({ ...distance, ...{ minorStep: distance.majorStep / 5 } });
      return p;
    }, [{ max, majorStep }]);

    const smallItems = [...new Array(count - 1)].reduce((p, _, i) => {
      const distance = {
        //max: p[i].max / 2,
        max: (((i - 1) % 3) === 0) ? p[i].max / 2.5 : p[i].max / 2,
        majorStep: (((i - 1) % 3) === 0) ? p[i].majorStep / 2.5 : p[i].majorStep / 2,
      };
      p.push({ ...distance, ...{ minorStep: distance.majorStep / 5 } });
      return p;
    }, [{ max: max / 2, majorStep: majorStep / 2 }]);

    const reversedSmallItems = [...smallItems].reverse();
    return [...reversedSmallItems, ...bigItems];
  }
}
