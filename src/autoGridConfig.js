import { Decimal } from "decimal.js";

export default class AutoStepConfig {
  constructor() {
    this.getDistances = () => {
      const max = Decimal(10);
      const majorStep = Decimal(1);
      const minorStep = Decimal(majorStep).dividedBy(5.0);
      const count = 50;
      const bigItems = [...new Array(count - 1)].reduce((p, _, i) => {
        const distance = {
          max: (((i - 1) % 3) === 0) ? p[i].max.times(2.5) 
            : p[i].max.times(2),
          majorStep: (((i - 1) % 3) === 0) ? p[i].majorStep.times(2.5)  
            : p[i].majorStep.times(2),
        };
        p.push({ ...distance, ...{ minorStep: distance.majorStep.dividedBy(5) } });
        return p;
      }, [{ max, majorStep, minorStep }]);

      const smallItems = [...new Array(count - 1)].reduce((p, _, i) => {
        const distance = {
          max: (((i - 1) % 3) === 0) ? p[i].max.dividedBy(2.5) 
            : p[i].max.dividedBy(2),
          majorStep: (((i - 1) % 3) === 0) ? p[i].majorStep.dividedBy(2.5)  
            : p[i].majorStep.dividedBy(2),
        };
        p.push({ ...distance, ...{ minorStep: distance.majorStep.dividedBy(5) } });
        return p;;
      }, [{ max, majorStep, minorStep }]);

      const reversedSmallItems = smallItems.map(x => { return {
        max: x.max.toFixed(),
        majorStep: x.majorStep.toFixed(),
        minorStep: x.minorStep.toFixed(),
      }}).reverse(x => x.max);

      const adjustedBigItems = bigItems.map(x => { return {
        max: x.max.toFixed(),
        majorStep: x.majorStep.toFixed(),
        minorStep: x.minorStep.toFixed(),
      }});

      return [...reversedSmallItems, ...adjustedBigItems];
    };
  }
}
