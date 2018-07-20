//import _ from "lodash";
import Config from "./config";
import View from "./view";

export default class Graph {
  constructor(args) {
    if (!args) { throw new Error("args must be defined"); }
    if (!args.id) { throw new Error("args.id must be defined"); }
    this.id = args.id;
    this.config = new Config();


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
    console.log([...reversedSmallItems, ...bigItems]);


    this.view = new View(this);
    this.draw();
  }

  draw() {
    this.view.draw();
  }
}
