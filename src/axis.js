import Grid from "./grid";

export default class Axis {
  constructor({ 
    start = -5.5,
    end = 5.5,
    majorGrid = new Grid({ step: 0.5, style: "#000000", showLabels: true }),
  } = {}) {
    this.start = start;
    this.end = end;
    this.show = true;
    this.width = 2.25;
    this.style = "#000000";
    this.majorGrid = majorGrid;
    this.minorGrid = new Grid({ step: 0.1, style: "lightgrey", width: 0.5 });
  }
}
