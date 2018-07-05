import GridLines from "./GridLines";

export default class Axis {
  constructor({ start = -5.5, end = 5.5 } = {}) {
    this.start = start;
    this.end = end;
    this.show = true;
    this.width = 1;
    this.style = "black";
    this.majorGrid = new GridLines({ step : .5, style: "darkgrey", showLabels: true });
    this.minorGrid = new GridLines({ step :.1, style: "lightgrey" });
    this.offset = 0;
  }
}