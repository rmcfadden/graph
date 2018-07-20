import AutoGridConfig from "./autoGridConfig";
import Axis from "./axis";

export default class Config {
  constructor() {
    this.title = "";
    this.borderStyle = "black";
    this.borderWidth = 1;
    this.backgroundStyle = "white";
    this.useAutoGrid = true;
    this.autoGrid = new AutoGridConfig();
    this.axes = {
      x: new Axis(),
      y: new Axis(),
    };
    this.transform = {
      xScale: 1.0,
      yScale: 1.0,
      xOffset: 0,
      yOffset: 0,
    };
  }
}
